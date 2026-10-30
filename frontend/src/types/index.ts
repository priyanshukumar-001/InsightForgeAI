/**
 * InsightForge AI - Core Frontend TypeScript Contracts
 */

export type InferredType = 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'text';

export interface ColumnProfile {
  name: string;
  inferredType: InferredType;
  pandasType: string;
  nonNullCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: any[];
}

export interface MissingValueStat {
  column: string;
  missingCount: number;
  missingPercentage: number;
  nonNullCount: number;
}

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  duplicateRows: number;
  repeatedIds?: number;
  primaryIdColumn?: string;
  healthScore: number;
  typeCounts: {
    numeric: number;
    categorical: number;
    datetime: number;
    boolean: number;
    text: number;
  };
  columns: ColumnProfile[];
  missingValues: MissingValueStat[];
}

export interface DatasetItem {
  id: string;
  name: string;
  filename: string;
  fileSize: number;
  mimeType?: string;
  isSample: boolean;
  status: 'ready' | 'processing' | 'error';
  profile?: DatasetProfile;
  description?: string;
  parentDatasetId?: string;
  cleaningAudit?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface PreviewData {
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  columns: string[];
  rows: Record<string, any>[];
}

export interface NumericSummaryItem {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
  sum: number;
  iqr: number;
  skewness: number;
}

export interface CategoricalSummaryItem {
  column: string;
  uniqueCount: number;
  topCategory: string;
  topCategoryCount: number;
  distribution: {
    label: string;
    count: number;
    percentage: number;
  }[];
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: {
    column: string;
    values: number[];
  }[];
  significantPairs: {
    columnA: string;
    columnB: string;
    correlation: number;
    strength: 'strong' | 'moderate';
    direction: 'positive' | 'negative';
  }[];
}

export interface AnalyticsResponse {
  numeric: NumericSummaryItem[];
  categorical: CategoricalSummaryItem[];
  correlations: CorrelationMatrix;
}

export interface ChartDataResponse {
  chartType: 'bar' | 'line' | 'scatter' | 'histogram' | 'pie' | 'area' | 'boxplot';
  xAxis?: string;
  yAxis?: string;
  category?: string;
  aggregation?: string;
  data: any[];
  categories?: string[];
  correlation?: number;
  correlationLabel?: string;
  totalValidPoints?: number;
  filteredPoints?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  insights?: string[];
}

export interface TestConnectionResponse {
  provider: string;
  model: string;
  status: string;
  latencyMs: number;
  message: string;
}

export interface AIProviderStatus {
  id: string;
  name: string;
  configured: boolean;
  isPrimary: boolean;
  isFallback: boolean;
  capabilities: {
    textGeneration: boolean;
    toolCalling: boolean;
    structuredOutput: boolean;
    isDemo?: boolean;
  };
}

export interface AssistantResponse {
  answer: string;
  provider: string;
  isDemo: boolean;
  toolExecuted?: string | null;
  toolResult?: any;
  chartData?: ChartDataResponse | null;
  auditTrail?: string[];
}

export interface ReportItem {
  id: string;
  title: string;
  datasetId: string;
  datasetName: string;
  summary: string;
  status: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: 'ai_query' | 'cleaning' | 'report';
  datasetId: string;
  datasetName: string;
  title?: string;
  question?: string;
  answer?: string;
  provider?: string;
  toolExecuted?: string;
  hasChart?: boolean;
  details?: any;
  timestamp: string;
}
