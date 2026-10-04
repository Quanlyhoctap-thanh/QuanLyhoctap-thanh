import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar, SchoolLogo } from './Avatar';
import { Download, Upload, RotateCcw, Settings, ChevronDown, Database, Cloud, LogOut, UserCheck } from 'lucide-react';
import { ClassSettingsModal } from '../modals/ClassSettingsModal';
import { SupabaseSyncModal } from '../modals/SupabaseSyncModal';
import { checkSupabaseHealth, SupabaseStatus } from '../../lib/supabase';

export const Header: React.FC = () => {
  const {
    data,
    exportDataJSON,
    exportDataCSV,
    importDataJSON,
    resetToDefaultData,
    isSupabaseModalOpen,
    openSupabaseModal,
    closeSupabaseModal,
  } = useApp();
  const { currentUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dbStatus, setDbStatus] = useState<SupabaseStatus>('connecting');

  useEffect(() => {
    checkSupabaseHealth().then((res) => {
      setDbStatus(res.status);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-700 text-white shadow-md print:hidden">
        <div className="flex items-center justify-between px-4 lg:px-6 py-2.5">
          {/* Left: Branding & School */}
          <div className="flex items-center gap-3">
            <SchoolLogo className="w-10 h-10" />
            <div>
              <h1 className="text-base lg:text-lg font-bold tracking-tight uppercase leading-tight">
                TRỢ LÝ THEO DÕI HỌC TẬP LỚP {data.classSettings.className}
              </h1>
              <p className="text-xs text-sky-100 font-medium leading-none mt-0.5">
                {data.classSettings.schoolName}
              </p>
            </div>
          </div>

          {/* Right: Quick Tools, Class & Teacher Badge */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Supabase Cloud Sync Quick Button */}
            <button
              type="button"
              onClick={openSupabaseModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
              title="Cơ sở dữ liệu Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Supabase</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus === 'connected'
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                    : dbStatus === 'tables_missing'
                    ? 'bg-amber-400 ring-2 ring-amber-400/30'
                    : dbStatus === 'connecting'
                    ? 'bg-sky-300 animate-pulse'
                    : 'bg-rose-400'
                }`}
                title={
                  dbStatus === 'connected'
                    ? 'Supabase đã kết nối'
                    : dbStatus === 'tables_missing'
                    ? 'Supabase cần tạo bảng'
                    : 'Chưa kết nối Supabase'
                }
              />
            </button>

            {/* Backup / Export dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors cursor-pointer"
                title="Sao lưu & Xuất dữ liệu"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dữ liệu</span>
                <ChevronDown className="w-3 h-3 text-sky-200" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800 text-xs"
                  onClick={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={openSupabaseModal}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-emerald-700 font-semibold cursor-pointer"
                  >
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đồng bộ Supabase (Đám mây)</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={exportDataJSON}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sao lưu file JSON</span>
                  </button>
                  <button
                    onClick={exportDataCSV}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xuất danh sách CSV</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Khôi phục từ JSON</span>
                  </button>
                  <button
                    onClick={resetToDefaultData}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Tải lại dữ liệu mẫu 3A2</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Input for Restore */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            {/* Class info & teacher avatar with dropdown menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-left transition-colors border border-white/10 cursor-pointer"
                title="Tài khoản giáo viên & Cài đặt lớp"
              >
                <div className="text-right leading-tight hidden xs:block">
                  <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    <span>{currentUser?.fullName || `GV: ${data.classSettings.teacherName}`}</span>
                    <ChevronDown className="w-3 h-3 text-sky-200" />
                  </div>
                  <div className="text-[11px] text-sky-100">
                    Lớp {data.classSettings.className} • @{currentUser?.username || 'thanh.le'}
                  </div>
                </div>
                <Avatar type="teacher" size="sm" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs animate-in fade-in"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <p className="font-bold text-slate-800 text-sm">
                      {currentUser?.fullName || data.classSettings.teacherName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      @{currentUser?.username || 'thanh.le'} • {currentUser?.role || 'Giáo viên chủ nhiệm'}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Đã xác thực tài khoản</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-sky-600" />
                      <span>Cài đặt thông tin lớp học</span>
                    </button>
                    <button
                      onClick={openSupabaseModal}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2 text-emerald-700 font-medium cursor-pointer"
                    >
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>Cơ sở dữ liệu Supabase</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Class Settings Modal */}
      {showSettingsModal && (
        <ClassSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Supabase Sync Modal */}
      {isSupabaseModalOpen && (
        <SupabaseSyncModal onClose={closeSupabaseModal} />
      )}
    </>
  );
};

