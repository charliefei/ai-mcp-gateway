package com.feirui.ai.domain.auth.service;

import com.feirui.ai.domain.auth.model.entity.LicenseCommandEntity;

/**
 * 权限证书服务接口
 */
public interface IAuthLicenseService {

    boolean checkLicense(LicenseCommandEntity commandEntity);

}
