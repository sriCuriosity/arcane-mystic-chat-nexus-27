// types/auth.ts
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}