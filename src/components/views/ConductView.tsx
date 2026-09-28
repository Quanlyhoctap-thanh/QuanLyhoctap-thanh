import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ConductRecord } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  Award,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ConductModal } from '../modals/ConductModal';

export const ConductView: React.FC = () => {
  const { data, deleteConductRecord, setSelectedStudentId, setCurrentView } = useApp();

  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [criterionFilter, setCriterionFilter] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<ConductRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return data.conductRecords.filter((rec) => {
      if (studentFilter !== 'all' && rec.studentId !== studentFilter) {
        return false;
      }
      if (criterionFilter !== 'all' && rec.criterion !== criterionFilter) {
        return false;
      }
      return true;
    });
  }, [data.conductRecords, studentFilter, criterionFilter]);

  const getStudent = (id: string) => data.students.find((s) => s.id === id);

  return (
    <div className="space-y-4">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">GHI NHẬN RÈN LUYỆN</h2>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi ý thức, nền nếp và phẩm chất của học sinh Lớp {data.classSettings.className}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm mới</span>
        </button>
      </div>

      {/* Filter Bar (Matches screenshot: Theo học sinh, Theo tiêu chí, Ngày) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Theo học sinh */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Theo học sinh</label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
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

          {/* Theo tiêu chí */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Theo tiêu chí</label>
            <select
              value={criterionFilter}
              onChange={(e) => setCriterionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tất cả tiêu chí</option>
              <option value="Ý thức học tập">Ý thức học tập</option>
              <option value="Chuẩn bị đồ dùng">Chuẩn bị đồ dùng</option>
              <option value="Thực hiện nhiệm vụ">Thực hiện nhiệm vụ</option>
              <option value="Hợp tác với bạn">Hợp tác với bạn</option>
              <option value="Tham gia hoạt động">Tham gia hoạt động</option>
              <option value="Thực hiện nội quy">Thực hiện nội quy</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tổng số {filteredRecords.length} lượt ghi nhận</span>
        </div>
      </div>

      {/* Main Conduct Table (Matches screenshot) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                <th className="py-3 px-3 min-w-[150px]">Tiêu chí</th>
                <th className="py-3 px-3 text-center min-w-[110px]">Mức ghi nhận</th>
                <th className="py-3 px-4 min-w-[220px]">Nhận xét</th>
                <th className="py-3 px-3 text-center min-w-[100px]">Ngày</th>
                <th className="py-3 px-3 text-center w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có dữ liệu rèn luyện phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const student = getStudent(rec.studentId);
                  if (!student) return null;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-sky-50/30 transition-colors group cursor-pointer"
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

                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {rec.criterion}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                            rec.rating === 'Tốt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.rating === 'Khá'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.rating}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-slate-600 font-medium">
                        {rec.comment}
                      </td>

                      <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                        {rec.date}
                      </td>

                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRecord(rec)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Chỉnh sửa ghi nhận"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteConductRecord(rec.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa ghi nhận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Conduct Modal */}
      {showAddModal && (
        <ConductModal onClose={() => setShowAddModal(false)} />
      )}

      {editingRecord && (
        <ConductModal
          initialRecord={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
};
