import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FeedbackResponseStatsService } from '../../../services/feedback-response-stats.service';
import { StatusMessageService } from '../../../services/status-message.service';
import { FeedbackResponseRecord, FeedbackResponseRecords } from '../../../types/api-output';
import { ErrorMessageOutput } from '../../error-message-output';
import { ResponseTimeSeriesChartModel } from './response-time-series-chart.model';
import { GraphDisplayMode } from "../../../types/graph-display-mode";

interface Margin {
  top: number,
  right: number,
  bottom: number,
  left: number,
}

/**
 * Response-tracking time series chart for admin user.
 */
@Component({
  selector: 'tm-response-time-series-chart',
  templateUrl: './response-time-series-chart.component.html',
  styleUrls: ['./response-time-series-chart.component.scss'],
})
export class ResponseTimeSeriesChartComponent implements OnInit {

  @Input()
  model: ResponseTimeSeriesChartModel = {
    durationMinutes: 5,
    responseIntervalMinutes: 1,
    refreshIntervalSeconds: 10,
    cumulativeResponseRecords: [],
    differenceResponseRecords: [],
  };

  runInterval: BehaviorSubject<number> = new BehaviorSubject<number>(this.model.refreshIntervalSeconds);
  GraphDisplayMode: typeof GraphDisplayMode = GraphDisplayMode;

  displayMode: GraphDisplayMode = GraphDisplayMode.SHOW_BOTH;

  canvasWidth: number = 800;
  canvasHeight: number = 400;

  margin: Margin = { top: 40, right: 60, bottom: 30, left: 60 };

  graphWidth: number = this.canvasWidth - this.margin.left - this.margin.right;
  graphHeight: number = this.canvasHeight - this.margin.top - this.margin.bottom;

  constructor(private feedbackResponseStatsService: FeedbackResponseStatsService,
              private statusMessageService: StatusMessageService) { }

  ngOnInit(): void {
    this.refresh();
    this.runInterval.pipe(
        switchMap((value: number) => interval(value * 1000)),
        tap(() => this.refresh()),
    ).subscribe();
  }

  refresh(): void {
    const durationMilliSeconds: number = this.model.durationMinutes * 60 * 1000;
    const responseIntervalMilliSeconds: number = this.model.responseIntervalMinutes * 60 * 1000;
    this.feedbackResponseStatsService.loadResponseStats(durationMilliSeconds.toString(),
        responseIntervalMilliSeconds.toString())
        .subscribe((records: FeedbackResponseRecords) => {
          this.model.cumulativeResponseRecords = records.responseRecords;
          this.model.differenceResponseRecords = []

          const totalCounts: number[] = [];

          for (const [i, record] of records.responseRecords.entries()) {
            totalCounts[i] = record.count;

            const differenceRecord: FeedbackResponseRecord = {
              count: 0,
              timestamp: record.timestamp
            }

            if (i > 0) {
              differenceRecord.count = record.count - totalCounts[i - 1];
            }

            this.model.differenceResponseRecords.push(differenceRecord);
          }

          this.drawChart();
        }, (err: ErrorMessageOutput) => {
          this.statusMessageService.showErrorToast(err.error.message);
        });
  }

  /**
   * Handles a change in duration
   */
  setDurationHandler(duration: number): void {
    this.model.durationMinutes = duration;
    this.refresh();
  }

  /**
   * Handles a change in the response interval
   */
  setResponseIntervalHandler(newInterval: number): void {
    this.model.responseIntervalMinutes = newInterval;
    this.refresh();
  }

  /**
   * Handles a change in the refresh interval
   */
  setRefreshIntervalHandler(newInterval: number): void {
    this.model.refreshIntervalSeconds = newInterval;
    this.runInterval.next(newInterval);
  }

  isSelectedForDisplay(mode: GraphDisplayMode): boolean {
    return mode === this.displayMode;
  }

  switchDisplayMode(mode: GraphDisplayMode): void {
    this.displayMode = mode;
    this.refresh();
  }

  drawChart(): void {
    const canvas: any = d3.select('svg');
    const duration: number = this.model.durationMinutes * 60 * 1000;

    // clear all content
    canvas.selectAll('*').remove();

    canvas.attr('width', this.canvasWidth);
    canvas.attr('height', this.canvasHeight);

    const container: any = canvas.append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const x: any = d3.scaleTime()
        .rangeRound([0, this.graphWidth])
        .nice();

    const y0: any = d3.scaleLinear()
        .rangeRound([this.graphHeight, 0]);
    const y1: any = d3.scaleLinear()
        .rangeRound([this.graphHeight, 0]);

    x.domain([Date.now() - duration, Date.now()]);

    y0.domain(d3.extent(this.model.cumulativeResponseRecords, (r: FeedbackResponseRecord) => r.count));
    y1.domain(d3.extent(this.model.differenceResponseRecords, (r: FeedbackResponseRecord) => r.count));

    const lineCumulativeAttributes: any = d3.line()
        .defined((r: FeedbackResponseRecord) => r.timestamp >= Date.now() - duration && r.timestamp <= Date.now())
        .x((r: FeedbackResponseRecord) => x(r.timestamp))
        .y((r: FeedbackResponseRecord) => y0(r.count));

    const lineDifferenceAttributes: any = d3.line()
        .defined((r: FeedbackResponseRecord) => r.timestamp >= Date.now() - duration && r.timestamp <= Date.now())
        .x((r: FeedbackResponseRecord) => x(r.timestamp))
        .y((r: FeedbackResponseRecord) => y1(r.count));

    container.append('g')
        .attr('transform', `translate(0, ${this.graphHeight})`)
        .call(d3.axisBottom(x));

    const differenceAxisLabel: string = `No. of responses / ${this.model.responseIntervalMinutes}min`;
    const cumulativeAxisLabel = 'Total no. of responses';

    switch (this.displayMode) {
      case GraphDisplayMode.SHOW_BOTH:
        this.drawLeftYAxis(container, y0, cumulativeAxisLabel);
        this.drawRightYAxis(container, y1, differenceAxisLabel);
        this.drawLine(container, this.model.differenceResponseRecords, lineDifferenceAttributes, '#cdcdcd');
        this.drawLine(container, this.model.cumulativeResponseRecords, lineCumulativeAttributes, 'steelblue');
        break;

      case GraphDisplayMode.SHOW_DIFFERENCE:
        this.drawLeftYAxis(container, y0, differenceAxisLabel);
        this.drawLine(container, this.model.differenceResponseRecords, lineDifferenceAttributes, 'steelblue');
        break;

      case GraphDisplayMode.SHOW_CUMULATIVE:
        this.drawLeftYAxis(container, y0, cumulativeAxisLabel);
        this.drawLine(container, this.model.cumulativeResponseRecords, lineCumulativeAttributes, 'steelblue');
        break;
    }
  }

  drawLeftYAxis(container: any, axis: any, label: string): void {
    container.append('g')
        .call(d3.axisLeft(axis))
        .attr('stroke', 'steelblue')
        .append('text')
        .attr('fill', 'steelblue')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(0, -30)')
        .text(label);
  }

  drawRightYAxis(container: any, axis: any, label: string): void {
    container.append('g')
        .call(d3.axisRight(axis))
        .attr('stroke', '#cdcdcd')
        .attr('transform', `translate(${this.graphWidth}, 0)`)
        .append('text')
        .attr('fill', '#cdcdcd')
        .attr('transform', 'translate(0, -30)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'middle')
        .text(label);
  }

  drawLine(container: any, data: FeedbackResponseRecord[], lineAttributes:any, color: string): void {
    container.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 2)
        .attr('d', lineAttributes);
  }
}
