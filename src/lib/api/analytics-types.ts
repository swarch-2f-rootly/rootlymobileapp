// Analytics-specific types

// Exact structure from the API response
export interface Metric {
  metric_name: string;
  value: number;
  unit: string;
  calculated_at: string;
  controller_id: string;
  description: string | null;
}

export interface FilterApplied {
  start_time: string | null;
  end_time: string | null;
  limit: number | null;
}

// Main response from /api/v1/analytics/multi-report
export interface MultiMetricReportResponse {
  controller_id: string;
  metrics: Metric[];
  generated_at: string;
  data_points_count: number;
  filters_applied: FilterApplied;
}

// Legacy interfaces for backwards compatibility (but will map to new structure)
export interface AnalyticsReport {
  controllerId: string;
  generatedAt: string;
  dataPointsCount: number;
  metrics: Metric[];
}

export interface AnalyticsMetric {
  metricName: string;
  value: number;
  unit: string;
  calculatedAt: string;
  controllerId: string;
  description: string | null;
}

export interface AnalyticsHealth {
  status: string;
  service: string;
  influxdb: string;
  influxdbUrl: string;
  timestamp: string;
}

export interface AnalyticsFilterInput {
  limit?: number;
  startTime?: string;
  endTime?: string;
}

export interface MultiMetricReportInput {
  controllers: string[];
  metrics: string[];
  filters?: AnalyticsFilterInput;
}

export interface TrendAnalysisInput {
  metricName: string;
  controllerId: string;
  startTime: string;
  endTime: string;
  interval: string;
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  interval: string;
}

export interface TrendAnalysis {
  metricName: string;
  controllerId: string;
  interval: string;
  generatedAt: string;
  totalPoints: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  dataPoints: TrendDataPoint[];
}

export interface LatestMeasurement {
  controller_id: string;
  measurement: {
    metric_name: string;
    value: number;
    unit: string;
    calculated_at: string;
    controller_id: string;
    description: string | null;
  };
  status: string;
  last_checked: string;
  data_age_minutes: number;
}

