import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  Building2,
  ChevronRight,
  Shield,
  Smartphone,
  AtSign
} from 'lucide-react';
import { Volunteer, AuthUser } from '../types';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'volunteer' | 'admin';
  volunteers: Volunteer[];
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'volunteer',
  volunteers,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'volunteer' | 'admin'>(initialTab);
  
  // Volunteer form state
  const [volLoginType, setVolLoginType] = useState<'gmail' | 'phone'>('gmail');
  const [volIdentifier, setVolIdentifier] = useState('');
  const [volSelectedId, setVolSelectedId] = useState('');
  const [volOtp, setVolOtp] = useState('');
  const [isVolOtpSent, setIsVolOtpSent] = useState(false);
  const [volError, setVolError] = useState<string | null>(null);

  // Admin form state
  const [adminLoginType, setAdminLoginType] = useState<'gmail' | 'phone'>('gmail');
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const settings = StorageService.getSettings();
  const configuredAdminEmail = settings.adminEmail || 'admin@vikalp.org';
  const configuredAdminPhone = settings.adminPhone || '9876543210';

  // Handle Volunteer Login
  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolError(null);

    const idToUse = volSelectedId || volIdentifier.trim();
    if (!idToUse) {
      setVolError(
        volLoginType === 'gmail'
          ? 'Please enter your registered Gmail / Email address.'
          : 'Please enter your 10-digit registered mobile number.'
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = StorageService.loginAsVolunteer(idToUse, volLoginType);
      setLoading(false);

      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setVolError(res.error || 'Volunteer record not found. Please verify your Gmail or mobile number.');
      }
    }, 250);
  };

  // One-click quick login for a specific sample volunteer
  const handleQuickVolunteerLogin = (vol: Volunteer) => {
    setLoading(true);
    setTimeout(() => {
      const res = StorageService.loginAsVolunteer(vol.id, 'gmail');
      setLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    }, 150);
  };

  // Google One-Tap Sign In simulation for Volunteer
  const handleVolunteerGoogleSignIn = () => {
    setLoading(true);
    // Find first volunteer with email or use first volunteer in list
    const vol = volunteers.find((v) => v.email) || volunteers[0];
    setTimeout(() => {
      setLoading(false);
      if (vol) {
        const res = StorageService.loginAsVolunteer(vol.id, 'google_sso');
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        }
      } else {
        setVolError('No volunteers registered in system yet. Please add a volunteer first.');
      }
    }, 300);
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const inputId = adminIdentifier.trim() || (adminLoginType === 'gmail' ? configuredAdminEmail : configuredAdminPhone);
    const pinToUse = adminPin.trim();

    if (!pinToUse) {
      setAdminError('Please enter the Admin PIN or Password (Default: 1234).');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = StorageService.loginAsAdmin(inputId, pinToUse, adminLoginType);
      setLoading(false);

      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setAdminError(res.error || 'Authentication failed. Please verify PIN/Password or use 1234.');
      }
    }, 250);
  };

  // Google One-Tap Admin Sign-In
  const handleAdminGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      const res = StorageService.loginAsAdmin(configuredAdminEmail, '1234', 'google_sso');
      setLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
              V
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>VIKALP</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 uppercase">
                  Portal Login
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Sign in with Gmail or Mobile Number
              </p>
            </div>
          </div>

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700/80 mt-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('volunteer');
                setVolError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'volunteer'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Volunteer Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAdminError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ===================== VOLUNTEER LOGIN ===================== */}
          {activeTab === 'volunteer' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Choose Login Method:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setVolLoginType('gmail');
                      setVolError(null);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      volLoginType === 'gmail'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Gmail / Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVolLoginType('phone');
                      setVolError(null);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      volLoginType === 'phone'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Mobile No.</span>
                  </button>
                </div>
              </div>

              {/* Google One-Tap Quick Sign-In Button */}
              <button
                type="button"
                onClick={handleVolunteerGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs hover:border-slate-400 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google / Gmail</span>
              </button>

              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">or enter details</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Error Message */}
              {volError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{volError}</span>
                </div>
              )}

              <form onSubmit={handleVolunteerSubmit} className="space-y-3">
                {volLoginType === 'gmail' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Volunteer Gmail / Email ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        autoFocus
                        value={volIdentifier}
                        onChange={(e) => {
                          setVolIdentifier(e.target.value);
                          setVolSelectedId('');
                          setVolError(null);
                        }}
                        placeholder="e.g. rahul.sharma@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Volunteer 10-Digit Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        autoFocus
                        maxLength={15}
                        value={volIdentifier}
                        onChange={(e) => {
                          setVolIdentifier(e.target.value);
                          setVolSelectedId('');
                          setVolError(null);
                        }}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Logging In...' : 'Sign In to Volunteer Portal'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick One-Tap Volunteer Select List */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Quick Volunteer Profiles (Click to Demo Login):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {volunteers.slice(0, 6).map((vol) => (
                    <button
                      key={vol.id}
                      type="button"
                      onClick={() => handleQuickVolunteerLogin(vol)}
                      className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 text-left transition group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {vol.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-teal-900">
                            {vol.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono truncate block">
                            {vol.email || vol.phone || vol.year}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md shrink-0">
                        Login &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== ADMIN LOGIN ===================== */}
          {activeTab === 'admin' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Admin Login Method:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLoginType('gmail');
                      setAdminError(null);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      adminLoginType === 'gmail'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Admin Gmail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLoginType('phone');
                      setAdminError(null);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      adminLoginType === 'phone'
                        ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Admin Mobile</span>
                  </button>
                </div>
              </div>

              {/* Google One-Tap Admin Sign-In */}
              <button
                type="button"
                onClick={handleAdminGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs hover:border-slate-400 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Admin Google 1-Tap Sign-In</span>
              </button>

              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">or enter credentials</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Error Message */}
              {adminError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-3">
                {adminLoginType === 'gmail' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Admin Gmail / Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={adminIdentifier}
                        onChange={(e) => {
                          setAdminIdentifier(e.target.value);
                          setAdminError(null);
                        }}
                        placeholder={configuredAdminEmail}
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Admin Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={adminIdentifier}
                        onChange={(e) => {
                          setAdminIdentifier(e.target.value);
                          setAdminError(null);
                        }}
                        placeholder={configuredAdminPhone}
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Admin Passcode / PIN
                    </label>
                    <span className="text-[10px] text-slate-400">Default: 1234</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      maxLength={12}
                      value={adminPin}
                      onChange={(e) => {
                        setAdminPin(e.target.value);
                        setAdminError(null);
                      }}
                      placeholder="••••"
                      className="w-full pl-10 pr-3 py-2.5 text-sm font-mono tracking-widest rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Verifying...' : 'Unlock Admin Portal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPin('1234');
                      const res = StorageService.loginAsAdmin(configuredAdminEmail, '1234', 'pin');
                      if (res.success && res.user) {
                        onAuthSuccess(res.user);
                        onClose();
                      }
                    }}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition shrink-0"
                    title="1-Click Demo Login with default PIN 1234"
                  >
                    Quick 1234
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 text-center text-[11px] text-slate-500">
          Vikalp Duty System &bull; Secure Authentication
        </div>

      </div>
    </div>
  );
};
