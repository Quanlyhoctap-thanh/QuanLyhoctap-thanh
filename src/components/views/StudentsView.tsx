import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { StudentModal } from '../modals/StudentModal';

export const StudentsView: React.FC = () => {
  const {
    data,
    setSelectedStudentId,
    setCurrentView,
    deleteStudent,
    selectedMonth,
    studentsNeedingAttention,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered students
  const filteredStudents = useMemo(() => {
    return data.students.filter((student) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(term);
        const matchCode = student.studentCode.toLowerCase().includes(term);
        const matchParent = student.parentName.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchParent) return false;
      }

      // 2. Gender filter
      if (genderFilter !== 'all' && student.gender !== genderFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== 'all') {
        const studentRecord = data.academicRecords.find(
          (r) => r.studentId === student.id && r.period === selectedMonth
        );
        const isNeedingAttention = studentsNeedingAttention.some((a) => a.student.id === student.id);

        if (statusFilter === 'attention' && !isNeedingAttention) return false;
        if (statusFilter === 'Tốt' && studentRecord?.level !== 'Tốt') return false;
        if (statusFilter === 'Khá' && studentRecord?.level !== 'Khá') return false;
        if (statusFilter === 'Cần cố gắng' && studentRecord?.level !== 'Cần cố gắng') return false;
      }

      return true;
    });
  }, [data.students, data.academicRecords, selectedMonth, searchTerm, genderFilter, statusFilter, studentsNeedingAttention]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const currentStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStudentLevel = (studentId: string) => {
    const rec = data.academicRecords.find(
      (r) => r.studentId === studentId && r.period === selectedMonth
    );
    return rec?.level || 'Tốt';
  };

  const getAttendanceSummary = (studentId: string) => {
    // Check latest attendance status
    const latestDay = data.attendanceRecords[0];
    if (!latestDay) return 'Có mặt';
    const rec = latestDay.records.find((r) => r.studentId === studentId);
    if (!rec) return 'Có mặt';
    if (rec.status === 'present') return 'Có mặt';
    if (rec.status === 'excused') return 'Nghỉ có phép';
    if (rec.status === 'unexcused') return 'Nghỉ không phép';
    if (rec.status === 'late') return 'Đi muộn';
    return 'Có mặt';
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-profile');
  };

  return (
    <div className="space-y-4">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">DANH SÁCH HỌC SINH</h2>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý hồ sơ {data.students.length} học sinh Lớp {data.classSettings.className}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Thêm học sinh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm học sinh theo tên, mã HS..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Lọc:</span>
          </div>

          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Tốt">Học tập: Tốt</option>
            <option value="Khá">Học tập: Khá</option>
            <option value="Cần cố gắng">Học tập: Cần cố gắng</option>
            <option value="attention">Cần quan tâm ({studentsNeedingAttention.length})</option>
          </select>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-3 text-center">Giới tính</th>
                <th className="py-3 px-3 text-center">Chuyên cần</th>
                <th className="py-3 px-3 text-center">Học tập</th>
                <th className="py-3 px-4 hidden md:table-cell">Ghi chú</th>
                <th className="py-3 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const level = getStudentLevel(student.id);
                  const attStatus = getAttendanceSummary(student.id);
                  const isAttention = studentsNeedingAttention.some((a) => a.student.id === student.id);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-sky-50/50 transition-colors group cursor-pointer"
                      onClick={() => handleViewProfile(student.id)}
                    >
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-500 tabular-nums">
                        {globalIdx}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar type={student.avatarType} size="sm" />
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors flex items-center gap-1.5">
                              <span>{student.fullName}</span>
                              {isAttention && (
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Cần quan tâm theo dõi" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{student.studentCode}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            student.gender === 'Nam'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                            attStatus === 'Có mặt'
                              ? 'text-emerald-700 bg-emerald-50'
                              : attStatus === 'Đi muộn'
                              ? 'text-purple-700 bg-purple-50'
                              : 'text-amber-700 bg-amber-50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              attStatus === 'Có mặt'
                                ? 'bg-emerald-500'
                                : attStatus === 'Đi muộn'
                                ? 'bg-purple-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {attStatus}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            level === 'Tốt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : level === 'Khá'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {level}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 hidden md:table-cell text-xs text-slate-500 max-w-[200px] truncate">
                        {student.notes || '-'}
                      </td>

                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewProfile(student.id)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                            title="Xem hồ sơ học sinh"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Table Footer with Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Hiển thị{' '}
            <span className="font-bold text-slate-700">
              {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>{' '}
            / <span className="font-bold text-slate-700">{filteredStudents.length}</span> học sinh
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-md font-bold text-xs transition-colors ${
                    currentPage === i + 1
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <StudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <StudentModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
