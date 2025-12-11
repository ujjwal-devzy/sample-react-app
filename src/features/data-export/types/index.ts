export interface ExportJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'json' | 'xlsx';
  createdAt: Date;
  completedAt?: Date;
  fileUrl?: string;
}

export interface ExportConfig {
  maxRecords: number;
  allowedFormats: string[];
  retentionDays: number;
}
