export interface Report {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  data: ReportData;
}

export interface ReportData {
  metrics: Record<string, number>;
  charts: ChartData[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  labels: string[];
  values: number[];
}
