import React, { useState } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Car, 
  PackageCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Users, 
  Info,
  Check,
  RotateCcw,
  Lock,
  Shield,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Volunteer, 
  DutyRecord, 
  VolunteerPointsSummary, 
  DutyType, 
  DayOfWeek,
  VolunteerGroup,
  AuthUser
} from '../types';
import { StorageService } from '../services/storage';

interface DutyRecordingViewProps {
  volunteers: Volunteer[];
  dutyRecords: DutyRecord[];
  summaries: VolunteerPointsSummary[];
  initialDutyType?: DutyType;
  initialDate?: string;
  initialSelectedVolunteerIds?: string[];
  isAdmin?: boolean;
  currentUser?: AuthUser | null;
  onRequireAdmin?: () => void;
  onSubmitSuccess: (count: number, dutyType: DutyType, pointsAdded: number) => void;
}

export const DutyRecordingView: React.FC<DutyRecordingViewProps> = ({
  volunteers,
  dutyRecords,
  summaries,
  initialDutyType = 'Pickup',
  initialDate,
  initialSelectedVolunteerIds = [],
  isAdmin = false,
  currentUser,
  onRequireAdmin,
  onSubmitSuccess,
}) => {
  const todayStr = StorageService.getTodayDateString();
  const [date, setDate] = useState<string>(initialDate || todayStr);
  const [dutyType, setDutyType] = useState<DutyType>(initialDutyType);
  const [selectedVolIds, setSelectedVolIds] = useState<string[]>(initialSelectedVolunteerIds);
  const [showAllVolunteers, setShowAllVolunteers] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<VolunteerGroup | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [duplicateWarningVols, setDuplicateWarningVols] = useState<string[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Check if selected date is in the past
  const isPastDate = StorageService.isDatePast(date);
  const isPastBlocked = isPastDate && !isAdmin;

  // Update day of week based on selected date
  const dayOfWeek = StorageService.getDayOfWeekFromDate(date);
  const formattedDate = StorageService.formatDateFormatted(date);

  // Active volunteers
  const activeVolunteers = volunteers.filter((v) => v.active);

  // Scheduled volunteers for selected date's day of week
  const scheduledVolunteers = activeVolunteers.filter((v) => 
    v.dutyDays.includes(dayOfWeek)
  );

  // Volunteers to show (either scheduled only or all active volunteers)
  const baseVolunteers = showAllVolunteers ? activeVolunteers : scheduledVolunteers;

  // Map volunteer ID to summaries
  const summaryMap = new Map<string, VolunteerPointsSummary>();
  summaries.forEach((s) => summaryMap.set(s.volunteerId, s));

  // Filter and sort by points ascending (fair allocation)
  const displayedVolunteers = baseVolunteers
    .filter((v) => {
      const matchesGroup = selectedGroup === 'All' || v.year === selectedGroup;
      const matchesSearch = searchQuery.trim() === '' || 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.rollNumber && v.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesGroup && matchesSearch;
    })
    .map((v) => {
      const summary = summaryMap.get(v.id);
      const points = summary ? summary.totalPoints : 0;
      
      // Check if already has a record for this date and duty type
      const isDuplicate = StorageService.checkDuplicateDuty(v.id, date, dutyType, dutyRecords);
      const isScheduledForDay = v.dutyDays.includes(dayOfWeek);

      return {
        volunteer: v,
        points,
        isDuplicate: Boolean(isDuplicate),
        isScheduledForDay,
      };
    })
    .sort((a, b) => a.points - b.points);

  // Toggle selection
  const toggleVolunteer = (id: string) => {
    setSelectedVolIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllDisplayed = () => {
    if (selectedVolIds.length === displayedVolunteers.length && displayedVolunteers.length > 0) {
      setSelectedVolIds([]);
    } else {
      setSelectedVolIds(displayedVolunteers.map((d) => d.volunteer.id));
    }
  };

  const handleDutyTypeChange = (newType: DutyType) => {
    setDutyType(newType);
    setDuplicateWarningVols([]);
    setAllowDuplicates(false);
  };

  // Submit action with duplicate & past date check
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVolIds.length === 0) return;

    // Enforce past date security: volunteers can only mark for today
    if (isPastDate && !isAdmin) {
      if (onRequireAdmin) {
        onRequireAdmin();
      }
      return;
    }

    // Check duplicates among selected
    const duplicates: string[] = [];
    selectedVolIds.forEach((id) => {
      const isDup = StorageService.checkDuplicateDuty(id, date, dutyType, dutyRecords);
      if (isDup) {
        const v = volunteers.find((vol) => vol.id === id);
        if (v) duplicates.push(v.name);
      }
    });

    if (duplicates.length > 0 && !allowDuplicates) {
      setDuplicateWarningVols(duplicates);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = StorageService.recordDutyBatch(selectedVolIds, date, dutyType);
      
      // Fire confetti effect
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore if not supported
      }

      const pointsEarned = result.count * 0.5;
      const message = `${result.count} volunteer${result.count > 1 ? 's' : ''} recorded successfully. +0.5 points added to each.`;
      
      setSuccessBanner(message);
      setSelectedVolIds([]);
      setDuplicateWarningVols([]);
      setAllowDuplicates(false);

      onSubmitSuccess(result.count, dutyType, pointsEarned);

      setTimeout(() => {
        setSuccessBanner(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Record Volunteer Duty
            </h1>
          </div>

          {/* Admin Authority Badge */}
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              Admin Mode (All Dates Unlocked)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Volunteer Mode (Present Day Only)
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Mark volunteer attendance for pickup or drop. Each duty awards +0.5 points automatically.
        </p>

        {/* Past Date Restriction Alert (If non-admin picked a past date) */}
        {isPastBlocked && (
          <div className="mt-3.5 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Past Day Duty Modification Restricted
                </h4>
                <p className="text-xs text-amber-900 mt-0.5">
                  Volunteers can only assign or record duties for the <strong>present day (today)</strong>. Modifying or recording past day records is strictly reserved for Administrators.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Reset to Today's Date ({todayStr})
              </button>
              {onRequireAdmin && (
                <button
                  type="button"
                  onClick={onRequireAdmin}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Sign in as Admin
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form Controls: Date & Duty Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Date Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Select Duty Date
              </label>
              {!isAdmin && (
                <span className="text-[10px] text-slate-400 font-medium">
                  (Today: {todayStr})
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                value={date}
                max={!isAdmin ? todayStr : undefined}
                onChange={(e) => {
                  setDate(e.target.value);
                  setDuplicateWarningVols([]);
                  setAllowDuplicates(false);
                }}
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white ${
                  isPastBlocked ? 'border-amber-400 bg-amber-50/50 text-amber-950' : 'border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-teal-700 font-bold">
                🗓️ {dayOfWeek}, {formattedDate}
              </span>
              {date === todayStr && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Duty Type Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Duty Type (+0.5 Pts)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDutyTypeChange('Pickup')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition border min-h-[44px] cursor-pointer ${
                  dutyType === 'Pickup'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>PICKUP (+0.5)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDutyTypeChange('Drop')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition border min-h-[44px] cursor-pointer ${
                  dutyType === 'Drop'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>DROP (+0.5)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              Duty Recorded!
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              {successBanner}
            </p>
          </div>
        </div>
      )}

      {/* Duplicate Warning Prompt */}
      {duplicateWarningVols.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Potential Duplicate Duty Entry
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                The following volunteer{duplicateWarningVols.length > 1 ? 's' : ''} already have a <strong>{dutyType}</strong> record on <strong>{formattedDate}</strong>:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {duplicateWarningVols.map((name) => (
                  <span key={name} className="px-2 py-0.5 bg-amber-200/70 text-amber-900 text-xs font-bold rounded-md">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
              <input
                type="checkbox"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Confirm & record duplicate entry anyway</span>
            </label>
          </div>
        </div>
      )}

      {/* Selection Filter & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllVolunteers(!showAllVolunteers)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                !showAllVolunteers
                  ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {!showAllVolunteers
                ? `Showing Scheduled (${dayOfWeek})`
                : 'Showing All Active Volunteers'}
            </button>

            <span className="text-xs text-slate-400">
              ({displayedVolunteers.length} available)
            </span>
          </div>

          {/* Quick Select All */}
          <button
            type="button"
            onClick={selectAllDisplayed}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 transition self-start sm:self-auto cursor-pointer"
          >
            {selectedVolIds.length === displayedVolunteers.length && displayedVolunteers.length > 0
              ? 'Deselect All'
              : 'Select All Displayed'}
          </button>
        </div>

        {/* Search & Group Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteer name or roll number..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as VolunteerGroup | 'All')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            >
              <option value="All">All Years / Groups</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volunteer Checkbox List */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {displayedVolunteers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No volunteers found matching current filter</p>
              {!showAllVolunteers && (
                <button
                  type="button"
                  onClick={() => setShowAllVolunteers(true)}
                  className="mt-2 text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Show all active volunteers
                </button>
              )}
            </div>
          ) : (
            displayedVolunteers.map(({ volunteer, points, isDuplicate, isScheduledForDay }) => {
              const isSelected = selectedVolIds.includes(volunteer.id);

              return (
                <label
                  key={volunteer.id}
                  className={`flex items-center justify-between p-3 sm:p-3.5 transition cursor-pointer hover:bg-slate-50/80 ${
                    isSelected ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleVolunteer(volunteer.id)}
                      className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {volunteer.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {volunteer.year}
                        </span>
                        {volunteer.rollNumber && (
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            {volunteer.rollNumber}
                          </span>
                        )}
                        {!isScheduledForDay && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            Off-day
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>
                          Current Points: <strong className="text-slate-800">{points.toFixed(1)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Days: {volunteer.dutyDays.map((d) => d.substring(0, 3)).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duplicate Status indicator */}
                  <div>
                    {isDuplicate ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        <AlertTriangle className="w-3 h-3" /> Already Marked
                      </span>
                    ) : isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Selected
                      </span>
                    ) : null}
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Sticky Submit Bottom Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-md sticky bottom-16 sm:bottom-4 z-20 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-900">
              {selectedVolIds.length} Volunteer{selectedVolIds.length === 1 ? '' : 's'} Selected
            </div>
            <div className="text-[11px] text-slate-500">
              Duty: <strong>{dutyType}</strong> on <strong>{formattedDate}</strong> (+{(selectedVolIds.length * 0.5).toFixed(1)} pts total)
            </div>
          </div>

          {isPastBlocked ? (
            <button
              type="button"
              onClick={onRequireAdmin}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Admin Login Required for Past Date
            </button>
          ) : (
            <button
              type="submit"
              disabled={selectedVolIds.length === 0 || isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 shadow-sm min-h-[44px] cursor-pointer ${
                selectedVolIds.length > 0 && !isSubmitting
                  ? dutyType === 'Pickup'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    RECORD {dutyType.toUpperCase()} ({selectedVolIds.length})
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
