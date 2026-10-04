import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  checkSupabaseHealth,
  pushDataToSupabase,
  fetchDataFromSupabase,
  SUPABASE_SQL_SETUP,
  SupabaseStatus,
} from '../../lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  X,
  ExternalLink,
  Code,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<Props> = ({ onClose }) => {
  const { data, showToast, importDataJSON } = useApp();
  const credentials = getSupabaseCredentials();

  const [url, setUrl] = useState(credentials.url);
  const [key, setKey] = useState(credentials.key);
  const [status, setStatus] = useState<SupabaseStatus>('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('Đang kiểm tra kết nối tới Supabase...');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [showSqlCode, setShowSqlCode] = useState<boolean>(false);
  const [showConfigEdit, setShowConfigEdit] = useState<boolean>(false);

  const runHealthCheck = async () => {
    setIsLoading(true);
    setStatus('connecting');
    setStatusMessage('Đang kiểm tra máy chủ Supabase...');
    const res = await checkSupabaseHealth();
    setStatus(res.status);
    setStatusMessage(res.message);
    setIsLoading(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleSaveCredentials = () => {
    saveSupabaseCredentials(url, key);
    showToast('Đã lưu cấu hình Supabase!');
    setShowConfigEdit(false);
    runHealthCheck();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    showToast('Đã sao chép toàn bộ câu lệnh SQL tạo bảng!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handlePushData = async () => {
    setIsLoading(true);
    showToast('Đang tải dữ liệu lên Supabase...', 'info');
    const res = await pushDataToSupabase(data);
    setIsLoading(false);

    if (res.success) {
      showToast(res.message, 'success');
      runHealthCheck();
    } else {
      showToast(res.message, 'warning');
    }
  };

  const handlePullData = async () => {
    setIsLoading(true);
    showToast('Đang tải dữ liệu từ Supabase về...', 'info');
    const res = await fetchDataFromSupabase(data);
    setIsLoading(false);

    if (res.success && res.data) {
      importDataJSON(JSON.stringify(res.data));
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Quản lý & Đồng bộ Supabase</h2>
              <p className="text-xs text-emerald-100">Cơ sở dữ liệu đám mây trực tuyến cho Lớp học</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-sm text-slate-700 flex-1">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              status === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : status === 'tables_missing'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : status === 'connecting'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {status === 'connected' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {status === 'tables_missing' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {status === 'connecting' && <RefreshCw className="w-5 h-5 text-sky-600 shrink-0 mt-0.5 animate-spin" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {status === 'unconfigured' && <Key className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {status === 'connected' && 'Trạng thái: Đã kết nối Supabase'}
                  {status === 'tables_missing' && 'Trạng thái: Đã kết nối, cần tạo bảng trên Supabase'}
                  {status === 'connecting' && 'Đang kiểm tra kết nối...'}
                  {status === 'error' && 'Trạng thái: Chưa thể kết nối'}
                  {status === 'unconfigured' && 'Trạng thái: Chưa cấu hình'}
                </span>
                <button
                  type="button"
                  onClick={runHealthCheck}
                  disabled={isLoading}
                  className="text-xs flex items-center gap-1 font-semibold hover:underline text-current disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Kiểm tra lại
                </button>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{statusMessage}</p>
              {url && (
                <div className="mt-2 text-[11px] font-mono opacity-80 truncate bg-white/60 px-2 py-1 rounded">
                  URL: {url}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Push & Pull */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePushData}
              disabled={isLoading || status === 'error' || status === 'unconfigured'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Đẩy dữ liệu lên Supabase</span>
            </button>

            <button
              type="button"
              onClick={handlePullData}
              disabled={isLoading || status === 'error' || status === 'unconfigured' || status === 'tables_missing'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>Tải dữ liệu từ Supabase về</span>
            </button>
          </div>

          {/* Quick SQL Guide if tables missing or user wants to review */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <div
              onClick={() => setShowSqlCode(!showSqlCode)}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  Hướng dẫn tạo bảng trên Supabase (Kịch bản SQL)
                </span>
                {status === 'tables_missing' && (
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                    Cần thực hiện
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {showSqlCode ? 'Thu gọn' : 'Xem chi tiết'}
                </span>
                {showSqlCode ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {(showSqlCode || status === 'tables_missing') && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Để lưu trữ học sinh, bảng điểm, chuyên cần và nhận xét vào cơ sở dữ liệu Supabase, Thầy/Cô chỉ cần thực hiện 3 bước đơn giản:
                </p>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal pl-4">
                  <li>
                    Nhấn nút <strong className="text-emerald-700">"Sao chép mã SQL"</strong> ở bên dưới.
                  </li>
                  <li>
                    Mở{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Supabase Dashboard <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    $\rightarrow$ Chọn Project $\rightarrow$ Chọn mục <strong>SQL Editor</strong> ở cột trái.
                  </li>
                  <li>
                    Nhấn <strong>New query</strong>, dán đoạn mã vừa sao chép vào rồi nhấn nút <strong>Run</strong> (màu xanh lá).
                  </li>
                </ol>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Bao gồm 6 bảng: class_settings, students, academic_records, attendance_days, conduct_records, comments
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Đã chép mã!' : 'Sao chép mã SQL'}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48 leading-relaxed">
                    {SUPABASE_SQL_SETUP}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Connection Parameters / Config Toggle */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <div
              onClick={() => setShowConfigEdit(!showConfigEdit)}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  Thông tin kết nối Supabase (URL & Key)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {showConfigEdit ? 'Đóng' : 'Tùy chỉnh'}
                </span>
                {showConfigEdit ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {showConfigEdit && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tiqpdmzyuaisstskvugv.supabase.co"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon / Publishable Key
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="sb_publishable_... hoặc eyJhbGciOi..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Lưu thông số kết nối
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Dữ liệu luôn được sao lưu an toàn tại máy và đồng bộ lên Supabase khi có mạng.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
