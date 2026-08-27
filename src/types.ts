export type VolunteerGroup = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | '5th Year' | 'Other';

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export type DutyType = 'Pickup' | 'Drop' | 'Other';

export interface Volunteer {
  id: string;
  name: string;
  year: VolunteerGroup;
  rollNumber?: string;
  phone?: string;
  email?: string;
  dutyDays: DayOfWeek[]; // Exactly 3 days
  active: boolean;
  createdAt: string;
  inTrash?: boolean;
  trashedAt?: string;
  isPermanentlyDeleted?: boolean;
  workHistorySummary?: {
    firstDutyDate?: string;
    lastDutyDate?: string;
    totalDuties: number;
    totalPoints: number;
    deletedAt?: string;
  };
}

export interface DutyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  day: DayOfWeek;
  volunteerId: string;
  volunteerName: string;
  year: VolunteerGroup;
  dutyType: DutyType;
  activityTitle?: string; // e.g. "Pickup Duty", "Drop Duty", "Orientation Camp", etc.
  points: number; // e.g. 0.5, 1.0, 2.0
  createdAt: string;
  notes?: string;
}

export interface VolunteerPointsSummary {
  volunteerId: string;
  volunteerName: string;
  year: VolunteerGroup;
  rollNumber?: string;
  phone?: string;
  email?: string;
  dutyDays: DayOfWeek[];
  active: boolean;
  inTrash?: boolean;
  totalPickup: number;
  totalDrop: number;
  totalDuties: number;
  totalPoints: number;
  firstDutyDate?: string;
  lastDutyDate?: string;
  rank?: number;
}

export interface MonthlyRecordRow {
  volunteerId: string;
  volunteerName: string;
  year: VolunteerGroup;
  pickupCount: number;
  dropCount: number;
  totalDuties: number;
  points: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pin?: string;
  roleTitle?: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface AppSettings {
  applicationName: string;
  appLogoUrl?: string; // Custom image URL or Base64 data URI
  appLogoType?: 'default' | 'image' | 'preset';
  appLogoPreset?: 'default_v' | 'helping_hands' | 'shield_guard' | 'star_trophy' | 'academic_cap' | 'heart_hands';
  adminPin: string;
  adminEmail?: string;
  adminPhone?: string;
  admins?: AdminUser[];
  requirePinForDutyRecording: boolean;
  pointValue: number; // 0.5
  googleAppsScriptUrl: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTimestamp?: string;
  lastSyncMessage?: string;
}

export type AuthRole = 'guest' | 'volunteer' | 'admin';
export type LoginMethod = 'gmail' | 'phone' | 'google_sso' | 'pin';

export interface AuthUser {
  role: AuthRole;
  name: string;
  email?: string;
  phone?: string;
  volunteerId?: string;
  volunteer?: Volunteer;
  loginMethod?: LoginMethod;
  loggedInAt: string;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'activity_matrix'
  | 'schedule' 
  | 'duty' 
  | 'points' 
  | 'records' 
  | 'volunteers';


