import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar, SchoolLogo } from './Avatar';
import { Download, Upload, RotateCcw, Settings, ChevronDown } from 'lucide-react';
import { ClassSettingsModal } from '../modals/ClassSettingsModal';

export const Header: React.FC = () => {
  const { data, exportDataJSON, exportDataCSV, importDataJSON, resetToDefaultData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
            {/* Backup / Export dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white transition-colors"
                title="Sao lưu & Xuất dữ liệu"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dữ liệu</span>
                <ChevronDown className="w-3 h-3 text-sky-200" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800 text-xs"
                  onClick={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={exportDataJSON}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sao lưu file JSON</span>
                  </button>
                  <button
                    onClick={exportDataCSV}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xuất danh sách CSV</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Khôi phục từ JSON</span>
                  </button>
                  <button
                    onClick={resetToDefaultData}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
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

            {/* Class info & teacher avatar */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-left transition-colors border border-white/10 cursor-pointer"
              title="Nhấn để chỉnh sửa thông tin lớp & giáo viên"
            >
              <div className="text-right leading-tight hidden xs:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <span>Lớp {data.classSettings.className}</span>
                  <Settings className="w-3 h-3 text-sky-200" />
                </div>
                <div className="text-[11px] text-sky-100">
                  GV: {data.classSettings.teacherName}
                </div>
              </div>
              <Avatar type="teacher" size="sm" />
            </button>
          </div>
        </div>
      </header>

      {/* Class Settings Modal */}
      {showSettingsModal && (
        <ClassSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  );
};
