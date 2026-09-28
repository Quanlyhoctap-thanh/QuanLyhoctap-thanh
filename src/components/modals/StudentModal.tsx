import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Gender } from '../../types';
import { X, UserPlus, Save, Sparkles } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface Props {
  student?: Student | null;
  onClose: () => void;
}

export const StudentModal: React.FC<Props> = ({ student, onClose }) => {
  const { addStudent, updateStudent } = useApp();
  const isEdit = !!student;

  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    gender: (student?.gender || 'Nữ') as Gender,
    birthDate: student?.birthDate || '15/03/2016',
    parentName: student?.parentName || '',
    parentPhone: student?.parentPhone || '',
    address: student?.address || '',
    enrollDate: student?.enrollDate || '05/09/2021',
    bloodType: student?.bloodType || 'O',
    allergies: student?.allergies || 'Không',
    notes: student?.notes || '',
    avatarType: student?.avatarType || (student?.gender === 'Nam' ? 'boy-1' : 'girl-1'),
    strengthsText: student?.strengths.join(', ') || 'Chăm ngoan, hòa đồng',
    needsSupportText: student?.needsSupport.join(', ') || 'Rèn thêm chữ viết',
    nextGoals: student?.nextGoals || 'Cải thiện điểm số các môn học',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const strengths = formData.strengthsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const needsSupport = formData.needsSupportText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEdit && student) {
      updateStudent(student.id, {
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        address: formData.address,
        enrollDate: formData.enrollDate,
        bloodType: formData.bloodType,
        allergies: formData.allergies,
        notes: formData.notes,
        avatarType: formData.avatarType as any,
        strengths,
        needsSupport,
        nextGoals: formData.nextGoals,
      });
    } else {
      addStudent({
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        address: formData.address,
        enrollDate: formData.enrollDate,
        bloodType: formData.bloodType,
        allergies: formData.allergies,
        notes: formData.notes,
        avatarType: formData.avatarType as any,
        strengths,
        needsSupport,
        nextGoals: formData.nextGoals,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-sky-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-200" />
            <h2 className="text-base font-bold">
              {isEdit ? `Chỉnh sửa hồ sơ: ${student.fullName}` : 'Thêm học sinh mới vào lớp'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 flex-1">
          {/* Avatar selection & Full Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <Avatar type={formData.avatarType as any} size="xl" />
              <div className="flex gap-1">
                {(['girl-1', 'girl-2', 'boy-1', 'boy-2'] as const).map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarType: av })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      formData.avatarType === av ? 'border-sky-600 scale-110' : 'border-transparent opacity-60'
                    }`}
                  >
                    <Avatar type={av} size="sm" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-slate-800">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-base font-medium"
                  placeholder="VD: Nguyễn Minh Anh"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as Gender,
                      avatarType: e.target.value === 'Nam' ? 'boy-1' : 'girl-1',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Nữ">Nữ</option>
                  <option value="Nam">Nam</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800">Ngày sinh</label>
                <input
                  type="text"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="DD/MM/YYYY (VD: 15/03/2016)"
                />
              </div>
            </div>
          </div>

          {/* Family Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Họ tên Phụ huynh</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0987.xxx.xxx"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-800">Địa chỉ thường trú</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Khu 1, Thị trấn Khánh Bình"
              />
            </div>
          </div>

          {/* Health & notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-800">Nhóm máu</label>
              <input
                type="text"
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="O / A / B / AB"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-800">Tiền sử dị ứng / Sức khỏe</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Không / Dị ứng hải sản..."
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-800">Ghi chú của giáo viên</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="VD: Học sinh ngoan, hòa đồng, hay giơ tay phát biểu..."
            />
          </div>

          {/* Progress & Goals Fields */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Đánh giá quá trình & Định hướng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm mạnh nổi bật (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.strengthsText}
                  onChange={(e) => setFormData({ ...formData, strengthsText: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  placeholder="Toán tốt, chữ đẹp, hoạt bát"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung cần hỗ trợ (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.needsSupportText}
                  onChange={(e) => setFormData({ ...formData, needsSupportText: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  placeholder="Kỹ năng tự tin, môn Tiếng Anh"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mục tiêu tiếp theo của học sinh
              </label>
              <input
                type="text"
                value={formData.nextGoals}
                onChange={(e) => setFormData({ ...formData, nextGoals: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                placeholder="VD: Nâng cao kết quả môn Toán, đạt học sinh xuất sắc"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
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
              {isEdit ? 'Lưu cập nhật' : 'Thêm học sinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
