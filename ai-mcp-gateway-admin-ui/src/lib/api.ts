import axios from 'axios'
import type {
  ApiResponse,
  ApiResponsePage,
  GatewayConfigDTO,
  GatewayConfigQueryDTO,
  GatewayConfigSaveRequest,
  GatewayToolConfigDTO,
  GatewayToolQueryDTO,
  GatewayToolSaveRequest,
  GatewayProtocolDTO,
  GatewayProtocolQueryDTO,
  GatewayProtocolSaveRequest,
  GatewayProtocolImportRequest,
  GatewayAuthDTO,
  GatewayAuthQueryDTO,
  GatewayAuthSaveRequest,
  GatewayLLMRequestDTO,
  GatewayLLMResponseDTO,
  GatewayConfigResponseDTO,
  GlobalSearchResult,
} from '@/types'

const BASE_URL = '/api-gateway/admin/'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器: 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.info || error.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

// ==============================
// 网关配置 API
// ==============================

export const gatewayApi = {
  saveGatewayConfig(data: GatewayConfigSaveRequest) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>('save_gateway_config', data)
  },

  queryGatewayConfigPage(params: GatewayConfigQueryDTO) {
    return apiClient.get<ApiResponsePage<GatewayConfigDTO[]>>('query_gateway_config_page', { params })
  },

  queryGatewayConfigList() {
    return apiClient.get<ApiResponse<GatewayConfigDTO[]>>('query_gateway_config_list')
  },
}

// ==============================
// 网关工具 API
// ==============================

export const toolApi = {
  saveGatewayToolConfig(data: GatewayToolSaveRequest) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>('save_gateway_tool_config', data)
  },

  queryGatewayToolPage(params: GatewayToolQueryDTO) {
    return apiClient.get<ApiResponsePage<GatewayToolConfigDTO[]>>('query_gateway_tool_page', { params })
  },

  queryGatewayToolList() {
    return apiClient.get<ApiResponse<GatewayToolConfigDTO[]>>('query_gateway_tool_list')
  },

  queryGatewayToolListByGatewayId(gatewayId: string) {
    return apiClient.get<ApiResponse<GatewayToolConfigDTO[]>>('query_gateway_tool_list_by_gateway_id', {
      params: { gatewayId },
    })
  },

  deleteGatewayToolConfig(gatewayId: string, toolId: number) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>(
      'delete_gateway_tool_config',
      null,
      { params: { gatewayId, toolId } }
    )
  },
}

// ==============================
// 网关协议 API
// ==============================

export const protocolApi = {
  saveGatewayProtocol(data: GatewayProtocolSaveRequest) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>('save_gateway_protocol', data)
  },

  importGatewayProtocol(data: GatewayProtocolImportRequest) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>('import_gateway_protocol', data)
  },

  analysisProtocol(data: GatewayProtocolImportRequest) {
    return apiClient.post<ApiResponse<GatewayProtocolDTO[]>>('analysis_protocol', data)
  },

  queryGatewayProtocolPage(params: GatewayProtocolQueryDTO) {
    return apiClient.get<ApiResponsePage<GatewayProtocolDTO[]>>('query_gateway_protocol_page', { params })
  },

  queryGatewayProtocolList() {
    return apiClient.get<ApiResponse<GatewayProtocolDTO[]>>('query_gateway_protocol_list')
  },

  queryGatewayProtocolListByGatewayId(gatewayId: string) {
    return apiClient.get<ApiResponse<GatewayProtocolDTO[]>>('query_gateway_protocol_list_by_gateway_id', {
      params: { gatewayId },
    })
  },

  deleteGatewayProtocol(protocolId: number) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>(
      'delete_gateway_protocol',
      null,
      { params: { protocolId } }
    )
  },
}

// ==============================
// 网关认证 API
// ==============================

export const authApi = {
  saveGatewayAuth(data: GatewayAuthSaveRequest) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>('save_gateway_auth', data)
  },

  queryGatewayAuthPage(params: GatewayAuthQueryDTO) {
    return apiClient.get<ApiResponsePage<GatewayAuthDTO[]>>('query_gateway_auth_page', { params })
  },

  queryGatewayAuthList() {
    return apiClient.get<ApiResponse<GatewayAuthDTO[]>>('query_gateway_auth_list')
  },

  queryGatewayAuthListByGatewayId(gatewayId: string) {
    return apiClient.get<ApiResponse<GatewayAuthDTO[]>>('query_gateway_auth_list_by_gateway_id', {
      params: { gatewayId },
    })
  },

  deleteGatewayAuth(gatewayId: string) {
    return apiClient.post<ApiResponse<GatewayConfigResponseDTO>>(
      'delete_gateway_auth',
      null,
      { params: { gatewayId } }
    )
  },
}

// ==============================
// 网关测试调用 API
// ==============================

export const testApi = {
  testCallGateway(data: GatewayLLMRequestDTO) {
    return apiClient.post<ApiResponse<GatewayLLMResponseDTO>>('test_call_gateway', data)
  },
}

// ==============================
// 全局搜索 API
// ==============================

export const searchApi = {
  /**
   * 跨网关/工具/协议/认证四个维度的关键字检索。
   * @param keyword 搜索关键字
   * @param limit 每个分类返回的最大条数（默认 5）
   */
  globalSearch(keyword: string, limit = 5) {
    return apiClient
      .get<ApiResponse<GlobalSearchResult>>('global_search', { params: { keyword, limit } })
      .then((r) => r.data.data)
  },
}

export default apiClient
