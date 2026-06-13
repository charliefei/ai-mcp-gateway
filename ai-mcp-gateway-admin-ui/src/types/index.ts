// ==============================
// API 通用响应类型
// ==============================

export interface ApiResponse<T> {
  code: string
  info: string
  data: T
}

export interface ApiResponsePage<T> {
  code: string
  info: string
  data: T
  total: number
}

// ==============================
// 网关配置
// ==============================

export interface GatewayConfigDTO {
  gatewayId: string
  gatewayName: string
  gatewayDesc: string
  version: string
  auth: number
  status: number
}

export interface GatewayConfigQueryDTO {
  gatewayId?: string
  gatewayName?: string
  page: number
  rows: number
}

export interface GatewayConfigSaveRequest {
  gatewayId: string
  gatewayName: string
  gatewayDesc: string
  version: string
  auth: number
  status: number
}

// ==============================
// 网关工具配置
// ==============================

export interface GatewayToolConfigDTO {
  gatewayId: string
  toolId: number
  toolName: string
  toolType: string
  toolDescription: string
  toolVersion: string
  protocolId: number
  protocolType: string
}

export interface GatewayToolQueryDTO {
  gatewayId?: string
  toolId?: string
  page: number
  rows: number
}

export interface GatewayToolSaveRequest {
  gatewayId: string
  toolId?: number
  toolName: string
  toolType: string
  toolDescription: string
  toolVersion: string
  protocolId: number
  protocolType: string
}

// ==============================
// 网关协议配置
// ==============================

export interface ProtocolMappingDTO {
  mappingType: string
  parentPath: string
  fieldName: string
  mcpPath: string
  mcpType: string
  mcpDesc: string
  isRequired: number
  sortOrder: number
}

export interface GatewayProtocolDTO {
  protocolId: number
  httpUrl: string
  httpMethod: string
  httpHeaders: string
  timeout: number
  mappings: ProtocolMappingDTO[]
}

export interface GatewayProtocolQueryDTO {
  protocolId?: number
  httpUrl?: string
  page: number
  rows: number
}

export interface HTTPProtocolSave {
  protocolId?: number
  httpUrl: string
  httpHeaders: string
  httpMethod: string
  timeout: number
  mappings: ProtocolMappingSave[]
}

export interface ProtocolMappingSave {
  mappingType: string
  parentPath: string
  fieldName: string
  mcpPath: string
  mcpType: string
  mcpDesc: string
  isRequired: number
  sortOrder: number
}

export interface GatewayProtocolSaveRequest {
  httpProtocols: HTTPProtocolSave[]
}

export interface GatewayProtocolImportRequest {
  openApiJson: string
  endpoints: string[]
}

// ==============================
// 网关认证配置
// ==============================

export interface GatewayAuthDTO {
  gatewayId: string
  apiKey: string
  rateLimit: number
  expireTime: string
}

export interface GatewayAuthQueryDTO {
  gatewayId?: string
  page: number
  rows: number
}

export interface GatewayAuthSaveRequest {
  gatewayId: string
  rateLimit: number
  expireTime: string
}

// ==============================
// 网关测试调用
// ==============================

export interface GatewayLLMRequestDTO {
  gatewayId: string
  authApiKey: string
  timeout: number
  message: string
  reload: boolean
  /** 传输协议：sse / streamable；不传默认 sse */
  transport?: string
}

export interface GatewayLLMResponseDTO {
  content: string
}

// ==============================
// 通用响应
// ==============================

export interface GatewayConfigResponseDTO {
  success: boolean
}

// ==============================
// 全局搜索
// ==============================

export type GlobalSearchItemType = 'gateway' | 'tool' | 'protocol' | 'auth'

export interface GlobalSearchItem {
  id: string
  type: GlobalSearchItemType
  title: string
  subtitle?: string
  description?: string
  badge?: string
  status?: number
  path: string
  queryParamKey?: string
}

export interface GlobalSearchCategory {
  type: GlobalSearchItemType
  label: string
  count: number
  /** 超出 limit 的剩余条数；>0 时前端可展示"查看全部" */
  truncated: number
  items: GlobalSearchItem[]
}

export interface GlobalSearchResult {
  keyword: string
  total: number
  categories: GlobalSearchCategory[]
}
