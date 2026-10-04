import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppData,
  Student,
  Subject,
  AcademicRecord,
  DayAttendance,
  AttendanceRecord,
  ConductRecord,
  CommentRecord,
  ClassSettings,
  ViewType,
} from '../types';
import { INITIAL_DATA } from '../data/initialData';

const STORAGE_KEY = 'tro_ly_hoc_tap_3a2_v1';

interface AttentionStudent {
  student: Student;
  reason: string;
  type: 'academic' | 'attendance' | 'conduct';
}

interface AppContextType {
  data: AppData;
  currentView: ViewType;
  selectedStudentId: string | null;
  selectedMonth: string;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  setCurrentView: (view: ViewType) => void;
  setSelectedStudentId: (id: string | null) => void;
  setSelectedMonth: (month: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  // Student CRUD
  addStudent: (student: Omit<Student, 'id' | 'studentCode'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  // Academic CRUD
  saveAcademicRecord: (record: Omit<AcademicRecord, 'id'> & { id?: string }) => void;
  // Attendance CRUD
  saveAttendanceDay: (date: string, records: AttendanceRecord[]) => void;
  // Conduct CRUD
  addConductRecord: (record: Omit<ConductRecord, 'id'>) => void;
  updateConductRecord: (id: string, updates: Partial<ConductRecord>) => void;
  deleteConductRecord: (id: string) => void;
  // Comment CRUD
  addComment: (comment: Omit<CommentRecord, 'id'>) => void;
  updateComment: (id: string, updates: Partial<CommentRecord>) => void;
  deleteComment: (id: string) => void;
  // Class Settings
  updateClassSettings: (settings: Partial<ClassSettings>) => void;
  // Backup / Restore
  exportDataJSON: () => void;
  exportDataCSV: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
  // Supabase State & Modal
  isSupabaseModalOpen: boolean;
  openSupabaseModal: () => void;
  closeSupabaseModal: () => void;
  // Derived Stats
  studentsNeedingAttention: AttentionStudent[];
  latestAttendanceStats: {
    present: number;
    excused: number;
    unexcused: number;
    late: number;
    rate: number;
    total: number;
  };
  classSubjectAverages: Record<string, number>;
  overallClassAverage: number;
  availablePeriods: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.students && parsed.classSettings) {
          if (
            parsed.classSettings.academicYear === '2024 - 2025' ||
            parsed.classSettings.academicYear === '2024-2025'
          ) {
            parsed.classSettings.academicYear = '2026 - 2027';
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DATA;
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('Tháng 4/2025');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  const openSupabaseModal = () => setIsSupabaseModalOpen(true);
  const closeSupabaseModal = () => setIsSupabaseModalOpen(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage quota or private mode
    }
  }, [data]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Available academic periods
  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    data.academicRecords.forEach((r) => set.add(r.period));
    set.add('Tháng 4/2025');
    set.add('Tháng 3/2025');
    set.add('Tháng 2/2025');
    set.add('Tháng 1/2025');
    return Array.from(set);
  }, [data.academicRecords]);

  // Derived: Students needing teacher attention based strictly on entered data
  const studentsNeedingAttention = useMemo<AttentionStudent[]>(() => {
    const list: AttentionStudent[] = [];
    const minAvg = data.classSettings.warningMinAverage || 7.5;

    data.students.forEach((student) => {
      // 1. Check latest academic record
      const studentRecords = data.academicRecords
        .filter((r) => r.studentId === student.id && r.period === selectedMonth);
      const latestRecord = studentRecords[0];

      if (latestRecord) {
        if (latestRecord.averageScore < minAvg || latestRecord.level === 'Cần cố gắng') {
          list.push({
            student,
            reason: `Điểm TB ${latestRecord.averageScore.toFixed(1)} (${latestRecord.level})`,
            type: 'academic',
          });
          return;
        }
      }

      // 2. Check attendance (absences or late arrivals in records)
      let absences = 0;
      let lateCount = 0;
      data.attendanceRecords.forEach((day) => {
        const att = day.records.find((r) => r.studentId === student.id);
        if (att) {
          if (att.status === 'unexcused' || att.status === 'excused') {
            absences += 1;
          }
          if (att.status === 'late') {
            lateCount += 1;
          }
        }
      });

      if (absences >= data.classSettings.warningMaxAbsence) {
        list.push({
          student,
          reason: `Nghỉ học ${absences} buổi`,
          type: 'attendance',
        });
        return;
      }

      if (lateCount >= 2) {
        list.push({
          student,
          reason: `Đi muộn ${lateCount} lần`,
          type: 'attendance',
        });
        return;
      }
    });

    return list;
  }, [data.students, data.academicRecords, data.attendanceRecords, data.classSettings, selectedMonth]);

  // Derived: Latest attendance stats
  const latestAttendanceStats = useMemo(() => {
    const totalStudents = data.students.length || 1;
    if (data.attendanceRecords.length === 0) {
      return { present: totalStudents, excused: 0, unexcused: 0, late: 0, rate: 100, total: totalStudents };
    }

    // Take the most recent attendance date
    const latestDay = data.attendanceRecords[0];
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    latestDay.records.forEach((rec) => {
      if (rec.status === 'present') present++;
      else if (rec.status === 'excused') excused++;
      else if (rec.status === 'unexcused') unexcused++;
      else if (rec.status === 'late') {
        late++;
        present++; // late still attends
      }
    });

    const attended = present;
    const rate = Math.round((attended / totalStudents) * 100);

    return {
      present,
      excused,
      unexcused,
      late,
      rate: Math.min(100, rate),
      total: totalStudents,
    };
  }, [data.students.length, data.attendanceRecords]);

  // Derived: Subject averages for the selected period
  const { classSubjectAverages, overallClassAverage } = useMemo(() => {
    const subjectSums: Record<string, { sum: number; count: number }> = {};
    data.subjects.forEach((s) => {
      subjectSums[s.id] = { sum: 0, count: 0 };
    });

    let totalScoreSum = 0;
    let totalScoreCount = 0;

    const currentRecords = data.academicRecords.filter((r) => r.period === selectedMonth);

    currentRecords.forEach((rec) => {
      Object.entries(rec.scores).forEach(([subId, score]) => {
        if (subjectSums[subId]) {
          subjectSums[subId].sum += score;
          subjectSums[subId].count += 1;
          totalScoreSum += score;
          totalScoreCount += 1;
        }
      });
    });

    const averages: Record<string, number> = {};
    data.subjects.forEach((s) => {
      const item = subjectSums[s.id];
      averages[s.id] = item && item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 8.0;
    });

    const overall = totalScoreCount > 0 ? Number((totalScoreSum / totalScoreCount).toFixed(1)) : 8.1;

    return { classSubjectAverages: averages, overallClassAverage: overall };
  }, [data.subjects, data.academicRecords, selectedMonth]);

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'studentCode'>) => {
    const nextIndex = data.students.length + 1;
    const studentCode = `${data.classSettings.className}-${nextIndex.toString().padStart(2, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `hs_${Date.now()}`,
      studentCode,
    };

    setData((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
    showToast(`Đã thêm học sinh ${newStudent.fullName} vào danh sách.`);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    showToast('Đã cập nhật thông tin học sinh thành công.');
  };

  const deleteStudent = (id: string) => {
    const student = data.students.find((s) => s.id === id);
    if (!student) return;

    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa học sinh "${student.fullName}"? Dữ liệu liên quan cũng sẽ được gỡ bỏ.`)) {
      setData((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== id),
        academicRecords: prev.academicRecords.filter((r) => r.studentId !== id),
        conductRecords: prev.conductRecords.filter((r) => r.studentId !== id),
        comments: prev.comments.filter((r) => r.studentId !== id),
        attendanceRecords: prev.attendanceRecords.map((day) => ({
          ...day,
          records: day.records.filter((r) => r.studentId !== id),
        })),
      }));
      if (selectedStudentId === id) {
        setSelectedStudentId(null);
        setCurrentView('students');
      }
      showToast(`Đã xóa học sinh ${student.fullName}.`, 'info');
    }
  };

  // Academic Records
  const saveAcademicRecord = (record: Omit<AcademicRecord, 'id'> & { id?: string }) => {
    setData((prev) => {
      const existingIndex = prev.academicRecords.findIndex(
        (r) => r.studentId === record.studentId && r.period === record.period
      );

      const recordId = record.id || (existingIndex >= 0 ? prev.academicRecords[existingIndex].id : `ar_${Date.now()}`);
      const updatedItem: AcademicRecord = {
        ...record,
        id: recordId,
      };

      if (existingIndex >= 0) {
        const nextList = [...prev.academicRecords];
        nextList[existingIndex] = updatedItem;
        return { ...prev, academicRecords: nextList };
      } else {
        return { ...prev, academicRecords: [...prev.academicRecords, updatedItem] };
      }
    });
    showToast('Đã lưu kết quả học tập thành công!');
  };

  // Attendance Day save
  const saveAttendanceDay = (date: string, records: AttendanceRecord[]) => {
    setData((prev) => {
      const existingIndex = prev.attendanceRecords.findIndex((r) => r.date === date);
      const newEntry: DayAttendance = { date, records };

      if (existingIndex >= 0) {
        const nextList = [...prev.attendanceRecords];
        nextList[existingIndex] = newEntry;
        return { ...prev, attendanceRecords: nextList };
      } else {
        return { ...prev, attendanceRecords: [newEntry, ...prev.attendanceRecords] };
      }
    });
    showToast(`Đã lưu dữ liệu chuyên cần ngày ${date}.`);
  };

  // Conduct CRUD
  const addConductRecord = (record: Omit<ConductRecord, 'id'>) => {
    const newRecord: ConductRecord = {
      ...record,
      id: `cr_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      conductRecords: [newRecord, ...prev.conductRecords],
    }));
    showToast('Đã ghi nhận rèn luyện của học sinh.');
  };

  const updateConductRecord = (id: string, updates: Partial<ConductRecord>) => {
    setData((prev) => ({
      ...prev,
      conductRecords: prev.conductRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    showToast('Đã cập nhật mục rèn luyện.');
  };

  const deleteConductRecord = (id: string) => {
    setData((prev) => ({
      ...prev,
      conductRecords: prev.conductRecords.filter((r) => r.id !== id),
    }));
    showToast('Đã xóa bản ghi rèn luyện.', 'info');
  };

  // Comment CRUD
  const addComment = (comment: Omit<CommentRecord, 'id'>) => {
    const newComment: CommentRecord = {
      ...comment,
      id: `cm_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
    }));
    showToast('Đã thêm nhận xét cho học sinh.');
  };

  const updateComment = (id: string, updates: Partial<CommentRecord>) => {
    setData((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    showToast('Đã cập nhật nhận xét.');
  };

  const deleteComment = (id: string) => {
    setData((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== id),
    }));
    showToast('Đã xóa nhận xét.', 'info');
  };

  // Class Settings
  const updateClassSettings = (settings: Partial<ClassSettings>) => {
    setData((prev) => ({
      ...prev,
      classSettings: { ...prev.classSettings, ...settings },
    }));
    showToast('Đã cập nhật cấu hình lớp học.');
  };

  // Export Data JSON
  const exportDataJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Du_lieu_Lop_${data.classSettings.className}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Đã xuất file sao lưu JSON về máy.');
    } catch {
      showToast('Không thể xuất file JSON.', 'warning');
    }
  };

  // Export Data CSV
  const exportDataCSV = () => {
    try {
      const rows = [
        ['STT', 'Mã HS', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Phụ huynh', 'Số điện thoại', 'Điểm TB (' + selectedMonth + ')', 'Ghi chú'],
      ];

      data.students.forEach((s, idx) => {
        const rec = data.academicRecords.find((r) => r.studentId === s.id && r.period === selectedMonth);
        const avg = rec ? rec.averageScore.toFixed(1) : '-';
        rows.push([
          (idx + 1).toString(),
          s.studentCode,
          `"${s.fullName}"`,
          s.gender,
          s.birthDate,
          `"${s.parentName}"`,
          s.parentPhone,
          avg,
          `"${s.notes || ''}"`,
        ]);
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `Danh_sach_Lop_${data.classSettings.className}_${selectedMonth.replace('/', '_')}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Đã xuất file CSV thành công.');
    } catch {
      showToast('Không thể xuất file CSV.', 'warning');
    }
  };

  // Import Data JSON
  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.students && parsed.classSettings) {
        setData(parsed);
        showToast('Khôi phục dữ liệu từ file JSON thành công!');
        return true;
      }
      showToast('File dữ liệu không đúng định dạng.', 'warning');
      return false;
    } catch {
      showToast('Lỗi khi đọc file JSON.', 'warning');
      return false;
    }
  };

  // Reset to default
  const resetToDefaultData = () => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn khôi phục về dữ liệu mẫu ban đầu của Lớp 3A2? Dữ liệu hiện tại sẽ được thay thế.')) {
      setData(INITIAL_DATA);
      setSelectedMonth('Tháng 4/2025');
      showToast('Đã khôi phục dữ liệu mẫu Lớp 3A2.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        data,
        currentView,
        selectedStudentId,
        selectedMonth,
        toast,
        setCurrentView,
        setSelectedStudentId,
        setSelectedMonth,
        showToast,
        addStudent,
        updateStudent,
        deleteStudent,
        saveAcademicRecord,
        saveAttendanceDay,
        addConductRecord,
        updateConductRecord,
        deleteConductRecord,
        addComment,
        updateComment,
        deleteComment,
        updateClassSettings,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        resetToDefaultData,
        isSupabaseModalOpen,
        openSupabaseModal,
        closeSupabaseModal,
        studentsNeedingAttention,
        latestAttendanceStats,
        classSubjectAverages,
        overallClassAverage,
        availablePeriods,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
