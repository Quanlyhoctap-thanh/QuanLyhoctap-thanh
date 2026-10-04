import { createClient } from '@supabase/supabase-js';
import { INITIAL_DATA } from '../src/data/initialData';

const url = 'https://tiqpdmzyuaisstskvugv.supabase.co';
const key = 'sb_publishable_9MEBPmzepVftXLEC6sLdZw_2M2TLilu';

const supabase = createClient(url, key);

async function seed() {
  console.log('--- BẮT ĐẦU ĐẨY DỮ LIỆU LÊN SUPABASE ---');

  // 1. Cài đặt lớp học
  console.log('1. Đẩy cài đặt lớp học (class_settings)...');
  const { error: setErr } = await supabase.from('class_settings').upsert({
    id: 'default',
    class_name: INITIAL_DATA.classSettings.className,
    school_name: INITIAL_DATA.classSettings.schoolName,
    teacher_name: INITIAL_DATA.classSettings.teacherName,
    academic_year: INITIAL_DATA.classSettings.academicYear,
    warning_min_average: INITIAL_DATA.classSettings.warningMinAverage,
    warning_max_absence: INITIAL_DATA.classSettings.warningMaxAbsence,
    updated_at: new Date().toISOString(),
  });
  if (setErr) {
    console.error('Lỗi class_settings:', setErr);
  } else {
    console.log('=> Thành công class_settings');
  }

  // 2. Tài khoản giáo viên / người dùng (app_users)
  console.log('2. Đẩy tài khoản đăng nhập (app_users)...');
  const defaultAccounts = [
    {
      id: 'usr_default_thanh',
      username: 'thanh.le',
      password_hash: '123456',
      full_name: 'Lê Văn Thành',
      role: 'Giáo viên chủ nhiệm',
      school_name: 'Trường Tiểu học Khánh Bình',
      class_name: '3A2',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    },
    {
      id: 'usr_default_admin',
      username: 'admin',
      password_hash: '123456',
      full_name: 'Quản trị viên Nhà trường',
      role: 'Quản trị viên',
      school_name: 'Trường Tiểu học Khánh Bình',
      class_name: '3A2',
      created_at: new Date().toISOString(),
    },
  ];

  const { error: userErr } = await supabase.from('app_users').upsert(defaultAccounts, { onConflict: 'id' });
  if (userErr) {
    console.error('Lỗi app_users:', userErr);
  } else {
    console.log(`=> Thành công app_users (${defaultAccounts.length} tài khoản)`);
  }

  // 3. Danh sách học sinh (students)
  console.log(`3. Đẩy ${INITIAL_DATA.students.length} học sinh (students)...`);
  const studentRows = INITIAL_DATA.students.map((s) => ({
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error: stuErr } = await supabase.from('students').upsert(studentRows, { onConflict: 'id' });
  if (stuErr) {
    console.error('Lỗi students:', stuErr);
  } else {
    console.log(`=> Thành công students (${studentRows.length} học sinh)`);
  }

  // 4. Kết quả học tập (academic_records)
  console.log(`4. Đẩy ${INITIAL_DATA.academicRecords.length} bảng điểm (academic_records)...`);
  const acadRows = INITIAL_DATA.academicRecords.map((r) => ({
    id: r.id,
    student_id: r.studentId,
    period: r.period,
    scores: r.scores,
    average_score: r.averageScore,
    level: r.level,
    comment: r.comment,
    updated_at: new Date().toISOString(),
  }));

  const { error: acadErr } = await supabase.from('academic_records').upsert(acadRows, { onConflict: 'id' });
  if (acadErr) {
    console.error('Lỗi academic_records:', acadErr);
  } else {
    console.log(`=> Thành công academic_records (${acadRows.length} bản ghi)`);
  }

  // 5. Chuyên cần (attendance_days)
  console.log(`5. Đẩy ${INITIAL_DATA.attendanceRecords.length} ngày điểm danh (attendance_days)...`);
  const attRows = INITIAL_DATA.attendanceRecords.map((day) => ({
    date: day.date,
    records: day.records,
    updated_at: new Date().toISOString(),
  }));

  const { error: attErr } = await supabase.from('attendance_days').upsert(attRows, { onConflict: 'date' });
  if (attErr) {
    console.error('Lỗi attendance_days:', attErr);
  } else {
    console.log(`=> Thành công attendance_days (${attRows.length} ngày)`);
  }

  // 6. Rèn luyện (conduct_records)
  console.log(`6. Đẩy ${INITIAL_DATA.conductRecords.length} bản ghi rèn luyện (conduct_records)...`);
  const condRows = INITIAL_DATA.conductRecords.map((c) => ({
    id: c.id,
    student_id: c.studentId,
    criterion: c.criterion,
    rating: c.rating,
    comment: c.comment,
    date: c.date,
  }));

  const { error: condErr } = await supabase.from('conduct_records').upsert(condRows, { onConflict: 'id' });
  if (condErr) {
    console.error('Lỗi conduct_records:', condErr);
  } else {
    console.log(`=> Thành công conduct_records (${condRows.length} bản ghi)`);
  }

  // 7. Nhận xét (comments)
  console.log(`7. Đẩy ${INITIAL_DATA.comments.length} nhận xét (comments)...`);
  const commRows = INITIAL_DATA.comments.map((cm) => ({
    id: cm.id,
    student_id: cm.studentId,
    date: cm.date,
    topic: cm.topic,
    content: cm.content,
    author: cm.author,
  }));

  const { error: commErr } = await supabase.from('comments').upsert(commRows, { onConflict: 'id' });
  if (commErr) {
    console.error('Lỗi comments:', commErr);
  } else {
    console.log(`=> Thành công comments (${commRows.length} nhận xét)`);
  }

  console.log('--- HOÀN TẤT ĐẨY DỮ LIỆU LÊN SUPABASE ---');
}

seed().catch(console.error);
