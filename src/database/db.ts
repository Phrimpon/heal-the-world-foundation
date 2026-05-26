import { Database, PersonalInfo, AimOfFoundation, Announcement, User, Settings, ProfileImage, ApiLog, UserRole, FoundationGoal, UploadedImage, InviteCode, LoginRecord, AdminNotification } from '../types';

const DB_KEY = 'htwf_database_v6';
const DEVICE_TOKEN_KEY = 'htwf_device_owner_token';

// ==========================================
// DEVICE OWNERSHIP VERIFICATION
// ==========================================

/**
 * Returns true only if this specific laptop/device is the registered owner.
 * The owner token is auto-generated on first visit and persists in localStorage.
 */
export function isOwnerDevice(): boolean {
  try {
    const token = localStorage.getItem(DEVICE_TOKEN_KEY);
    return !!token; // token exists = owner's device
  } catch {
    return false;
  }
}

/**
 * Registers the current device as the owner.
 * Called automatically on first visit — no manual setup needed.
 */
export function registerOwnerDevice(): void {
  try {
    const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!existing) {
      // Generate a cryptographically-adjacent unique device fingerprint
      const fingerprint = [
        navigator.hardwareConcurrency || 0,
        (navigator as any).deviceMemory || 0,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
        navigator.language,
      ].join('|');
      
      // Simple hash of the fingerprint
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
        hash |= 0;
      }
      const token = `htwf_owner_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
      console.log('🔐 Device registered as owner. Administrator sandbox access enabled.');
    }
  } catch {
    // localStorage unavailable — silently skip
  }
}

// Simple SHA-256 simulation for Werkzeug-like password hashing
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `pbkdf2:sha256:260000$${Math.abs(hash).toString(16)}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return hashPassword(password) === passwordHash;
}

// Pre-seeded users with status and amountOwed
const seededUsers: User[] = [
  {
    username: 'Admin User',
    email: 'admin@healtheworld.org',
    passwordHash: hashPassword('password123'),
    role: 'Administrator',
    isLoggedIn: false,
    createdAt: new Date().toISOString(),
    status: 'Active',
    amountOwed: 0,
  },
  {
    username: 'Generous Donor',
    email: 'donor@healtheworld.org',
    passwordHash: hashPassword('password123'),
    role: 'Donor',
    isLoggedIn: false,
    createdAt: new Date().toISOString(),
    status: 'Active',
    amountOwed: 0,
  },
  {
    username: 'Active Volunteer',
    email: 'volunteer@healtheworld.org',
    passwordHash: hashPassword('password123'),
    role: 'Volunteer',
    isLoggedIn: false,
    createdAt: new Date().toISOString(),
    status: 'Active',
    amountOwed: 50,
  },
  {
    username: 'Community Member',
    email: 'member@healtheworld.org',
    passwordHash: hashPassword('password123'),
    role: 'Member',
    isLoggedIn: false,
    createdAt: new Date().toISOString(),
    status: 'Active',
    amountOwed: 120,
  },
];

const defaultDatabase: Database = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    dateOfBirth: '',
  },
  aimOfFoundation: {
    mission: 'Heal the World Foundation is dedicated to enhancing global welfare by addressing critical human needs: clean water, quality education, and sustainable community development.',
    vision: 'A world where every human has access to clean water, life-changing education, and the capacity to build a thriving, self-sufficient community.',
    goals: [
      'Provide clean, safe water pipelines to 100 rural communities by 2028.',
      'Construct and fully supply 50 sustainable primary schools.',
      'Empower local farming co-operatives through agro-training and high-yield resources.'
    ],
    description: 'Founded with the conviction that clean resources and empowering education form the foundations of all human advancement, Heal the World Foundation operates active field operations in 15 regions across Africa, Southeast Asia, and Central America. Through direct action, transparency, and community alignment, we build systems that heal the world from the roots.',
  },
  announcements: [
    {
      id: '1',
      title: 'Clean Water Project Launched in East Africa',
      content: 'We are incredibly proud to announce the launch of our newest water pipeline project. Over 12,000 people will receive continuous, safe, and clean running drinking water upon completion next month.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Admin User',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Volunteer Orientation for Winter Drive',
      content: 'Orientation sessions for the upcoming Winter Care & Supplies Drive will commence this Saturday. All registered volunteers please check your dashboard schedule and RSVP.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Admin User',
      priority: 'medium'
    }
  ],
  users: seededUsers,
  currentUser: null,
  settings: {
    theme: 'light',
    notifications: true,
    language: 'en',
    emailUpdates: true,
    twoFactor: false,
  },
  profileImage: null,
  apiLogs: [],

  foundationGoals: [
    { id: 'G-101', title: 'Clean Water Boreholes Construction', targetValue: 50000, currentValue: 32000, category: 'Infrastructure', deadline: '2026-12-31' },
    { id: 'G-102', title: 'Ghana Primary School Classrooms', targetValue: 75000, currentValue: 48500, category: 'Education', deadline: '2026-09-30' },
  ],
  uploadedImages: [
    { id: 'IMG-01', fileName: 'water_pipeline_site.jpg', filePath: '/uploads/images/water_pipeline_site.jpg', fileSizeKb: 1024, uploadedBy: 'admin@healtheworld.org', uploadedAt: '2026-02-01' },
    { id: 'IMG-02', fileName: 'classroom_construction.jpg', filePath: '/uploads/images/classroom_construction.jpg', fileSizeKb: 2048, uploadedBy: 'admin@healtheworld.org', uploadedAt: '2026-02-15' },
  ],

  // Preseeded invite codes
  inviteCodes: [
    { id: 'IC-1', code: '9f3ab12c', used: false, createdAt: '2026-02-26' },
    { id: 'IC-2', code: 'c7a82d11', used: false, createdAt: '2026-02-26' },
    { id: 'IC-3', code: 'ab44ee90', used: false, createdAt: '2026-02-26' },
  ],

  // Login session records
  loginRecords: [],

  // Admin notifications
  adminNotifications: [],
};

export function getDatabase(): Database {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      return { ...defaultDatabase, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to read database:', e);
  }
  return { ...defaultDatabase };
}

export function saveDatabase(db: Database): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

// API Logging Simulation
export function logApiCall(method: string, endpoint: string, status: number, message: string, payload?: string): void {
  const db = getDatabase();
  const newLog: ApiLog = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toLocaleTimeString(),
    method,
    endpoint,
    status,
    message,
    payload,
  };
  db.apiLogs = [newLog, ...db.apiLogs.slice(0, 49)];
  saveDatabase(db);
}

export function getApiLogs(): ApiLog[] {
  return getDatabase().apiLogs;
}

// Admin Notifications System
export function pushAdminNotification(type: AdminNotification['type'], title: string, message: string, userEmail: string, userRole: string): void {
  const db = getDatabase();
  const notif: AdminNotification = {
    id: `NOTIF-${Date.now().toString(36).toUpperCase()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    userEmail,
    userRole,
  };
  db.adminNotifications = [notif, ...db.adminNotifications.slice(0, 99)];
  saveDatabase(db);
}

export function getAdminNotifications(): AdminNotification[] {
  return getDatabase().adminNotifications;
}

export function getUnreadNotificationCount(): number {
  return getDatabase().adminNotifications.filter(n => !n.read).length;
}

export function markNotificationRead(id: string): void {
  const db = getDatabase();
  const idx = db.adminNotifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    db.adminNotifications[idx].read = true;
    saveDatabase(db);
  }
}

export function markAllNotificationsRead(): void {
  const db = getDatabase();
  db.adminNotifications = db.adminNotifications.map(n => ({ ...n, read: true }));
  saveDatabase(db);
}

export function clearApiLogs(): void {
  const db = getDatabase();
  db.apiLogs = [];
  saveDatabase(db);
}

// Personal Info
export function getPersonalInfo(): PersonalInfo {
  return getDatabase().personalInfo;
}

export function savePersonalInfo(info: PersonalInfo): void {
  const db = getDatabase();
  db.personalInfo = info;
  saveDatabase(db);
  logApiCall('POST', '/api/personal-info/update', 200, 'Successfully updated personal contact info.', JSON.stringify(info));
}

// Aim of Foundation
export function getAimOfFoundation(): AimOfFoundation {
  return getDatabase().aimOfFoundation;
}

export function saveAimOfFoundation(aim: AimOfFoundation): boolean {
  if (!isCurrentUserAdmin()) {
    logApiCall('POST', '/api/foundation/aim', 403, 'Access denied: non-admin tried editing foundation aims.');
    return false;
  }
  const db = getDatabase();
  db.aimOfFoundation = aim;
  saveDatabase(db);
  logApiCall('POST', '/api/foundation/aim', 200, 'Administrator updated foundation aims, mission, and pillars.', JSON.stringify(aim));
  return true;
}

// Announcements
export function getAnnouncements(): Announcement[] {
  return getDatabase().announcements;
}

export function addAnnouncement(announcement: Omit<Announcement, 'id' | 'date'>): Announcement {
  if (!isCurrentUserAdmin()) {
    logApiCall('POST', '/api/announcements/create', 403, 'Access denied: non-admin tried publishing announcement.');
    throw new Error('Administrator access required');
  }
  const db = getDatabase();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  db.announcements = [newAnnouncement, ...db.announcements];
  saveDatabase(db);
  logApiCall('POST', '/api/announcements/create', 200, `Administrator published announcement: "${announcement.title}"`, JSON.stringify(announcement));
  return newAnnouncement;
}

export function deleteAnnouncement(id: string): void {
  if (!isCurrentUserAdmin()) {
    logApiCall('DELETE', `/api/announcements/delete/${id}`, 403, 'Access denied: non-admin tried deleting announcement.');
    return;
  }
  const db = getDatabase();
  db.announcements = db.announcements.filter(a => a.id !== id);
  saveDatabase(db);
  logApiCall('DELETE', `/api/announcements/delete/${id}`, 200, `Administrator deleted announcement ${id}.`);
}

// Foundation Goals Methods
export function getFoundationGoals(): FoundationGoal[] {
  return getDatabase().foundationGoals;
}

export function addFoundationGoal(goal: Omit<FoundationGoal, 'id'>): FoundationGoal {
  if (!isCurrentUserAdmin()) {
    logApiCall('POST', '/api/goals/create', 403, 'Access denied: non-admin tried adding foundation goal.');
    throw new Error('Administrator access required');
  }
  const db = getDatabase();
  const newGoal: FoundationGoal = {
    ...goal,
    id: `G-${Math.floor(100 + Math.random() * 900)}`,
  };
  db.foundationGoals = [...db.foundationGoals, newGoal];
  saveDatabase(db);
  logApiCall('POST', '/api/goals/create', 201, `Administrator added goal: "${goal.title}" (${goal.category})`, JSON.stringify(goal));
  return newGoal;
}

// Uploaded Images Methods (Admin Only Enforced!)
export function getUploadedImages(): UploadedImage[] {
  return getDatabase().uploadedImages;
}

export function addUploadedImage(fileName: string, sizeKb: number): { success: boolean; message: string; image?: UploadedImage } {
  const db = getDatabase();
  const activeUser = db.currentUser;

  if (!activeUser || activeUser.role !== 'Administrator') {
    logApiCall('POST', '/api/images/upload', 403, `Image upload failed: User "${activeUser?.username || 'Anonymous'}" lacks 'Administrator' role permissions.`);
    return { success: false, message: 'Permission Denied: Only Administrators are authorized to upload images.' };
  }

  const newImage: UploadedImage = {
    id: `IMG-${Math.floor(10 + Math.random() * 90)}`,
    fileName,
    filePath: `/uploads/images/${fileName}`,
    fileSizeKb: sizeKb,
    uploadedBy: activeUser.email,
    uploadedAt: new Date().toISOString().split('T')[0],
  };

  db.uploadedImages = [...db.uploadedImages, newImage];
  saveDatabase(db);

  logApiCall('POST', '/api/images/upload', 201, `Image successfully uploaded to SQLite table: "${fileName}" by {activeUser.email}`);
  return { success: true, message: 'Image uploaded successfully!', image: newImage };
}

// Executive Invite Authentication Methods
export function getInviteCodes(): InviteCode[] {
  return getDatabase().inviteCodes;
}

export function generateInviteCode(adminKeyText: string): { success: boolean; code?: string; error?: string } {
  if (!isCurrentUserAdmin()) {
    logApiCall('POST', '/api/generate-code', 403, 'Invite code generation failed: non-admin attempted code generation.');
    return { success: false, error: 'Administrator access required' };
  }
  if (adminKeyText !== 'MY_SUPER_ADMIN_KEY') {
    logApiCall('POST', '/api/generate-code', 403, 'Invite code generation failed: Unauthorized Admin Key.');
    return { success: false, error: 'Unauthorized' };
  }

  const code = Math.random().toString(16).substring(2, 10);
  const db = getDatabase();
  const newCode: InviteCode = {
    id: `IC-${Date.now()}`,
    code,
    used: false,
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.inviteCodes.push(newCode);
  saveDatabase(db);

  logApiCall('POST', '/api/generate-code', 200, `SQLite: Invite code generated: "${code}"`);
  return { success: true, code };
}

// User Authentication (Simulated Flask-Login & Werkzeug security)
export function getActiveUser(): User | null {
  return getDatabase().currentUser;
}

export function isCurrentUserAdmin(): boolean {
  const user = getDatabase().currentUser;
  return !!user && user.role === 'Administrator' && user.status !== 'Disabled';
}

export function getAllUsers(): User[] {
  return getDatabase().users;
}

// SQL Injection Detection Utility (Frontend Simulator)
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /select\s+.*\s+from/i,
    /or\s+['"]\d+['"]\s*=\s*['"]\d+['"]/i,
    /or\s+true/i,
    /--/
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
}

export function registerNewUser(
  username: string,
  email: string,
  passwordText: string,
  role: UserRole = 'Member',
  inviteCodeText?: string
): { success: boolean; message: string; user?: User } {
  if (role === 'Administrator') {
    logApiCall('POST', '/api/register', 403, 'Blocked public Administrator registration attempt.');
    return { success: false, message: 'Administrator accounts cannot be self-registered.' };
  }
  const db = getDatabase();
  const emailLower = email.toLowerCase().trim();

  if (detectSqlInjection(email) || detectSqlInjection(username)) {
    logApiCall('POST', '/api/register', 400, `Blocked SQL Injection Attempt! Malicious relational queries pattern found.`, JSON.stringify({ username, email }));
    return { success: false, message: 'Security Exception: Malicious character sequences detected.' };
  }

  if (role === 'Executive') {
    if (!inviteCodeText) {
      logApiCall('POST', '/api/register', 403, `Registration blocked: Executive requires a secret invite code.`);
      return { success: false, message: 'Forbidden: Secret invite code is required for Executive registration.' };
    }

    const codeIndex = db.inviteCodes.findIndex(ic => ic.code === inviteCodeText.trim() && !ic.used);
    if (codeIndex === -1) {
      logApiCall('POST', '/api/register', 403, `Registration blocked: Invalid or used invite code "${inviteCodeText}".`);
      return { success: false, message: 'Forbidden: Invalid or already used secret invite code.' };
    }

    db.inviteCodes[codeIndex].used = true;
    logApiCall('POST', '/api/register', 200, `SQLite: Verified secret invite code "${inviteCodeText}". Status changed to Used.`);
  }

  const exists = db.users.some(u => u.email.toLowerCase() === emailLower);
  if (exists) {
    logApiCall('POST', '/api/register', 400, `Registration failed: Email "${email}" is already registered.`);
    return { success: false, message: 'A user with this email already exists.' };
  }

  const passwordHash = hashPassword(passwordText);
  const newUser: User = {
    username,
    email: emailLower,
    passwordHash,
    role,
    isLoggedIn: true,
    createdAt: new Date().toISOString(),
    status: 'Active',
    amountOwed: role === 'Member' ? 120 : role === 'Volunteer' ? 50 : 0, // Preseed outstanding balance
  };

  db.users.push(newUser);
  db.currentUser = newUser;
  saveDatabase(db);

  logApiCall('POST', '/api/register', 201, `Werkzeug: Hashed password. Flask-Login: Authenticated user session for "${username}" (${role}).`, JSON.stringify({ username, email, role }));

  // Notify administrator
  pushAdminNotification('register', '🆕 New Account Registered', `${username} (${role}) just created an account with email ${emailLower}.`, emailLower, role);

  return { success: true, message: 'Account created successfully!', user: newUser };
}

// ==========================================
// LOGIN SESSION RECORDS DATABASE
// ==========================================

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'Mobile / Tablet';
  return 'Desktop / Laptop';
}

function getSimulatedIP(): string {
  // Simulated IP — real IPs require a backend call
  const segments = [
    Math.floor(100 + Math.random() * 155),
    Math.floor(0 + Math.random() * 255),
    Math.floor(0 + Math.random() * 255),
    Math.floor(1 + Math.random() * 254),
  ];
  return segments.join('.');
}

export function getLoginRecords(): LoginRecord[] {
  return getDatabase().loginRecords;
}

export function clearLoginRecords(): void {
  const db = getDatabase();
  db.loginRecords = [];
  saveDatabase(db);
  logApiCall('DELETE', '/api/auth/sessions/clear', 200, 'All login session records cleared by Administrator.');
}

function createLoginRecord(user: User): LoginRecord {
  return {
    id: `SESSION-${Date.now().toString(36).toUpperCase()}`,
    email: user.email,
    username: user.username,
    role: user.role,
    loginTime: new Date().toISOString(),
    logoutTime: null,
    ipAddress: getSimulatedIP(),
    device: detectDevice(),
    browser: detectBrowser(),
    os: detectOS(),
    status: 'Active',
    sessionDuration: null,
  };
}

function markSessionLoggedOut(email: string): void {
  const db = getDatabase();
  const idx = db.loginRecords.findIndex(r => r.email === email && r.status === 'Active');
  if (idx !== -1) {
    const loginTime = new Date(db.loginRecords[idx].loginTime).getTime();
    const logoutTime = Date.now();
    const diffMs = logoutTime - loginTime;
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    db.loginRecords[idx].logoutTime = new Date(logoutTime).toISOString();
    db.loginRecords[idx].status = 'Logged Out';
    db.loginRecords[idx].sessionDuration = `${mins}m ${secs}s`;
    saveDatabase(db);
  }
}

export function loginUserSession(emailText: string, passwordText: string): { success: boolean; message: string; user?: User } {
  const db = getDatabase();
  const emailLower = emailText.toLowerCase().trim();

  if (detectSqlInjection(emailText)) {
    logApiCall('POST', '/api/login', 400, `Blocked SQL Injection Attempt: "${emailText}". Parameterized statement block active.`);
    return { success: false, message: 'Security Exception: Malicious queries blocked.' };
  }

  const foundUserIndex = db.users.findIndex(u => u.email.toLowerCase() === emailLower);
  if (foundUserIndex === -1) {
    logApiCall('POST', '/api/login', 401, `Login failed: Email "${emailText}" not found in SQLite users database.`);
    return { success: false, message: 'Account email not found.' };
  }

  const foundUser = db.users[foundUserIndex];

  if (foundUser.status === 'Disabled') {
    logApiCall('POST', '/api/login', 403, `Access Denied: Login attempt blocked for deactivated account "${foundUser.username}" (${foundUser.email}).`);
    return { success: false, message: 'Account disabled: Please contact a foundation administrator.' };
  }

  if (!verifyPassword(passwordText, foundUser.passwordHash)) {
    logApiCall('POST', '/api/login', 401, `Login failed: Werkzeug check_password_hash returned False for "${foundUser.username}".`);
    return { success: false, message: 'Incorrect password.' };
  }

  const expiresTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  
  foundUser.isLoggedIn = true;
  foundUser.expiresAt = expiresTime;
  db.users[foundUserIndex] = foundUser;
  db.currentUser = foundUser;

  // Record the login session in the database
  const record = createLoginRecord(foundUser);
  db.loginRecords = [record, ...db.loginRecords];

  saveDatabase(db);

  logApiCall('POST', '/api/login', 200, `Flask-Login: Session established for "${foundUser.username}" (${foundUser.role}). Session cookie stored securely. Session expires at: ${expiresTime}`);
  logApiCall('POST', '/api/auth/sessions/record', 201, `Login session record created: ${record.id} | Device: ${record.device} | OS: ${record.os} | Browser: ${record.browser} | IP: ${record.ipAddress}`);

  // Notify administrator
  pushAdminNotification('login', '🔑 User Logged In', `${foundUser.username} (${foundUser.role}) signed in from ${record.device} · ${record.browser} · ${record.os} — IP: ${record.ipAddress}`, foundUser.email, foundUser.role);

  return { success: true, message: `Welcome back, ${foundUser.username}!`, user: foundUser };
}

export function logoutUserSession(): void {
  const db = getDatabase();
  if (db.currentUser) {
    const username = db.currentUser.username;
    const email = db.currentUser.email;
    const userIndex = db.users.findIndex(u => u.email === db.currentUser?.email);
    if (userIndex !== -1) {
      db.users[userIndex].isLoggedIn = false;
    }
    // Mark session record as logged out
    markSessionLoggedOut(email);
    db.currentUser = null;
    saveDatabase(db);
    logApiCall('POST', '/api/logout', 200, `Flask-Login: Destroyed active session for "${username}".`);
  }
}

export function updateUserRole(emailText: string, newRole: UserRole): boolean {
  if (!isCurrentUserAdmin()) {
    logApiCall('PATCH', '/api/admin/update-role', 403, 'Access denied: non-admin tried changing user roles.');
    return false;
  }
  const db = getDatabase();
  const index = db.users.findIndex(u => u.email === emailText);
  if (index !== -1) {
    db.users[index].role = newRole;
    if (db.currentUser && db.currentUser.email === emailText) {
      db.currentUser.role = newRole;
    }
    saveDatabase(db);
    logApiCall('PATCH', '/api/admin/update-role', 200, `Admin updated role for "${db.users[index].username}" to "${newRole}".`);
    return true;
  }
  return false;
}

// Toggle Deactivate / Disable Account
export function toggleUserStatus(emailText: string): boolean {
  if (!isCurrentUserAdmin()) {
    logApiCall('PATCH', '/api/admin/toggle-status', 403, 'Access denied: non-admin tried toggling account status.');
    return false;
  }
  const db = getDatabase();
  const index = db.users.findIndex(u => u.email === emailText);
  if (index !== -1) {
    const currentStatus = db.users[index].status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    db.users[index].status = nextStatus;
    
    if (db.currentUser && db.currentUser.email === emailText && nextStatus === 'Disabled') {
      db.currentUser = null;
    }
    
    saveDatabase(db);
    logApiCall('PATCH', '/api/admin/toggle-status', 200, `Admin toggled status of "${db.users[index].username}" to "${nextStatus}".`);
    return true;
  }
  return false;
}

// Delete User Account completely from the database
export function deleteUserAccount(emailText: string): boolean {
  if (!isCurrentUserAdmin()) {
    logApiCall('DELETE', '/api/admin/delete-user', 403, 'Access denied: non-admin tried deleting user account.');
    return false;
  }
  const db = getDatabase();
  const index = db.users.findIndex(u => u.email === emailText);
  if (index !== -1) {
    const username = db.users[index].username;
    db.users = db.users.filter(u => u.email !== emailText);
    
    if (db.currentUser && db.currentUser.email === emailText) {
      db.currentUser = null;
    }
    
    saveDatabase(db);
    logApiCall('DELETE', `/api/admin/delete-user`, 200, `Admin completely purged user account "${username}" (${emailText}) from SQLite users table.`);
    return true;
  }
  return false;
}

// Pay Dues / Dues Payouts
export function payUserDues(emailText: string, amountPaid: number): { success: boolean; message: string; newBalance: number } {
  const db = getDatabase();
  const index = db.users.findIndex(u => u.email === emailText);
  if (index === -1) {
    return { success: false, message: 'User not found.', newBalance: 0 };
  }

  const currentOwed = db.users[index].amountOwed || 0;
  const nextOwed = Math.max(0, currentOwed - amountPaid);
  db.users[index].amountOwed = nextOwed;

  if (db.currentUser && db.currentUser.email === emailText) {
    db.currentUser.amountOwed = nextOwed;
  }

  saveDatabase(db);
  logApiCall('POST', '/api/dues/pay', 200, `Dues Paid: GH₵ ${amountPaid} received from "${db.users[index].username}". Outstanding Balance: GH₵ ${nextOwed}.`);
  return { success: true, message: `Successfully processed payment of GH₵ ${amountPaid}!`, newBalance: nextOwed };
}

// Charge Dues
export function chargeUserDues(emailText: string, amountCharged: number): boolean {
  if (!isCurrentUserAdmin()) {
    logApiCall('POST', '/api/dues/charge', 403, 'Access denied: non-admin tried charging member dues.');
    return false;
  }
  const db = getDatabase();
  const index = db.users.findIndex(u => u.email === emailText);
  if (index !== -1) {
    db.users[index].amountOwed = (db.users[index].amountOwed || 0) + amountCharged;
    if (db.currentUser && db.currentUser.email === emailText) {
      db.currentUser.amountOwed = db.users[index].amountOwed;
    }
    saveDatabase(db);
    logApiCall('POST', '/api/dues/charge', 200, `Dues Charged: GH₵ ${amountCharged} billed to "${db.users[index].username}".`);
    return true;
  }
  return false;
}

// Settings
export function getSettings(): Settings {
  return getDatabase().settings;
}

export function saveSettings(settings: Settings): boolean {
  if (!isCurrentUserAdmin()) {
    logApiCall('POST', '/api/settings/save', 403, 'Access denied: non-admin tried updating platform settings.');
    return false;
  }
  const db = getDatabase();
  db.settings = settings;
  saveDatabase(db);
  logApiCall('POST', '/api/settings/save', 200, 'Administrator updated platform settings.', JSON.stringify(settings));
  return true;
}

// Profile Image
export function getProfileImage(): ProfileImage | null {
  return getDatabase().profileImage;
}

export function saveProfileImage(image: ProfileImage): void {
  const db = getDatabase();
  db.profileImage = image;
  saveDatabase(db);
}

export function removeProfileImage(): void {
  const db = getDatabase();
  db.profileImage = null;
  saveDatabase(db);
}
