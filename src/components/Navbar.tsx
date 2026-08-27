import React from 'react';
import { 
  Shield, 
  FileSpreadsheet, 
  HelpCircle, 
  Settings, 
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  User,
  LogOut,
  ChevronDown,
  Trophy
} from 'lucide-react';
import { AppSettings, AuthUser, VolunteerPointsSummary } from '../types';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  settings: AppSettings;
  isAdmin: boolean;
  currentUser: AuthUser | null;
  userSummary?: VolunteerPointsSummary;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenGoogleSheets: () => void;
  onOpenAuth: (initialTab?: 'volunteer' | 'admin') => void;
  onLogout: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isAdmin,
  currentUser,
  userSummary,
  onOpenSettings,
  onOpenGuide,
  onOpenGoogleSheets,
  onOpenAuth,
  onLogout,
  onSync,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AppLogo settings={settings} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                {settings.applicationName ? settings.applicationName.split(' ')[0] : 'VIKALP'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wider">
                Duty System
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden xs:block">
              {settings.applicationName || 'Volunteer Pickup & Drop Manager'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Google Sheets Sync Pill */}
          <button
            onClick={settings.googleAppsScriptUrl ? onSync : onOpenGoogleSheets}
            disabled={isSyncing}
            id="nav-sheets-sync-btn"
            title={settings.googleAppsScriptUrl ? "Sync with Google Sheets" : "Connect Google Sheets"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              settings.googleAppsScriptUrl
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden md:inline">
              {isSyncing ? 'Syncing...' : settings.googleAppsScriptUrl ? 'Sheets Connected' : 'Google Sheets'}
            </span>
          </button>

          {/* Guide / Help button */}
          <button
            onClick={onOpenGuide}
            id="nav-guide-btn"
            title="User Guide & PWA Install"
            className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold transition border border-transparent hover:border-slate-200"
          >
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* User Auth Status / Login Buttons */}
          {currentUser?.role === 'admin' ? (
            <div className="flex items-center gap-1 bg-teal-700 text-white rounded-xl p-0.5 pl-2 pr-1 border border-teal-800 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold py-1">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Admin Mode</span>
                <span className="sm:hidden">Admin</span>
              </div>
              <button
                onClick={onLogout}
                title="Lock Admin Mode / Logout"
                className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-teal-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : currentUser?.role === 'volunteer' ? (
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 pl-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[100px] sm:max-w-[130px]">
                    {currentUser.name}
                  </span>
                  {userSummary && (
                    <span className="text-[10px] text-teal-700 font-bold hidden sm:inline leading-none">
                      🏆 {userSummary.totalPoints} pts
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out of Volunteer Account"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenAuth('volunteer')}
                id="nav-volunteer-login-btn"
                title="Login as Volunteer with Gmail or Mobile"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Volunteer Login</span>
              </button>

              <button
                onClick={() => onOpenAuth('admin')}
                id="nav-admin-login-btn"
                title="Login as Admin"
                className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            id="nav-settings-btn"
            title="Settings & Data Management"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition border border-slate-200"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

