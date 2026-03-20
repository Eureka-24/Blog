'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { registerApi } from '@/lib/api';
import type { User } from '@/types';
import { Header, Footer } from '@/components/layout';
import LoginModal from '@/components/LoginModal';
import styles from './register.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
    registrationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 登录状态
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // 登录成功回调
  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      return '请输入用户名';
    }
    if (formData.username.length < 3) {
      return '用户名至少3个字符';
    }
    if (!formData.password) {
      return '请输入密码';
    }
    if (formData.password.length < 6) {
      return '密码至少6个字符';
    }
    if (formData.password !== formData.confirmPassword) {
      return '两次输入的密码不一致';
    }
    if (!formData.registrationCode.trim()) {
      return '请输入注册码';
    }
    if (!formData.email.trim()) {
      return '请输入邮箱';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return '请输入有效的邮箱地址';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await registerApi.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        nickname: formData.nickname || formData.username,
        registrationCode: formData.registrationCode.toUpperCase(),
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || '注册失败');
      }
    } catch (err) {
      setError('注册失败，请检查注册码是否正确或已过期');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onShowLogin={() => setShowLoginModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success ? (
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.successIcon}>✓</div>
              <h1 className={styles.successTitle}>注册成功！</h1>
              <p className={styles.successMessage}>
                您的账号已创建成功，现在可以登录了。
              </p>
              <Link href="/" className={styles.button}>
                返回首页
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.header}>
                <h1 className={styles.title}>用户注册</h1>
                <p className={styles.subtitle}>使用注册码创建新账号</p>
              </div>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="username" className={styles.label}>
                    用户名 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="请输入用户名（至少3个字符）"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="nickname" className={styles.label}>
                    昵称
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="请输入昵称（可选，默认使用用户名）"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    邮箱 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="请输入邮箱地址"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    密码 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="请输入密码（至少6个字符）"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    确认密码 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="请再次输入密码"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="registrationCode" className={styles.label}>
                    注册码 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="registrationCode"
                    name="registrationCode"
                    value={formData.registrationCode}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="请输入8位注册码"
                    disabled={loading}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <p className={styles.hint}>
                    注册码区分大小写，请联系管理员获取
                  </p>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? '注册中...' : '立即注册'}
                </button>
              </form>

              <div className={styles.footer}>
                <Link href="/" className={styles.link}>
                  ← 返回首页
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
