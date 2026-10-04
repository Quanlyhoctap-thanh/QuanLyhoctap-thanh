import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppData, Student, AcademicRecord, DayAttendance, ConductRecord, CommentRecord, ClassSettings } from '../types';

// Read environment variables
const rawEnvUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawEnvKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Local storage override keys in case user updates keys in UI
const STORAGE_SUPABASE_URL = 'tro_ly_supabase_url';
const STORAGE_SUPABASE_KEY = 'tro_ly_supabase_anon_key';

export function getSupabaseCredentials() {
  let url = (localStorage.getItem(STORAGE_SUPABASE_URL) || rawEnvUrl || '').trim();
  let key = (localStorage.getItem(STORAGE_SUPABASE_KEY) || rawEnvKey || '').trim();

  // Auto-detect and swap if user accidentally swapped URL and Key
  if ((url.startsWith('sb_') || url.startsWith('eyJ')) && key.startsWith('http')) {
    const temp = url;
    url = key;
    key = temp;
  }

  // Strip trailing /rest/v1 or trailing slashes
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string) {
  let cleanUrl = url.trim();
  let cleanKey = key.trim();

  if ((cleanUrl.startsWith('sb_') || cleanUrl.startsWith('eyJ')) && cleanKey.startsWith('http')) {
    const temp = cleanUrl;
    cleanUrl = cleanKey;
    cleanKey = temp;
  }
  cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  localStorage.setItem(STORAGE_SUPABASE_URL, cleanUrl);
  localStorage.setItem(STORAGE_SUPABASE_KEY, cleanKey);
  cachedClient = null; // reset cached client
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error('Lỗi khởi tạo Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

// SQL Script to create all necessary tables in Supabase SQL Editor
export const SUPABASE_SQL_SETUP = `-- ========================================================
-- KỊCH BẢN TẠO BẢNG CHO PHẦN MỀM TRỢ LÝ HỌC TẬP LỚP HỌC (SUPABASE)
-- Thầy/Cô hãy copy toàn bộ nội dung này và dán vào:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ========================================================

-- 1. Bảng Cài đặt thông tin lớp học
CREATE TABLE IF NOT EXISTS public.class_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  class_name TEXT NOT NULL DEFAULT '3A2',
  school_name TEXT NOT NULL DEFAULT 'Trường Tiểu học Khánh Bình',
  teacher_name TEXT NOT NULL DEFAULT 'Lê Văn Thành',
  academic_year TEXT NOT NULL DEFAULT '2026 - 2027',
  warning_min_average NUMERIC DEFAULT 7.5,
  warning_max_absence INT DEFAULT 2,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Danh sách Học sinh
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  student_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  enroll_date TEXT,
  blood_type TEXT,
  allergies TEXT,
  notes TEXT,
  avatar_type TEXT DEFAULT 'boy-1',
  strengths JSONB DEFAULT '[]'::jsonb,
  needs_support JSONB DEFAULT '[]'::jsonb,
  next_goals TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Kết quả Học tập (Điểm số theo tháng)
CREATE TABLE IF NOT EXISTS public.academic_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  average_score NUMERIC NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Khá',
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Điểm danh Chuyên cần theo ngày
CREATE TABLE IF NOT EXISTS public.attendance_days (
  date TEXT PRIMARY KEY,
  records JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Đánh giá Rèn luyện / Hạnh kiểm
CREATE TABLE IF NOT EXISTS public.conduct_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  rating TEXT NOT NULL,
  comment TEXT DEFAULT '',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng Nhận xét & Nhật ký tiến bộ
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Tài khoản Giáo viên / Người dùng
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'Giáo viên chủ nhiệm',
  school_name TEXT,
  class_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Bật RLS và cấp quyền truy cập công khai cho Anon Key (Client-side)
ALTER TABLE public.class_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conduct_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép đọc/ghi qua Anon key
CREATE POLICY "Cho phép đọc/ghi công khai class_settings" ON public.class_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc/ghi công khai students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc/ghi công khai academic_records" ON public.academic_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc/ghi công khai attendance_days" ON public.attendance_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc/ghi công khai conduct_records" ON public.conduct_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc/ghi công khai comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc/ghi công khai app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

`;

export type SupabaseStatus = 'unconfigured' | 'connecting' | 'connected' | 'tables_missing' | 'error';

export interface HealthCheckResult {
  status: SupabaseStatus;
  message: string;
  missingTables?: string[];
}

/**
 * Kiểm tra tình trạng kết nối tới Supabase và xác nhận các bảng đã được tạo hay chưa
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const client = getSupabaseClient();
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return {
      status: 'unconfigured',
      message: 'Chưa cấu hình URL hoặc Anon Key của Supabase.',
    };
  }

  if (!client) {
    return {
      status: 'error',
      message: 'Không thể khởi tạo kết nối Supabase với thông số hiện tại.',
    };
  }

  try {
    // Query students count & app_users count
    const { count: studentCount, error: countErr } = await client
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      if (countErr.code === '42P01' || countErr.message.includes('does not exist')) {
        return {
          status: 'tables_missing',
          message: 'Đã kết nối tới Supabase nhưng chưa có các bảng dữ liệu. Hãy chạy câu lệnh SQL tạo bảng.',
        };
      }
      return {
        status: 'error',
        message: `Lỗi kết nối Supabase: ${countErr.message}`,
      };
    }

    const { count: userCount } = await client
      .from('app_users')
      .select('*', { count: 'exact', head: true });

    const stuNum = studentCount ?? 0;
    const usrNum = userCount ?? 0;

    return {
      status: 'connected',
      message: `Kết nối thành công tới Supabase! Đang lưu trữ trực tuyến: ${stuNum} học sinh và ${usrNum} tài khoản giáo viên/người dùng.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      status: 'error',
      message: `Không thể kết nối máy chủ Supabase: ${errorMsg}`,
    };
  }
}

/**
 * Đẩy toàn bộ dữ liệu ứng dụng hiện tại lên các bảng Supabase
 */
export async function pushDataToSupabase(appData: AppData): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase chưa được cấu hình hoặc chưa khởi tạo.' };
  }

  try {
    // 1. Cài đặt lớp
    const { error: settingsErr } = await client.from('class_settings').upsert({
      id: 'default',
      class_name: appData.classSettings.className,
      school_name: appData.classSettings.schoolName,
      teacher_name: appData.classSettings.teacherName,
      academic_year: appData.classSettings.academicYear,
      warning_min_average: appData.classSettings.warningMinAverage,
      warning_max_absence: appData.classSettings.warningMaxAbsence,
      updated_at: new Date().toISOString(),
    });

    if (settingsErr) {
      if (settingsErr.code === '42P01') {
        return { success: false, message: 'Chưa tạo bảng trên Supabase. Vui lòng chạy lệnh SQL trước.' };
      }
      throw settingsErr;
    }

    // 2. Học sinh
    if (appData.students.length > 0) {
      const studentRows = appData.students.map((s) => ({
        id: s.id,
        student_code: s.studentCode,
        full_name: s.fullName,
        gender: s.gender,
        birth_date: s.birthDate,
        parent_name: s.parentName,
        parent_phone: s.parentPhone,
        address: s.address,
        enroll_date: s.enrollDate,
        blood_type: s.bloodType,
        allergies: s.allergies,
        notes: s.notes,
        avatar_type: s.avatarType,
        strengths: s.strengths,
        needs_support: s.needsSupport,
        next_goals: s.nextGoals,
        updated_at: new Date().toISOString(),
      }));

      const { error: stuErr } = await client.from('students').upsert(studentRows, { onConflict: 'id' });
      if (stuErr) throw stuErr;
    }

    // 3. Kết quả học tập
    if (appData.academicRecords.length > 0) {
      const academicRows = appData.academicRecords.map((r) => ({
        id: r.id,
        student_id: r.studentId,
        period: r.period,
        scores: r.scores,
        average_score: r.averageScore,
        level: r.level,
        comment: r.comment,
        updated_at: new Date().toISOString(),
      }));

      const { error: acadErr } = await client.from('academic_records').upsert(academicRows, { onConflict: 'id' });
      if (acadErr) throw acadErr;
    }

    // 4. Chuyên cần theo ngày
    if (appData.attendanceRecords.length > 0) {
      const attendanceRows = appData.attendanceRecords.map((day) => ({
        date: day.date,
        records: day.records,
        updated_at: new Date().toISOString(),
      }));

      const { error: attErr } = await client.from('attendance_days').upsert(attendanceRows, { onConflict: 'date' });
      if (attErr) throw attErr;
    }

    // 5. Rèn luyện
    if (appData.conductRecords.length > 0) {
      const conductRows = appData.conductRecords.map((c) => ({
        id: c.id,
        student_id: c.studentId,
        criterion: c.criterion,
        rating: c.rating,
        comment: c.comment,
        date: c.date,
      }));

      const { error: condErr } = await client.from('conduct_records').upsert(conductRows, { onConflict: 'id' });
      if (condErr) throw condErr;
    }

    // 6. Nhận xét
    if (appData.comments.length > 0) {
      const commentRows = appData.comments.map((cm) => ({
        id: cm.id,
        student_id: cm.studentId,
        date: cm.date,
        topic: cm.topic,
        content: cm.content,
        author: cm.author,
      }));

      const { error: commErr } = await client.from('comments').upsert(commentRows, { onConflict: 'id' });
      if (commErr) throw commErr;
    }

    // 7. Tài khoản giáo viên / người dùng (app_users)
    try {
      const savedUsersStr = localStorage.getItem('tro_ly_registered_users_v1');
      if (savedUsersStr) {
        const users = JSON.parse(savedUsersStr);
        if (Array.isArray(users) && users.length > 0) {
          const userRows = users.map((u: any) => ({
            id: u.id,
            username: u.username.toLowerCase(),
            password_hash: u.password,
            full_name: u.fullName,
            role: u.role || 'Giáo viên chủ nhiệm',
            school_name: u.schoolName,
            class_name: u.className,
            created_at: u.createdAt,
            last_login: u.lastLogin,
          }));
          await client.from('app_users').upsert(userRows, { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.warn('Đồng bộ tài khoản app_users lên Supabase có lưu ý:', e);
    }

    return {
      success: true,
      message: `Đã đồng bộ thành công toàn bộ học sinh, điểm số và tài khoản lên Supabase!`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Lỗi tải dữ liệu lên Supabase:', err);
    return { success: false, message: `Lỗi tải lên: ${errorMsg}` };
  }
}

/**
 * Tải toàn bộ dữ liệu từ Supabase về cập nhật cho ứng dụng
 */
export async function fetchDataFromSupabase(currentData: AppData): Promise<{ success: boolean; data?: AppData; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Chưa cấu hình Supabase Client.' };
  }

  try {
    // 1. Tải settings
    const { data: settingsData } = await client.from('class_settings').select('*').limit(1).single();

    // 2. Tải học sinh
    const { data: studentsData, error: stuErr } = await client.from('students').select('*').order('student_code');
    if (stuErr) throw stuErr;

    // 3. Tải điểm học tập
    const { data: acadData, error: acadErr } = await client.from('academic_records').select('*');
    if (acadErr) throw acadErr;

    // 4. Tải điểm danh
    const { data: attData, error: attErr } = await client.from('attendance_days').select('*').order('date', { ascending: false });
    if (attErr) throw attErr;

    // 5. Tải rèn luyện
    const { data: condData, error: condErr } = await client.from('conduct_records').select('*').order('date', { ascending: false });
    if (condErr) throw condErr;

    // 6. Tải nhận xét
    const { data: commData, error: commErr } = await client.from('comments').select('*').order('date', { ascending: false });
    if (commErr) throw commErr;

    // 7. Tải tài khoản người dùng / giáo viên (app_users)
    try {
      const { data: usersData } = await client.from('app_users').select('*');
      if (usersData && usersData.length > 0) {
        const formattedUsers = usersData.map((u: any) => ({
          id: u.id,
          username: u.username,
          password: u.password_hash || u.password,
          fullName: u.full_name,
          role: u.role || 'Giáo viên chủ nhiệm',
          schoolName: u.school_name,
          className: u.class_name,
          createdAt: u.created_at,
          lastLogin: u.last_login,
        }));
        localStorage.setItem('tro_ly_registered_users_v1', JSON.stringify(formattedUsers));
      }
    } catch (e) {
      console.warn('Không thể đồng bộ app_users từ Supabase:', e);
    }

    // Chuyển đổi dữ liệu từ Supabase về AppData
    const newSettings: ClassSettings = settingsData
      ? {
          className: settingsData.class_name || currentData.classSettings.className,
          schoolName: settingsData.school_name || currentData.classSettings.schoolName,
          teacherName: settingsData.teacher_name || currentData.classSettings.teacherName,
          academicYear: settingsData.academic_year || currentData.classSettings.academicYear,
          warningMinAverage: Number(settingsData.warning_min_average) || 7.5,
          warningMaxAbsence: Number(settingsData.warning_max_absence) || 2,
        }
      : currentData.classSettings;

    const newStudents: Student[] = (studentsData || []).map((row: any) => ({
      id: row.id,
      studentCode: row.student_code,
      fullName: row.full_name,
      gender: row.gender,
      birthDate: row.birth_date || '',
      parentName: row.parent_name || '',
      parentPhone: row.parent_phone || '',
      address: row.address || '',
      enrollDate: row.enroll_date || '',
      bloodType: row.blood_type || '',
      allergies: row.allergies || '',
      notes: row.notes || '',
      avatarType: row.avatar_type || 'boy-1',
      strengths: Array.isArray(row.strengths) ? row.strengths : [],
      needsSupport: Array.isArray(row.needs_support) ? row.needs_support : [],
      nextGoals: row.next_goals || '',
    }));

    const newAcademic: AcademicRecord[] = (acadData || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      period: row.period,
      scores: row.scores || {},
      averageScore: Number(row.average_score) || 0,
      level: row.level || 'Khá',
      comment: row.comment || '',
    }));

    const newAttendance: DayAttendance[] = (attData || []).map((row: any) => ({
      date: row.date,
      records: Array.isArray(row.records) ? row.records : [],
    }));

    const newConduct: ConductRecord[] = (condData || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      criterion: row.criterion,
      rating: row.rating,
      comment: row.comment || '',
      date: row.date,
    }));

    const newComments: CommentRecord[] = (commData || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      date: row.date,
      topic: row.topic,
      content: row.content,
      author: row.author,
    }));

    const mergedData: AppData = {
      ...currentData,
      classSettings: newSettings,
      students: newStudents.length > 0 ? newStudents : currentData.students,
      academicRecords: newAcademic.length > 0 ? newAcademic : currentData.academicRecords,
      attendanceRecords: newAttendance.length > 0 ? newAttendance : currentData.attendanceRecords,
      conductRecords: newConduct.length > 0 ? newConduct : currentData.conductRecords,
      comments: newComments.length > 0 ? newComments : currentData.comments,
    };

    return {
      success: true,
      data: mergedData,
      message: `Đã nạp thành công ${newStudents.length} học sinh từ Supabase!`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Lỗi tải dữ liệu từ Supabase:', err);
    return { success: false, message: `Lỗi nạp dữ liệu: ${errorMsg}` };
  }
}
