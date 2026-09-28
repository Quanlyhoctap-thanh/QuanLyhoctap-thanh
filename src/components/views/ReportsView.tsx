import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileBarChart2,
  Printer,
  Download,
  Calendar,
  AlertTriangle,
  Users,
  Award,
  BookOpen,
  ShieldAlert,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    data,
    selectedMonth,
    setSelectedMonth,
    latestAttendanceStats,
    overallClassAverage,
    classSubjectAverages,
    studentsNeedingAttention,
    exportDataCSV,
    exportDataJSON,
    showToast,
  } = useApp();

  const [reportType, setReportType] = useState<'all' | 'single' | 'subject'>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(data.students[0]?.id || '');
  const [reportSubTab, setReportSubTab] = useState<'summary' | 'academics' | 'attendance' | 'conduct' | 'comments' | 'progress'>('summary');
  const [teacherSummaryNote, setTeacherSummaryNote] = useState<string>(
    `Lớp ${data.classSettings.className} có nền nếp tốt, đa số học sinh có ý thức học tập và rèn luyện. Cần quan tâm thêm ${studentsNeedingAttention.length} học sinh có kết quả học tập chưa ổn định.`
  );

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    showToast('Báo cáo đã được cập nhật số liệu mới nhất!');
  };

  return (
    <div className="space-y-4">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">BÁO CÁO TỔNG HỢP</h2>
          <p className="text-xs text-slate-500 font-medium">
            Xuất báo cáo định kỳ cho Ban giám hiệu & Phụ huynh học sinh Lớp {data.classSettings.className}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
          >
            <span>+ Tạo báo cáo</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>In báo cáo</span>
          </button>

          <button
            onClick={exportDataCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Filter Options (Matches screenshot) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Loại báo cáo</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Toàn lớp</option>
              <option value="single">Từng học sinh</option>
              <option value="subject">Theo môn học</option>
            </select>
          </div>

          {reportType === 'single' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Học sinh</label>
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {data.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentCode} - {s.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Thời gian</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
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

        <div className="text-xs text-slate-500">
          Trường Tiểu học Khánh Bình · Năm học {data.classSettings.academicYear}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
          <div className="text-xs uppercase font-bold tracking-widest text-slate-500">
            {data.classSettings.schoolName}
          </div>
          <h1 className="text-xl font-black uppercase text-slate-900 tracking-tight">
            BÁO CÁO TÌNH HÌNH HỌC TẬP VÀ RÈN LUYỆN LỚP {data.classSettings.className}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Kỳ đánh giá: <span className="font-bold">{selectedMonth}</span> · Giáo viên chủ nhiệm:{' '}
            <span className="font-bold">{data.classSettings.teacherName}</span>
          </p>
        </div>

        {/* Report Sub Tabs (Web only) */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto print:hidden">
          {(
            [
              { id: 'summary', label: 'Tổng quan' },
              { id: 'academics', label: 'Học tập' },
              { id: 'attendance', label: 'Chuyên cần' },
              { id: 'conduct', label: 'Rèn luyện' },
              { id: 'comments', label: 'Nhận xét' },
              { id: 'progress', label: 'Tiến bộ' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setReportSubTab(t.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-md transition-colors border-b-2 ${
                reportSubTab === t.id
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Section 1: Thống kê chung (Cards match screenshot) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Thống kê chung toàn lớp
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Tổng số học sinh</span>
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1 tabular-nums">
                {data.students.length}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tỷ lệ có mặt</span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
                {latestAttendanceStats.rate}%
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Điểm TB lớp</span>
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
                {overallClassAverage}
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Cần quan tâm</span>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-1 tabular-nums">
                {studentsNeedingAttention.length}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bar chart kết quả học tập theo môn */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            2. Kết quả học tập theo môn (TB Lớp)
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="h-40 w-full flex items-end justify-between gap-3 px-2">
              {data.subjects.map((sub) => {
                const avg = classSubjectAverages[sub.id] || 8.0;
                const heightPercent = Math.min(100, Math.max(10, (avg / 10) * 100));

                return (
                  <div key={sub.id} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-xs font-bold text-slate-700 mb-1 tabular-nums">
                      {avg.toFixed(1)}
                    </span>
                    <div className="w-full max-w-[32px] bg-slate-200 rounded-t-md overflow-hidden flex flex-col justify-end h-28">
                      <div
                        className="w-full rounded-t-md"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: sub.color || '#0284c7',
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 mt-2 truncate w-full text-center">
                      {sub.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Bảng danh sách học sinh tổng hợp */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            3. Bảng điểm và đánh giá chi tiết
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-2 text-center w-10">STT</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-2 text-center">Giới tính</th>
                  {data.subjects.map((sub) => (
                    <th key={sub.id} className="py-2.5 px-2 text-center">
                      {sub.shortName}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-center bg-slate-200/60">TB</th>
                  <th className="py-2.5 px-3 text-center">Mức độ</th>
                  <th className="py-2.5 px-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.students.map((student, idx) => {
                  const rec = data.academicRecords.find(
                    (r) => r.studentId === student.id && r.period === selectedMonth
                  );
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{student.fullName}</td>
                      <td className="py-2 px-2 text-center">{student.gender}</td>
                      {data.subjects.map((sub) => (
                        <td key={sub.id} className="py-2 px-2 text-center tabular-nums">
                          {rec?.scores[sub.id] ?? '-'}
                        </td>
                      ))}
                      <td className="py-2 px-2 text-center font-bold text-sky-800 bg-slate-50 tabular-nums">
                        {rec?.averageScore.toFixed(1) ?? '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec?.level === 'Tốt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec?.level === 'Khá'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec?.level || 'Tốt'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 italic max-w-xs truncate">
                        {rec?.comment || student.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Nhận xét chung của Giáo viên chủ nhiệm */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            4. Nhận xét chung của Giáo viên chủ nhiệm
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <textarea
              rows={2}
              value={teacherSummaryNote}
              onChange={(e) => setTeacherSummaryNote(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="hidden print:grid grid-cols-2 pt-8 text-center text-xs">
          <div>
            <div className="font-bold text-slate-700 uppercase">Hiệu trưởng / Ban giám hiệu</div>
            <div className="text-[11px] text-slate-400 mt-1">(Ký và ghi rõ họ tên)</div>
          </div>
          <div>
            <div className="font-bold text-slate-700 uppercase">Giáo viên chủ nhiệm</div>
            <div className="text-[11px] text-slate-400 mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="mt-12 font-bold text-slate-900">{data.classSettings.teacherName}</div>
          </div>
        </div>

        {/* Privacy & Compliance Notice Banner (Matches screenshot bottom) */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs print:hidden">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="leading-relaxed">
            <span className="font-bold">Lưu ý:</span> Dữ liệu học sinh là thông tin quan trọng, cần được bảo vệ và sử dụng theo đúng quy định của nhà trường. Không phát tán hoặc sao lưu ra thiết bị không an toàn.
          </p>
        </div>
      </div>
    </div>
  );
};
