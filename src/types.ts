export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  dateOfBirth: string;
}

export interface PaymentDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  paymentMethod: string;
  currency: string;
}

export interface AimOfFoundation {
  mission: string;
  vision: string;
  goals: string[];
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'low' | 'medium' | 'high';
}

export type UserRole = 'Administrator' | 'Donor' | 'Volunteer' | 'Member' | 'Executive';

export interface User {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isLoggedIn: boolean;
  createdAt: string;
  status?: 'Active' | 'Disabled';
  expiresAt?: string;
  amountOwed: number;
}

export interface InviteCode {
  id: string;
  code: string;
  used: boolean;
  createdAt: string;
}

export interface FoundationGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  category: string;
  deadline: string;
}

export interface UploadedImage {
  id: string;
  fileName: string;
  filePath: string;
  fileSizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface VolunteerRecord {
  id: string;
  volunteerName: string;
  email: string;
  hoursLogged: number;
  skills: string;
  campaignName: string;
  status: 'Active' | 'Inactive';
}

export interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  emailUpdates: boolean;
  twoFactor: boolean;
}

export interface ProfileImage {
  dataUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  message: string;
  payload?: string;
}

export interface LoginRecord {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  loginTime: string;
  logoutTime: string | null;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  status: 'Active' | 'Logged Out' | 'Blocked';
  sessionDuration: string | null;
}

export interface AdminNotification {
  id: string;
  type: 'login' | 'register' | 'logout' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userEmail: string;
  userRole: string;
}

export interface Database {
  personalInfo: PersonalInfo;
  aimOfFoundation: AimOfFoundation;
  announcements: Announcement[];
  users: User[];
  currentUser: User | null;
  settings: Settings;
  profileImage: ProfileImage | null;
  apiLogs: ApiLog[];
  
  // Extended storage requirements
  foundationGoals: FoundationGoal[];
  uploadedImages: UploadedImage[];
  inviteCodes: InviteCode[];
  loginRecords: LoginRecord[];
  adminNotifications: AdminNotification[];
}

export type NavItem = 
  | 'home'
  | 'dashboard'
  | 'personal-info'
  | 'member-balance'
  | 'aim-of-foundation'
  | 'announcement'
  | 'notifications'
  | 'cloud-storage'
  | 'deploy'
  | 'login-records'
  | 'settings'
  | 'login';
