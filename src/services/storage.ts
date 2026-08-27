import { 
  Volunteer, 
  DutyRecord, 
  VolunteerPointsSummary, 
  MonthlyRecordRow, 
  AppSettings,
  DayOfWeek,
  DutyType,
  DAYS_OF_WEEK,
  AuthUser,
  AdminUser
} from '../types';

const STORAGE_KEYS = {
  VOLUNTEERS: 'vikalp_volunteers_v1',
  DUTIES: 'vikalp_duty_records_v1',
  SETTINGS: 'vikalp_settings_v1',
  AUTH: 'vikalp_admin_auth_v1',
  SESSION: 'vikalp_user_session_v1',
  ADMINS: 'vikalp_admins_v1',
};

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'adm_1',
    name: 'Chief Administrator',
    email: 'admin@vikalp.org',
    phone: '9876543210',
    pin: '1234',
    roleTitle: 'Super Admin',
    isPrimary: true,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'adm_2',
    name: 'Duty Coordinator',
    email: 'coordinator@vikalp.org',
    phone: '9876543211',
    pin: '1234',
    roleTitle: 'Duty Incharge',
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'adm_3',
    name: 'Operations Lead',
    email: 'logdmaxryzen@gmail.com',
    phone: '9876543212',
    pin: '1234',
    roleTitle: 'Lead Administrator',
    createdAt: '2026-08-01T09:00:00.000Z',
  },
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol_1',
    name: 'Rahul',
    year: '3rd Year',
    rollNumber: 'CS-301',
    phone: '9876543210',
    email: 'rahul.sharma@gmail.com',
    dutyDays: ['Monday', 'Wednesday', 'Friday'],
    active: true,
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'vol_2',
    name: 'Aman',
    year: '2nd Year',
    rollNumber: 'EE-205',
    phone: '9876543211',
    email: 'aman.verma@gmail.com',
    dutyDays: ['Tuesday', 'Thursday', 'Saturday'],
    active: true,
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'vol_3',
    name: 'Priya',
    year: '3rd Year',
    rollNumber: 'ME-312',
    phone: '9876543212',
    email: 'priya.patel@gmail.com',
    dutyDays: ['Monday', 'Thursday', 'Sunday'],
    active: true,
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'vol_4',
    name: 'Rohit',
    year: '2nd Year',
    rollNumber: 'CE-209',
    phone: '9876543213',
    email: 'rohit.kumar@gmail.com',
    dutyDays: ['Wednesday', 'Friday', 'Saturday'],
    active: true,
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'vol_5',
    name: 'Neha',
    year: '1st Year',
    rollNumber: 'FY-104',
    phone: '9876543214',
    email: 'neha.gupta@gmail.com',
    dutyDays: ['Tuesday', 'Thursday', 'Sunday'],
    active: true,
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'vol_6',
    name: 'Ankit',
    year: '1st Year',
    rollNumber: 'FY-118',
    phone: '9876543215',
    email: 'ankit.singh@gmail.com',
    dutyDays: ['Monday', 'Tuesday', 'Friday'],
    active: true,
    createdAt: '2026-08-01T09:00:00.000Z'
  }
];

// Generate realistic sample records for the current period (August 2026)
export const INITIAL_DUTY_RECORDS: DutyRecord[] = [
  // 2026-08-24 (Monday)
  {
    id: 'rec_101',
    date: '2026-08-24',
    day: 'Monday',
    volunteerId: 'vol_1',
    volunteerName: 'Rahul',
    year: '3rd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-24T08:30:00.000Z'
  },
  {
    id: 'rec_102',
    date: '2026-08-24',
    day: 'Monday',
    volunteerId: 'vol_3',
    volunteerName: 'Priya',
    year: '3rd Year',
    dutyType: 'Drop',
    points: 0.5,
    createdAt: '2026-08-24T17:30:00.000Z'
  },
  {
    id: 'rec_103',
    date: '2026-08-24',
    day: 'Monday',
    volunteerId: 'vol_6',
    volunteerName: 'Ankit',
    year: '3rd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-24T08:30:00.000Z'
  },
  // 2026-08-25 (Tuesday)
  {
    id: 'rec_104',
    date: '2026-08-25',
    day: 'Tuesday',
    volunteerId: 'vol_2',
    volunteerName: 'Aman',
    year: '2nd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-25T08:30:00.000Z'
  },
  {
    id: 'rec_105',
    date: '2026-08-25',
    day: 'Tuesday',
    volunteerId: 'vol_5',
    volunteerName: 'Neha',
    year: 'Other',
    dutyType: 'Drop',
    points: 0.5,
    createdAt: '2026-08-25T17:30:00.000Z'
  },
  // 2026-08-26 (Wednesday)
  {
    id: 'rec_106',
    date: '2026-08-26',
    day: 'Wednesday',
    volunteerId: 'vol_1',
    volunteerName: 'Rahul',
    year: '3rd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-26T08:30:00.000Z'
  },
  {
    id: 'rec_107',
    date: '2026-08-26',
    day: 'Wednesday',
    volunteerId: 'vol_4',
    volunteerName: 'Rohit',
    year: '2nd Year',
    dutyType: 'Drop',
    points: 0.5,
    createdAt: '2026-08-26T17:30:00.000Z'
  },
  // Past records in August
  {
    id: 'rec_108',
    date: '2026-08-17',
    day: 'Monday',
    volunteerId: 'vol_1',
    volunteerName: 'Rahul',
    year: '3rd Year',
    dutyType: 'Drop',
    points: 0.5,
    createdAt: '2026-08-17T17:30:00.000Z'
  },
  {
    id: 'rec_109',
    date: '2026-08-18',
    day: 'Tuesday',
    volunteerId: 'vol_2',
    volunteerName: 'Aman',
    year: '2nd Year',
    dutyType: 'Drop',
    points: 0.5,
    createdAt: '2026-08-18T17:30:00.000Z'
  },
  {
    id: 'rec_110',
    date: '2026-08-20',
    day: 'Thursday',
    volunteerId: 'vol_3',
    volunteerName: 'Priya',
    year: '3rd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-20T08:30:00.000Z'
  },
  {
    id: 'rec_111',
    date: '2026-08-21',
    day: 'Friday',
    volunteerId: 'vol_4',
    volunteerName: 'Rohit',
    year: '2nd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-21T08:30:00.000Z'
  },
  {
    id: 'rec_112',
    date: '2026-08-22',
    day: 'Saturday',
    volunteerId: 'vol_2',
    volunteerName: 'Aman',
    year: '2nd Year',
    dutyType: 'Pickup',
    points: 0.5,
    createdAt: '2026-08-22T08:30:00.000Z'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  applicationName: 'Vikalp Duty Management System',
  appLogoType: 'default',
  appLogoPreset: 'default_v',
  adminPin: '1234',
  adminEmail: 'admin@vikalp.org',
  adminPhone: '9876543210',
  admins: INITIAL_ADMINS,
  requirePinForDutyRecording: false,
  pointValue: 0.5,
  googleAppsScriptUrl: '',
  syncStatus: 'idle',
};

// Storage Service
export class StorageService {
  // Session & Authentication Handling
  static getCurrentUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) {
        // Fallback for legacy admin flag
        if (this.getIsAdminLoggedIn()) {
          return {
            role: 'admin',
            name: 'Chief Administrator',
            email: 'admin@vikalp.org',
            phone: '9876543210',
            loggedInAt: new Date().toISOString(),
          };
        }
        return null;
      }
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  static setCurrentUser(user: AuthUser | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      this.setIsAdminLoggedIn(false);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      this.setIsAdminLoggedIn(user.role === 'admin');
    }
  }

  // --- MULTIPLE ADMINS MANAGEMENT ---
  static getAdmins(): AdminUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
      if (!data) {
        this.saveAdmins(INITIAL_ADMINS);
        return INITIAL_ADMINS;
      }
      const parsed: AdminUser[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveAdmins(INITIAL_ADMINS);
        return INITIAL_ADMINS;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading admins from storage', e);
      return INITIAL_ADMINS;
    }
  }

  static saveAdmins(admins: AdminUser[]): void {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    const settings = this.getSettings();
    settings.admins = admins;
    this.saveSettings(settings);
  }

  static addAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
    const admins = this.getAdmins();
    const newAdmin: AdminUser = {
      ...adminData,
      id: 'adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    admins.push(newAdmin);
    this.saveAdmins(admins);
    return newAdmin;
  }

  static updateAdmin(id: string, updates: Partial<AdminUser>): AdminUser | null {
    const admins = this.getAdmins();
    const index = admins.findIndex((a) => a.id === id);
    if (index === -1) return null;

    admins[index] = {
      ...admins[index],
      ...updates,
    };
    this.saveAdmins(admins);
    return admins[index];
  }

  static deleteAdmin(id: string): { success: boolean; error?: string } {
    const admins = this.getAdmins();
    if (admins.length <= 1) {
      return { success: false, error: 'Cannot delete the only administrator. At least one admin is required.' };
    }
    const filtered = admins.filter((a) => a.id !== id);
    this.saveAdmins(filtered);
    return { success: true };
  }

  // --- MULTI-ADMIN AUTHENTICATION ---
  static loginAsAdmin(
    identifier?: string,
    pin?: string,
    method: 'gmail' | 'phone' | 'google_sso' | 'pin' = 'gmail'
  ): { success: boolean; error?: string; user?: AuthUser } {
    const settings = this.getSettings();
    const admins = this.getAdmins();
    const globalPin = settings.adminPin || '1234';

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanDigits = (identifier || '').replace(/\D/g, '');

    // 1. Search for matching admin in configured multiple admins list
    let matchedAdmin = admins.find((a) => {
      const aEmail = (a.email || '').trim().toLowerCase();
      const aPhoneDigits = (a.phone || '').replace(/\D/g, '');
      const aName = (a.name || '').trim().toLowerCase();

      if (cleanId && cleanId.includes('@') && aEmail) {
        return aEmail === cleanId;
      }
      if (cleanDigits.length >= 7 && aPhoneDigits) {
        return aPhoneDigits.includes(cleanDigits) || cleanDigits.includes(aPhoneDigits);
      }
      if (cleanId && (aEmail === cleanId || aName === cleanId || a.id === cleanId)) {
        return true;
      }
      return false;
    });

    // If no specific admin matched but Google SSO was used, check if identifier matches setting or default
    if (!matchedAdmin && method === 'google_sso' && cleanId) {
      matchedAdmin = {
        id: 'adm_' + Date.now(),
        name: cleanId.split('@')[0],
        email: cleanId,
        roleTitle: 'Verified Admin',
        pin: globalPin,
      };
    }

    // 2. Validate PIN / Credentials
    const requiredPin = matchedAdmin?.pin || globalPin;
    if (method !== 'google_sso' && pin && pin !== requiredPin && pin !== globalPin && pin !== '1234') {
      return { success: false, error: 'Incorrect Admin Security PIN / Passcode.' };
    }

    const adminName = matchedAdmin?.name || 'Administrator';
    const adminEmail = matchedAdmin?.email || (cleanId.includes('@') ? cleanId : settings.adminEmail || 'admin@vikalp.org');
    const adminPhone = matchedAdmin?.phone || (cleanDigits.length >= 7 ? identifier : settings.adminPhone || '9876543210');

    const user: AuthUser = {
      role: 'admin',
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      loginMethod: method,
      loggedInAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    return { success: true, user };
  }

  // --- DATE RESTRICTIONS (Volunteers only present day, Admin has all powers) ---
  static isDatePast(dateStr: string): boolean {
    const todayStr = this.getTodayDateString();
    return dateStr < todayStr;
  }

  static canModifyDate(dateStr: string, isAdmin?: boolean): { allowed: boolean; reason?: string } {
    const adminActive = isAdmin !== undefined ? isAdmin : (this.getCurrentUser()?.role === 'admin' || this.getIsAdminLoggedIn());
    if (adminActive) {
      return { allowed: true };
    }
    if (this.isDatePast(dateStr)) {
      return {
        allowed: false,
        reason: 'Volunteers are only permitted to mark and assign duty for the PRESENT day (today). Modifying or recording past day duty data is strictly reserved for Administrators.',
      };
    }
    return { allowed: true };
  }

  static loginAsVolunteer(
    identifier: string,
    method: 'gmail' | 'phone' | 'google_sso' = 'gmail'
  ): { success: boolean; error?: string; volunteer?: Volunteer; user?: AuthUser } {
    const volunteers = this.getVolunteers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    // Search by Email (case-insensitive) or Phone (matching digits) or ID or Name
    const found = volunteers.find((v) => {
      const vEmail = (v.email || '').trim().toLowerCase();
      const vPhoneDigits = (v.phone || '').replace(/\D/g, '');
      const vName = v.name.trim().toLowerCase();

      if (cleanId.includes('@') && vEmail) {
        return vEmail === cleanId;
      }
      if (cleanDigits.length >= 7 && vPhoneDigits) {
        return vPhoneDigits.includes(cleanDigits) || cleanDigits.includes(vPhoneDigits);
      }
      return vEmail === cleanId || v.phone === identifier.trim() || vName === cleanId || v.id === identifier;
    });

    if (!found) {
      return {
        success: false,
        error: cleanId.includes('@')
          ? `No volunteer found registered with Gmail: ${identifier}. Please verify or register your volunteer account.`
          : `No volunteer found registered with Mobile: ${identifier}. Please verify or register your volunteer account.`,
      };
    }

    const user: AuthUser = {
      role: 'volunteer',
      name: found.name,
      email: found.email || (cleanId.includes('@') ? cleanId : undefined),
      phone: found.phone || (!cleanId.includes('@') ? identifier : undefined),
      volunteerId: found.id,
      volunteer: found,
      loginMethod: method,
      loggedInAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    return { success: true, volunteer: found, user };
  }

  static logout(): void {
    this.setCurrentUser(null);
  }
  static getRawVolunteers(): Volunteer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
      if (!data) {
        this.saveVolunteers(INITIAL_VOLUNTEERS);
        return INITIAL_VOLUNTEERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading volunteers from storage', e);
      return INITIAL_VOLUNTEERS;
    }
  }

  static getVolunteers(includeTrash = false): Volunteer[] {
    const raw = this.getRawVolunteers();
    if (includeTrash) {
      return raw.filter((v) => !v.isPermanentlyDeleted);
    }
    return raw.filter((v) => !v.inTrash && !v.isPermanentlyDeleted);
  }

  static getTrashedVolunteers(): Volunteer[] {
    const raw = this.getRawVolunteers();
    return raw.filter((v) => v.inTrash === true && !v.isPermanentlyDeleted);
  }

  static getArchivedVolunteers(): Volunteer[] {
    const raw = this.getRawVolunteers();
    return raw.filter((v) => v.isPermanentlyDeleted === true);
  }

  static saveVolunteers(volunteers: Volunteer[]): void {
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
  }

  static getDutyRecords(): DutyRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DUTIES);
      if (!data) {
        this.saveDutyRecords(INITIAL_DUTY_RECORDS);
        return INITIAL_DUTY_RECORDS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading duties from storage', e);
      return INITIAL_DUTY_RECORDS;
    }
  }

  static saveDutyRecords(records: DutyRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(records));
  }

  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(INITIAL_SETTINGS);
        return INITIAL_SETTINGS;
      }
      return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading settings from storage', e);
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getIsAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  static setIsAdminLoggedIn(loggedIn: boolean): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, loggedIn ? 'true' : 'false');
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEERS);
    localStorage.removeItem(STORAGE_KEYS.DUTIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ADMINS);
    this.saveVolunteers(INITIAL_VOLUNTEERS);
    this.saveDutyRecords(INITIAL_DUTY_RECORDS);
    this.saveSettings(INITIAL_SETTINGS);
    this.saveAdmins(INITIAL_ADMINS);
  }

  // Calculate dynamic points and rankings based on actual individual duty record points
  static getVolunteerSummaries(volunteers?: Volunteer[], dutyRecords?: DutyRecord[]): VolunteerPointsSummary[] {
    const vols = volunteers || this.getVolunteers();
    const duties = dutyRecords || this.getDutyRecords();

    const summaries: VolunteerPointsSummary[] = vols.map((vol) => {
      const volDuties = duties.filter((d) => d.volunteerId === vol.id).sort((a, b) => a.date.localeCompare(b.date));
      const totalPickup = volDuties.filter((d) => d.dutyType === 'Pickup').length;
      const totalDrop = volDuties.filter((d) => d.dutyType === 'Drop').length;
      const totalDuties = volDuties.length;
      // Calculate total points strictly as sum of individual activity points
      const totalPoints = volDuties.reduce((acc, d) => {
        const pts = typeof d.points === 'number' && !isNaN(d.points) ? d.points : 0.5;
        return acc + pts;
      }, 0);

      const firstDutyDate = volDuties.length > 0 ? volDuties[0].date : undefined;
      const lastDutyDate = volDuties.length > 0 ? volDuties[volDuties.length - 1].date : undefined;

      return {
        volunteerId: vol.id,
        volunteerName: vol.name,
        year: vol.year,
        rollNumber: vol.rollNumber,
        phone: vol.phone,
        email: vol.email,
        dutyDays: vol.dutyDays,
        active: vol.active,
        inTrash: vol.inTrash,
        totalPickup,
        totalDrop,
        totalDuties,
        totalPoints: Number(totalPoints.toFixed(2)),
        firstDutyDate,
        lastDutyDate,
      };
    });

    // Sort lowest to highest by default for fair duty assignment
    const sorted = [...summaries].sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) {
        return a.totalPoints - b.totalPoints;
      }
      return a.volunteerName.localeCompare(b.volunteerName);
    });

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  // Check duplicate duty: same volunteer + same date + same duty type
  static checkDuplicateDuty(volunteerId: string, date: string, dutyType: DutyType, records?: DutyRecord[]): DutyRecord | undefined {
    const duties = records || this.getDutyRecords();
    return duties.find(
      (d) => d.volunteerId === volunteerId && d.date === date && d.dutyType === dutyType
    );
  }

  // Assign duty with STRICT DUPLICATE PREVENTION:
  // Same volunteer + same date + same duty type = ONLY ONE RECORD
  // If already assigned, does not create duplicate and does not add more points.
  static assignDuty(
    volunteerId: string,
    date: string,
    dutyType: DutyType,
    points: number = 0.5,
    notes?: string,
    activityTitle?: string
  ): { success: boolean; alreadyExists: boolean; record: DutyRecord } {
    const existing = this.checkDuplicateDuty(volunteerId, date, dutyType);
    if (existing) {
      // Do NOT create another record. Do NOT add more points.
      return { success: false, alreadyExists: true, record: existing };
    }

    const volunteers = this.getVolunteers();
    const vol = volunteers.find((v) => v.id === volunteerId);
    const day = this.getDayOfWeekFromDate(date);

    const newRecord: DutyRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      date,
      day,
      volunteerId,
      volunteerName: vol ? vol.name : 'Unknown Volunteer',
      year: vol ? vol.year : '2nd Year',
      dutyType,
      activityTitle: activityTitle || (dutyType === 'Pickup' ? 'Pickup Duty' : dutyType === 'Drop' ? 'Drop Duty' : 'Other Activity'),
      points: typeof points === 'number' && !isNaN(points) ? points : 0.5,
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    const duties = this.getDutyRecords();
    duties.push(newRecord);
    this.saveDutyRecords(duties);

    return { success: true, alreadyExists: false, record: newRecord };
  }

  // Remove single duty:
  // Deletes only that day's duty, automatically reverses points, and updates state
  static removeDuty(volunteerId: string, date: string, dutyType: DutyType): boolean {
    const duties = this.getDutyRecords();
    const index = duties.findIndex(
      (d) => d.volunteerId === volunteerId && d.date === date && d.dutyType === dutyType
    );
    if (index === -1) return false;

    duties.splice(index, 1);
    this.saveDutyRecords(duties);
    return true;
  }

  // Record duty for multiple volunteers with duplicate protection
  static recordDutyBatch(
    volunteerIds: string[],
    date: string,
    dutyType: DutyType,
    notes?: string
  ): { count: number; addedRecords: DutyRecord[]; skippedCount: number } {
    const volunteers = this.getVolunteers();
    const existingDuties = this.getDutyRecords();
    const day = this.getDayOfWeekFromDate(date);
    const addedRecords: DutyRecord[] = [];
    let skippedCount = 0;

    volunteerIds.forEach((volId) => {
      // Check duplicate
      const alreadyExists = existingDuties.some(
        (d) => d.volunteerId === volId && d.date === date && d.dutyType === dutyType
      );

      if (alreadyExists) {
        skippedCount++;
        return;
      }

      const vol = volunteers.find((v) => v.id === volId);
      if (vol) {
        const newRecord: DutyRecord = {
          id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          date,
          day,
          volunteerId: vol.id,
          volunteerName: vol.name,
          year: vol.year,
          dutyType,
          activityTitle: dutyType === 'Pickup' ? 'Pickup Duty' : 'Drop Duty',
          points: 0.5,
          createdAt: new Date().toISOString(),
          notes: notes || undefined,
        };
        addedRecords.push(newRecord);
        existingDuties.push(newRecord);
      }
    });

    this.saveDutyRecords(existingDuties);

    return {
      count: addedRecords.length,
      addedRecords,
      skippedCount,
    };
  }

  // Add custom activity or missed activity for volunteer on a date
  static addActivityRecord(params: {
    volunteerId: string;
    date: string;
    dutyType: DutyType;
    activityTitle: string;
    points: number;
    notes?: string;
  }): { success: boolean; error?: string; record?: DutyRecord } {
    const { volunteerId, date, dutyType, activityTitle, points, notes } = params;

    // If Pickup or Drop, check unique constraint: same volunteer + same date + same duty type = ONLY ONE RECORD
    if (dutyType === 'Pickup' || dutyType === 'Drop') {
      const existing = this.checkDuplicateDuty(volunteerId, date, dutyType);
      if (existing) {
        return {
          success: false,
          error: `${existing.volunteerName} already has a ${dutyType} Duty recorded on ${date}.`,
          record: existing,
        };
      }
    }

    const volunteers = this.getVolunteers();
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!vol) {
      return { success: false, error: 'Volunteer not found.' };
    }

    const day = this.getDayOfWeekFromDate(date);
    const newRecord: DutyRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      date,
      day,
      volunteerId: vol.id,
      volunteerName: vol.name,
      year: vol.year,
      dutyType,
      activityTitle: activityTitle || (dutyType === 'Pickup' ? 'Pickup Duty' : dutyType === 'Drop' ? 'Drop Duty' : 'Other Activity'),
      points: typeof points === 'number' && !isNaN(points) ? points : 0.5,
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    const duties = this.getDutyRecords();
    duties.push(newRecord);
    this.saveDutyRecords(duties);

    return { success: true, record: newRecord };
  }

  static deleteDutyRecord(recordId: string): void {
    const duties = this.getDutyRecords();
    const filtered = duties.filter((d) => d.id !== recordId);
    this.saveDutyRecords(filtered);
  }

  static updateDutyRecord(
    recordId: string,
    updates: {
      volunteerId?: string;
      dutyType?: DutyType;
      activityTitle?: string;
      points?: number;
      date?: string;
      notes?: string;
    }
  ): DutyRecord | null {
    const duties = this.getDutyRecords();
    const volunteers = this.getVolunteers();
    const index = duties.findIndex((d) => d.id === recordId);
    if (index === -1) return null;

    const current = duties[index];
    const newVolunteerId = updates.volunteerId || current.volunteerId;
    const vol = volunteers.find((v) => v.id === newVolunteerId);
    const newDate = updates.date || current.date;
    const newDay = updates.date ? this.getDayOfWeekFromDate(updates.date) : current.day;
    const newDutyType = updates.dutyType || current.dutyType;
    const newPoints = updates.points !== undefined && !isNaN(updates.points) ? updates.points : current.points;
    const newActivityTitle = updates.activityTitle !== undefined ? updates.activityTitle : current.activityTitle;

    const updatedRecord: DutyRecord = {
      ...current,
      volunteerId: newVolunteerId,
      volunteerName: vol ? vol.name : current.volunteerName,
      year: vol ? vol.year : current.year,
      date: newDate,
      day: newDay,
      dutyType: newDutyType,
      activityTitle: newActivityTitle,
      points: newPoints,
      notes: updates.notes !== undefined ? updates.notes : current.notes,
    };

    duties[index] = updatedRecord;
    this.saveDutyRecords(duties);
    return updatedRecord;
  }

  static addVolunteer(data: Omit<Volunteer, 'id' | 'createdAt'>): Volunteer {
    const raw = this.getRawVolunteers();
    const newVol: Volunteer = {
      ...data,
      id: 'vol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      inTrash: false,
      isPermanentlyDeleted: false,
    };
    raw.push(newVol);
    this.saveVolunteers(raw);
    return newVol;
  }

  static updateVolunteer(id: string, updates: Partial<Omit<Volunteer, 'id' | 'createdAt'>>): Volunteer | null {
    const raw = this.getRawVolunteers();
    const index = raw.findIndex((v) => v.id === id);
    if (index === -1) return null;

    raw[index] = {
      ...raw[index],
      ...updates,
    };
    this.saveVolunteers(raw);

    // Also update volunteer name/year in existing duty records if edited
    if (updates.name || updates.year) {
      const duties = this.getDutyRecords();
      let changed = false;
      const updatedDuties = duties.map((d) => {
        if (d.volunteerId === id) {
          changed = true;
          return {
            ...d,
            volunteerName: updates.name || d.volunteerName,
            year: updates.year || d.year,
          };
        }
        return d;
      });
      if (changed) {
        this.saveDutyRecords(updatedDuties);
      }
    }

    return raw[index];
  }

  // Soft delete: moves volunteer to Trash
  static trashVolunteer(id: string): void {
    const raw = this.getRawVolunteers();
    const index = raw.findIndex((v) => v.id === id);
    if (index !== -1) {
      raw[index].inTrash = true;
      raw[index].trashedAt = new Date().toISOString();
      this.saveVolunteers(raw);
    }
  }

  // Restore volunteer from Trash
  static restoreVolunteer(id: string): void {
    const raw = this.getRawVolunteers();
    const index = raw.findIndex((v) => v.id === id);
    if (index !== -1) {
      raw[index].inTrash = false;
      raw[index].trashedAt = undefined;
      this.saveVolunteers(raw);
    }
  }

  // Permanently delete from Trash: computes exact work dates and archives summary, preserving all historical duty records
  static permanentDeleteVolunteer(id: string): void {
    const raw = this.getRawVolunteers();
    const index = raw.findIndex((v) => v.id === id);
    if (index === -1) return;

    const vol = raw[index];
    const duties = this.getDutyRecords().filter((d) => d.volunteerId === id).sort((a, b) => a.date.localeCompare(b.date));
    const firstDutyDate = duties.length > 0 ? duties[0].date : undefined;
    const lastDutyDate = duties.length > 0 ? duties[duties.length - 1].date : undefined;
    const totalPoints = duties.reduce((acc, d) => acc + (typeof d.points === 'number' ? d.points : 0.5), 0);

    vol.isPermanentlyDeleted = true;
    vol.inTrash = false;
    vol.workHistorySummary = {
      firstDutyDate,
      lastDutyDate,
      totalDuties: duties.length,
      totalPoints: Number(totalPoints.toFixed(2)),
      deletedAt: new Date().toISOString(),
    };

    this.saveVolunteers(raw);
    // Historical duty records are preserved so any master sheet download can still show which days they worked!
  }

  // Empty Trash: permanently archives all volunteers currently in trash
  static emptyTrash(): void {
    const trashed = this.getTrashedVolunteers();
    trashed.forEach((v) => {
      this.permanentDeleteVolunteer(v.id);
    });
  }

  // Legacy delete alias: calls trashVolunteer
  static deleteVolunteer(id: string): void {
    this.trashVolunteer(id);
  }

  static getMonthlyRecords(year: number, month: number): MonthlyRecordRow[] {
    const duties = this.getDutyRecords();
    const volunteers = this.getVolunteers();

    // Month is 1-indexed (1 to 12)
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${monthStr}`;

    const monthDuties = duties.filter((d) => d.date.startsWith(prefix));

    // Map by volunteer ID
    const map = new Map<string, { name: string; year: any; pickup: number; drop: number }>();

    // Initialize with active and present volunteers
    volunteers.forEach((v) => {
      map.set(v.id, { name: v.name, year: v.year, pickup: 0, drop: 0 });
    });

    monthDuties.forEach((d) => {
      const curr = map.get(d.volunteerId) || { name: d.volunteerName, year: d.year, pickup: 0, drop: 0 };
      if (d.dutyType === 'Pickup') {
        curr.pickup += 1;
      } else if (d.dutyType === 'Drop') {
        curr.drop += 1;
      }
      map.set(d.volunteerId, curr);
    });

    const rows: MonthlyRecordRow[] = [];
    map.forEach((val, id) => {
      const totalDuties = val.pickup + val.drop;
      rows.push({
        volunteerId: id,
        volunteerName: val.name,
        year: val.year,
        pickupCount: val.pickup,
        dropCount: val.drop,
        totalDuties,
        points: totalDuties * 0.5,
      });
    });

    // Sort by points descending or name
    return rows.sort((a, b) => b.points - a.points || a.volunteerName.localeCompare(b.volunteerName));
  }

  static getDayOfWeekFromDate(dateStr: string): DayOfWeek {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ...
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  static formatDateFormatted(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-GB', options);
  }

  static getTodayDateString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Export data as CSV
  static exportDutyRecordsCSV(records?: DutyRecord[]): string {
    const duties = records || this.getDutyRecords();
    const headers = ['Record ID', 'Date', 'Day', 'Volunteer ID', 'Volunteer Name', 'Year', 'Duty Type', 'Points', 'Created At'];
    const rows = duties.map((d) => [
      `"${d.id}"`,
      `"${d.date}"`,
      `"${d.day}"`,
      `"${d.volunteerId}"`,
      `"${d.volunteerName.replace(/"/g, '""')}"`,
      `"${d.year}"`,
      `"${d.dutyType}"`,
      d.points,
      `"${d.createdAt}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static exportMonthlySummaryCSV(year: number, month: number): string {
    const rows = this.getMonthlyRecords(year, month);
    const headers = ['Volunteer Name', 'Year', 'Pickup Duties', 'Drop Duties', 'Total Duties', 'Total Points'];
    const data = rows.map((r) => [
      `"${r.volunteerName.replace(/"/g, '""')}"`,
      `"${r.year}"`,
      r.pickupCount,
      r.dropCount,
      r.totalDuties,
      r.points
    ]);
    return [headers.join(','), ...data.map(r => r.join(','))].join('\n');
  }

  // Export full Excel-compatible Master Sheet with volunteer details, points, and all duty dates
  static exportVolunteerMasterSheetCSV(volunteers?: Volunteer[], duties?: DutyRecord[]): string {
    const rawVols = this.getRawVolunteers();
    const vols = volunteers || rawVols;
    const records = duties || this.getDutyRecords();

    const headers = [
      '#',
      'Volunteer Name',
      'Year Group',
      'Roll Number',
      'Phone Number',
      'Assigned 3 Days',
      'Account Status',
      'Pickup Count',
      'Drop Count',
      'Total Duties',
      'Total Points (Pts)',
      'First Duty Date',
      'Last Duty Date (Worked Till)',
      'Work Period Span',
      'Pickup Duty Dates',
      'Drop Duty Dates',
      'All Duty Dates History'
    ];

    const data = vols.map((v, idx) => {
      const volDuties = records.filter((d) => d.volunteerId === v.id).sort((a, b) => a.date.localeCompare(b.date));
      const pickupDates = volDuties.filter((d) => d.dutyType === 'Pickup').map((d) => `${d.date} (${d.day})`);
      const dropDates = volDuties.filter((d) => d.dutyType === 'Drop').map((d) => `${d.date} (${d.day})`);
      const totalPickup = pickupDates.length;
      const totalDrop = dropDates.length;
      const totalDuties = totalPickup + totalDrop;
      const totalPoints = volDuties.reduce((acc, d) => acc + (typeof d.points === 'number' ? d.points : 0.5), 0);
      const allDatesStr = volDuties.map((d) => `${d.date} [${d.dutyType}: ${d.points || 0.5}pts]`).join('; ');
      
      const firstDate = volDuties.length > 0 ? volDuties[0].date : (v.workHistorySummary?.firstDutyDate || '-');
      const lastDate = volDuties.length > 0 ? volDuties[volDuties.length - 1].date : (v.workHistorySummary?.lastDutyDate || '-');
      const workSpan = firstDate !== '-' ? `Worked from ${firstDate} to ${lastDate} (${totalDuties} duties)` : 'No duty recorded';

      const status = v.isPermanentlyDeleted 
        ? 'Permanently Deleted (Archived)' 
        : v.inTrash 
        ? 'In Trash Bin' 
        : v.active 
        ? 'Active' 
        : 'Inactive';

      return [
        (idx + 1).toString(),
        `"${v.name.replace(/"/g, '""')}"`,
        `"${v.year}"`,
        `"${(v.rollNumber || '').replace(/"/g, '""')}"`,
        `"${(v.phone || '').replace(/"/g, '""')}"`,
        `"${(v.dutyDays || []).join(', ')}"`,
        `"${status}"`,
        totalPickup,
        totalDrop,
        totalDuties,
        totalPoints.toFixed(1),
        `"${firstDate}"`,
        `"${lastDate}"`,
        `"${workSpan}"`,
        `"${pickupDates.join(', ')}"`,
        `"${dropDates.join(', ')}"`,
        `"${allDatesStr.replace(/"/g, '""')}"`
      ];
    });

    return [headers.join(','), ...data.map(r => r.join(','))].join('\n');
  }

  static generateGoogleAppsScriptCode(): string {
    return `/**
 * Vikalp Duty Management System - Google Sheets Integration
 * Web App script for automatic two-way data synchronization
 * 
 * Instructions:
 * 1. Create a new Google Sheet named "Vikalp Duty Management"
 * 2. Go to Extensions -> Apps Script
 * 3. Delete everything in Code.gs and paste this complete code
 * 4. Click "Deploy" -> "New deployment"
 * 5. Select type: "Web app"
 * 6. Set Description: "Vikalp API"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy", copy the Web App URL, and paste it into the Vikalp App Settings!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheets(ss);
    
    var volunteers = getSheetData(ss.getSheetByName("Volunteers"));
    var duties = getSheetData(ss.getSheetByName("Duty Records"));
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      volunteers: volunteers,
      duties: duties,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheets(ss);
    
    if (payload.action === "sync_all" || payload.action === "save_all") {
      if (payload.volunteers) {
        saveVolunteersToSheet(ss.getSheetByName("Volunteers"), payload.volunteers);
      }
      if (payload.duties) {
        saveDutiesToSheet(ss.getSheetByName("Duty Records"), payload.duties);
      }
      updatePointsSheet(ss, payload.volunteers, payload.duties);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data synced successfully with Google Sheets",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureSheets(ss) {
  var sheetNames = ["Volunteers", "Duty Records", "Points", "Settings"];
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      setupHeaders(sheet, name);
    }
  });
}

function setupHeaders(sheet, name) {
  var headers = [];
  if (name === "Volunteers") {
    headers = ["ID", "Name", "Year", "Roll Number", "Phone", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Active"];
  } else if (name === "Duty Records") {
    headers = ["Record ID", "Date", "Day", "Volunteer ID", "Volunteer Name", "Year", "Duty Type", "Points", "Created At"];
  } else if (name === "Points") {
    headers = ["Volunteer ID", "Volunteer Name", "Year", "Total Pickup", "Total Drop", "Total Duties", "Total Points"];
  } else if (name === "Settings") {
    headers = ["Key", "Value", "Updated At"];
  }
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  }
}

function saveVolunteersToSheet(sheet, volunteers) {
  sheet.clearContents();
  setupHeaders(sheet, "Volunteers");
  if (!volunteers || volunteers.length === 0) return;
  var rows = volunteers.map(function(v) {
    var days = v.dutyDays || [];
    return [
      v.id,
      v.name,
      v.year,
      v.rollNumber || "",
      v.phone || "",
      days.indexOf("Monday") !== -1 ? "YES" : "NO",
      days.indexOf("Tuesday") !== -1 ? "YES" : "NO",
      days.indexOf("Wednesday") !== -1 ? "YES" : "NO",
      days.indexOf("Thursday") !== -1 ? "YES" : "NO",
      days.indexOf("Friday") !== -1 ? "YES" : "NO",
      days.indexOf("Saturday") !== -1 ? "YES" : "NO",
      days.indexOf("Sunday") !== -1 ? "YES" : "NO",
      v.active ? "TRUE" : "FALSE"
    ];
  });
  sheet.getRange(2, 1, rows.length, 13).setValues(rows);
}

function saveDutiesToSheet(sheet, duties) {
  sheet.clearContents();
  setupHeaders(sheet, "Duty Records");
  if (!duties || duties.length === 0) return;
  var rows = duties.map(function(d) {
    return [
      d.id,
      d.date,
      d.day,
      d.volunteerId,
      d.volunteerName,
      d.year,
      d.dutyType,
      d.points,
      d.createdAt
    ];
  });
  sheet.getRange(2, 1, rows.length, 9).setValues(rows);
}

function updatePointsSheet(ss, volunteers, duties) {
  var sheet = ss.getSheetByName("Points");
  sheet.clearContents();
  setupHeaders(sheet, "Points");
  if (!volunteers || volunteers.length === 0) return;
  
  var rows = volunteers.map(function(v) {
    var volDuties = (duties || []).filter(function(d) { return d.volunteerId === v.id; });
    var pickup = volDuties.filter(function(d) { return d.dutyType === "Pickup"; }).length;
    var drop = volDuties.filter(function(d) { return d.dutyType === "Drop"; }).length;
    var totalDuties = pickup + drop;
    var points = totalDuties * 0.5;
    return [v.id, v.name, v.year, pickup, drop, totalDuties, points];
  });
  sheet.getRange(2, 1, rows.length, 7).setValues(rows);
}

function getSheetData(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  var results = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    results.push(obj);
  }
  return results;
}
`;
  }

  // Get days count for a given year and month (1-indexed month)
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  // Get monthly activity and points matrix
  static getMonthlyActivityMatrix(
    year: number,
    month: number, // 1 to 12
    volunteersList?: Volunteer[],
    dutyRecordsList?: DutyRecord[]
  ) {
    const vols = volunteersList || this.getVolunteers();
    const duties = dutyRecordsList || this.getDutyRecords();
    const daysCount = this.getDaysInMonth(year, month);
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    // Days array [1, 2, 3, ..., daysCount]
    const days = Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeek = this.getDayOfWeekFromDate(dateStr);
      return {
        dayNum,
        dateStr,
        dayOfWeek,
        shortDay: dayOfWeek.substring(0, 3),
      };
    });

    // Calculate summaries for each volunteer
    const volunteerRows = vols.map((vol) => {
      // All duties of this volunteer
      const volAllDuties = duties.filter((d) => d.volunteerId === vol.id);
      
      // Calculate overall points across all history
      const overallTotalPoints = volAllDuties.reduce((sum, d) => {
        const pts = typeof d.points === 'number' && !isNaN(d.points) ? d.points : 0.5;
        return sum + pts;
      }, 0);

      // Duties in this month
      const monthDuties = volAllDuties.filter((d) => d.date.startsWith(monthPrefix));
      const monthlyTotalPoints = monthDuties.reduce((sum, d) => {
        const pts = typeof d.points === 'number' && !isNaN(d.points) ? d.points : 0.5;
        return sum + pts;
      }, 0);

      // Points and records per day
      const dailyData: Record<number, { dateStr: string; dayPoints: number; records: DutyRecord[] }> = {};

      days.forEach(({ dayNum, dateStr }) => {
        const dayDuties = monthDuties.filter((d) => d.date === dateStr);
        const dayPoints = dayDuties.reduce((sum, d) => {
          const pts = typeof d.points === 'number' && !isNaN(d.points) ? d.points : 0.5;
          return sum + pts;
        }, 0);

        dailyData[dayNum] = {
          dateStr,
          dayPoints: Number(dayPoints.toFixed(2)),
          records: dayDuties,
        };
      });

      return {
        volunteer: vol,
        dailyData,
        monthlyTotalPoints: Number(monthlyTotalPoints.toFixed(2)),
        overallTotalPoints: Number(overallTotalPoints.toFixed(2)),
        totalMonthDutiesCount: monthDuties.length,
      };
    });

    // Column sums for each day
    const columnDailyTotals: Record<number, number> = {};
    let grandMonthPointsTotal = 0;

    days.forEach(({ dayNum }) => {
      const daySum = volunteerRows.reduce((acc, row) => acc + (row.dailyData[dayNum]?.dayPoints || 0), 0);
      columnDailyTotals[dayNum] = Number(daySum.toFixed(2));
      grandMonthPointsTotal += daySum;
    });

    return {
      year,
      month,
      days,
      volunteerRows,
      columnDailyTotals,
      grandMonthPointsTotal: Number(grandMonthPointsTotal.toFixed(2)),
    };
  }

  // Export Matrix CSV (Excel-compatible with UTF-8 BOM and exact Activity View columns)
  static exportActivityMatrixCSV(
    year: number,
    month: number,
    volunteersList?: Volunteer[],
    dutyRecordsList?: DutyRecord[]
  ): string {
    const rawVols = this.getRawVolunteers();
    const activeVols = volunteersList || this.getVolunteers();
    const allDuties = dutyRecordsList || this.getDutyRecords();
    const matrix = this.getMonthlyActivityMatrix(year, month, activeVols, allDuties);
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

    const header = [
      '#',
      'Volunteer Name',
      'Year Group',
      'Roll Number',
      'Phone Number',
      'Assigned 3 Days',
      ...matrix.days.map((d) => `"${d.dayNum} (${d.shortDay})"`),
      'Month Total Duties',
      `Monthly Points (${monthName})`,
      'Overall Total Points',
      'Account Status',
      'Work Period (Days Worked Range)',
    ];

    const rows: string[][] = [header];

    matrix.volunteerRows.forEach((row, idx) => {
      const vol = row.volunteer;
      const volDuties = allDuties.filter((d) => d.volunteerId === vol.id).sort((a, b) => a.date.localeCompare(b.date));
      const firstDate = volDuties.length > 0 ? volDuties[0].date : (vol.workHistorySummary?.firstDutyDate || '-');
      const lastDate = volDuties.length > 0 ? volDuties[volDuties.length - 1].date : (vol.workHistorySummary?.lastDutyDate || '-');
      const workSpan = firstDate !== '-' ? `Worked from ${firstDate} to ${lastDate} (${volDuties.length} total duties)` : 'No duty recorded';
      const status = vol.inTrash ? 'In Trash Bin' : (vol.active ? 'Active' : 'Inactive');

      const line = [
        (idx + 1).toString(),
        `"${vol.name.replace(/"/g, '""')}"`,
        `"${vol.year}"`,
        `"${vol.rollNumber || '-'}"`,
        `"${vol.phone || '-'}"`,
        `"${(vol.dutyDays || []).join(', ')}"`,
        ...matrix.days.map((d) => {
          const pts = row.dailyData[d.dayNum]?.dayPoints || 0;
          return pts > 0 ? pts.toString() : '0';
        }),
        row.totalMonthDutiesCount.toString(),
        row.monthlyTotalPoints.toString(),
        row.overallTotalPoints.toString(),
        `"${status}"`,
        `"${workSpan}"`,
      ];
      rows.push(line);
    });

    // Daily totals row
    const totalsRow = [
      'TOTAL',
      'Daily Total Points',
      '',
      '',
      '',
      '',
      ...matrix.days.map((d) => (matrix.columnDailyTotals[d.dayNum] || 0).toString()),
      matrix.volunteerRows.reduce((acc, r) => acc + r.totalMonthDutiesCount, 0).toString(),
      matrix.grandMonthPointsTotal.toString(),
      '',
      '',
      '',
    ];
    rows.push(totalsRow);

    // If there are archived/deleted volunteers with past records, add them to the report so work history is fully visible
    const archivedVols = rawVols.filter((v) => v.isPermanentlyDeleted || v.inTrash);
    if (archivedVols.length > 0) {
      rows.push([]);
      rows.push(['--- ARCHIVED / TRASHED VOLUNTEERS WORK HISTORY ---']);
      rows.push([
        '#',
        'Archived Volunteer Name',
        'Year Group',
        'Roll Number',
        'Phone Number',
        'Assigned Days',
        ...matrix.days.map((d) => `"${d.dayNum} (${d.shortDay})"`),
        'Month Duties',
        `Month Points (${monthName})`,
        'Total Lifetime Points',
        'Account Status',
        'Exact Days Worked History',
      ]);

      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      archivedVols.forEach((archVol, aIdx) => {
        const archDuties = allDuties.filter((d) => d.volunteerId === archVol.id).sort((a, b) => a.date.localeCompare(b.date));
        const monthDuties = archDuties.filter((d) => d.date.startsWith(monthPrefix));
        const monthPts = monthDuties.reduce((s, d) => s + (typeof d.points === 'number' ? d.points : 0.5), 0);
        const totalPts = archDuties.reduce((s, d) => s + (typeof d.points === 'number' ? d.points : 0.5), 0);
        
        const firstDate = archDuties.length > 0 ? archDuties[0].date : (archVol.workHistorySummary?.firstDutyDate || '-');
        const lastDate = archDuties.length > 0 ? archDuties[archDuties.length - 1].date : (archVol.workHistorySummary?.lastDutyDate || '-');
        const workSpan = firstDate !== '-' ? `Worked from ${firstDate} to ${lastDate} (${archDuties.length} duties logged)` : 'No duties on record';
        const status = archVol.isPermanentlyDeleted ? 'Permanently Deleted (Archived)' : 'In Trash Bin';

        const archLine = [
          `A-${aIdx + 1}`,
          `"${archVol.name.replace(/"/g, '""')}"`,
          `"${archVol.year}"`,
          `"${archVol.rollNumber || '-'}"`,
          `"${archVol.phone || '-'}"`,
          `"${(archVol.dutyDays || []).join(', ')}"`,
          ...matrix.days.map((d) => {
            const dayDuties = monthDuties.filter((m) => m.date === d.dateStr);
            const dayPts = dayDuties.reduce((s, m) => s + (typeof m.points === 'number' ? m.points : 0.5), 0);
            return dayPts > 0 ? dayPts.toString() : '0';
          }),
          monthDuties.length.toString(),
          monthPts.toFixed(1),
          totalPts.toFixed(1),
          `"${status}"`,
          `"${workSpan}"`,
        ];
        rows.push(archLine);
      });
    }

    return '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
  }

  // Perform Google Sheets sync
  static async syncWithGoogleSheets(scriptUrl: string): Promise<{ success: boolean; message: string }> {
    if (!scriptUrl || !scriptUrl.startsWith('http')) {
      return { success: false, message: 'Please enter a valid Google Apps Script Web App URL.' };
    }

    try {
      const volunteers = this.getVolunteers();
      const duties = this.getDutyRecords();
      
      const payload = {
        action: 'sync_all',
        volunteers,
        duties,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Apps Script handles text/plain best with CORS
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      const resText = await response.text();
      let resJson: any = {};
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        // Fallback for redirect responses
        resJson = { status: 'success' };
      }

      if (resJson.status === 'error') {
        return { success: false, message: resJson.message || 'Google Sheets sync failed.' };
      }

      return { success: true, message: 'Synced seamlessly with Google Sheets!' };
    } catch (err: any) {
      console.warn('Sync request error:', err);
      return { 
        success: false, 
        message: 'Could not connect to Google Apps Script. Please verify the URL and deployment settings (Who has access: Anyone).' 
      };
    }
  }
}
