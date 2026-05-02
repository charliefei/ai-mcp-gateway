package com.feirui.ai.domain.auth.service;

import com.feirui.ai.domain.auth.model.entity.RateLimitCommandEntity;

/**
 * 调用限制服务接口
 */
public interface IAuthRateLimitService {

    /**
     * 限流操作
     * true - 限流
     * false - 未限流
     */
    boolean rateLimit(RateLimitCommandEntity commandEntity);

}
