import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FeedbackResponseStatsService } from '../../../services/feedback-response-stats.service';
import { StatusMessageService } from '../../../services/status-message.service';
import { FeedbackResponseRecord, FeedbackResponseRecords } from '../../../types/api-output';
import { ErrorMessageOutput } from '../../error-message-output';
import { ResponseTimeSeriesChartModel } from './response-time-series-chart.model';

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
    intervalSeconds: 10,
    responseRecords: [],
  };

  runInterval: BehaviorSubject<number> = new BehaviorSubject<number>(this.model.intervalSeconds);

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
    this.feedbackResponseStatsService.loadResponseStats(durationMilliSeconds.toString(),
        this.model.intervalSeconds.toString())
        .subscribe((records: FeedbackResponseRecords) => {
          this.model.responseRecords = records.responseRecords;

          const canvas = d3.select('svg');

          // clear all content
          canvas.selectAll('*').remove();

          this.drawChart(canvas, durationMilliSeconds, false);

          const totalCounts: number[] = [];
          records.responseRecords.map((record: FeedbackResponseRecord, i: number) => {
            totalCounts[i] = record.count;

            if (i <= 0) {
              record.count = 0;
            } else {
              record.count = record.count - totalCounts[i - 1];
            }

            return record;
          });

          this.drawChart(canvas, durationMilliSeconds);
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
   * Handles a change in interval
   */
  setIntervalHandler(newInterval: number): void {
    this.model.intervalSeconds = newInterval;
    this.runInterval.next(newInterval);
    this.refresh();
  }

  drawChart(canvas: any, duration: number, isForeground: boolean = true): void {
    const svgWidth: number = 800;
    const svgHeight: number = 400;
    const margin: any = { top: 40, right: 60, bottom: 30, left: 60 };
    const width: number = svgWidth - margin.left - margin.right;
    const height: number = svgHeight - margin.top - margin.bottom;

    canvas.attr('width', svgWidth);
    canvas.attr('height', svgHeight);

    const container: any = canvas.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x: any = d3.scaleTime()
        .rangeRound([0, width])
        .nice();

    const y: any = d3.scaleLinear()
        .rangeRound([height, 0]);

    x.domain([Date.now() - duration, Date.now()]);
    y.domain(d3.extent(this.model.responseRecords, (r: FeedbackResponseRecord) => r.count));

    const line: any = d3.line()
        .defined((r: FeedbackResponseRecord) => r.timestamp >= Date.now() - duration && r.timestamp <= Date.now())
        .x((r: FeedbackResponseRecord) => x(r.timestamp))
        .y((r: FeedbackResponseRecord) => y(r.count));

    if (isForeground) {
      container.append('g')
          .attr('transform', `translate(0, ${height})`)
          .call(d3.axisBottom(x));
      container.append('g')
          .call(d3.axisLeft(y))
          .attr('stroke', 'steelblue')
          .attr('stroke-width', '0.05em')
          .append('text')
          .attr('fill', 'steelblue')
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'middle')
          .attr('transform', `translate(0, -30)`)
          .text(`No. of responses / ${this.model.intervalSeconds}s`);
    } else {
      container.append('g')
          .call(d3.axisRight(y))
          .attr('stroke', '#cdcdcd')
          .attr('stroke-width', '0.04em')
          .attr('transform', `translate(${width}, 0)`)
          .append('text')
          .attr('fill', '#000')
          .attr('transform', `translate(0, -30)`)
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'middle')
          .text('Total no. of responses');
    }

    const color: string = isForeground ? 'steelblue' : '#cdcdcd';

    container.append('path')
        .datum(this.model.responseRecords)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 2)
        .attr('d', line);
  }
}
