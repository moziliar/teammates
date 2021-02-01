/**
 * The form model for the response time series chart display options.
 */
import { FeedbackResponseRecord } from '../../../types/api-output';

/**
 * The model of feedback response time series chart.
 */
export interface ResponseTimeSeriesChartModel {
  durationMinutes: number;
  responseIntervalMinutes: number;
  cumulativeResponseRecords: FeedbackResponseRecord[];
  differenceResponseRecords: FeedbackResponseRecord[];
}
