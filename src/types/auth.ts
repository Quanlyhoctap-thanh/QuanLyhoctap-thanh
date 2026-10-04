export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: string;
  schoolName?: string;
  className?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface StoredUserAccount extends UserAccount {
  password: string;
}
