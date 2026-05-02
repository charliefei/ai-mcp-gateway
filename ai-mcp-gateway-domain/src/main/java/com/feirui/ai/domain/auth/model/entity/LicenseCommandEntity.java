package com.feirui.ai.domain.auth.model.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 校验证书命令实体对象
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LicenseCommandEntity {

    /**
     * 网关ID
     */
    private String gatewayId;

    /**
     * API密钥
     */
    private String apiKey;

}
