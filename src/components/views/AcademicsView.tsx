import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Subject } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  BookOpen,
  Filter,
  Plus,
  Edit2,
  Calendar,
  Settings,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { ScoreModal } from '../modals/ScoreModal';

export const AcademicsView: React.FC = () => {
  const { data, selectedMonth, setSelectedMonth, setSelectedStudentId, setCurrentView } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showSubjectSettings, setShowSubjectSettings] = useState(false);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return data.students.filter((student) => {
      if (selectedStudentFilter !== 'all' && student.id !== selectedStudentFilter) {
        return false;
      }
      return true;
    });
  }, [data.students, selectedStudentFilter]);

  // Map of student academic record for this month
  const recordsMap = useMemo(() => {
    const map = new Map<string, any>();
    data.academicRecords
      .filter((r) => r.period === selectedMonth)
      .forEach((r) => map.set(r.studentId, r));
    return map;
  }, [data.academicRecords, selectedMonth]);

  const displayedSubjects = useMemo(() => {
    if (selectedSubjectFilter === 'all') return data.subjects;
    return data.subjects.filter((s) => s.id === selectedSubjectFilter);
  }, [data.subjects, selectedSubjectFilter]);

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">THEO DÕI HỌC TẬP</h2>
          <p className="text-xs text-slate-500 font-medium">
            Kết quả học tập các môn học Lớp {data.classSettings.className} - {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingStudent(data.students[0] || null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập kết quả</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Matches screenshot: Theo môn, Theo học sinh, Theo thời gian) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Theo môn */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Theo môn</label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tất cả môn</option>
              {data.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theo học sinh */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Theo học sinh</label>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tất cả học sinh</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Theo thời gian */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Theo thời gian</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-xs font-bold text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Tháng 4/2025">Tháng 4/2025</option>
              <option value="Tháng 3/2025">Tháng 3/2025</option>
              <option value="Tháng 2/2025">Tháng 2/2025</option>
              <option value="Tháng 1/2025">Tháng 1/2025</option>
              <option value="Học kỳ 1">Học kỳ 1</option>
              <option value="Học kỳ 2">Học kỳ 2</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-sky-600" />
          <span>Đánh giá theo chuẩn Tiểu học (TT 27/2020)</span>
        </div>
      </div>

      {/* Main Academics Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                {displayedSubjects.map((sub) => (
                  <th key={sub.id} className="py-3 px-2 text-center min-w-[70px]">
                    <span className="truncate" title={sub.name}>
                      {sub.shortName}
                    </span>
                  </th>
                ))}
                <th className="py-3 px-3 text-center min-w-[60px] bg-sky-50/70 text-sky-900">TB</th>
                <th className="py-3 px-4 min-w-[180px]">Nhận xét</th>
                <th className="py-3 px-3 text-center w-16">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {filteredStudents.map((student, idx) => {
                const rec = recordsMap.get(student.id);
                const avg = rec ? rec.averageScore : null;
                const comment = rec?.comment || '-';

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-sky-50/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setCurrentView('student-profile');
                    }}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar type={student.avatarType} size="sm" />
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                            {student.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">{student.studentCode}</div>
                        </div>
                      </div>
                    </td>

                    {displayedSubjects.map((sub) => {
                      const score = rec?.scores?.[sub.id];
                      return (
                        <td
                          key={sub.id}
                          className="py-2.5 px-2 text-center font-bold text-slate-800 tabular-nums"
                        >
                          {score !== undefined ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                                score >= 8
                                  ? 'text-emerald-700'
                                  : score >= 7
                                  ? 'text-sky-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {score}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-center font-extrabold text-sky-800 bg-sky-50/50 tabular-nums text-sm">
                      {avg !== null ? avg.toFixed(1) : '-'}
                    </td>

                    <td className="py-2.5 px-4 text-slate-600">
                      <span className="truncate block max-w-xs">{comment}</span>
                    </td>

                    <td
                      className="py-2.5 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                        title="Chỉnh sửa điểm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Modal */}
      {editingStudent && (
        <ScoreModal
          student={editingStudent}
          period={selectedMonth}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
};
