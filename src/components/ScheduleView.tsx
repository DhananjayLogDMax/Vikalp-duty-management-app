import React, { useState } from 'react';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle, 
  Car, 
  PackageCheck, 
  Grid, 
  List, 
  Plus,
  Users,
  ChevronRight,
  Phone,
  Hash
} from 'lucide-react';
import { 
  Volunteer, 
  VolunteerGroup, 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  VolunteerPointsSummary,
  DutyType 
} from '../types';
import { StorageService } from '../services/storage';

interface ScheduleViewProps {
  volunteers: Volunteer[];
  summaries: VolunteerPointsSummary[];
  onOpenDutyModalForDay: (day: DayOfWeek, dutyType: DutyType) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  volunteers,
  summaries,
  onOpenDutyModalForDay,
}) => {
  const todayStr = StorageService.getTodayDateString();
  const currentDayOfWeek = StorageService.getDayOfWeekFromDate(todayStr);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentDayOfWeek);
  const [selectedGroup, setSelectedGroup] = useState<VolunteerGroup | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'weekly'>('day');

  // Map volunteer ID to point summaries
  const summaryMap = new Map<string, VolunteerPointsSummary>();
  summaries.forEach((s) => summaryMap.set(s.volunteerId, s));

  // Active volunteers
  const activeVolunteers = volunteers.filter((v) => v.active);

  // Volunteers assigned to selectedDay
  const dayVolunteers = activeVolunteers.filter((v) => 
    v.dutyDays.includes(selectedDay)
  );

  // Filtered by group and search query
  const filteredVolunteers = dayVolunteers.filter((v) => {
    const matchesGroup = selectedGroup === 'All' || v.year === selectedGroup;
    const matchesSearch = searchQuery.trim() === '' || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.rollNumber && v.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  // Grouped by year
  const groupedByYear = {
    '1st Year': filteredVolunteers.filter((v) => v.year === '1st Year'),
    '2nd Year': filteredVolunteers.filter((v) => v.year === '2nd Year'),
    '3rd Year': filteredVolunteers.filter((v) => v.year === '3rd Year'),
    '4th Year': filteredVolunteers.filter((v) => v.year === '4th Year'),
    '5th Year': filteredVolunteers.filter((v) => v.year === '5th Year'),
    'Other': filteredVolunteers.filter((v) => v.year === 'Other'),
  };

  // Fair Duty Assignment list: sorted by current points from lowest to highest
  const fairOrderedVolunteers = [...filteredVolunteers].map((v) => {
    const summary = summaryMap.get(v.id);
    return {
      volunteer: v,
      points: summary ? summary.totalPoints : 0,
      totalDuties: summary ? summary.totalDuties : 0,
    };
  }).sort((a, b) => a.points - b.points);

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Duty Schedule
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Every volunteer has exactly 3 assigned duty days per week
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'day'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'weekly'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly Grid</span>
            </button>
          </div>
        </div>

        {/* Day Selector Pills (Monday to Sunday) */}
        {viewMode === 'day' && (
          <div className="mt-4 overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex items-center gap-1.5 min-w-max">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = currentDayOfWeek === day;
                const count = activeVolunteers.filter((v) => v.dutyDays.includes(day)).length;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    id={`schedule-day-btn-${day.toLowerCase()}`}
                    className={`relative flex flex-col items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold transition border min-w-[76px] ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
                      {day.substring(0, 3)}
                    </span>
                    <span className="text-xs font-extrabold mt-0.5">{day}</span>
                    
                    <span className={`mt-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-teal-900/60 text-teal-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count} Vols
                    </span>

                    {isToday && (
                      <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isSelected
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-teal-600 text-white'
                      }`}>
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {viewMode === 'day' ? (
        <>
          {/* Day Controls: Search, Year Filters & Action Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedDay}'s volunteers...`}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Group filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
                {(['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other'] as const).map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      selectedGroup === group
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Record Duty Buttons for this day */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Quick Record for <strong className="text-slate-800">{selectedDay}</strong>:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDutyModalForDay(selectedDay, 'Pickup')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Record Pickup</span>
                </button>
                <button
                  onClick={() => onOpenDutyModalForDay(selectedDay, 'Drop')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Record Drop</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 12: FAIR DUTY ASSIGNMENT / SUGGESTED ORDER */}
          {fairOrderedVolunteers.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">
                    Suggested Volunteers (Fair Assignment)
                  </h3>
                </div>
                <span className="text-[11px] text-amber-800 font-semibold">
                  Sorted by Lowest Points
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mb-3">
                Recommended duty order for <strong>{selectedDay}</strong> to balance volunteer workload fairly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {fairOrderedVolunteers.map((item, idx) => (
                  <div
                    key={item.volunteer.id}
                    className="bg-white/90 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {item.volunteer.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.volunteer.year}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-amber-700 text-xs shrink-0 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {item.points.toFixed(1)} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Grouped by Year List */}
          <div className="space-y-4">
            {(['2nd Year', '3rd Year', 'Other'] as const).map((yearGroup) => {
              if (selectedGroup !== 'All' && selectedGroup !== yearGroup) return null;
              const groupVols = groupedByYear[yearGroup];

              return (
                <div 
                  key={yearGroup} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        yearGroup === '2nd Year' ? 'bg-blue-500' :
                        yearGroup === '3rd Year' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}></span>
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                        {yearGroup.toUpperCase()}
                      </h3>
                      <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                        {groupVols.length}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    {groupVols.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center italic">
                        No volunteers from {yearGroup} assigned to {selectedDay}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {groupVols.map((vol) => {
                          const summary = summaryMap.get(vol.id);
                          const pts = summary ? summary.totalPoints : 0;

                          return (
                            <div
                              key={vol.id}
                              className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/60 hover:shadow-xs transition flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm truncate">
                                    {vol.name}
                                  </span>
                                  {vol.rollNumber && (
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      #{vol.rollNumber}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1">
                                  {vol.dutyDays.map((d) => (
                                    <span
                                      key={d}
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                        d === selectedDay
                                          ? 'bg-teal-100 text-teal-800 font-extrabold'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      {d.substring(0, 3)}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {pts.toFixed(1)} pts
                                </span>
                                {vol.phone && (
                                  <span className="text-[10px] text-slate-400 block mt-1">
                                    📞 {vol.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Section 11: FULL WEEKLY SCHEDULE VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayVols = activeVolunteers.filter((v) => v.dutyDays.includes(day));
              const isToday = currentDayOfWeek === day;

              return (
                <div
                  key={day}
                  className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                    isToday ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className={`px-4 py-2.5 flex items-center justify-between ${
                    isToday ? 'bg-teal-700 text-white' : 'bg-slate-50 text-slate-800 border-b border-slate-100'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm uppercase tracking-wide">
                        {day}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-black text-[9px] uppercase">
                          Today
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isToday ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {dayVols.length} Assigned
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    {(['2nd Year', '3rd Year', 'Other'] as const).map((year) => {
                      const yVols = dayVols.filter((v) => v.year === year);
                      if (yVols.length === 0) return null;

                      return (
                        <div key={year} className="text-xs">
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                            {year} ({yVols.length})
                          </span>
                          <div className="space-y-1 pl-1">
                            {yVols.map((v) => {
                              const s = summaryMap.get(v.id);
                              return (
                                <div
                                  key={v.id}
                                  className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 border border-slate-100"
                                >
                                  <span className="font-semibold text-slate-800">
                                    • {v.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-700">
                                    {s ? s.totalPoints.toFixed(1) : 0} pts
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
