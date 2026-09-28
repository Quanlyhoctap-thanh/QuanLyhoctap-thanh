import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CommentRecord } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  MessageSquareText,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { CommentModal } from '../modals/CommentModal';

export const CommentsView: React.FC = () => {
  const { data, deleteComment, setSelectedStudentId, setCurrentView } = useApp();

  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [editingComment, setEditingComment] = useState<CommentRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefilledTemplate, setPrefilledTemplate] = useState<string | null>(null);

  const sampleTemplates = [
    { label: 'Học tập tốt', text: 'Học tập tốt, tiếp thu bài nhanh, tích cực phát biểu xây dựng bài.' },
    { label: 'Chuyên cần tốt', text: 'Đi học đầy đủ, đúng giờ, thực hiện tốt nền nếp ra vào lớp.' },
    { label: 'Ngoan, lễ phép', text: 'Ngoan, lễ phép, hòa đồng với bạn bè, tích cực giúp đỡ bạn.' },
    { label: 'Cần cố gắng hơn', text: 'Cần tập trung hơn trong giờ học và chuẩn bị bài đầy đủ.' },
    { label: 'Tiến bộ rõ rệt', text: 'Có tiến bộ rõ rệt so với giai đoạn trước, tích cực rèn luyện.' },
  ];

  // Filtered comments
  const filteredComments = useMemo(() => {
    return data.comments.filter((c) => {
      if (studentFilter !== 'all' && c.studentId !== studentFilter) return false;
      if (topicFilter !== 'all' && c.topic !== topicFilter) return false;
      return true;
    });
  }, [data.comments, studentFilter, topicFilter]);

  const getStudent = (id: string) => data.students.find((s) => s.id === id);

  const handleUseTemplate = (text: string) => {
    setPrefilledTemplate(text);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Title & Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">DANH SÁCH NHẬN XÉT</h2>
          <p className="text-xs text-slate-500 font-medium">
            Ghi nhận nhận xét quá trình học tập và rèn luyện của học sinh Lớp {data.classSettings.className}
          </p>
        </div>

        <button
          onClick={() => {
            setPrefilledTemplate(null);
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm nhận xét</span>
        </button>
      </div>

      {/* Filter Bar (Matches screenshot: Theo học sinh, Theo thời gian/chủ đề) */}
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

          {/* Theo chủ đề */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Chủ đề</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tất cả chủ đề</option>
              <option value="Học tập">Học tập</option>
              <option value="Chuyên cần">Chuyên cần</option>
              <option value="Rèn luyện">Rèn luyện</option>
              <option value="Kỹ năng sống">Kỹ năng sống</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <span className="font-bold text-slate-700">{filteredComments.length}</span> nhận xét
        </div>
      </div>

      {/* Main Comments Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                <th className="py-3 px-3 min-w-[100px]">Ngày nhận xét</th>
                <th className="py-3 px-3 min-w-[100px]">Chủ đề</th>
                <th className="py-3 px-4 min-w-[240px]">Nội dung</th>
                <th className="py-3 px-3 min-w-[120px]">Người nhập</th>
                <th className="py-3 px-3 text-center w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có nhận xét nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredComments.map((cm, idx) => {
                  const student = getStudent(cm.studentId);
                  if (!student) return null;

                  return (
                    <tr
                      key={cm.id}
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

                      <td className="py-2.5 px-3 text-slate-500 font-medium">
                        {cm.date}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            cm.topic === 'Học tập'
                              ? 'bg-blue-100 text-blue-800'
                              : cm.topic === 'Chuyên cần'
                              ? 'bg-amber-100 text-amber-800'
                              : cm.topic === 'Rèn luyện'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {cm.topic}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {cm.content}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 font-medium">
                        {cm.author}
                      </td>

                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingComment(cm)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Sửa nhận xét"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteComment(cm.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa nhận xét"
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

      {/* Quick Templates Strip (Matches screenshot bottom) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          Mẫu nhận xét (Có thể chỉnh sửa khi bấm chọn)
        </h4>
        <div className="flex flex-wrap gap-2">
          {sampleTemplates.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleUseTemplate(item.text)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <CommentModal
          initialComment={
            prefilledTemplate
              ? {
                  id: '',
                  studentId: data.students[0]?.id || '',
                  date: new Date().toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
                  topic: 'Học tập',
                  content: prefilledTemplate,
                  author: data.classSettings.teacherName,
                }
              : null
          }
          onClose={() => {
            setShowAddModal(false);
            setPrefilledTemplate(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editingComment && (
        <CommentModal
          initialComment={editingComment}
          onClose={() => setEditingComment(null)}
        />
      )}
    </div>
  );
};
