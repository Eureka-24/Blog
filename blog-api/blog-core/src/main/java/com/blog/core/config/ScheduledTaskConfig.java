package com.blog.core.config;

import com.blog.core.service.RegistrationCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class ScheduledTaskConfig {

    private final RegistrationCodeService registrationCodeService;

    /**
     * 每天凌晨2点清理过期且已使用的注册码
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredRegistrationCodes() {
        log.info("开始执行注册码清理任务...");
        try {
            int deletedCount = registrationCodeService.cleanupExpiredCodes();
            log.info("注册码清理任务完成，共删除 {} 条记录", deletedCount);
        } catch (Exception e) {
            log.error("注册码清理任务执行失败", e);
        }
    }
}
