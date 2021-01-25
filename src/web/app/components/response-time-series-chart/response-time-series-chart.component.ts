import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FeedbackResponseStatsService } from '../../../services/feedback-response-stats.service';
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
    durationMinutes: 180,
    intervalSeconds: 10,
  };

  runInterval: BehaviorSubject<number> = new BehaviorSubject<number>(this.model.intervalSeconds);

  constructor(private feedbackResponseStatsService: FeedbackResponseStatsService) { }

  ngOnInit(): void {
    this.refresh();
    this.runInterval.pipe(
        switchMap((value: number) => interval(value * 1000)),
        tap(() => this.refresh()),
    ).subscribe();
  }

  refresh(): void {
    const durationSeconds: number = this.model.durationMinutes * 60;
    this.feedbackResponseStatsService.loadResponseStats(durationSeconds.toString(),
        this.model.intervalSeconds.toString())
        .subscribe((records: FeedbackResponseRecords) => {
          console.log(records);
          this.drawChart(records.responseRecords, durationSeconds * 1000);
        }, (err: ErrorMessageOutput) => {
          console.log(err.error);
        });
  }

  /**
   * Handles a change in duration
   */
  setDurationHandler(duration: number): void {
    this.model.durationMinutes = duration;
  }

  /**
   * Handles a change in interval
   */
  setIntervalHandler(newInterval: number): void {
    this.model.intervalSeconds = newInterval;
    this.runInterval.next(newInterval);
  }

  drawChart(data: FeedbackResponseRecord[], duration: number): void {
    const svg: any = d3.select('svg');
    const svgWidth: number = 800;
    const svgHeight: number = 400;
    const margin: any = { top: 20, right: 20, bottom: 30, left: 50 };
    const width: number = svgWidth - margin.left - margin.right;
    const height: number = svgHeight - margin.top - margin.bottom;

    // clear all content
    svg.selectAll('*').remove();

    svg.attr('width', svgWidth);
    svg.attr('height', svgHeight);

    const container: any = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x: any = d3.scaleTime()
        .rangeRound([0, width])
        .nice();

    const y: any = d3.scaleLinear()
        .rangeRound([height, 0]);

    x.domain([Date.now() - duration, Date.now()]);
    y.domain(d3.extent(data, (r: FeedbackResponseRecord) => r.count));

    const line: any = d3.line()
        .defined((r: FeedbackResponseRecord) => r.timestamp >= Date.now() - duration && r.timestamp <= Date.now())
        .x((r: FeedbackResponseRecord) => x(r.timestamp))
        .y((r: FeedbackResponseRecord) => y(r.count));

    container.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    container.append('g')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('No. of responses');

    container.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', line);
  }
}
