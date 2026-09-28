import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommentRecord } from '../../types';
import { X, Save, MessageSquareText, Sparkles } from 'lucide-react';

interface Props {
  initialComment?: CommentRecord | null;
  defaultStudentId?: string;
  onClose: () => void;
}

export const CommentModal: React.FC<Props> = ({ initialComment, defaultStudentId, onClose }) => {
  const { data, addComment, updateComment } = useApp();

  const [studentId, setStudentId] = useState(
    initialComment?.studentId || defaultStudentId || data.students[0]?.id || ''
  );
  const [topic, setTopic] = useState<'Học tập' | 'Chuyên cần' | 'Rèn luyện' | 'Kỹ năng sống'>(
    initialComment?.topic || 'Học tập'
  );
  const [content, setContent] = useState(initialComment?.content || '');
  const [author, setAuthor] = useState(initialComment?.author || data.classSettings.teacherName);
  const [date, setDate] = useState(
    initialComment?.date ||
      new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  const sampleTemplates = [
    { label: 'Học tập tốt', text: 'Học tập tốt, tiếp thu bài nhanh, tích cực phát biểu xây dựng bài.' },
    { label: 'Chuyên cần tốt', text: 'Đi học đều đặn, đúng giờ, thực hiện tốt nền nếp ra vào lớp.' },
    { label: 'Ngoan, lễ phép', text: 'Ngoan ngoãn, lễ phép với thầy cô, hòa đồng và hay giúp đỡ bạn bè.' },
    { label: 'Cần cố gắng hơn', text: 'Cần chú ý lắng nghe cô giảng bài và hoàn thành bài tập về nhà đầy đủ.' },
    { label: 'Tiến bộ rõ rệt', text: 'Có nhiều tiến bộ vượt bậc so với giai đoạn trước, đáng khen ngợi!' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (initialComment) {
      updateComment(initialComment.id, {
        studentId,
        topic,
        content: content.trim(),
        author,
        date,
      });
    } else {
      addComment({
        studentId,
        topic,
        content: content.trim(),
        author,
        date,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 bg-sky-700 text-white">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-sky-200" />
            <h2 className="text-base font-bold">
              {initialComment ? 'Chỉnh sửa nhận xét' : 'Thêm nhận xét học sinh'}
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
              <label className="block font-semibold mb-1 text-slate-800">Chủ đề nhận xét</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Học tập">Học tập</option>
                <option value="Chuyên cần">Chuyên cần</option>
                <option value="Rèn luyện">Rèn luyện</option>
                <option value="Kỹ năng sống">Kỹ năng sống</option>
              </select>
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
          </div>

          {/* Quick template suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                Gợi ý mẫu nhận xét (Nhấn để áp dụng):
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleTemplates.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setContent(item.text)}
                  className="px-2.5 py-1 text-xs rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800">
              Nội dung nhận xét <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              placeholder="Nhập nội dung nhận xét chi tiết..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800">Người nhận xét</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Giáo viên chủ nhiệm"
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
              Lưu nhận xét
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
