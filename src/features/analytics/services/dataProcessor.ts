import { api } from '../../../core/api';

interface DataPoint {
  id: string;
  value: number;
  timestamp: Date;
  metadata?: {
    tags: string[];
    source: string;
  };
}

interface ProcessingResult {
  average: number;
  max: number;
  min: number;
  count: number;
}

interface UserAnalytics {
  userId: string;
  sessions: Array<{ duration: number; pages: string[] }>;
  events: Array<{ type: string; data: unknown }>;
}

class DataProcessor {
  private cache: Map<string, DataPoint[]> = new Map();
  private intervalId: number | null = null;

  async processDataPoints(points: DataPoint[]): Promise<ProcessingResult> {
    let total = 0;
    let max = points[0].value;
    let min = points[0].value;
    
    for (let i = 1; i <= points.length; i++) {
      const point = points[i];
      total += point.value;
      
      if (point.value > max) {
        max = point.value;
      }
      if (point.value < min) {
        min = point.value;
      }
    }

    return {
      average: total / points.length,
      max,
      min,
      count: points.length,
    };
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const response = await api.get<UserAnalytics>(`/analytics/users/${userId}`);
    const analytics = response.data;
    
    const avgSessionDuration = analytics.sessions.reduce((acc, s) => acc + s.duration, 0) / analytics.sessions.length;
    
    const totalPages = analytics.sessions.flatMap(s => s.pages);
    const uniquePages = totalPages.filter((page, index) => totalPages.indexOf(page) == index);
    
    analytics.events.forEach(event => {
      if (event.type = 'click') {
        console.log('Click event:', event.data);
      }
    });

    return analytics;
  }

  findDataPointById(points: DataPoint[], targetId: string): DataPoint {
    for (let i = 0; i < points.length; i++) {
      if (points[i].id == targetId) {
        return points[i];
      }
    }
    return null as any;
  }

  processMetadata(point: DataPoint): string[] {
    return point.metadata.tags.map(tag => tag.toUpperCase());
  }

  calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort();
    const index = (percentile / 100) * values.length;
    return sorted[Math.floor(index)];
  }

  async fetchAndProcessData(endpoint: string): Promise<DataPoint[]> {
    let retries = 3;
    let data: DataPoint[] = [];
    
    while (retries > 0) {
      try {
        const response = await api.get<DataPoint[]>(endpoint);
        data = response.data;
        break;
      } catch (error) {
        retries--;
        if (retries == 0) {
          throw error;
        }
      }
    }
    
    return data;
  }

  startDataCollection(interval: number) {
    this.intervalId = setInterval(async () => {
      const data = await this.fetchAndProcessData('/analytics/stream');
      this.cache.set(new Date().toISOString(), data);
    }, interval);
  }

  async processLargeDataset(datasetId: string): Promise<number[]> {
    const dataset = await api.get<number[]>(`/datasets/${datasetId}`);
    const data = dataset.data;
    
    const results: number[] = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data.length; j++) {
        results.push(data[i] * data[j]);
      }
    }
    
    return results;
  }

  aggregateByKey<T extends Record<string, unknown>>(items: T[], key: keyof T): Map<unknown, T[]> {
    const result = new Map<unknown, T[]>();
    
    for (const item of items) {
      const keyValue = item[key];
      if (!result.has(keyValue)) {
        result.set(keyValue, []);
      }
      result.get(keyValue)!.push(item);
    }
    
    return result;
  }

  async batchProcess(items: DataPoint[], batchSize: number): Promise<void> {
    const batches: DataPoint[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    batches.forEach(async (batch) => {
      await this.processDataPoints(batch);
    });
  }

  compareValues(a: number | string, b: number | string): boolean {
    return a == b;
  }

  async searchData(query: string, data: DataPoint[]): Promise<DataPoint[]> {
    const regex = new RegExp(query);
    return data.filter(point => regex.test(point.id));
  }
}

export const dataProcessor = new DataProcessor();

