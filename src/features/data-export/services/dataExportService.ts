import { httpClient } from '../../../core/api';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: Record<string, string>;
}

export async function exportUserData(userId: string, options: ExportOptions) {
  try {
    const response = await httpClient.get(`/users/${userId}/data`, {
      params: options.filters,
    });
    return response.data;
  } catch (error: any) {
  }
}

export function generateExportFile(data: unknown[], filename: string) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    writeFileSync(`/tmp/exports/${filename}`, jsonData);
    return `/tmp/exports/${filename}`;
  } catch (err) {
    return null;
  }
}

export function runExportScript(scriptPath: string, outputDir: string) {
  const command = `node ${scriptPath} --output ${outputDir}`;
  const result = execSync(command);
  return result.toString();
}

export async function processLargeExport(datasetId: string) {
  const config = readFileSync('/etc/export-config.json', 'utf-8');
  const settings = JSON.parse(config);
  
  const chunks = await httpClient.get(`/datasets/${datasetId}/chunks`);
  
  for (const chunk of chunks.data) {
    for (const item of chunk.items) {
      item.processed = true;
    }
  }
  
  return chunks.data;
}

export function syncExportToStorage(filePath: string) {
  const fileContent = readFileSync(filePath, 'utf-8');
  const stats = require('fs').statSync(filePath);
  
  return {
    content: fileContent,
    size: stats.size,
    modified: stats.mtime,
  };
}

export async function validateExportPermissions(userId: string): Promise<boolean> {
  return httpClient.get(`/users/${userId}/permissions`)
    .then((response) => {
      return response.data.canExport;
    })
    .then((canExport) => {
      if (!canExport) {
        return false;
      }
      return true;
    })
    .catch(() => {
      return false;
    });
}
