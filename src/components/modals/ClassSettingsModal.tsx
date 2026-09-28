import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, Sliders, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ClassSettingsModal: React.FC<Props> = ({ onClose }) => {
  const { data, updateClassSettings } = useApp();
  const [formData, setFormData] = useState({
    className: data.classSettings.className,
    schoolName: data.classSettings.schoolName,
    teacherName: data.classSettings.teacherName,
    academicYear: data.classSettings.academicYear,
    warningMinAverage: data.classSettings.warningMinAverage,
    warningMaxAbsence: data.classSettings.warningMaxAbsence,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 bg-sky-700 text-white">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-200" />
            <h2 className="text-base font-bold">Cài đặt Thông tin Lớp học</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm text-slate-700">
          <div>
            <label className="block font-semibold mb-1 text-slate-800">Tên lớp</label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="VD: 3A2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800">Trường Tiểu học</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="VD: Trường Tiểu học Khánh Bình"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Giáo viên chủ nhiệm</label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="VD: Lê Văn Thành"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Năm học</label>
              <input
                type="text"
                list="academicYearsList"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="2026 - 2027"
              />
              <datalist id="academicYearsList">
                <option value="2024 - 2025" />
                <option value="2025 - 2026" />
                <option value="2026 - 2027" />
                <option value="2027 - 2028" />
                <option value="2028 - 2029" />
                <option value="2029 - 2030" />
                <option value="2030 - 2031" />
              </datalist>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['2025 - 2026', '2026 - 2027', '2027 - 2028', '2028 - 2029'].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setFormData({ ...formData, academicYear: yr })}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      formData.academicYear === yr
                        ? 'bg-sky-100 text-sky-700 border-sky-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Tiêu chí "Cần quan tâm theo dõi"
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Điểm TB dưới ngưỡng
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.warningMinAverage}
                  onChange={(e) =>
                    setFormData({ ...formData, warningMinAverage: parseFloat(e.target.value) || 7.0 })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nghỉ học từ (buổi)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.warningMaxAbsence}
                  onChange={(e) =>
                    setFormData({ ...formData, warningMaxAbsence: parseInt(e.target.value) || 2 })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Danh sách được hệ thống tính toán hoàn toàn dựa trên dữ liệu giáo viên nhập, không suy đoán.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
