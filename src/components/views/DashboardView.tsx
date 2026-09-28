import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

// Danh sách các năm học chuẩn gồm quá khứ, hiện tại và các năm học tiếp theo
const PRESET_ACADEMIC_YEARS = [
  '2024 - 2025',
  '2025 - 2026',
  '2026 - 2027',
  '2027 - 2028',
  '2028 - 2029',
  '2029 - 2030',
  '2030 - 2031',
];

export const DashboardView: React.FC = () => {
  const {
    data,
    setCurrentView,
    setSelectedStudentId,
    updateClassSettings,
    showToast,
    studentsNeedingAttention,
    latestAttendanceStats,
    classSubjectAverages,
    overallClassAverage,
    selectedMonth,
  } = useApp();

  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isAddingCustomYear, setIsAddingCustomYear] = useState(false);
  const [customYearInput, setCustomYearInput] = useState('');
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
        setIsYearDropdownOpen(false);
        setIsAddingCustomYear(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsYearDropdownOpen(false);
        setIsAddingCustomYear(false);
      }
    };

    if (isYearDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isYearDropdownOpen]);

  // Combine preset years with current year if it was custom-set
  const availableYears = React.useMemo(() => {
    const list = [...PRESET_ACADEMIC_YEARS];
    const currentYear = data.classSettings.academicYear?.trim();
    if (currentYear && !list.includes(currentYear)) {
      list.push(currentYear);
    }
    return list;
  }, [data.classSettings.academicYear]);

  const handleSelectYear = (year: string) => {
    updateClassSettings({ academicYear: year });
    showToast(`Đã chuyển sang Năm học ${year}`, 'success');
    setIsYearDropdownOpen(false);
    setIsAddingCustomYear(false);
  };

  const handleAddCustomYear = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customYearInput.trim();
    if (!trimmed) return;
    updateClassSettings({ academicYear: trimmed });
    showToast(`Đã cập nhật Năm học ${trimmed}`, 'success');
    setCustomYearInput('');
    setIsAddingCustomYear(false);
    setIsYearDropdownOpen(false);
  };

  const totalStudents = data.students.length;
  const maleCount = data.students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = data.students.filter((s) => s.gender === 'Nữ').length;
  const latestRecordsCount = data.academicRecords.filter((r) => r.period === selectedMonth).length;

  // Donut chart calculations
  const presentPct = Math.round((latestAttendanceStats.present / (latestAttendanceStats.total || 1)) * 100);
  const excusedPct = Math.round((latestAttendanceStats.excused / (latestAttendanceStats.total || 1)) * 100);
  const unexcusedPct = Math.round((latestAttendanceStats.unexcused / (latestAttendanceStats.total || 1)) * 100);
  const latePct = Math.round((latestAttendanceStats.late / (latestAttendanceStats.total || 1)) * 100);

  // SVG Donut coordinates
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (latestAttendanceStats.rate / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Top Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            TỔNG QUAN LỚP {data.classSettings.className}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Thống kê tình hình học tập và rèn luyện {selectedMonth}
          </p>
        </div>

        {/* Nút sổ chọn các năm học tiếp theo */}
        <div className="relative" ref={yearDropdownRef}>
          <button
            type="button"
            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 active:bg-sky-200/80 text-sky-800 border border-sky-200/90 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            title="Nhấn để chọn các năm học (hiện tại và tiếp theo)"
            aria-expanded={isYearDropdownOpen}
            aria-haspopup="listbox"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Năm học {data.classSettings.academicYear}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-sky-600 shrink-0 transition-transform duration-200 ${
                isYearDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu sổ danh sách năm học */}
          {isYearDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                  Chọn năm học
                </span>
                <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded font-semibold">
                  Lớp {data.classSettings.className}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50">
                {availableYears.map((year) => {
                  const isSelected =
                    data.classSettings.academicYear?.trim().replace(/\s+/g, '') ===
                    year.trim().replace(/\s+/g, '');
                  const isDefaultPresent = year.includes('2026') && year.includes('2027');
                  const isUpcoming =
                    year.includes('2027') ||
                    year.includes('2028') ||
                    year.includes('2029') ||
                    year.includes('2030');

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleSelectYear(year)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-sky-50/90 text-sky-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-sky-600' : 'text-slate-400'
                          }`}
                        />
                        <span>Năm học {year}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isDefaultPresent && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                            Hiện tại
                          </span>
                        )}
                        {!isDefaultPresent && isUpcoming && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                            Tiếp theo
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tùy chỉnh năm học khác */}
              <div className="border-t border-slate-100 pt-1 px-2">
                {!isAddingCustomYear ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomYear(true)}
                    className="w-full text-left px-2 py-1.5 text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm năm học khác...</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddCustomYear} className="p-1 space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Nhập năm học mới:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={customYearInput}
                        onChange={(e) => setCustomYearInput(e.target.value)}
                        placeholder="VD: 2031 - 2032"
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-sky-600 text-white rounded-md font-semibold text-[11px] hover:bg-sky-700 transition-colors"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomYear(false);
                          setCustomYearInput('');
                        }}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded-md text-[11px] transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 1: 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total */}
        <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Tổng số học sinh</div>
            <div className="text-2xl font-black text-slate-800 tabular-nums">{totalStudents}</div>
          </div>
        </div>

        {/* Card 2: Male */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Nam</div>
            <div className="text-2xl font-black text-slate-800 tabular-nums">{maleCount}</div>
          </div>
        </div>

        {/* Card 3: Female */}
        <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Nữ</div>
            <div className="text-2xl font-black text-slate-800 tabular-nums">{femaleCount}</div>
          </div>
        </div>

        {/* Card 4: Newest Data */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Có dữ liệu mới nhất</div>
            <div className="text-2xl font-black text-slate-800 tabular-nums">
              {latestRecordsCount}/{totalStudents}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Need Attention & Attendance progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Need attention card */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-900">Cần quan tâm theo dõi</div>
              <div className="text-2xl font-black text-amber-700 tabular-nums">
                {studentsNeedingAttention.length} <span className="text-xs font-normal text-amber-800">học sinh</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('progress')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Attendance progress card */}
        <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Tình hình chuyên cần lớp</span>
            </div>
            <div className="text-base font-extrabold text-purple-800 tabular-nums">
              {latestAttendanceStats.rate}%
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-purple-200/70 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${latestAttendanceStats.rate}%` }}
            />
          </div>
          <div className="text-[11px] text-purple-700 mt-1 flex justify-between">
            <span>Có mặt: {latestAttendanceStats.present} HS</span>
            <span>Vắng: {latestAttendanceStats.excused + latestAttendanceStats.unexcused} HS</span>
          </div>
        </div>
      </div>

      {/* Row 3: 3 Detailed Overview Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Widget 1: Bar chart - Average score per subject */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Kết quả học tập theo môn (TB lớp)</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              TB: {overallClassAverage}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-1">
            {data.subjects.map((sub) => {
              const score = classSubjectAverages[sub.id] || 8.0;
              const heightPercent = Math.min(100, Math.max(10, (score / 10) * 100));

              return (
                <div key={sub.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-700 mb-1 tabular-nums group-hover:text-sky-600">
                    {score.toFixed(1)}
                  </span>
                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-32">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: sub.color || '#38bdf8',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 mt-2 truncate w-full text-center">
                    {sub.shortName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Dữ liệu {selectedMonth}</span>
            <button
              onClick={() => setCurrentView('academics')}
              className="text-sky-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Widget 2: Attendance Donut Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Tình hình chuyên cần</h3>
            <span className="text-xs text-slate-500 font-medium">Toàn lớp</span>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-sky-500 transition-all duration-500"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-lg font-black text-slate-800">{latestAttendanceStats.rate}%</div>
                <div className="text-[9px] text-slate-500 uppercase font-semibold">Có mặt</div>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-slate-600">Có mặt:</span>
                <span className="font-bold text-slate-800 ml-auto">{presentPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-600">Nghỉ có phép:</span>
                <span className="font-bold text-slate-800 ml-auto">{excusedPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-slate-600">Nghỉ K.phép:</span>
                <span className="font-bold text-slate-800 ml-auto">{unexcusedPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-slate-600">Đi muộn:</span>
                <span className="font-bold text-slate-800 ml-auto">{latePct}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Ngày điểm danh gần nhất</span>
            <button
              onClick={() => setCurrentView('attendance')}
              className="text-sky-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Điểm danh</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Widget 3: Students needing attention */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Những học sinh cần theo dõi</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {studentsNeedingAttention.length} HS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              Tạo tự động từ kết quả học tập & chuyên cần do giáo viên đã nhập.
            </p>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {studentsNeedingAttention.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                  Không có học sinh nào chạm ngưỡng cần quan tâm đặc biệt.
                </div>
              ) : (
                studentsNeedingAttention.map(({ student, reason, type }) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setCurrentView('student-profile');
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar type={student.avatarType} size="sm" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">{student.studentCode}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        type === 'academic'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {reason}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setCurrentView('students')}
              className="text-xs font-semibold px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <span>Xem tất cả học sinh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
