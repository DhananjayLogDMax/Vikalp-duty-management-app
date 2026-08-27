import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  Users, 
  Award, 
  Car, 
  PackageCheck, 
  Sparkles, 
  Calendar,
  ChevronRight,
  X,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Volunteer, 
  DutyRecord, 
  VolunteerPointsSummary, 
  VolunteerGroup 
} from '../types';
import { StorageService } from '../services/storage';

interface PointsRankingViewProps {
  volunteers: Volunteer[];
  dutyRecords: DutyRecord[];
  summaries: VolunteerPointsSummary[];
  onOpenDutyForVolunteer: (volunteerId: string) => void;
}

export const PointsRankingView: React.FC<PointsRankingViewProps> = ({
  volunteers,
  dutyRecords,
  summaries,
  onOpenDutyForVolunteer,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<VolunteerGroup | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default ASC: Lowest to Highest as required!
  const [activeVolunteerModal, setActiveVolunteerModal] = useState<VolunteerPointsSummary | null>(null);

  const handleDownloadMasterExcel = () => {
    const csv = StorageService.exportVolunteerMasterSheetCSV(volunteers, dutyRecords);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vikalp_Volunteers_Points_and_Duty_Dates_Sheet_${StorageService.getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered summaries
  const filteredSummaries = summaries.filter((item) => {
    const matchesGroup = selectedGroup === 'All' || item.year === selectedGroup;
    const matchesSearch = searchQuery.trim() === '' || 
      item.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.rollNumber && item.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  // Sorted
  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.totalPoints - b.totalPoints || a.volunteerName.localeCompare(b.volunteerName);
    } else {
      return b.totalPoints - a.totalPoints || a.volunteerName.localeCompare(b.volunteerName);
    }
  });

  // Calculate statistics
  const totalPointsAwarded = summaries.reduce((acc, curr) => acc + curr.totalPoints, 0);
  const avgPoints = summaries.length > 0 ? (totalPointsAwarded / summaries.length).toFixed(1) : '0';
  const maxPoints = Math.max(...summaries.map((s) => s.totalPoints), 1);

  // Get duties for volunteer in modal
  const modalVolunteerDuties = activeVolunteerModal
    ? dutyRecords
        .filter((d) => d.volunteerId === activeVolunteerModal.volunteerId)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Points & Ranking
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sorted by <strong>Lowest to Highest Points</strong> to help select volunteers with fewer points for upcoming duties.
            </p>
          </div>

          {/* Quick Metrics & Download Sheet */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleDownloadMasterExcel}
              id="btn-points-download-excel"
              title="Download Excel spreadsheet with points and duty dates"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel</span>
            </button>
            <div className="bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">
                Total Awarded
              </span>
              <span className="text-sm font-black text-amber-900">
                {totalPointsAwarded.toFixed(1)} pts
              </span>
            </div>
            <div className="bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">
                Avg / Vol
              </span>
              <span className="text-sm font-black text-teal-900">
                {avgPoints} pts
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-100">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteer name or roll..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          {/* Year Group Filters */}
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

          {/* Sort Toggle Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            id="btn-sort-points"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-700" />
            <span>
              {sortOrder === 'asc' ? 'Lowest First (Fair)' : 'Highest First'}
            </span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Showing {sortedSummaries.length} Volunteers
          </span>
          <span className="text-[11px] text-slate-500">
            Click any volunteer to view duty breakdown
          </span>
        </div>

        <div className="p-3 sm:p-4 divide-y divide-slate-100">
          {sortedSummaries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No volunteers match the filters
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSummaries.map((item, index) => {
                const rankNumber = index + 1;
                const percentage = Math.round((item.totalPoints / maxPoints) * 100);

                return (
                  <div
                    key={item.volunteerId}
                    onClick={() => setActiveVolunteerModal(item)}
                    id={`points-row-${item.volunteerId}`}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-500/80 hover:bg-teal-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Rank, Avatar & Name Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        rankNumber === 1 && sortOrder === 'asc'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : rankNumber <= 3
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'bg-slate-50 text-slate-600'
                      }`}>
                        #{rankNumber}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-teal-800 transition-colors truncate">
                            {item.volunteerName}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            item.year === '1st Year'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.year === '2nd Year'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.year === '3rd Year'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : item.year === '4th Year'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : item.year === '5th Year'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.year}
                          </span>
                          {!item.active && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Duty Days badges */}
                        <div className="flex items-center gap-1 mt-1">
                          {item.dutyDays.map((d) => (
                            <span key={d} className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 rounded">
                              {d.substring(0, 3)}
                            </span>
                          ))}
                          {item.rollNumber && (
                            <span className="text-[10px] text-slate-400 ml-1 font-mono">
                              #{item.rollNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Duty Counts & Points Display */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100 text-[11px]">
                          <Car className="w-3 h-3 text-emerald-600" />
                          {item.totalPickup} Pick
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100 text-[11px]">
                          <PackageCheck className="w-3 h-3 text-indigo-600" />
                          {item.totalDrop} Drop
                        </span>
                      </div>

                      <div className="text-right shrink-0 min-w-[70px]">
                        <span className="text-base font-black text-amber-700 block">
                          {item.totalPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-500">pts</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.totalDuties} total duties
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Duty History Breakdown Modal */}
      {activeVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeVolunteerModal.volunteerName}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {activeVolunteerModal.year}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Duty history and point accumulation
                </p>
              </div>

              <button
                onClick={() => setActiveVolunteerModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Stat Pills */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100">
              <div className="bg-amber-50 p-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Total Points</span>
                <span className="text-base font-black text-amber-900">{activeVolunteerModal.totalPoints.toFixed(1)}</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Pickups</span>
                <span className="text-base font-black text-emerald-900">{activeVolunteerModal.totalPickup} (+{(activeVolunteerModal.totalPickup * 0.5).toFixed(1)})</span>
              </div>
              <div className="bg-indigo-50 p-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">Drops</span>
                <span className="text-base font-black text-indigo-900">{activeVolunteerModal.totalDrop} (+{(activeVolunteerModal.totalDrop * 0.5).toFixed(1)})</span>
              </div>
            </div>

            {/* Log list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-64">
              <h4 className="text-xs font-bold text-slate-700 mb-1">
                Completed Duty Records ({modalVolunteerDuties.length})
              </h4>
              {modalVolunteerDuties.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">
                  No duty records logged yet.
                </p>
              ) : (
                modalVolunteerDuties.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        {StorageService.formatDateFormatted(d.date)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {d.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        d.dutyType === 'Pickup'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {d.dutyType}
                      </span>
                      <span className="font-black text-teal-800">
                        +{d.points.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveVolunteerModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
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
