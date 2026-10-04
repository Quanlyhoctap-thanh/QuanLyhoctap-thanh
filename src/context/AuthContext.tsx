import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, StoredUserAccount } from '../types/auth';
import { getSupabaseClient } from '../lib/supabase';

const SESSION_KEY = 'tro_ly_auth_session_v1';
const USERS_STORAGE_KEY = 'tro_ly_registered_users_v1';

// Tài khoản giáo viên mặc định ban đầu
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'usr_default_thanh',
    username: 'thanh.le',
    password: '123456',
    fullName: 'Lê Văn Thành',
    role: 'Giáo viên chủ nhiệm',
    schoolName: 'Trường Tiểu học Khánh Bình',
    className: '3A2',
    createdAt: '2026-09-01T00:00:00.000Z',
    lastLogin: '2026-10-04T07:00:00.000Z',
  },
  {
    id: 'usr_default_admin',
    username: 'admin',
    password: '123456',
    fullName: 'Quản trị viên Nhà trường',
    role: 'Quản trị viên',
    schoolName: 'Trường Tiểu học Khánh Bình',
    className: '3A2',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    username: string;
    password: string;
    fullName: string;
    schoolName?: string;
    className?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session & sync registered users from Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check stored session
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const user = JSON.parse(savedSession) as UserAccount;
          if (user && user.id && user.username) {
            setCurrentUser(user);
          }
        }

        // 2. Ensure local default accounts exist
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        let currentUsers: StoredUserAccount[] = DEFAULT_ACCOUNTS;
        if (savedUsers) {
          try {
            const parsed = JSON.parse(savedUsers);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentUsers = parsed;
            }
          } catch {
            // ignore
          }
        }

        // 3. Sync from Supabase app_users table
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data: suUsers } = await client.from('app_users').select('*');
            if (suUsers && Array.isArray(suUsers) && suUsers.length > 0) {
              const suFormatted: StoredUserAccount[] = suUsers.map((u: any) => ({
                id: u.id,
                username: u.username.toLowerCase(),
                password: u.password_hash || u.password,
                fullName: u.full_name || u.username,
                role: u.role || 'Giáo viên chủ nhiệm',
                schoolName: u.school_name || 'Trường Tiểu học Khánh Bình',
                className: u.class_name || '3A2',
                createdAt: u.created_at,
                lastLogin: u.last_login,
              }));

              // Merge unique by username
              const userMap = new Map<string, StoredUserAccount>();
              currentUsers.forEach((u) => userMap.set(u.username.toLowerCase(), u));
              suFormatted.forEach((u) => userMap.set(u.username.toLowerCase(), u));
              currentUsers = Array.from(userMap.values());
            }
          } catch (err) {
            console.warn('Lỗi kết nối Supabase app_users lúc khởi động:', err);
          }
        }

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));
      } catch (e) {
        console.error('Lỗi khi tải phiên đăng nhập:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const getLocalUsers = (): StoredUserAccount[] => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCOUNTS;
  };

  const saveLocalUsers = (users: StoredUserAccount[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Không thể lưu danh sách người dùng:', e);
    }
  };

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string }> => {
    const username = usernameInput.trim().toLowerCase();
    const password = passwordInput;

    if (!username || !password) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.' };
    }

    // 1. Kiểm tra tài khoản từ Supabase (nếu đã kết nối và có bảng app_users)
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: suUser, error } = await client
          .from('app_users')
          .select('*')
          .ilike('username', username)
          .maybeSingle();

        if (!error && suUser) {
          if (suUser.password_hash === password || suUser.password === password) {
            const userObj: UserAccount = {
              id: suUser.id,
              username: suUser.username,
              fullName: suUser.full_name || suUser.username,
              role: suUser.role || 'Giáo viên chủ nhiệm',
              schoolName: suUser.school_name || 'Trường Tiểu học Khánh Bình',
              className: suUser.class_name || '3A2',
              createdAt: suUser.created_at,
              lastLogin: new Date().toISOString(),
            };

            // Update last_login in Supabase
            client.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', suUser.id).then();

            // Save session
            setCurrentUser(userObj);
            localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
            return { success: true, message: `Chào mừng Thầy/Cô ${userObj.fullName}!` };
          } else {
            return { success: false, message: 'Mật khẩu không chính xác.' };
          }
        }
      } catch {
        // Fallback to local check
      }
    }

    // 2. Kiểm tra bộ nhớ cục bộ / tài khoản mẫu
    const localUsers = getLocalUsers();
    const found = localUsers.find((u) => u.username.toLowerCase() === username);

    if (!found) {
      return {
        success: false,
        message: `Tên đăng nhập "${username}" chưa tồn tại. Thầy/Cô vui lòng nhấp sang tab "Đăng ký tài khoản" để tạo tài khoản mới.`,
      };
    }

    if (found.password !== password) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    const userObj: UserAccount = {
      id: found.id,
      username: found.username,
      fullName: found.fullName || found.username,
      role: found.role || 'Giáo viên chủ nhiệm',
      schoolName: found.schoolName || 'Trường Tiểu học Khánh Bình',
      className: found.className || '3A2',
      createdAt: found.createdAt,
      lastLogin: new Date().toISOString(),
    };

    // Update last login
    const updatedUsers = localUsers.map((u) => (u.id === found.id ? { ...u, lastLogin: new Date().toISOString() } : u));
    saveLocalUsers(updatedUsers);

    setCurrentUser(userObj);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));

    return { success: true, message: `Đăng nhập thành công! Chào mừng Thầy/Cô ${userObj.fullName}.` };
  };

  const register = async (data: {
    username: string;
    password: string;
    fullName?: string;
    schoolName?: string;
    className?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const username = data.username.trim().toLowerCase();
    const password = data.password;
    const fullName = (data.fullName || '').trim() || username;

    if (!username || !password) {
      return { success: false, message: 'Vui lòng nhập Tên đăng nhập và Mật khẩu.' };
    }

    if (username.length < 2) {
      return { success: false, message: 'Tên đăng nhập phải có ít nhất 2 ký tự.' };
    }

    if (password.length < 3) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 3 ký tự.' };
    }

    // Check existing in local
    const localUsers = getLocalUsers();
    if (localUsers.some((u) => u.username.toLowerCase() === username)) {
      return { success: false, message: `Tên đăng nhập "${username}" đã tồn tại. Thầy/Cô hãy chọn tên khác hoặc chuyển sang Đăng nhập.` };
    }

    const newUser: StoredUserAccount = {
      id: `usr_${Date.now()}`,
      username,
      password,
      fullName,
      role: 'Giáo viên chủ nhiệm',
      schoolName: data.schoolName?.trim() || 'Trường Tiểu học Khánh Bình',
      className: data.className?.trim() || '3A2',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // 1. Lưu vào local
    saveLocalUsers([...localUsers, newUser]);

    // 2. Lưu trực tiếp vào bảng app_users trên Supabase
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error: suErr } = await client.from('app_users').upsert([
          {
            id: newUser.id,
            username: newUser.username,
            password_hash: newUser.password,
            full_name: newUser.fullName,
            role: newUser.role,
            school_name: newUser.schoolName,
            class_name: newUser.className,
            created_at: newUser.createdAt,
            last_login: newUser.lastLogin,
          },
        ]);
        if (suErr) {
          console.warn('Lỗi ghi app_users Supabase:', suErr);
        }
      } catch (err) {
        console.warn('Không thể đồng bộ tài khoản lên Supabase:', err);
      }
    }

    // Auto login ngay sau khi đăng ký
    const sessionUser: UserAccount = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      schoolName: newUser.schoolName,
      className: newUser.className,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin,
    };

    setCurrentUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, message: `Đăng ký thành công tài khoản "${username}"! Đang vào hệ thống...` };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
