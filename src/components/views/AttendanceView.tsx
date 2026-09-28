import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { data, saveAttendanceDay, showToast } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>('2025-04-25');

  // Load existing records for selectedDate or default all present
  const [dayRecords, setDayRecords] = useState<AttendanceRecord[]>(() => {
    const existing = data.attendanceRecords.find((r) => r.date === '2025-04-25');
    if (existing) return existing.records;
    return data.students.map((s) => ({ studentId: s.id, status: 'present' as AttendanceStatus }));
  });

  // When selectedDate changes, reload or create default
  useEffect(() => {
    const existing = data.attendanceRecords.find((r) => r.date === selectedDate);
    if (existing) {
      // Merge with all students to ensure newly added students are covered
      const records = data.students.map((s) => {
        const found = existing.records.find((r) => r.studentId === s.id);
        return found || { studentId: s.id, status: 'present' as AttendanceStatus };
      });
      setDayRecords(records);
    } else {
      setDayRecords(
        data.students.map((s) => ({ studentId: s.id, status: 'present' as AttendanceStatus }))
      );
    }
  }, [selectedDate, data.attendanceRecords, data.students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDayRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setDayRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setDayRecords((prev) =>
      prev.map((r) => ({ ...r, status: 'present' as AttendanceStatus }))
    );
    showToast('Đã đánh dấu toàn bộ học sinh Có mặt.');
  };

  const handleSave = () => {
    saveAttendanceDay(selectedDate, dayRecords);
  };

  // Stats calculation
  const total = dayRecords.length || 1;
  const presentCount = dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const excusedCount = dayRecords.filter((r) => r.status === 'excused').length;
  const unexcusedCount = dayRecords.filter((r) => r.status === 'unexcused').length;
  const lateCount = dayRecords.filter((r) => r.status === 'late').length;

  return (
    <div className="space-y-4">
      {/* Title & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">BẢNG ĐIỂM DANH</h2>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi chuyên cần hàng ngày của Lớp {data.classSettings.className}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cả lớp Có mặt</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu điểm danh</span>
          </button>
        </div>
      </div>

      {/* Date selector and filter toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Ngày:</span>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Theo:</span>
            <select className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="all">Toàn lớp ({data.students.length} HS)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span>* Chạm hoặc bấm chọn trạng thái tương ứng của từng học sinh</span>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4 min-w-[170px]">Họ và tên</th>
                <th className="py-3 px-3 text-center min-w-[85px] text-emerald-700">Có mặt</th>
                <th className="py-3 px-3 text-center min-w-[85px] text-amber-700">Nghỉ phép</th>
                <th className="py-3 px-3 text-center min-w-[85px] text-rose-700">Nghỉ không phép</th>
                <th className="py-3 px-3 text-center min-w-[85px] text-purple-700">Đi muộn</th>
                <th className="py-3 px-4 min-w-[180px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {data.students.map((student, idx) => {
                const record = dayRecords.find((r) => r.studentId === student.id) || {
                  studentId: student.id,
                  status: 'present',
                };

                return (
                  <tr key={student.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar type={student.avatarType} size="sm" />
                        <div>
                          <div className="font-bold text-slate-800">{student.fullName}</div>
                          <div className="text-[10px] text-slate-400">{student.studentCode}</div>
                        </div>
                      </div>
                    </td>

                    {/* Radio buttons matching screenshot design */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${
                          record.status === 'present'
                            ? 'bg-emerald-500 text-white shadow-xs scale-110'
                            : 'border border-slate-300 hover:border-emerald-400'
                        }`}
                        title="Có mặt"
                      >
                        {record.status === 'present' && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'excused')}
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${
                          record.status === 'excused'
                            ? 'bg-amber-500 text-white shadow-xs scale-110'
                            : 'border border-slate-300 hover:border-amber-400'
                        }`}
                        title="Nghỉ có phép"
                      >
                        {record.status === 'excused' && <AlertCircle className="w-4 h-4" />}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'unexcused')}
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${
                          record.status === 'unexcused'
                            ? 'bg-rose-500 text-white shadow-xs scale-110'
                            : 'border border-slate-300 hover:border-rose-400'
                        }`}
                        title="Nghỉ không phép"
                      >
                        {record.status === 'unexcused' && <XCircle className="w-4 h-4" />}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${
                          record.status === 'late'
                            ? 'bg-purple-500 text-white shadow-xs scale-110'
                            : 'border border-slate-300 hover:border-purple-400'
                        }`}
                        title="Đi muộn"
                      >
                        {record.status === 'late' && <Clock className="w-4 h-4" />}
                      </button>
                    </td>

                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={record.note || ''}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        placeholder="Lý do nghỉ / ghi chú..."
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Cards (Matches screenshot) */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Thống kê chuyên cần ngày {selectedDate}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-800">Có mặt</div>
              <div className="text-xl font-black text-emerald-700 tabular-nums">{presentCount}</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-amber-800">Nghỉ có phép</div>
              <div className="text-xl font-black text-amber-700 tabular-nums">{excusedCount}</div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-rose-800">Nghỉ không phép</div>
              <div className="text-xl font-black text-rose-700 tabular-nums">{unexcusedCount}</div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-purple-800">Đi muộn</div>
              <div className="text-xl font-black text-purple-700 tabular-nums">{lateCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
