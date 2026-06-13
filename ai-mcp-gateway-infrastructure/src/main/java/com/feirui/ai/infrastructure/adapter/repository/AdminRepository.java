package com.feirui.ai.infrastructure.adapter.repository;

import com.feirui.ai.domain.admin.model.entity.*;
import com.feirui.ai.domain.admin.adapter.respository.IAdminRepository;
import com.feirui.ai.infrastructure.dao.*;
import com.feirui.ai.infrastructure.dao.po.*;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class AdminRepository implements IAdminRepository {

    @Resource
    private IMcpGatewayAuthDao mcpGatewayAuthDao;
    @Resource
    private IMcpGatewayDao mcpGatewayDao;
    @Resource
    private IMcpGatewayToolDao mcpGatewayToolDao;
    @Resource
    private IMcpProtocolHttpDao protocolHttpDao;
    @Resource
    private IMcpProtocolMappingDao protocolMappingDao;

    @Override
    public List<GatewayConfigEntity> queryGatewayConfigList() {
        List<McpGatewayPO> mcpGatewayPOS = mcpGatewayDao.queryAll();
        return mcpGatewayPOS.stream().map(po -> GatewayConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .gatewayName(po.getGatewayName())
                .gatewayDesc(po.getGatewayDesc())
                .version(po.getVersion())
                .auth(po.getAuth())
                .status(po.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Override
    public GatewayConfigPageEntity queryGatewayConfigPage(GatewayConfigQueryEntity queryEntity) {
        McpGatewayPO query = new McpGatewayPO();
        query.setGatewayId(queryEntity.getGatewayId());
        query.setGatewayName(queryEntity.getGatewayName());
        query.setPage(queryEntity.getPage());
        query.setRows(queryEntity.getRows());

        Long count = mcpGatewayDao.queryGatewayListCount(query);
        if (count == null || count == 0) {
            return GatewayConfigPageEntity.builder()
                    .dataList(new java.util.ArrayList<>())
                    .total(0L)
                    .build();
        }

        List<McpGatewayPO> mcpGatewayPOS = mcpGatewayDao.queryGatewayList(query);
        List<GatewayConfigEntity> dataList = mcpGatewayPOS.stream().map(po -> GatewayConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .gatewayName(po.getGatewayName())
                .gatewayDesc(po.getGatewayDesc())
                .version(po.getVersion())
                .auth(po.getAuth())
                .status(po.getStatus())
                .build()).collect(Collectors.toList());

        return GatewayConfigPageEntity.builder()
                .dataList(dataList)
                .total(count)
                .build();
    }

    @Override
    public List<GatewayToolConfigEntity> queryGatewayToolList() {
        List<com.feirui.ai.infrastructure.dao.po.McpGatewayToolPO> mcpGatewayToolPOS = mcpGatewayToolDao.queryAll();
        return mcpGatewayToolPOS.stream().map(po -> GatewayToolConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .toolId(po.getToolId())
                .toolName(po.getToolName())
                .toolType(po.getToolType())
                .toolDescription(po.getToolDescription())
                .toolVersion(po.getToolVersion())
                .protocolId(po.getProtocolId())
                .protocolType(po.getProtocolType())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<GatewayProtocolConfigEntity> queryGatewayProtocolList() {
        List<McpProtocolHttpPO> pos = protocolHttpDao.queryAll();
        return pos.stream().map(po -> {
            List<McpProtocolMappingPO> mappings = protocolMappingDao.queryMcpGatewayToolConfigListByProtocolId(po.getProtocolId());
            return GatewayProtocolConfigEntity.builder()
                    .protocolId(po.getProtocolId())
                    .httpUrl(po.getHttpUrl())
                    .httpMethod(po.getHttpMethod())
                    .httpHeaders(po.getHttpHeaders())
                    .timeout(po.getTimeout())
                    .mappings(mappings == null ? null : mappings.stream().map(m -> GatewayProtocolConfigEntity.ProtocolMappingEntity.builder()
                            .mappingType(m.getMappingType())
                            .parentPath(m.getParentPath())
                            .fieldName(m.getFieldName())
                            .mcpPath(m.getMcpPath())
                            .mcpType(m.getMcpType())
                            .mcpDesc(m.getMcpDesc())
                            .isRequired(m.getIsRequired())
                            .sortOrder(m.getSortOrder())
                            .build()).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<GatewayAuthConfigEntity> queryGatewayAuthList() {
        List<McpGatewayAuthPO> mcpGatewayAuthPOS = mcpGatewayAuthDao.queryAll();
        return mcpGatewayAuthPOS.stream().map(po -> GatewayAuthConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .apiKey(po.getApiKey())
                .rateLimit(po.getRateLimit())
                .expireTime(po.getExpireTime())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<GatewayAuthConfigEntity> queryGatewayAuthListByGatewayId(String gatewayId) {
        // 直接按网关ID过滤认证配置，不做业务逻辑判断
        List<McpGatewayAuthPO> pos = mcpGatewayAuthDao.queryListByGatewayId(gatewayId);
        return pos.stream().map(po -> GatewayAuthConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .apiKey(po.getApiKey())
                .rateLimit(po.getRateLimit())
                .expireTime(po.getExpireTime())
                .build()).collect(Collectors.toList());
    }

    @Override
    public GatewayAuthPageEntity queryGatewayAuthPage(GatewayAuthQueryEntity queryEntity) {
        McpGatewayAuthPO query = new McpGatewayAuthPO();
        query.setGatewayId(queryEntity.getGatewayId());
        query.setPage(queryEntity.getPage());
        query.setRows(queryEntity.getRows());

        Long count = mcpGatewayAuthDao.queryAuthListCount(query);
        if (count == null || count == 0) {
            return GatewayAuthPageEntity.builder()
                    .dataList(new java.util.ArrayList<>())
                    .total(0L)
                    .build();
        }

        List<McpGatewayAuthPO> pos = mcpGatewayAuthDao.queryAuthList(query);
        List<GatewayAuthConfigEntity> dataList = pos.stream().map(po -> GatewayAuthConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .apiKey(po.getApiKey())
                .rateLimit(po.getRateLimit())
                .expireTime(po.getExpireTime())
                .build()).collect(Collectors.toList());

        return GatewayAuthPageEntity.builder()
                .dataList(dataList)
                .total(count)
                .build();
    }

    @Override
    public GatewayToolPageEntity queryGatewayToolPage(GatewayToolQueryEntity queryEntity) {
        McpGatewayToolPO query = new McpGatewayToolPO();
        query.setGatewayId(queryEntity.getGatewayId());
        if (queryEntity.getToolId() != null && !queryEntity.getToolId().trim().isEmpty()) {
            query.setToolId(Long.parseLong(queryEntity.getToolId()));
        }
        query.setPage(queryEntity.getPage());
        query.setRows(queryEntity.getRows());

        Long count = mcpGatewayToolDao.queryToolListCount(query);
        if (count == null || count == 0) {
            return GatewayToolPageEntity.builder()
                    .dataList(new java.util.ArrayList<>())
                    .total(0L)
                    .build();
        }

        List<McpGatewayToolPO> mcpGatewayToolPOS = mcpGatewayToolDao.queryToolList(query);
        List<GatewayToolConfigEntity> dataList = mcpGatewayToolPOS.stream().map(po -> GatewayToolConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .toolId(po.getToolId())
                .toolName(po.getToolName())
                .toolType(po.getToolType())
                .toolDescription(po.getToolDescription())
                .toolVersion(po.getToolVersion())
                .protocolId(po.getProtocolId())
                .protocolType(po.getProtocolType())
                .build()).collect(Collectors.toList());

        return GatewayToolPageEntity.builder()
                .dataList(dataList)
                .total(count)
                .build();
    }

    @Override
    public List<GatewayToolConfigEntity> queryGatewayToolListByGatewayId(String gatewayId) {
        List<McpGatewayToolPO> pos = mcpGatewayToolDao.queryListByGatewayId(gatewayId);
        return pos.stream().map(po -> GatewayToolConfigEntity.builder()
                .gatewayId(po.getGatewayId())
                .toolId(po.getToolId())
                .toolName(po.getToolName())
                .toolType(po.getToolType())
                .toolDescription(po.getToolDescription())
                .toolVersion(po.getToolVersion())
                .protocolId(po.getProtocolId())
                .protocolType(po.getProtocolType())
                .build()).collect(Collectors.toList());
    }

    @Override
    public GatewayProtocolPageEntity queryGatewayProtocolPage(GatewayProtocolQueryEntity queryEntity) {
        McpProtocolHttpPO query = new McpProtocolHttpPO();
        query.setProtocolId(queryEntity.getProtocolId());
        query.setHttpUrl(queryEntity.getHttpUrl());
        query.setPage(queryEntity.getPage());
        query.setRows(queryEntity.getRows());

        Long count = protocolHttpDao.queryProtocolListCount(query);
        if (count == null || count == 0) {
            return GatewayProtocolPageEntity.builder()
                    .dataList(new java.util.ArrayList<>())
                    .total(0L)
                    .build();
        }

        List<McpProtocolHttpPO> pos = protocolHttpDao.queryProtocolList(query);
        List<Long> protocolIds = pos.stream().map(McpProtocolHttpPO::getProtocolId).collect(Collectors.toList());
        List<McpProtocolMappingPO> mappings = protocolMappingDao.queryListByProtocolIds(protocolIds);

        List<GatewayProtocolConfigEntity> dataList = pos.stream().map(po -> {
            List<McpProtocolMappingPO> protocolMappings = mappings.stream()
                    .filter(m -> m.getProtocolId().equals(po.getProtocolId()))
                    .collect(Collectors.toList());

            return GatewayProtocolConfigEntity.builder()
                    .protocolId(po.getProtocolId())
                    .httpUrl(po.getHttpUrl())
                    .httpMethod(po.getHttpMethod())
                    .httpHeaders(po.getHttpHeaders())
                    .timeout(po.getTimeout())
                    .mappings(protocolMappings.isEmpty() ? null : protocolMappings.stream().map(m -> GatewayProtocolConfigEntity.ProtocolMappingEntity.builder()
                            .mappingType(m.getMappingType())
                            .parentPath(m.getParentPath())
                            .fieldName(m.getFieldName())
                            .mcpPath(m.getMcpPath())
                            .mcpType(m.getMcpType())
                            .mcpDesc(m.getMcpDesc())
                            .isRequired(m.getIsRequired())
                            .sortOrder(m.getSortOrder())
                            .build()).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());

        return GatewayProtocolPageEntity.builder()
                .dataList(dataList)
                .total(count)
                .build();
    }

    @Override
    public List<GatewayProtocolConfigEntity> queryGatewayProtocolListByProtocolIds(List<Long> protocolIds) {
        if (protocolIds == null || protocolIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<McpProtocolHttpPO> pos = protocolHttpDao.queryListByProtocolIds(protocolIds);
        List<McpProtocolMappingPO> mappings = protocolMappingDao.queryListByProtocolIds(protocolIds);

        return pos.stream().map(po -> {
            List<McpProtocolMappingPO> protocolMappings = mappings.stream()
                    .filter(m -> m.getProtocolId().equals(po.getProtocolId()))
                    .collect(Collectors.toList());

            return GatewayProtocolConfigEntity.builder()
                    .protocolId(po.getProtocolId())
                    .httpUrl(po.getHttpUrl())
                    .httpMethod(po.getHttpMethod())
                    .httpHeaders(po.getHttpHeaders())
                    .timeout(po.getTimeout())
                    .mappings(protocolMappings.isEmpty() ? null : protocolMappings.stream().map(m -> GatewayProtocolConfigEntity.ProtocolMappingEntity.builder()
                            .mappingType(m.getMappingType())
                            .parentPath(m.getParentPath())
                            .fieldName(m.getFieldName())
                            .mcpPath(m.getMcpPath())
                            .mcpType(m.getMcpType())
                            .mcpDesc(m.getMcpDesc())
                            .isRequired(m.getIsRequired())
                            .sortOrder(m.getSortOrder())
                            .build()).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public GlobalSearchResultEntity globalSearch(GlobalSearchQueryEntity queryEntity) {
        // 兜底：关键字为空直接返回空结果，避免查全表
        String keyword = queryEntity == null ? null : queryEntity.getKeyword();
        if (keyword == null || keyword.trim().isEmpty()) {
            return GlobalSearchResultEntity.builder()
                    .keyword(keyword == null ? "" : keyword)
                    .total(0)
                    .categories(java.util.Collections.emptyList())
                    .build();
        }
        // 上限 50（防止前端恶意传大值），下限 1
        int userLimit = queryEntity.getLimit() == null || queryEntity.getLimit() <= 0 ? 5 : queryEntity.getLimit();
        int limit = Math.min(userLimit, 50);
        // 用 limit+1 探测是否还有更多命中
        int probeLimit = limit + 1;

        List<GlobalSearchResultEntity.Category> categories = new java.util.ArrayList<>(4);
        int total = 0;

        // ---- 1. 网关 ----
        List<McpGatewayPO> gatewayPos = mcpGatewayDao.searchGatewayList(keyword, probeLimit);
        if (!gatewayPos.isEmpty()) {
            boolean hasMore = gatewayPos.size() > limit;
            List<McpGatewayPO> shown = hasMore ? gatewayPos.subList(0, limit) : gatewayPos;
            int categoryCount = hasMore ? limit + 1 : shown.size();
            List<GlobalSearchResultEntity.Item> items = shown.stream()
                    .map(po -> GlobalSearchResultEntity.Item.builder()
                            .id(po.getGatewayId())
                            .type("gateway")
                            .title(emptyToFallback(po.getGatewayName(), po.getGatewayId()))
                            .subtitle(po.getGatewayId())
                            .description(po.getGatewayDesc())
                            .status(po.getStatus())
                            .path("/gateway")
                            .queryParamKey("gatewayName")
                            .build())
                    .collect(Collectors.toList());
            categories.add(GlobalSearchResultEntity.Category.builder()
                    .type("gateway")
                    .label("网关")
                    .count(categoryCount)
                    .truncated(hasMore ? 1 : 0)
                    .items(items)
                    .build());
            total += categoryCount;
        }

        // ---- 2. 工具 ----
        List<McpGatewayToolPO> toolPos = mcpGatewayToolDao.searchToolList(keyword, probeLimit);
        if (!toolPos.isEmpty()) {
            boolean hasMore = toolPos.size() > limit;
            List<McpGatewayToolPO> shown = hasMore ? toolPos.subList(0, limit) : toolPos;
            int categoryCount = hasMore ? limit + 1 : shown.size();
            List<GlobalSearchResultEntity.Item> items = shown.stream()
                    .map(po -> GlobalSearchResultEntity.Item.builder()
                            .id(po.getToolId() == null ? "" : po.getToolId().toString())
                            .type("tool")
                            .title(emptyToFallback(po.getToolName(), po.getToolId() == null ? "" : po.getToolId().toString()))
                            .subtitle(po.getGatewayId() + " / " + po.getToolId())
                            .description(po.getToolDescription())
                            .path("/tool")
                            .queryParamKey("toolName")
                            .build())
                    .collect(Collectors.toList());
            categories.add(GlobalSearchResultEntity.Category.builder()
                    .type("tool")
                    .label("工具")
                    .count(categoryCount)
                    .truncated(hasMore ? 1 : 0)
                    .items(items)
                    .build());
            total += categoryCount;
        }

        // ---- 3. 协议 ----
        List<McpProtocolHttpPO> protocolPos = protocolHttpDao.searchProtocolList(keyword, probeLimit);
        if (!protocolPos.isEmpty()) {
            boolean hasMore = protocolPos.size() > limit;
            List<McpProtocolHttpPO> shown = hasMore ? protocolPos.subList(0, limit) : protocolPos;
            int categoryCount = hasMore ? limit + 1 : shown.size();
            List<GlobalSearchResultEntity.Item> items = shown.stream()
                    .map(po -> GlobalSearchResultEntity.Item.builder()
                            .id(po.getProtocolId() == null ? "" : po.getProtocolId().toString())
                            .type("protocol")
                            .title((po.getHttpMethod() == null ? "" : po.getHttpMethod()) + " " + (po.getHttpUrl() == null ? "" : po.getHttpUrl()))
                            .subtitle(po.getProtocolId() == null ? "" : po.getProtocolId().toString())
                            .badge(po.getHttpMethod())
                            .path("/protocol")
                            .queryParamKey("httpUrl")
                            .build())
                    .collect(Collectors.toList());
            categories.add(GlobalSearchResultEntity.Category.builder()
                    .type("protocol")
                    .label("协议")
                    .count(categoryCount)
                    .truncated(hasMore ? 1 : 0)
                    .items(items)
                    .build());
            total += categoryCount;
        }

        // ---- 4. 认证 ----
        List<McpGatewayAuthPO> authPos = mcpGatewayAuthDao.searchAuthList(keyword, probeLimit);
        if (!authPos.isEmpty()) {
            boolean hasMore = authPos.size() > limit;
            List<McpGatewayAuthPO> shown = hasMore ? authPos.subList(0, limit) : authPos;
            int categoryCount = hasMore ? limit + 1 : shown.size();
            List<GlobalSearchResultEntity.Item> items = shown.stream()
                    .map(po -> GlobalSearchResultEntity.Item.builder()
                            .id(po.getGatewayId())
                            .type("auth")
                            .title(maskApiKey(po.getApiKey()))
                            .subtitle(po.getGatewayId())
                            .path("/auth")
                            .queryParamKey("gatewayId")
                            .build())
                    .collect(Collectors.toList());
            categories.add(GlobalSearchResultEntity.Category.builder()
                    .type("auth")
                    .label("认证")
                    .count(categoryCount)
                    .truncated(hasMore ? 1 : 0)
                    .items(items)
                    .build());
            total += categoryCount;
        }

        return GlobalSearchResultEntity.builder()
                .keyword(keyword)
                .total(total)
                .categories(categories)
                .build();
    }

    private static String emptyToFallback(String primary, String fallback) {
        return (primary == null || primary.isEmpty()) ? (fallback == null ? "" : fallback) : primary;
    }

    /**
     * 简单掩码：前 4 后 4，中间 ***；长度过短时返回 *** 整串。
     */
    private static String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "";
        }
        if (apiKey.length() <= 8) {
            return "***";
        }
        return apiKey.substring(0, 4) + "***" + apiKey.substring(apiKey.length() - 4);
    }

}
