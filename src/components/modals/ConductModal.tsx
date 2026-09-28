import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConductCriterion, ConductRating, ConductRecord } from '../../types';
import { X, Save, Award } from 'lucide-react';

interface Props {
  initialRecord?: ConductRecord | null;
  defaultStudentId?: string;
  onClose: () => void;
}

export const ConductModal: React.FC<Props> = ({ initialRecord, defaultStudentId, onClose }) => {
  const { data, addConductRecord, updateConductRecord } = useApp();

  const [studentId, setStudentId] = useState(
    initialRecord?.studentId || defaultStudentId || data.students[0]?.id || ''
  );
  const [criterion, setCriterion] = useState<ConductCriterion>(
    initialRecord?.criterion || 'Ý thức học tập'
  );
  const [rating, setRating] = useState<ConductRating>(initialRecord?.rating || 'Tốt');
  const [comment, setComment] = useState(
    initialRecord?.comment || 'Chủ động, tích cực phát biểu trong tất cả các môn.'
  );
  const [date, setDate] = useState(
    initialRecord?.date ||
      new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  const criteriaList: ConductCriterion[] = [
    'Ý thức học tập',
    'Chuẩn bị đồ dùng',
    'Thực hiện nhiệm vụ',
    'Hợp tác với bạn',
    'Tham gia hoạt động',
    'Thực hiện nội quy',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialRecord) {
      updateConductRecord(initialRecord.id, {
        studentId,
        criterion,
        rating,
        comment,
        date,
      });
    } else {
      addConductRecord({
        studentId,
        criterion,
        rating,
        comment,
        date,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 bg-sky-700 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-200" />
            <h2 className="text-base font-bold">
              {initialRecord ? 'Sửa ghi nhận rèn luyện' : 'Ghi nhận rèn luyện học sinh'}
            </h2>
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
            <label className="block font-semibold mb-1 text-slate-800">Chọn học sinh</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentCode} - {s.fullName} ({s.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Tiêu chí rèn luyện</label>
              <select
                value={criterion}
                onChange={(e) => setCriterion(e.target.value as ConductCriterion)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              >
                {criteriaList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-800">Mức ghi nhận</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value as ConductRating)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-semibold"
              >
                <option value="Tốt">Tốt (Khen ngợi)</option>
                <option value="Khá">Khá (Đạt yêu cầu)</option>
                <option value="Cần cố gắng">Cần cố gắng (Nhắc nhở)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800">Ngày ghi nhận</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="DD/MM/YYYY"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800">Nhận xét chi tiết</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              placeholder="Nhập nội dung quan sát được của giáo viên..."
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
              Lưu ghi nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
