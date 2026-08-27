import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  Volunteer, 
  DutyRecord, 
  AppSettings, 
  DutyType, 
  DayOfWeek,
  AuthUser 
} from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ActivityPointsMatrixView } from './components/ActivityPointsMatrixView';
import { ScheduleView } from './components/ScheduleView';
import { DutyRecordingView } from './components/DutyRecordingView';
import { PointsRankingView } from './components/PointsRankingView';
import { RecordsView } from './components/RecordsView';
import { VolunteersView } from './components/VolunteersView';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import { AuthModal } from './components/AuthModal';
import { Check, Info, AlertTriangle } from 'lucide-react';

export default function App() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [dutyRecords, setDutyRecords] = useState<DutyRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(StorageService.getCurrentUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(StorageService.getIsAdminLoggedIn());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'volunteer' | 'admin'>('volunteer');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Duty recording initial preselection (when navigating from other views)
  const [dutyPreselect, setDutyPreselect] = useState<{
    dutyType: DutyType;
    date?: string;
    volunteerIds?: string[];
  }>({
    dutyType: 'Pickup',
    date: StorageService.getTodayDateString(),
    volunteerIds: [],
  });

  // Load data on mount
  const refreshData = () => {
    const vols = StorageService.getVolunteers();
    const duties = StorageService.getDutyRecords();
    const setts = StorageService.getSettings();
    const user = StorageService.getCurrentUser();
    setVolunteers(vols);
    setDutyRecords(duties);
    setSettings(setts);
    setCurrentUser(user);
    setIsAdmin(user?.role === 'admin' || StorageService.getIsAdminLoggedIn());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Point summaries dynamically calculated from duty records
  const summaries = StorageService.getVolunteerSummaries(volunteers, dutyRecords);
  const loggedInSummary = currentUser?.volunteerId 
    ? summaries.find((s) => s.volunteerId === currentUser.volunteerId) 
    : undefined;

  // Handlers
  const handleOpenAuth = (initialTab: 'volunteer' | 'admin' = 'volunteer') => {
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAdmin(user.role === 'admin');
    refreshData();
    if (user.role === 'admin') {
      showToast('Admin Portal unlocked with full privileges!', 'success');
    } else {
      showToast(`Welcome back, ${user.name}! Logged in successfully.`, 'success');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    refreshData();
    showToast('Signed out successfully.', 'info');
  };

  const handleOpenDutyWithConfig = (dutyType: DutyType, preselectedVolunteerIds?: string[]) => {
    setDutyPreselect({
      dutyType,
      date: StorageService.getTodayDateString(),
      volunteerIds: preselectedVolunteerIds || [],
    });
    setActiveTab('duty');
  };

  const handleOpenDutyForDay = (day: DayOfWeek, dutyType: DutyType) => {
    const todayStr = StorageService.getTodayDateString();
    setDutyPreselect({
      dutyType,
      date: todayStr,
      volunteerIds: [],
    });
    setActiveTab('duty');
  };

  const handleQuickBatchRecord = (volunteerIds: string[], dutyType: DutyType) => {
    const todayStr = StorageService.getTodayDateString();
    const result = StorageService.recordDutyBatch(volunteerIds, todayStr, dutyType);
    refreshData();
    showToast(
      `${result.count} volunteer${result.count > 1 ? 's' : ''} recorded for ${dutyType}! +${(result.count * 0.5).toFixed(1)} pts added.`,
      'success'
    );
  };

  const handleDutySubmitSuccess = (count: number, dutyType: DutyType, points: number) => {
    refreshData();
    showToast(`${count} ${dutyType} record${count > 1 ? 's' : ''} saved! +${points.toFixed(1)} pts distributed.`, 'success');
  };

  const handleAddVolunteer = (data: Omit<Volunteer, 'id' | 'createdAt'>) => {
    const newVol = StorageService.addVolunteer(data);
    refreshData();
    showToast(`Volunteer ${newVol.name} added successfully!`, 'success');
  };

  const handleUpdateVolunteer = (id: string, updates: Partial<Omit<Volunteer, 'id' | 'createdAt'>>) => {
    StorageService.updateVolunteer(id, updates);
    refreshData();
    showToast('Volunteer profile updated!', 'success');
  };

  const handleDeleteVolunteer = (id: string) => {
    StorageService.deleteVolunteer(id);
    refreshData();
    showToast('Volunteer removed. Historical duty records preserved.', 'info');
  };

  const handleDeleteDuty = (recordId: string) => {
    StorageService.deleteDutyRecord(recordId);
    refreshData();
    showToast('Duty record deleted. Points updated.', 'info');
  };

  const handleUpdateDuty = (
    recordId: string,
    updates: {
      volunteerId?: string;
      dutyType?: DutyType;
      date?: string;
      notes?: string;
    }
  ) => {
    const updated = StorageService.updateDutyRecord(recordId, updates);
    refreshData();
    if (updated) {
      showToast(`Duty record updated successfully for ${updated.volunteerName}!`, 'success');
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Settings saved successfully!', 'success');
  };

  const handleSyncGoogleSheets = async () => {
    if (!settings.googleAppsScriptUrl) {
      setIsSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const res = await StorageService.syncWithGoogleSheets(settings.googleAppsScriptUrl);
      if (res.success) {
        showToast('Google Sheets synchronized successfully!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast('Error syncing with Google Sheets', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    refreshData();
    showToast('Data reset to sample volunteers and records!', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        isAdmin={isAdmin}
        currentUser={currentUser}
        userSummary={loggedInSummary}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenGoogleSheets={() => setIsSettingsOpen(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSync={handleSyncGoogleSheets}
        isSyncing={isSyncing}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 max-w-sm w-[90%] text-center justify-center backdrop-blur-md bg-white/95 border-slate-200">
          {toastMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-teal-600 shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span className="text-slate-800">{toastMessage.text}</span>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 safe-bottom-padding">
        {activeTab === 'dashboard' && (
          <DashboardView
            volunteers={volunteers}
            dutyRecords={dutyRecords}
            summaries={summaries}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onOpenDutyModal={handleOpenDutyWithConfig}
            onNavigateToSchedule={() => setActiveTab('schedule')}
            onNavigateToPoints={() => setActiveTab('points')}
            onNavigateToActivityMatrix={() => setActiveTab('activity_matrix')}
            onQuickBatchRecord={handleQuickBatchRecord}
            onDataChanged={refreshData}
          />
        )}

        {activeTab === 'activity_matrix' && (
          <ActivityPointsMatrixView
            volunteers={volunteers}
            dutyRecords={dutyRecords}
            summaries={summaries}
            onDataChanged={refreshData}
            isAdmin={isAdmin}
            onRequireAdmin={() => handleOpenAuth('admin')}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            volunteers={volunteers}
            summaries={summaries}
            onOpenDutyModalForDay={handleOpenDutyForDay}
          />
        )}

        {activeTab === 'duty' && (
          <DutyRecordingView
            volunteers={volunteers}
            dutyRecords={dutyRecords}
            summaries={summaries}
            initialDutyType={dutyPreselect.dutyType}
            initialDate={dutyPreselect.date}
            initialSelectedVolunteerIds={dutyPreselect.volunteerIds}
            isAdmin={isAdmin}
            currentUser={currentUser}
            onRequireAdmin={() => handleOpenAuth('admin')}
            onSubmitSuccess={handleDutySubmitSuccess}
          />
        )}

        {activeTab === 'points' && (
          <PointsRankingView
            volunteers={volunteers}
            dutyRecords={dutyRecords}
            summaries={summaries}
            onOpenDutyForVolunteer={(volId) => {
              setDutyPreselect({
                dutyType: 'Pickup',
                date: StorageService.getTodayDateString(),
                volunteerIds: [volId],
              });
              setActiveTab('duty');
            }}
          />
        )}

        {activeTab === 'records' && (
          <RecordsView
            volunteers={volunteers}
            dutyRecords={dutyRecords}
            summaries={summaries}
            isAdmin={isAdmin}
            onRequireAdmin={() => handleOpenAuth('admin')}
            onDeleteDuty={handleDeleteDuty}
            onUpdateDuty={handleUpdateDuty}
            onOpenRecordDutyForDate={(dateStr) => {
              setDutyPreselect({
                dutyType: 'Pickup',
                date: dateStr,
                volunteerIds: [],
              });
              setActiveTab('duty');
            }}
          />
        )}

        {activeTab === 'volunteers' && (
          <VolunteersView
            volunteers={volunteers}
            summaries={summaries}
            onAddVolunteer={handleAddVolunteer}
            onUpdateVolunteer={handleUpdateVolunteer}
            onDeleteVolunteer={handleDeleteVolunteer}
            onDataChanged={refreshData}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenQuickDuty={() => {
          setDutyPreselect({
            dutyType: 'Pickup',
            date: StorageService.getTodayDateString(),
            volunteerIds: [],
          });
          setActiveTab('duty');
        }}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onSyncGoogleSheets={handleSyncGoogleSheets}
        onResetData={handleResetData}
        isSyncing={isSyncing}
        volunteers={volunteers}
        dutyRecords={dutyRecords}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => {
          setIsGuideOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Unified Auth Modal (Gmail / Mobile Number for Volunteers and Admin) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        volunteers={volunteers}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

