// Data Connector Framework Types
// Frontend TypeScript interfaces for the connector system

export enum ConnectorType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  REST_API = 'rest_api',
  CSV = 'csv',
  JSON = 'json',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  ELASTICSEARCH = 'elasticsearch',
  GRAPHQL = 'graphql',
  PARQUET = 'parquet',
  EXCEL = 'excel'
}

export enum AuthenticationType {
  NONE = 'none',
  BASIC = 'basic',
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  JWT = 'jwt',
  CERTIFICATE = 'certificate'
}

export enum DataType {
  STRING = 'string',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  JSON = 'json',
  BINARY = 'binary',
  UNKNOWN = 'unknown'
}

export enum QueryType {
  SELECT = 'select',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  SCHEMA = 'schema',
  PREVIEW = 'preview'
}

export interface ConnectorConfig {
  connector_type: ConnectorType
  name: string
  description?: string
  
  // Connection settings
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  
  // Authentication
  auth_type: AuthenticationType
  api_key?: string
  token?: string
  
  // Connection pooling
  pool_size: number
  max_overflow: number
  pool_timeout: number
  
  // Timeouts
  connection_timeout: number
  query_timeout: number
  
  // SSL/TLS
  use_ssl: boolean
  ssl_cert_path?: string
  ssl_key_path?: string
  ssl_ca_path?: string
  
  // Additional settings
  extra_params: Record<string, any>
}

export interface ColumnInfo {
  name: string
  data_type: DataType
  nullable: boolean
  primary_key: boolean
  foreign_key?: string
  default_value?: any
  max_length?: number
  precision?: number
  scale?: number
  description?: string
}

export interface TableInfo {
  name: string
  schema?: string
  columns: ColumnInfo[]
  row_count?: number
  size_bytes?: number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface SchemaInfo {
  name: string
  tables: TableInfo[]
  views: TableInfo[]
  description?: string
}

export interface QueryResult {
  data: Record<string, any>[]
  columns: string[]
  row_count: number
  execution_time_ms: number
  query_id: string
  has_more: boolean
  next_offset?: number
  metadata: Record<string, any>
}

export interface PreviewResult {
  sample_data: Record<string, any>[]
  total_rows?: number
  columns: ColumnInfo[]
  data_quality: Record<string, any>
}

export interface HealthStatus {
  is_healthy: boolean
  status: 'healthy' | 'degraded' | 'unhealthy'
  last_check: string
  response_time_ms?: number
  error_message?: string
  details: Record<string, any>
}

export interface ConnectorMetrics {
  total_queries: number
  successful_queries: number
  failed_queries: number
  success_rate: number
  avg_response_time_ms: number
  last_query_time?: string
  connection_pool_size: number
  active_connections: number
}

export interface Connector {
  id: string
  connector_type: ConnectorType
  name: string
  config: ConnectorConfig
  created_at: string
  last_used?: string
  is_connected: boolean
  metrics: ConnectorMetrics
}

export interface ConnectionResult {
  success: boolean
  message: string
  connection_time_ms: number
  connector_id: string
  details: Record<string, any>
}

export interface TestResult {
  success: boolean
  message: string
  test_time_ms: number
  tests_performed: string[]
  details: Record<string, any>
}

export interface QueryRequest {
  connector_id: string
  query: string
  query_type?: QueryType
  parameters?: Record<string, any>
  limit?: number
  offset?: number
  timeout?: number
}

export interface PreviewRequest {
  connector_id: string
  table_name: string
  limit?: number
}

// Connector wizard step types
export interface ConnectorWizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  isValid: boolean
  isOptional?: boolean
}

export interface ConnectorFormData {
  // Basic info
  name: string
  description: string
  connector_type: ConnectorType
  
  // Connection details
  host: string
  port: string
  database: string
  username: string
  password: string
  
  // Authentication
  auth_type: AuthenticationType
  api_key: string
  token: string
  
  // Advanced settings
  pool_size: number
  connection_timeout: number
  query_timeout: number
  use_ssl: boolean
  
  // Extra parameters
  extra_params: Record<string, string>
}

// UI State types
export interface ConnectorListState {
  connectors: Connector[]
  loading: boolean
  error?: string
  selectedConnector?: string
  filter: {
    type?: ConnectorType
    status?: 'connected' | 'disconnected' | 'all'
    search?: string
  }
}

export interface ConnectorWizardState {
  currentStep: number
  steps: ConnectorWizardStep[]
  formData: Partial<ConnectorFormData>
  isSubmitting: boolean
  error?: string
}

export interface SchemaExplorerState {
  connector_id?: string
  schema?: SchemaInfo
  selectedTable?: string
  loading: boolean
  error?: string
  expandedTables: Set<string>
}

export interface DataPreviewState {
  connector_id?: string
  table_name?: string
  preview?: PreviewResult
  loading: boolean
  error?: string
  currentPage: number
  pageSize: number
}

// API Response types
export interface ConnectorListResponse {
  connectors: Connector[]
}

export interface ConnectorResponse {
  connector: Connector
}

export interface CreateConnectorResponse {
  connector_id: string
  message: string
  connector: Connector
}

export interface SupportedTypesResponse {
  supported_types: string[]
  auth_types: string[]
}

export interface RegistryStatsResponse {
  total_connectors: number
  connected_connectors: number
  disconnected_connectors: number
  connector_types: Record<string, number>
  supported_types: string[]
}

// Connector configuration templates
export interface ConnectorTemplate {
  type: ConnectorType
  name: string
  description: string
  icon: string
  category: 'database' | 'api' | 'file' | 'cloud'
  difficulty: 'easy' | 'medium' | 'advanced'
  defaultConfig: Partial<ConnectorConfig>
  requiredFields: string[]
  optionalFields: string[]
  documentation?: string
  examples?: ConnectorExample[]
}

export interface ConnectorExample {
  name: string
  description: string
  config: Partial<ConnectorConfig>
  sampleQuery?: string
}

// Error types
export interface ConnectorError {
  error_type: string
  message: string
  connector_type?: string
  connector_id?: string
  details: Record<string, any>
}

// Event types for real-time updates
export interface ConnectorEvent {
  type: 'connection_status' | 'health_check' | 'query_executed' | 'error'
  connector_id: string
  timestamp: string
  data: any
}

// Hook return types
export interface UseConnectorReturn {
  connectors: Connector[]
  loading: boolean
  error?: string
  createConnector: (config: ConnectorConfig) => Promise<string>
  deleteConnector: (id: string) => Promise<void>
  connectConnector: (id: string) => Promise<ConnectionResult>
  disconnectConnector: (id: string) => Promise<void>
  testConnector: (id: string) => Promise<TestResult>
  refreshConnectors: () => Promise<void>
}

export interface UseSchemaReturn {
  schema?: SchemaInfo
  tables: TableInfo[]
  loading: boolean
  error?: string
  loadSchema: (connectorId: string) => Promise<void>
  refreshSchema: () => Promise<void>
}

export interface UseQueryReturn {
  executeQuery: (request: QueryRequest) => Promise<QueryResult>
  previewData: (request: PreviewRequest) => Promise<PreviewResult>
  loading: boolean
  error?: string
}

export interface UseConnectorHealthReturn {
  healthStatus?: HealthStatus
  metrics?: ConnectorMetrics
  loading: boolean
  error?: string
  checkHealth: (connectorId: string) => Promise<void>
  getMetrics: (connectorId: string) => Promise<void>
}