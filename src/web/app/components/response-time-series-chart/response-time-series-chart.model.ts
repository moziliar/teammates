/**
 * The form model for the response time series chart display options.
 */
import { FeedbackResponseRecord } from "../../../types/api-output";

export interface ResponseTimeSeriesChartModel {
  durationMinutes: number;
  intervalSeconds: number;
  responseRecords: FeedbackResponseRecord[];
}
