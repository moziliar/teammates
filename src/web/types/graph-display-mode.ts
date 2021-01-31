/**
 * Visibility of data in the admin time-series graph.
 */

export enum GraphDisplayMode {

  /**
   * Display only the cumulative number of feedback responses.
   */
  SHOW_CUMULATIVE = 0,

  /**
   * Display only the change in the number of feedback responses.
   */
  SHOW_DIFFERENCE = 1,

  /**
   * Display both datasets.
   */
  SHOW_BOTH = 2,
}
