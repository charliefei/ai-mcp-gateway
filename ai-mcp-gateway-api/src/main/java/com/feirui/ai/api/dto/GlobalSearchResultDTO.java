package com.feirui.ai.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 全局搜索结果 DTO
 * <p>
 * 结果按分类（网关/工具/协议/认证）分组返回，每个分类最多展示 limit 条，超出部分通过 truncated 提示"查看全部"。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchResultDTO implements Serializable {

    /** 用户输入的关键字 */
    private String keyword;

    /** 命中总数（所有分类合计） */
    private Integer total;

    /** 各分类的命中结果，按 gateway / tool / protocol / auth 顺序返回 */
    private List<Category> categories;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Category implements Serializable {

        /** 分类枚举：gateway / tool / protocol / auth */
        private String type;

        /** 中文标签：网关 / 工具 / 协议 / 认证 */
        private String label;

        /** 当前分类命中数量（截断前的总数） */
        private Integer count;

        /** 超出 limit 的剩余条数（0 表示未截断，前端无需展示"查看全部"） */
        private Integer truncated;

        /** 命中条目 */
        private List<Item> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item implements Serializable {

        /** 记录主键（gatewayId / toolId / protocolId） */
        private String id;

        /** 分类枚举（同 Category.type） */
        private String type;

        /** 主标题 */
        private String title;

        /** 副标题（一般为 ID / URL） */
        private String subtitle;

        /** 描述（可空） */
        private String description;

        /** 标签（协议类型显示 HTTP 方法） */
        private String badge;

        /** 状态（网关用：1 启用 / 0 禁用） */
        private Integer status;

        /** 目标路由，前端点击后跳转 */
        private String path;

        /**
         * 前端在该路由上需要回填到哪个本地搜索字段的 key。
         * 后端不直接消费，仅透传给前端，前端在跳转后用 ?q= 触发对应 SearchBar 的预填。
         */
        private String queryParamKey;
    }

}
