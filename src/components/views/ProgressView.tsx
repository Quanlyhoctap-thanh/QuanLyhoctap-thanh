import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Edit2,
  Calendar,
  LineChart,
} from 'lucide-react';
import { StudentModal } from '../modals/StudentModal';

export const ProgressView: React.FC = () => {
  const { data, selectedStudentId, setSelectedStudentId } = useApp();

  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || data.students[0]?.id || ''
  );
  const [timeRange, setTimeRange] = useState<string>('3months');
  const [editingStudent, setEditingStudent] = useState<boolean>(false);

  const student = data.students.find((s) => s.id === activeStudentId) || data.students[0];

  // Progression records for this student sorted chronologically
  const studentRecords = useMemo(() => {
    if (!student) return [];
    return data.academicRecords
      .filter((r) => r.studentId === student.id)
      .slice(0, 4);
  }, [data.academicRecords, student]);

  // Current period record & Previous period record
  const currentRecord = studentRecords[0] || {
    scores: { sub_tv: 9, sub_toan: 8, sub_tnxh: 9, sub_dd: 9, sub_th: 8, sub_nn: 8 },
    averageScore: 8.5,
    period: 'Tháng 4/2025',
  };

  const previousRecord = studentRecords[1] || {
    scores: { sub_tv: 8, sub_toan: 7, sub_tnxh: 8, sub_dd: 8, sub_th: 7, sub_nn: 7 },
    averageScore: 7.5,
    period: 'Tháng 3/2025',
  };

  // Timeline points
  const timelinePoints = [
    { period: 'Tháng 1/2025', avg: 7.2 },
    { period: 'Tháng 2/2025', avg: 7.9 },
    { period: 'Tháng 3/2025', avg: 8.3 },
    { period: 'Tháng 4/2025', avg: currentRecord.averageScore || 8.5 },
  ];

  if (!student) {
    return <div className="p-8 text-center text-slate-500">Chưa có dữ liệu học sinh.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Title & Selection Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">TIẾN BỘ CỦA HỌC SINH</h2>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi sự thay đổi năng lực và kết quả học tập qua từng giai đoạn
          </p>
        </div>
      </div>

      {/* Selector bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Chọn học sinh</label>
            <select
              value={activeStudentId}
              onChange={(e) => {
                setActiveStudentId(e.target.value);
                setSelectedStudentId(e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentCode} - {s.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Thời gian</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="3months">3 tháng gần nhất</option>
              <option value="semester1">Cả Học kỳ 1</option>
              <option value="fullYear">Toàn năm học</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-sky-700 bg-sky-50 font-bold px-3 py-1.5 rounded-lg border border-sky-100 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <span>Tiến trình tăng trưởng: +{(timelinePoints[3].avg - timelinePoints[0].avg).toFixed(1)} điểm TB</span>
        </div>
      </div>

      {/* Row 1: 2-Column Split (Matches screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Student Overview (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Thông tin tổng quan</h3>
              <button
                onClick={() => setEditingStudent(true)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                title="Chỉnh sửa định hướng & mục tiêu"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            </div>

            {/* Profile lockup */}
            <div className="flex items-center gap-3.5 my-3.5">
              <Avatar type={student.avatarType} size="xl" />
              <div>
                <h4 className="text-base font-black text-slate-800">{student.fullName}</h4>
                <div className="text-xs text-slate-500">
                  Lớp {data.classSettings.className} · Mã: {student.studentCode}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    Điểm TB: {currentRecord.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Qualitative milestones */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <div className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm mạnh:</span>
                </div>
                <p className="text-emerald-800 leading-relaxed font-medium">
                  {student.strengths?.join(', ') || 'Chăm chỉ, tích cực tham gia xây dựng bài.'}
                </p>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-lg">
                <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cần hỗ trợ:</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  {student.needsSupport?.join(', ') || 'Rèn luyện thêm kỹ năng giao tiếp và tính toán.'}
                </p>
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg">
                <div className="font-bold text-sky-900 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Mục tiêu tiếp theo:</span>
                </div>
                <p className="text-sky-800 leading-relaxed font-medium">
                  {student.nextGoals || 'Đạt danh hiệu Học sinh Xuất sắc cuối năm.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Double Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">So sánh kết quả học tập</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-400 shrink-0" />
                  <span className="text-slate-600">Giai đoạn trước</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-600 shrink-0" />
                  <span className="text-slate-600 font-semibold">Giai đoạn hiện tại</span>
                </div>
              </div>
            </div>

            {/* Double Bar Chart */}
            <div className="h-56 w-full pt-8 pb-2 flex items-end justify-between gap-3 px-2">
              {data.subjects.map((sub) => {
                const prevScore = previousRecord.scores[sub.id] ?? 7;
                const currScore = currentRecord.scores[sub.id] ?? 8;

                const prevHeight = Math.min(100, Math.max(10, (prevScore / 10) * 100));
                const currHeight = Math.min(100, Math.max(10, (currScore / 10) * 100));

                return (
                  <div key={sub.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end justify-center gap-1 w-full max-w-[48px] h-40">
                      {/* Previous Bar */}
                      <div
                        className="w-1/2 bg-purple-400 rounded-t-sm transition-all duration-500 relative group-hover:brightness-105"
                        style={{ height: `${prevHeight}%` }}
                        title={`Trước: ${prevScore}`}
                      >
                        <span className="text-[10px] font-bold text-purple-900 -top-4 left-1/2 -translate-x-1/2 absolute hidden group-hover:block">
                          {prevScore}
                        </span>
                      </div>

                      {/* Current Bar */}
                      <div
                        className="w-1/2 bg-sky-600 rounded-t-sm transition-all duration-500 relative group-hover:brightness-110"
                        style={{ height: `${currHeight}%` }}
                        title={`Hiện tại: ${currScore}`}
                      >
                        <span className="text-[10px] font-bold text-sky-900 -top-4 left-1/2 -translate-x-1/2 absolute block">
                          {currScore}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-700 mt-2 truncate w-full text-center">
                      {sub.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>So sánh giữa {previousRecord.period} và {currentRecord.period}</span>
            <span className="font-bold text-emerald-600">Đa số các môn đều có bước tiến rõ rệt</span>
          </div>
        </div>
      </div>

      {/* Row 2: Progress Timeline (Matches screenshot bottom) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <LineChart className="w-4 h-4 text-sky-600" />
          <span>Quá trình tiến bộ theo thời gian</span>
        </h3>

        {/* Timeline connector and steps */}
        <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4 py-4">
          {/* Connector Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-600 z-0" />

          {timelinePoints.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              {/* Point Node */}
              <div className="w-6 h-6 rounded-full bg-white border-4 border-sky-600 flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              </div>

              {/* Text labels */}
              <div className="mt-2.5 text-center">
                <div className="text-xs font-bold text-slate-800">{item.period}</div>
                <div className="text-[11px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                  Điểm TB: {item.avg.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Edit Modal */}
      {editingStudent && (
        <StudentModal
          student={student}
          onClose={() => setEditingStudent(false)}
        />
      )}
    </div>
  );
};
