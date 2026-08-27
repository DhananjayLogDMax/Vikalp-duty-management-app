import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  Car, 
  PackageCheck, 
  CheckSquare, 
  Square, 
  Layers, 
  ChevronRight,
  Settings2,
  Trash2,
  Plus,
  X,
  CalendarDays,
  Table,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  Volunteer, 
  DutyRecord, 
  VolunteerPointsSummary, 
  DutyType, 
  DayOfWeek,
  AuthUser 
} from '../types';
import { StorageService } from '../services/storage';

interface DashboardViewProps {
  volunteers: Volunteer[];
  dutyRecords: DutyRecord[];
  summaries: VolunteerPointsSummary[];
  currentUser?: AuthUser | null;
  onOpenAuth?: (tab?: 'volunteer' | 'admin') => void;
  onOpenDutyModal: (dutyType: DutyType, preselectedVolunteerIds?: string[]) => void;
  onNavigateToSchedule: () => void;
  onNavigateToPoints: () => void;
  onNavigateToActivityMatrix: () => void;
  onQuickBatchRecord: (volunteerIds: string[], dutyType: DutyType) => void;
  onDataChanged: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  volunteers,
  dutyRecords,
  summaries,
  currentUser,
  onOpenAuth,
  onOpenDutyModal,
  onNavigateToSchedule,
  onNavigateToPoints,
  onNavigateToActivityMatrix,
  onQuickBatchRecord,
  onDataChanged,
}) => {
  const todayStr = StorageService.getTodayDateString();
  const todayDay = StorageService.getDayOfWeekFromDate(todayStr);
  const todayFormatted = StorageService.formatDateFormatted(todayStr);

  const [selectedVolIds, setSelectedVolIds] = useState<string[]>([]);
  const [manageDutyVolunteer, setManageDutyVolunteer] = useState<Volunteer | null>(null);

  // Active volunteers
  const activeVolunteers = volunteers.filter((v) => v.active);

  // Today's scheduled volunteers (those whose dutyDays includes today's DayOfWeek)
  const todayScheduledVolunteers = activeVolunteers.filter((v) => 
    v.dutyDays.includes(todayDay)
  );

  // Duties completed this month (YYYY-MM)
  const currentMonthPrefix = todayStr.substring(0, 7);
  const thisMonthDuties = dutyRecords.filter((d) => d.date.startsWith(currentMonthPrefix));
  const totalMonthPoints = thisMonthDuties.reduce((acc, d) => acc + (typeof d.points === 'number' ? d.points : 0.5), 0);

  // Today's completed duties
  const todayDuties = dutyRecords.filter((d) => d.date === todayStr);

  // Map volunteer ID to their summary
  const summaryMap = new Map<string, VolunteerPointsSummary>();
  summaries.forEach((s) => summaryMap.set(s.volunteerId, s));

  // Current logged in volunteer data if role is volunteer
  const loggedInVolSummary = currentUser?.volunteerId ? summaryMap.get(currentUser.volunteerId) : undefined;
  const loggedInVolObj = currentUser?.volunteerId ? volunteers.find((v) => v.id === currentUser.volunteerId) : undefined;
  const isTodayMyDutyDay = loggedInVolObj ? loggedInVolObj.dutyDays.includes(todayDay) : false;
  const myPickupToday = currentUser?.volunteerId ? todayDuties.find((d) => d.volunteerId === currentUser.volunteerId && d.dutyType === 'Pickup') : undefined;
  const myDropToday = currentUser?.volunteerId ? todayDuties.find((d) => d.volunteerId === currentUser.volunteerId && d.dutyType === 'Drop') : undefined;

  // Today's scheduled volunteers sorted by points (lowest to highest) for fair duty suggestion
  const todayVolunteersWithStats = todayScheduledVolunteers.map((vol) => {
    const summary = summaryMap.get(vol.id);
    const totalPoints = summary ? summary.totalPoints : 0;
    
    // Check what duties this volunteer completed today
    const volTodayDuties = todayDuties.filter((d) => d.volunteerId === vol.id);
    const pickupDuty = volTodayDuties.find((d) => d.dutyType === 'Pickup');
    const dropDuty = volTodayDuties.find((d) => d.dutyType === 'Drop');

    return {
      volunteer: vol,
      totalPoints,
      hasPickupToday: Boolean(pickupDuty),
      hasDropToday: Boolean(dropDuty),
      pickupDuty,
      dropDuty,
      totalDuties: summary ? summary.totalDuties : 0,
      volTodayDuties,
    };
  }).sort((a, b) => a.totalPoints - b.totalPoints);

  // Handle single direct assignment
  const handleAssignSingleDuty = (volunteerId: string, dutyType: DutyType, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = StorageService.assignDuty(volunteerId, todayStr, dutyType, 0.5);
    if (!result.success) {
      alert(`${dutyType} Duty is already assigned for today. No duplicate was created.`);
    }
    onDataChanged();
  };

  // Handle remove duty for today
  const handleRemoveTodayDuty = (volunteerId: string, dutyType: DutyType) => {
    StorageService.removeDuty(volunteerId, todayStr, dutyType);
    onDataChanged();
  };

  const toggleSelect = (id: string) => {
    setSelectedVolIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedVolIds.length === todayScheduledVolunteers.length) {
      setSelectedVolIds([]);
    } else {
      setSelectedVolIds(todayScheduledVolunteers.map((v) => v.id));
    }
  };

  const handleQuickSubmit = (dutyType: DutyType) => {
    if (selectedVolIds.length === 0) return;
    onQuickBatchRecord(selectedVolIds, dutyType);
    setSelectedVolIds([]);
  };

  // Active volunteer in modal
  const activeModalStats = manageDutyVolunteer
    ? todayVolunteersWithStats.find((item) => item.volunteer.id === manageDutyVolunteer.id)
    : null;

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-200" />
              <span>{todayDay}, {todayFormatted}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              VIKALP DUTY MANAGEMENT SYSTEM
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm mt-0.5 font-medium">
              Fair, point-based volunteer pickup & drop duty coordinator
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onNavigateToActivityMatrix}
              id="btn-nav-activity-screen-hero"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-bold shadow-sm transition"
            >
              <Table className="w-4 h-4 text-teal-700" />
              <span>Activity & Points Screen</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-teal-200 uppercase font-bold tracking-wider block">
              Total Volunteers
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white">{volunteers.length}</span>
              <span className="text-[10px] text-teal-200">({activeVolunteers.length} active)</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-teal-200 uppercase font-bold tracking-wider block">
              Today's Scheduled
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-amber-300">
                {todayScheduledVolunteers.length}
              </span>
              <span className="text-[10px] text-teal-200">on duty</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-teal-200 uppercase font-bold tracking-wider block">
              This Month's Duties
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {thisMonthDuties.length}
              </span>
              <span className="text-[10px] text-teal-200">completed</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-teal-200 uppercase font-bold tracking-wider block">
              Points Logged
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-300">
                {totalMonthPoints.toFixed(1)}
              </span>
              <span className="text-[10px] text-teal-200">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Volunteer Portal Card if logged in as Volunteer */}
      {currentUser?.role === 'volunteer' && loggedInVolObj && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-teal-800/40 relative overflow-hidden animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  Volunteer Portal &bull; {loggedInVolObj.year}
                </span>
                {currentUser.email && (
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {currentUser.email}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Welcome back, {currentUser.name}!
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                <span>My 3 Assigned Days:</span>
                <div className="flex items-center gap-1">
                  {loggedInVolObj.dutyDays.map((day) => {
                    const isDayToday = day === todayDay;
                    return (
                      <span
                        key={day}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                          isDayToday
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {day.substring(0, 3)} {isDayToday && '★ (Today)'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Self-Mark Duty for Today */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 bg-white/10 p-2.5 rounded-2xl border border-white/10">
              <div className="text-left sm:text-right pr-2">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">
                  My Duty Status Today ({todayDay})
                </span>
                <span className="text-xs font-bold text-white block">
                  {myPickupToday && myDropToday
                    ? 'Both Duties Completed! 🎉'
                    : myPickupToday
                    ? 'Pickup Done ✓'
                    : myDropToday
                    ? 'Drop Done ✓'
                    : isTodayMyDutyDay
                    ? 'Scheduled Shift Ready'
                    : 'Not scheduled today'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAssignSingleDuty(loggedInVolObj.id, 'Pickup')}
                  disabled={Boolean(myPickupToday)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    myPickupToday
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {myPickupToday ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{myPickupToday ? 'Pickup Done (+0.5)' : 'Mark My Pickup (+0.5)'}</span>
                </button>

                <button
                  onClick={() => handleAssignSingleDuty(loggedInVolObj.id, 'Drop')}
                  disabled={Boolean(myDropToday)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    myDropToday
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {myDropToday ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{myDropToday ? 'Drop Done (+0.5)' : 'Mark My Drop (+0.5)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Notice */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                Sign in with your Gmail or Mobile Number
              </span>
              <p className="text-xs text-slate-600">
                Log in as a Volunteer to check your assigned schedule and points, or Admin to manage system records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAuth?.('volunteer')}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Volunteer Sign In
            </button>
            <button
              onClick={() => onOpenAuth?.('admin')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}

      {/* TWO LARGE PRIMARY DUTY BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* PICKUP BUTTON */}
        <button
          onClick={() => {
            if (selectedVolIds.length > 0) {
              onQuickBatchRecord(selectedVolIds, 'Pickup');
              setSelectedVolIds([]);
            } else {
              onOpenDutyModal('Pickup');
            }
          }}
          id="btn-record-pickup-hero"
          className="group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-md shadow-emerald-700/20 transition-all flex items-center justify-between min-h-[76px] cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {selectedVolIds.length > 0 ? `ASSIGN PICKUP (${selectedVolIds.length})` : 'PICKUP DUTY'}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-800/60 text-emerald-100">
                  +0.5 pts
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {selectedVolIds.length > 0
                  ? `Assign pickup duty only to ${selectedVolIds.length} selected volunteer(s)`
                  : 'Record morning / arrival pickup duties'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-emerald-200 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* DROP BUTTON */}
        <button
          onClick={() => {
            if (selectedVolIds.length > 0) {
              onQuickBatchRecord(selectedVolIds, 'Drop');
              setSelectedVolIds([]);
            } else {
              onOpenDutyModal('Drop');
            }
          }}
          id="btn-record-drop-hero"
          className="group relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl p-4 sm:p-5 shadow-md shadow-indigo-700/20 transition-all flex items-center justify-between min-h-[76px] cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {selectedVolIds.length > 0 ? `ASSIGN DROP (${selectedVolIds.length})` : 'DROP DUTY'}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-800/60 text-indigo-100">
                  +0.5 pts
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                {selectedVolIds.length > 0
                  ? `Assign drop duty only to ${selectedVolIds.length} selected volunteer(s)`
                  : 'Record evening / departure drop duties'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-indigo-200 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>

      {/* Fair Duty Suggestion Banner */}
      {todayVolunteersWithStats.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 sm:p-3.5 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-900 block">
              Fair Allocation Recommended for Today ({todayDay}):
            </span>
            <p className="text-amber-800 mt-0.5">
              Volunteers with fewest points today:{' '}
              {todayVolunteersWithStats.slice(0, 3).map((item, idx) => (
                <span key={item.volunteer.id} className="font-bold">
                  {item.volunteer.name} ({item.totalPoints} pts)
                  {idx < Math.min(2, todayVolunteersWithStats.length - 1) ? ', ' : ''}
                </span>
              ))}
              . Assign duties to them first to keep points balanced.
            </p>
          </div>
        </div>
      )}

      {/* TODAY'S VOLUNTEERS SECTION (State Management & Uniqueness Rules) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base">
                Today's Volunteers ({todayDay})
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                {todayScheduledVolunteers.length} Assigned
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any volunteer to assign duty or open "Manage Today's Duty". Single record per shift guaranteed.
            </p>
          </div>

          {todayScheduledVolunteers.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                id="btn-dashboard-select-all"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
              >
                {selectedVolIds.length === todayScheduledVolunteers.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>
          )}
        </div>

        {/* Volunteer List */}
        <div className="p-3 sm:p-4 divide-y divide-slate-100">
          {todayScheduledVolunteers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No volunteers scheduled for {todayDay}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Check the schedule or add duty days in the Volunteers section.
              </p>
              <button
                onClick={onNavigateToSchedule}
                className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-800 underline inline-flex items-center gap-1"
              >
                View Full Weekly Schedule <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {todayVolunteersWithStats.map((item) => {
                const { volunteer, totalPoints, hasPickupToday, hasDropToday } = item;
                const isSelected = selectedVolIds.includes(volunteer.id);
                const hasAnyDuty = hasPickupToday || hasDropToday;

                return (
                  <div
                    key={volunteer.id}
                    id={`volunteer-card-${volunteer.id}`}
                    onClick={() => {
                      if (hasAnyDuty) {
                        setManageDutyVolunteer(volunteer);
                      } else {
                        toggleSelect(volunteer.id);
                      }
                    }}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 shadow-xs ring-1 ring-teal-500'
                        : hasAnyDuty
                        ? 'bg-slate-50/70 border-slate-300 hover:border-teal-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(volunteer.id);
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* Volunteer Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {volunteer.name}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              volunteer.year === '1st Year'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : volunteer.year === '2nd Year'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : volunteer.year === '3rd Year'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : volunteer.year === '4th Year'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : volunteer.year === '5th Year'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {volunteer.year}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                              🏆 {totalPoints.toFixed(1)} Points
                            </span>

                            {volunteer.rollNumber && (
                              <span className="text-[11px] text-slate-500 truncate hidden xs:inline">
                                {volunteer.rollNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Manage Button if already assigned */}
                      {hasAnyDuty && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManageDutyVolunteer(volunteer);
                          }}
                          title="Open Manage Today's Duty"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-200/60 transition"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Today's Duty Status & Assignment Controls */}
                    <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2">
                      {!hasAnyDuty ? (
                        /* NO DUTY TODAY -> SHOW "Assign Duty" (Pickup / Drop) */
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                            Assign:
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleAssignSingleDuty(volunteer.id, 'Pickup', e)}
                            className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1 transition"
                          >
                            <Car className="w-3.5 h-3.5" />
                            <span>+ Pickup</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAssignSingleDuty(volunteer.id, 'Drop', e)}
                            className="flex-1 py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1 transition"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>+ Drop</span>
                          </button>
                        </div>
                      ) : (
                        /* ALREADY ASSIGNED TODAY -> SHOW "Pickup Assigned" / "Drop Assigned" */
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            {hasPickupToday && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Pickup Assigned
                              </span>
                            )}
                            {hasDropToday && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> Drop Assigned
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManageDutyVolunteer(volunteer);
                            }}
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                          >
                            Manage Duty →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Batch Action Bar when volunteers are selected */}
        {selectedVolIds.length > 0 && (
          <div className="p-3.5 bg-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-center sm:text-left">
              <span className="px-2 py-0.5 rounded bg-teal-800 text-teal-200 font-bold">
                {selectedVolIds.length} Selected
              </span>
              <span>Record duty for selected volunteers:</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleQuickSubmit('Pickup')}
                id="btn-batch-pickup"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <Car className="w-3.5 h-3.5" />
                <span>+0.5 Pickup</span>
              </button>

              <button
                onClick={() => handleQuickSubmit('Drop')}
                id="btn-batch-drop"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>+0.5 Drop</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation Footer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <button
          onClick={onNavigateToActivityMatrix}
          id="card-nav-activity-matrix"
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
              📊 Activity & Points Screen
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Excel-style full monthly date matrix & point editor
          </p>
        </button>

        <button
          onClick={onNavigateToSchedule}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
              📅 Weekly Schedule
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            View 7-day volunteer shifts & groups
          </p>
        </button>

        <button
          onClick={onNavigateToPoints}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
              🏆 Points & Ranking
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Fair distribution & contributor ranks
          </p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MANAGE TODAY'S DUTY MODAL (On clicking already-assigned volunteer) */}
      {/* ========================================================================= */}
      {manageDutyVolunteer && activeModalStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300 block">
                  Today's Shift Management
                </span>
                <h3 className="text-base font-black text-white">
                  Manage Today's Duty: {manageDutyVolunteer.name}
                </h3>
                <span className="text-xs text-slate-300">
                  {todayDay}, {todayFormatted} ({manageDutyVolunteer.year})
                </span>
              </div>

              <button
                onClick={() => setManageDutyVolunteer(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Pickup Duty Row */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Pickup Duty
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {activeModalStats.hasPickupToday ? (
                        <strong className="text-emerald-700 font-bold">Assigned (+0.5 pts)</strong>
                      ) : (
                        'Not Assigned'
                      )}
                    </span>
                  </div>
                </div>

                {activeModalStats.hasPickupToday ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveTodayDuty(manageDutyVolunteer.id, 'Pickup')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAssignSingleDuty(manageDutyVolunteer.id, 'Pickup')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                )}
              </div>

              {/* Drop Duty Row */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Drop Duty
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {activeModalStats.hasDropToday ? (
                        <strong className="text-indigo-700 font-bold">Assigned (+0.5 pts)</strong>
                      ) : (
                        'Not Assigned'
                      )}
                    </span>
                  </div>
                </div>

                {activeModalStats.hasDropToday ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveTodayDuty(manageDutyVolunteer.id, 'Drop')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAssignSingleDuty(manageDutyVolunteer.id, 'Drop')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                )}
              </div>

              {/* Note on automatic point reversal */}
              <p className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg">
                ℹ️ Removing a duty deletes only today's duty record and automatically reverses the corresponding points.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setManageDutyVolunteer(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
