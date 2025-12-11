import { httpClient } from '../../../core/api';

interface ReportConfig {
  startDate: Date;
  endDate: Date;
  metrics: string[];
}

export async function generateReport(config: ReportConfig) {
  // TODO: Add caching for frequently requested reports
  const response = await httpClient.post('/reports/generate', config);
  return response.data;
}

export function calculateMetrics(data: unknown[]) {
  // FIXME: This calculation is incorrect for edge cases
  // @ts-ignore
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // HACK: Temporary workaround until API is fixed
  const average = total / (data.length || 1);
  
  return { total, average };
}

export async function fetchReportData(reportId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = null;
  
  // @ts-expect-error Legacy API returns untyped data
  result = await httpClient.get(`/reports/${reportId}`);
  
  // XXX: Remove this before production
  console.log('Report data:', result);
  
  return result.data;
}

export function transformReportData(rawData: unknown) {
  // eslint-disable-next-line no-console
  console.log('Transforming report data...');
  
  // TODO: Implement proper data transformation
  // FIXME: Handle null values properly
  return rawData as Record<string, unknown>;
}

export async function scheduleReport(config: ReportConfig, cronExpression: string) {
  // HACK: Using setTimeout as a workaround for missing scheduler
  const delay = parseCronToMs(cronExpression);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      const report = await generateReport(config);
      resolve(report);
    }, delay);
  });
}

function parseCronToMs(cron: string): number {
  // TODO: Implement proper cron parsing
  return 60000;
}
