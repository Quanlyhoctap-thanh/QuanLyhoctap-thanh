export type Gender = 'Nam' | 'Nữ';

export type AcademicLevel = 'Tốt' | 'Khá' | 'Cần cố gắng';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export type ConductRating = 'Tốt' | 'Khá' | 'Cần cố gắng';

export type ConductCriterion =
  | 'Ý thức học tập'
  | 'Chuẩn bị đồ dùng'
  | 'Thực hiện nhiệm vụ'
  | 'Hợp tác với bạn'
  | 'Tham gia hoạt động'
  | 'Thực hiện nội quy';

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  address: string;
  enrollDate: string;
  bloodType: string;
  allergies: string;
  notes: string;
  avatarType: 'boy-1' | 'boy-2' | 'boy-3' | 'girl-1' | 'girl-2' | 'girl-3';
  strengths: string[];
  needsSupport: string[];
  nextGoals: string;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  period: string; // e.g., 'Tháng 4/2025', 'Tháng 3/2025', 'Tháng 2/2025', 'Tháng 1/2025'
  scores: Record<string, number>; // subjectId -> score
  averageScore: number;
  level: AcademicLevel;
  comment: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface ConductRecord {
  id: string;
  studentId: string;
  criterion: ConductCriterion;
  rating: ConductRating;
  comment: string;
  date: string;
}

export interface CommentRecord {
  id: string;
  studentId: string;
  date: string;
  topic: 'Học tập' | 'Chuyên cần' | 'Rèn luyện' | 'Kỹ năng sống';
  content: string;
  author: string;
}

export interface ClassSettings {
  className: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  warningMinAverage: number;
  warningMaxAbsence: number;
}

export interface AppData {
  classSettings: ClassSettings;
  subjects: Subject[];
  students: Student[];
  academicRecords: AcademicRecord[];
  attendanceRecords: DayAttendance[];
  conductRecords: ConductRecord[];
  comments: CommentRecord[];
}

export type ViewType =
  | 'dashboard'
  | 'students'
  | 'student-profile'
  | 'academics'
  | 'attendance'
  | 'conduct'
  | 'comments'
  | 'progress'
  | 'reports';
