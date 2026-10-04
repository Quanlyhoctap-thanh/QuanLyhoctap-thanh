import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchoolLogo } from '../common/Avatar';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  School,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getSupabaseCredentials } from '../../lib/supabase';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form extra fields
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [schoolName, setSchoolName] = useState('Trường Tiểu học Khánh Bình');
  const [className, setClassName] = useState('3A2');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { url } = getSupabaseCredentials();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const res = await login(username, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      username,
      password,
      fullName,
      schoolName,
      className,
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleQuickDemoLogin = async () => {
    setUsername('thanh.le');
    setPassword('123456');
    setErrorMessage(null);
    setIsLoading(true);
    const res = await login('thanh.le', '123456');
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Decorative background blur circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-700 px-6 pt-7 pb-6 text-white text-center relative">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20 shadow-md">
              <SchoolLogo className="w-14 h-14" />
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight leading-tight">
            TRỢ LÝ THEO DÕI HỌC TẬP
          </h1>
          <p className="text-xs text-sky-100 font-medium mt-1">
            Trường Tiểu học Khánh Bình • Lớp 3A2
          </p>
        </div>

        {/* Mode Tabs (Login / Register) */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-sky-700 border-b-2 border-sky-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-sky-700 border-b-2 border-sky-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký tài khoản</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-in fade-in space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Bấm vào đây để Đăng ký tài khoản "{username || 'mới'}" ngay</span>
                </button>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: thanh.le"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-sky-600 focus:ring-sky-500" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <span className="text-slate-400 text-[11px]">Đăng nhập không cần email</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}</span>
              </button>

              {/* Direct Link to Register Tab */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-sky-700 hover:text-sky-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Chưa có tài khoản? Bấm vào đây để Đăng ký ngay</span>
                </button>
              </div>

              {/* Quick Demo Account Helper */}
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tài khoản giáo viên có sẵn</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={isLoading}
                    className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Điền & Vào ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Tài khoản: <strong className="text-slate-700 font-mono">thanh.le</strong></span>
                  <span>Mật khẩu: <strong className="text-slate-700 font-mono">123456</strong></span>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM (100% NO EMAIL REQUIRED) */
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* No-email Guarantee Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Không cần email!</strong> Thầy/Cô chỉ cần chọn Tên đăng nhập và Mật khẩu để tạo tài khoản lưu trên Supabase.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="VD: thanh, lethanh, gv3a2..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Viết liền không dấu để đăng nhập dễ nhớ</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Xác nhận mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu..."
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên Thầy/Cô <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Lê Văn Thành (nếu để trống sẽ lấy theo tên đăng nhập)"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Trường Tiểu học
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="TH Khánh Bình"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lớp phụ trách
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="3A2"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm mt-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản & Vào ứng dụng ngay'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-sky-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đã có tài khoản? Nhấn để chuyển sang Đăng nhập</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info: Supabase Cloud Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hệ thống lưu trữ đám mây Supabase</span>
          {url && (
            <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
              Đã kết nối
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
