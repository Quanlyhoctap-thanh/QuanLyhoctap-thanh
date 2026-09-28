import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Phone,
  MapPin,
  Heart,
  BookOpen,
  Award,
  MessageSquareText,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StudentModal } from '../modals/StudentModal';
import { ScoreModal } from '../modals/ScoreModal';
import { ConductModal } from '../modals/ConductModal';
import { CommentModal } from '../modals/CommentModal';

export const StudentProfileView: React.FC = () => {
  const {
    data,
    selectedStudentId,
    setSelectedStudentId,
    setCurrentView,
    selectedMonth,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'basic' | 'academics' | 'attendance' | 'conduct' | 'comments' | 'progress' | 'notes'
  >('basic');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Student selection
  const currentStudentIndex = data.students.findIndex((s) => s.id === selectedStudentId);
  const student = data.students[currentStudentIndex >= 0 ? currentStudentIndex : 0];

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Chưa chọn học sinh để xem hồ sơ.</p>
        <button
          onClick={() => setCurrentView('students')}
          className="mt-3 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold"
        >
          Quay lại danh sách học sinh
        </button>
      </div>
    );
  }

  // Navigation to next/previous student
  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setSelectedStudentId(data.students[currentStudentIndex - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < data.students.length - 1) {
      setSelectedStudentId(data.students[currentStudentIndex + 1].id);
    }
  };

  // Student's records
  const academicRecords = data.academicRecords.filter((r) => r.studentId === student.id);
  const latestAcademic = academicRecords.find((r) => r.period === selectedMonth) || academicRecords[0];

  // Attendance history
  const studentAttendance = data.attendanceRecords.map((day) => {
    const rec = day.records.find((r) => r.studentId === student.id);
    return {
      date: day.date,
      status: rec?.status || 'present',
      note: rec?.note,
    };
  });

  const presentDays = studentAttendance.filter((a) => a.status === 'present').length;
  const excusedDays = studentAttendance.filter((a) => a.status === 'excused').length;
  const unexcusedDays = studentAttendance.filter((a) => a.status === 'unexcused').length;
  const lateDays = studentAttendance.filter((a) => a.status === 'late').length;

  // Conduct records
  const conductRecords = data.conductRecords.filter((r) => r.studentId === student.id);

  // Comments
  const comments = data.comments.filter((c) => c.studentId === student.id);

  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản', icon: FileText },
    { id: 'academics', label: 'Lịch sử học tập', icon: BookOpen },
    { id: 'attendance', label: 'Chuyên cần', icon: Calendar },
    { id: 'conduct', label: 'Rèn luyện', icon: Award },
    { id: 'comments', label: 'Nhận xét', icon: MessageSquareText },
    { id: 'progress', label: 'Tiến bộ', icon: TrendingUp },
    { id: 'notes', label: 'Ghi chú', icon: FileText },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Top back & switcher bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('students')}
          className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevStudent}
            disabled={currentStudentIndex === 0}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            title="Học sinh trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2">
            {currentStudentIndex + 1} / {data.students.length}
          </span>
          <button
            onClick={handleNextStudent}
            disabled={currentStudentIndex === data.students.length - 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            title="Học sinh kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Student Header Card (matches screenshot) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Avatar type={student.avatarType} size="2xl" />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black text-slate-800">{student.fullName}</h2>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    student.gender === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {student.gender}
                </span>
                {latestAcademic && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Điểm TB: {latestAcademic.averageScore.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 mt-2">
                <div>
                  <span className="text-slate-400">Mã HS:</span>{' '}
                  <span className="font-bold text-slate-800">{student.studentCode}</span>
                </div>
                <div>
                  <span className="text-slate-400">Ngày sinh:</span>{' '}
                  <span className="font-medium text-slate-800">{student.birthDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Phụ huynh:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {student.parentName} - {student.parentPhone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Địa chỉ:</span>{' '}
                  <span className="font-medium text-slate-800">{student.address}</span>
                </div>
                <div className="sm:col-span-2 mt-1">
                  <span className="text-slate-400">Ghi chú:</span>{' '}
                  <span className="text-slate-700 italic">{student.notes || 'Chưa có ghi chú đặc biệt.'}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* Profile Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-3 pt-2 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl p-5 shadow-2xs min-h-[300px]">
        {/* Tab 1: Thông tin cơ bản */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông tin liên hệ & Gia đình
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 text-xs border border-slate-100">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Phụ huynh học sinh:</span>
                    <span className="font-bold text-slate-800">{student.parentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <span className="font-bold text-sky-700">{student.parentPhone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Địa chỉ cư trú:</span>
                    <span className="font-medium text-slate-800 text-right">{student.address}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Lớp:</span>
                    <span className="font-bold text-slate-800">
                      Lớp {data.classSettings.className} - {data.classSettings.schoolName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Other medical & school info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông tin sức khỏe & Nhập học
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 text-xs border border-slate-100">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Ngày vào lớp:</span>
                    <span className="font-medium text-slate-800">{student.enrollDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Nhóm máu:</span>
                    <span className="font-bold text-slate-800">{student.bloodType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Dị ứng:</span>
                    <span className="font-medium text-amber-700">{student.allergies}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Tình trạng hồ sơ:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đầy đủ học bạ & giấy khai sinh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Lịch sử học tập */}
        {activeTab === 'academics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                Bảng điểm theo giai đoạn của {student.fullName}
              </h4>
              <button
                onClick={() => setShowScoreModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nhập kết quả kỳ này</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="py-2.5 px-3">Giai đoạn</th>
                    {data.subjects.map((sub) => (
                      <th key={sub.id} className="py-2.5 px-2 text-center">
                        {sub.shortName}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center">Điểm TB</th>
                    <th className="py-2.5 px-3 text-center">Đánh giá</th>
                    <th className="py-2.5 px-4">Nhận xét giáo viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {academicRecords.length === 0 ? (
                    <tr>
                      <td colSpan={data.subjects.length + 4} className="py-6 text-center text-slate-400">
                        Chưa có dữ liệu học tập cho học sinh này.
                      </td>
                    </tr>
                  ) : (
                    academicRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{rec.period}</td>
                        {data.subjects.map((sub) => (
                          <td key={sub.id} className="py-2.5 px-2 text-center font-semibold text-slate-700 tabular-nums">
                            {rec.scores[sub.id] ?? '-'}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-center font-black text-sky-700 tabular-nums">
                          {rec.averageScore.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              rec.level === 'Tốt'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.level === 'Khá'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rec.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 italic">{rec.comment}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Chuyên cần */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <div className="text-xs font-semibold text-emerald-800">Có mặt</div>
                <div className="text-xl font-black text-emerald-700 tabular-nums">{presentDays} buổi</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                <div className="text-xs font-semibold text-amber-800">Nghỉ có phép</div>
                <div className="text-xl font-black text-amber-700 tabular-nums">{excusedDays} buổi</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                <div className="text-xs font-semibold text-rose-800">Nghỉ K.phép</div>
                <div className="text-xl font-black text-rose-700 tabular-nums">{unexcusedDays} buổi</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-center">
                <div className="text-xs font-semibold text-purple-800">Đi muộn</div>
                <div className="text-xl font-black text-purple-700 tabular-nums">{lateDays} lần</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
              <div className="px-4 py-2.5 bg-slate-50 font-bold text-xs text-slate-700 border-b border-slate-200">
                Nhật ký điểm danh
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {studentAttendance.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Chưa có lịch sử điểm danh.</div>
                ) : (
                  studentAttendance.map((item, idx) => (
                    <div key={idx} className="px-4 py-2 flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-700">{item.date}</div>
                      <div className="flex items-center gap-3">
                        {item.note && <span className="text-slate-500 italic">"{item.note}"</span>}
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            item.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'excused'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'late'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status === 'present'
                            ? 'Có mặt'
                            : item.status === 'excused'
                            ? 'Nghỉ có phép'
                            : item.status === 'late'
                            ? 'Đi muộn'
                            : 'Nghỉ không phép'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Rèn luyện */}
        {activeTab === 'conduct' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Đánh giá rèn luyện & Phẩm chất</h4>
              <button
                onClick={() => setShowConductModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi nhận rèn luyện</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {conductRecords.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Chưa có ghi nhận rèn luyện cho học sinh này.
                </div>
              ) : (
                conductRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{rec.criterion}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            rec.rating === 'Tốt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.rating === 'Khá'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.rating}
                        </span>
                      </div>
                      <p className="text-slate-600">{rec.comment}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">{rec.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Nhận xét */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Nhận xét của giáo viên</h4>
              <button
                onClick={() => setShowCommentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhận xét</span>
              </button>
            </div>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Chưa có nhận xét nào được ghi nhận cho học sinh này.
                </div>
              ) : (
                comments.map((cm) => (
                  <div
                    key={cm.id}
                    className="p-4 bg-sky-50/40 border border-sky-100 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-800 px-2 py-0.5 rounded bg-sky-100">
                        {cm.topic}
                      </span>
                      <span className="text-slate-400">{cm.date}</span>
                    </div>
                    <p className="text-slate-800 text-sm font-medium leading-relaxed">{cm.content}</p>
                    <div className="text-[11px] text-slate-500 font-semibold text-right">
                      Người nhận xét: {cm.author}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Tiến bộ */}
        {activeTab === 'progress' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <div className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Điểm mạnh ghi nhận
                </div>
                <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                  {student.strengths?.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl">
                <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Nội dung cần tiếp tục hỗ trợ
                </div>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  {student.needsSupport?.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl">
                <div className="text-xs font-bold text-sky-900 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                  Mục tiêu tiếp theo
                </div>
                <p className="text-xs text-sky-800 leading-relaxed font-medium">
                  {student.nextGoals || 'Cải thiện toàn diện các môn học.'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCurrentView('progress')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
              >
                <span>Xem biểu đồ so sánh tiến bộ chi tiết toàn diện</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 7: Ghi chú của giáo viên */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Ghi chú theo dõi riêng của giáo viên</h4>
            <div className="p-4 bg-amber-50/40 border border-amber-200/70 rounded-xl">
              <p className="text-sm text-slate-700 leading-relaxed">
                {student.notes || 'Chưa có ghi chú đặc biệt từ giáo viên chủ nhiệm.'}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Cập nhật ghi chú</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {isEditingProfile && (
        <StudentModal
          student={student}
          onClose={() => setIsEditingProfile(false)}
        />
      )}

      {/* Quick Score Modal */}
      {showScoreModal && (
        <ScoreModal
          student={student}
          period={selectedMonth}
          onClose={() => setShowScoreModal(false)}
        />
      )}

      {/* Quick Conduct Modal */}
      {showConductModal && (
        <ConductModal
          defaultStudentId={student.id}
          onClose={() => setShowConductModal(false)}
        />
      )}

      {/* Quick Comment Modal */}
      {showCommentModal && (
        <CommentModal
          defaultStudentId={student.id}
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </div>
  );
};
