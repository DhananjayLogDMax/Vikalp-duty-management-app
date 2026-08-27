import React, { useState } from 'react';
import { 
  Settings, 
  FileSpreadsheet, 
  Lock, 
  Key, 
  RefreshCw, 
  Download, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink,
  Shield,
  X,
  AlertCircle,
  Image as ImageIcon,
  UserPlus,
  Trash2,
  Edit2,
  Users,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  Award,
  GraduationCap
} from 'lucide-react';
import { AppSettings, Volunteer, DutyRecord, AdminUser, LogoPresetType } from '../types';
import { StorageService } from '../services/storage';
import { AppLogo } from './AppLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onSyncGoogleSheets: () => Promise<void>;
  onResetData: () => void;
  isSyncing: boolean;
  volunteers: Volunteer[];
  dutyRecords: DutyRecord[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSyncGoogleSheets,
  onResetData,
  isSyncing,
  volunteers,
  dutyRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'admins' | 'sheets' | 'data'>('branding');
  
  // Branding state
  const [appName, setAppName] = useState(settings.applicationName || 'Vikalp Duty Management System');
  const [logoType, setLogoType] = useState<'default' | 'image' | 'preset'>(settings.appLogoType || 'default');
  const [logoUrl, setLogoUrl] = useState(settings.appLogoUrl || '');
  const [logoPreset, setLogoPreset] = useState<LogoPresetType>(settings.appLogoPreset || 'default_v');

  // Admins state
  const [adminsList, setAdminsList] = useState<AdminUser[]>(() => StorageService.getAdmins());
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('1234');
  const [newAdminRole, setNewAdminRole] = useState('Duty Admin');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Sheets & General state
  const [scriptUrl, setScriptUrl] = useState(settings.googleAppsScriptUrl || '');
  const [globalAdminPin, setGlobalAdminPin] = useState(settings.adminPin || '1234');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Custom Logo Upload Handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);
      setLogoType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) {
      setAdminError('Please provide the administrator name.');
      return;
    }
    if (!newAdminEmail.trim() && !newAdminPhone.trim()) {
      setAdminError('Please provide either an Email address or Mobile number for authentication.');
      return;
    }

    const newAdmin = StorageService.addAdmin({
      name: newAdminName.trim(),
      email: newAdminEmail.trim() || undefined,
      phone: newAdminPhone.trim() || undefined,
      pin: newAdminPin.trim() || '1234',
      roleTitle: newAdminRole.trim() || 'Duty Admin',
    });

    setAdminsList(StorageService.getAdmins());
    setShowAddAdmin(false);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPhone('');
    setNewAdminPin('1234');
    setNewAdminRole('Duty Admin');
    setAdminError(null);
    setSaveMessage(`Administrator "${newAdmin.name}" added successfully!`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (confirm(`Remove administrator "${name}"?`)) {
      const res = StorageService.deleteAdmin(id);
      if (!res.success) {
        alert(res.error || 'Cannot delete admin');
        return;
      }
      setAdminsList(StorageService.getAdmins());
      setSaveMessage(`Administrator "${name}" removed.`);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCopyScriptCode = () => {
    const code = StorageService.generateGoogleAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveAll = () => {
    const updated: AppSettings = {
      ...settings,
      applicationName: appName.trim() || 'Vikalp Duty Management System',
      appLogoType: logoType,
      appLogoUrl: logoUrl.trim() || undefined,
      appLogoPreset: logoPreset,
      googleAppsScriptUrl: scriptUrl.trim(),
      adminPin: globalAdminPin.trim() || '1234',
      admins: adminsList,
    };
    onSaveSettings(updated);
    StorageService.saveAdmins(adminsList);
    setSaveMessage('All settings & branding saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDownloadJSON = () => {
    const data = {
      volunteers,
      dutyRecords,
      settings: {
        ...settings,
        applicationName: appName,
        appLogoType: logoType,
        appLogoUrl: logoUrl,
        appLogoPreset: logoPreset,
        admins: adminsList,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vikalp_Duty_Backup_${StorageService.getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.volunteers && Array.isArray(parsed.volunteers)) {
          StorageService.saveVolunteers(parsed.volunteers);
        }
        if (parsed.dutyRecords && Array.isArray(parsed.dutyRecords)) {
          StorageService.saveDutyRecords(parsed.dutyRecords);
        }
        if (parsed.settings) {
          StorageService.saveSettings(parsed.settings);
        }
        alert('Data imported successfully! Page will refresh.');
        window.location.reload();
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const previewSettings: AppSettings = {
    ...settings,
    applicationName: appName,
    appLogoType: logoType,
    appLogoUrl: logoUrl,
    appLogoPreset: logoPreset,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                System & Admin Settings
              </h3>
              <p className="text-xs text-slate-500">
                App Logo, Multiple Admins, Google Sheets & Data Backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 my-3">
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo & Brand</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admins ({adminsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'data'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Data Backup</span>
          </button>
        </div>

        {saveMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* 1. APP LOGO & BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-4 text-xs">
              {/* Header */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800">Customize Application Logo</h4>
                  <p className="text-slate-500 mt-0.5">
                    Upload your organization's logo image or select from high-contrast preset badges.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-xl border border-slate-200">
                  <AppLogo settings={previewSettings} size="lg" />
                  <div className="text-left hidden xs:block">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Preview</span>
                    <span className="text-xs font-bold text-slate-800">{appName.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              {/* App Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Application Title / Organization Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Vikalp Duty Management System"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Logo Choice: Upload vs Preset */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">
                  Select Logo Source:
                </label>

                {/* Option A: Preset Icons */}
                <div className="space-y-2">
                  <span className="text-slate-500 font-medium block">
                    Choose from Preset Identity Badges:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'default_v', label: 'Teal V', icon: <span className="font-black text-sm">V</span>, bg: 'bg-teal-700 text-white' },
                      { id: 'helping_hands', label: 'Volunteers', icon: <HeartHandshake className="w-4 h-4" />, bg: 'bg-emerald-600 text-white' },
                      { id: 'shield_guard', label: 'Duty Guard', icon: <Shield className="w-4 h-4" />, bg: 'bg-indigo-600 text-white' },
                      { id: 'star_trophy', label: 'Points Star', icon: <Award className="w-4 h-4" />, bg: 'bg-amber-500 text-white' },
                      { id: 'academic_cap', label: 'College/Uni', icon: <GraduationCap className="w-4 h-4" />, bg: 'bg-sky-600 text-white' },
                      { id: 'heart_hands', label: 'Care Spark', icon: <Sparkles className="w-4 h-4" />, bg: 'bg-rose-500 text-white' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLogoType('preset');
                          setLogoPreset(item.id as LogoPresetType);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          logoType === 'preset' && logoPreset === item.id
                            ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs ${item.bg}`}>
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 text-center leading-tight truncate w-full">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option B: Custom Image Upload / URL */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block">
                    Or Upload Custom Logo Image:
                  </span>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="px-4 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-xl font-bold text-xs text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4 text-teal-600" />
                      <span>Upload Logo File (PNG/JPG/SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    <span className="text-slate-400 text-center text-[11px]">or</span>

                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => {
                        setLogoUrl(e.target.value);
                        if (e.target.value) setLogoType('image');
                      }}
                      placeholder="Paste Image URL (https://...)"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {logoType === 'image' && logoUrl && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Custom image loaded
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoType('default');
                          setLogoUrl('');
                        }}
                        className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove & Reset to Default
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. MULTIPLE ADMINS MANAGEMENT */}
          {activeTab === 'admins' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-bold text-slate-800">
                    Administrator Accounts & Powers
                  </h4>
                  <p className="text-slate-500">
                    Multiple admins can manage past duties, volunteers, and settings using their Gmail or Mobile number.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAdmin(!showAddAdmin)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Admin</span>
                </button>
              </div>

              {/* Add Admin Form Drawer */}
              {showAddAdmin && (
                <form onSubmit={handleAddAdmin} className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-teal-700" />
                      Add New Administrator
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAddAdmin(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {adminError && (
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                      {adminError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Admin Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                        placeholder="e.g. Duty Incharge / Faculty"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Admin Gmail / Email
                      </label>
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin2@vikalp.org"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Admin Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={newAdminPhone}
                        onChange={(e) => setNewAdminPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Security PIN Passcode
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={newAdminPin}
                        onChange={(e) => setNewAdminPin(e.target.value)}
                        placeholder="1234"
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-200">
                    <button
                      type="button"
                      onClick={() => setShowAddAdmin(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                    >
                      Save Admin Account
                    </button>
                  </div>
                </form>
              )}

              {/* List of Admins */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {adminsList.map((adm) => (
                  <div key={adm.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {adm.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {adm.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {adm.roleTitle || 'Admin'}
                          </span>
                          {adm.isPrimary && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {adm.email && <span>✉️ {adm.email}</span>}
                          {adm.phone && <span>📱 {adm.phone}</span>}
                          <span>🔑 PIN: ••••</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {adminsList.length > 1 && !adm.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                          title="Remove Administrator"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Master Global PIN */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  Master Admin Fallback PIN (Default: 1234)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={globalAdminPin}
                  onChange={(e) => setGlobalAdminPin(e.target.value)}
                  placeholder="1234"
                  className="w-full max-w-xs px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Used as system fallback for quick verification across any admin terminal.
                </span>
              </div>
            </div>
          )}

          {/* 3. GOOGLE SHEETS INTEGRATION */}
          {activeTab === 'sheets' && (
            <div className="space-y-4 text-xs">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 text-teal-900 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                  <span>Free Google Sheets Database Connection</span>
                </div>
                <p className="text-teal-800">
                  Connect your Google Sheet to store volunteer duty logs in real-time for FREE. The app automatically creates 4 sheets:
                  <strong> Volunteers, Duty Records, Points, and Settings</strong>.
                </p>
              </div>

              {/* Step by step guide */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800">
                  Quick 2-Minute Setup Steps:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>Create a new blank Google Sheet at <strong>sheets.google.com</strong>.</li>
                  <li>Click <strong>Extensions &gt; Apps Script</strong> in the menu.</li>
                  <li>
                    Click the button below to copy the Apps Script code, then paste it in the editor.
                  </li>
                  <li>
                    Click <strong>Deploy &gt; New deployment &gt; Select type: Web app</strong>.
                  </li>
                  <li>
                    Set <em>Execute as: "Me"</em> and <em>Who has access: "Anyone"</em>.
                  </li>
                  <li>Click Deploy, copy the Web App URL, and paste it in the box below!</li>
                </ol>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyScriptCode}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Apps Script Code Copied!' : 'Copy Google Apps Script Code'}</span>
                  </button>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Sync Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSyncGoogleSheets}
                  disabled={isSyncing || !scriptUrl}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer ${
                    scriptUrl
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync All Data to Sheets Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. DATA BACKUP & RESET */}
          {activeTab === 'data' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-800">
                  Offline Local Persistence & Backup
                </h4>
                <p className="text-slate-600">
                  All volunteer profiles, administrators, and duty records are securely persisted in your browser and automatically synchronized with Google Sheets when configured.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Download Backup JSON</span>
                    <span className="text-[11px] text-slate-500">Save full data to your device</span>
                  </div>
                </button>

                <label className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition text-left flex items-center gap-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Import Backup JSON</span>
                    <span className="text-[11px] text-slate-500">Restore from previously saved file</span>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <h5 className="font-bold text-slate-800 mb-1">Reset to Sample Volunteers</h5>
                <p className="text-slate-500 mb-2">
                  Restore default sample data (Rahul, Aman, Priya, Rohit, Neha, Ankit) with August duty records.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset all data to default sample records? Current custom records will be overwritten.')) {
                      onResetData();
                      setAdminsList(StorageService.getAdmins());
                      setSaveMessage('Data reset to sample volunteers and default admins!');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sample Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};
