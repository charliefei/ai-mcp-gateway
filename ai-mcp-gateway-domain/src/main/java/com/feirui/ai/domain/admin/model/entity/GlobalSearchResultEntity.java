package com.feirui.ai.domain.admin.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 全局搜索结果实体
 * <p>
 * 与 {@link com.feirui.ai.api.dto.GlobalSearchResultDTO} 字段一一对应，
 * 供 Repository / Domain / Trigger 层之间传递。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchResultEntity {

    /** 用户输入的关键字 */
    private String keyword;

    /** 命中总数 */
    private Integer total;

    /** 各分类命中结果 */
    private List<Category> categories;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Category {

        private String type;
        private String label;
        private Integer count;
        private Integer truncated;
        private List<Item> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        private String id;
        private String type;
        private String title;
        private String subtitle;
        private String description;
        private String badge;
        private Integer status;
        private String path;
        private String queryParamKey;
    }

}
