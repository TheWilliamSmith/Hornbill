import { MangaStatus } from '../enums/manga-status.enum';
import { ImportJobStatus, ImportJobType } from '../enums/import-job-status.enum';

export class ImportJobDto {
  id: string;
  type: ImportJobType;
  status: ImportJobStatus;
  triggeredById: string;
  totalPages: number | null;
  currentPage: number;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  errorLog: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export class ImportJobDetailDto extends ImportJobDto {
  triggeredByEmail?: string;
}
