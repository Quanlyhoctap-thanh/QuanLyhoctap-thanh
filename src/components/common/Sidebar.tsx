import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  MessageSquareText,
  TrendingUp,
  FileBarChart2,
} from 'lucide-react';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { data, currentView, setCurrentView, setSelectedStudentId, studentsNeedingAttention } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Danh sách học sinh', icon: Users },
    { id: 'academics', label: 'Học tập', icon: BookOpen },
    { id: 'attendance', label: 'Chuyên cần', icon: CalendarCheck },
    { id: 'conduct', label: 'Rèn luyện', icon: Award },
    { id: 'comments', label: 'Nhận xét', icon: MessageSquareText },
    {
      id: 'progress',
      label: 'Theo dõi tiến bộ',
      icon: TrendingUp,
      badge: studentsNeedingAttention.length > 0 ? studentsNeedingAttention.length : undefined,
    },
    { id: 'reports', label: 'Báo cáo', icon: FileBarChart2 },
  ];

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'student-profile') {
      setSelectedStudentId(null);
    }
  };

  return (
    <aside className="w-full md:w-56 lg:w-64 bg-sky-700 shrink-0 text-white flex flex-col justify-between py-3 shadow-inner print:hidden">
      <nav className="px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'students' && currentView === 'student-profile');

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                isActive
                  ? 'bg-sky-500/80 text-white shadow-sm font-semibold'
                  : 'text-sky-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white' : 'text-sky-200 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Class reminder badge in sidebar bottom */}
      <div className="px-3 pt-3 border-t border-sky-600/60 hidden md:block">
        <div className="p-2.5 rounded-lg bg-sky-800/60 border border-sky-600/40 text-xs text-sky-100">
          <p className="font-semibold text-white mb-0.5">{data.classSettings.schoolName}</p>
          <p className="text-[11px] leading-relaxed text-sky-200">
            Năm học {data.classSettings.academicYear}. Dữ liệu lưu an toàn trên máy trình duyệt.
          </p>
        </div>
      </div>
    </aside>
  );
};
