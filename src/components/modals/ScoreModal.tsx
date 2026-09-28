import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicLevel, Student } from '../../types';
import { X, Save, BookOpen, Calculator } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface Props {
  student: Student;
  period: string;
  onClose: () => void;
}

export const ScoreModal: React.FC<Props> = ({ student, period, onClose }) => {
  const { data, saveAcademicRecord } = useApp();

  const existingRecord = data.academicRecords.find(
    (r) => r.studentId === student.id && r.period === period
  );

  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initialScores: Record<string, number> = {};
    data.subjects.forEach((s) => {
      initialScores[s.id] = existingRecord?.scores[s.id] ?? 8;
    });
    return initialScores;
  });

  const [comment, setComment] = useState(existingRecord?.comment || 'Học tập tốt, tích cực phát biểu.');
  const [level, setLevel] = useState<AcademicLevel>(existingRecord?.level || 'Tốt');

  // Compute average automatically
  const currentAverage = React.useMemo(() => {
    const keys = Object.keys(scores);
    if (keys.length === 0) return 0;
    const sum = keys.reduce((acc, k) => acc + (Number(scores[k]) || 0), 0);
    return Number((sum / keys.length).toFixed(1));
  }, [scores]);

  const handleScoreChange = (subjectId: string, val: string) => {
    const num = parseFloat(val);
    const clamped = isNaN(num) ? 0 : Math.min(10, Math.max(0, num));
    setScores((prev) => ({ ...prev, [subjectId]: clamped }));

    // Auto level recommendation based on elementary standards
    const updated = { ...scores, [subjectId]: clamped };
    const sum = Object.values(updated).reduce((a, b) => a + b, 0);
    const avg = sum / Object.keys(updated).length;
    if (avg >= 8.0) setLevel('Tốt');
    else if (avg >= 6.5) setLevel('Khá');
    else setLevel('Cần cố gắng');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAcademicRecord({
      studentId: student.id,
      period,
      scores,
      averageScore: currentAverage,
      level,
      comment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 bg-sky-700 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-200" />
            <h2 className="text-base font-bold">Nhập kết quả học tập ({period})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student card info */}
        <div className="px-5 py-3 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar type={student.avatarType} size="md" />
            <div>
              <div className="font-bold text-slate-800 text-sm">{student.fullName}</div>
              <div className="text-xs text-slate-500">Mã: {student.studentCode} · Lớp 3A2</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Điểm TB dự kiến</div>
            <div className="text-lg font-extrabold text-sky-700 tabular-nums flex items-center justify-end gap-1">
              <Calculator className="w-4 h-4 text-sky-500" />
              {currentAverage.toFixed(1)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Subject score inputs */}
          <div>
            <label className="block font-semibold mb-2 text-slate-800">
              Điểm số theo từng môn (Thang điểm 10):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {data.subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-sky-300 transition-colors"
                >
                  <label className="block text-xs font-semibold text-slate-700 truncate mb-1">
                    {sub.name}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    required
                    value={scores[sub.id] ?? ''}
                    onChange={(e) => handleScoreChange(sub.id, e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Level selection */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Mức độ đánh giá</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Tốt">Hoàn thành tốt (Tốt)</option>
                <option value="Khá">Hoàn thành (Khá)</option>
                <option value="Cần cố gắng">Chưa hoàn thành (Cần cố gắng)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Thời gian đánh giá</label>
              <input
                type="text"
                disabled
                value={period}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-medium"
              />
            </div>
          </div>

          {/* Teacher comment */}
          <div>
            <label className="block font-semibold mb-1 text-slate-800">Nhận xét của giáo viên</label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              placeholder="Nhận xét cụ thể về kết quả học tập của học sinh..."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Lưu kết quả
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
