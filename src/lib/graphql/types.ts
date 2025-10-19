// Analytics-specific types (from frontend documentation)
export interface AnalyticsReport {
  controllerId: string;
  generatedAt: string;
  dataPointsCount: number;
  metrics: AnalyticsMetric[];
}

export interface AnalyticsMetric {
  metricName: string;
  value: number;
  unit: string;
  calculatedAt: string;
  controllerId: string;
  description: string;
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

// Response types for analytics queries
export interface SupportedMetricsResponse {
  getSupportedMetrics: string[];
}

export interface AnalyticsHealthResponse {
  getAnalyticsHealth: AnalyticsHealth;
}

export interface SingleMetricReportResponse {
  getSingleMetricReport: AnalyticsReport;
}

export interface MultiMetricReportResponse {
  getMultiMetricReport: {
    generatedAt: string;
    totalControllers: number;
    totalMetrics: number;
    reports: AnalyticsReport[];
  };
}

export interface TrendAnalysisResponse {
  getTrendAnalysis: TrendAnalysis;
}
