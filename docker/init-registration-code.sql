-- 注册码表
CREATE TABLE IF NOT EXISTS registration_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    type INTEGER NOT NULL DEFAULT 0,
    expire_time TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_by BIGINT,
    used_time TIMESTAMP,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE registration_codes IS '注册码表';
COMMENT ON COLUMN registration_codes.code IS '注册码';
COMMENT ON COLUMN registration_codes.type IS '类型：0-普通用户码，1-管理员码';
COMMENT ON COLUMN registration_codes.expire_time IS '过期时间';
COMMENT ON COLUMN registration_codes.is_used IS '是否已使用';
COMMENT ON COLUMN registration_codes.used_by IS '使用用户ID';
COMMENT ON COLUMN registration_codes.used_time IS '使用时间';

CREATE INDEX IF NOT EXISTS idx_code ON registration_codes(code);
CREATE INDEX IF NOT EXISTS idx_expire_time ON registration_codes(expire_time);
