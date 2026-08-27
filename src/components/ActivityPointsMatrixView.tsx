import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Car, 
  PackageCheck, 
  Sparkles, 
  AlertTriangle, 
  X, 
  Clock, 
  User, 
  Award,
  Layers,
  Check,
  CalendarDays
} from 'lucide-react';
import { 
  Volunteer, 
  DutyRecord, 
  VolunteerPointsSummary, 
  DutyType, 
  VolunteerGroup 
} from '../types';
import { StorageService } from '../services/storage';

interface ActivityPointsMatrixViewProps {
  volunteers: Volunteer[];
  dutyRecords: DutyRecord[];
  summaries: VolunteerPointsSummary[];
  onDataChanged: () => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const ActivityPointsMatrixView: React.FC<ActivityPointsMatrixViewProps> = ({
  volunteers,
  dutyRecords,
  summaries,
  onDataChanged,
  isAdmin,
  onRequireAdmin,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1 to 12
  const [selectedGroup, setSelectedGroup] = useState<VolunteerGroup | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [cellModalData, setCellModalData] = useState<{
    volunteer: Volunteer;
    dateStr: string;
    dayNum: number;
    dayOfWeek: string;
  } | null>(null);

  const [volunteerHistoryModal, setVolunteerHistoryModal] = useState<Volunteer | null>(null);

  // New activity form state inside cell modal
  const [showAddActivityForm, setShowAddActivityForm] = useState<boolean>(false);
  const [newDutyType, setNewDutyType] = useState<DutyType>('Pickup');
  const [newActivityTitle, setNewActivityTitle] = useState<string>('');
  const [newActivityPoints, setNewActivityPoints] = useState<number>(0.5);
  const [newActivityNotes, setNewActivityNotes] = useState<string>('');
  const [activityFormError, setActivityFormError] = useState<string | null>(null);

  // Editing existing activity inside cell modal
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editPoints, setEditPoints] = useState<number>(0.5);
  const [editNotes, setEditNotes] = useState<string>('');

  // Missed duty form in volunteer history modal
  const [historyMissedDate, setHistoryMissedDate] = useState<string>(StorageService.getTodayDateString());
  const [historyMissedType, setHistoryMissedType] = useState<DutyType>('Pickup');
  const [historyMissedPoints, setHistoryMissedPoints] = useState<number>(0.5);
  const [historyMissedTitle, setHistoryMissedTitle] = useState<string>('');

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
  };

  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' });

  // Calculate matrix
  const matrix = useMemo(() => {
    return StorageService.getMonthlyActivityMatrix(
      selectedYear,
      selectedMonth,
      volunteers,
      dutyRecords
    );
  }, [selectedYear, selectedMonth, volunteers, dutyRecords]);

  // Filter volunteer rows
  const filteredRows = useMemo(() => {
    return matrix.volunteerRows.filter((row) => {
      const v = row.volunteer;
      const matchesGroup = selectedGroup === 'All' || v.year === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        v.name.toLowerCase().includes(q) ||
        (v.rollNumber && v.rollNumber.toLowerCase().includes(q)) ||
        (v.phone && v.phone.includes(q));
      return matchesGroup && matchesSearch;
    });
  }, [matrix, selectedGroup, searchQuery]);

  // Download CSV
  const handleDownloadCSV = () => {
    const csv = StorageService.exportActivityMatrixCSV(
      selectedYear,
      selectedMonth,
      volunteers,
      dutyRecords
    );
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vikalp_Activity_Points_Matrix_${monthName}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open day activity modal for volunteer and date
  const handleOpenCellModal = (vol: Volunteer, dateStr: string, dayNum: number, dayOfWeek: string) => {
    setCellModalData({ volunteer: vol, dateStr, dayNum, dayOfWeek });
    setShowAddActivityForm(false);
    setEditingRecordId(null);
    setActivityFormError(null);
    setNewDutyType('Pickup');
    setNewActivityTitle('');
    setNewActivityPoints(0.5);
    setNewActivityNotes('');
  };

  // Records for active cell modal
  const currentCellRecords = useMemo(() => {
    if (!cellModalData) return [];
    return dutyRecords.filter(
      (d) => d.volunteerId === cellModalData.volunteer.id && d.date === cellModalData.dateStr
    );
  }, [cellModalData, dutyRecords]);

  const currentCellTotalPoints = useMemo(() => {
    return currentCellRecords.reduce((sum, d) => sum + (typeof d.points === 'number' ? d.points : 0.5), 0);
  }, [currentCellRecords]);

  const hasPickupInCell = currentCellRecords.some((d) => d.dutyType === 'Pickup');
  const hasDropInCell = currentCellRecords.some((d) => d.dutyType === 'Drop');

  // Add activity in cell
  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellModalData) return;

    if (newDutyType === 'Pickup' && hasPickupInCell) {
      setActivityFormError('Pickup duty already exists for this date. Cannot add duplicate.');
      return;
    }
    if (newDutyType === 'Drop' && hasDropInCell) {
      setActivityFormError('Drop duty already exists for this date. Cannot add duplicate.');
      return;
    }

    const title = newActivityTitle.trim() || (newDutyType === 'Pickup' ? 'Pickup Duty' : newDutyType === 'Drop' ? 'Drop Duty' : 'Special Duty');
    const result = StorageService.addActivityRecord({
      volunteerId: cellModalData.volunteer.id,
      date: cellModalData.dateStr,
      dutyType: newDutyType,
      activityTitle: title,
      points: Number(newActivityPoints) || 0.5,
      notes: newActivityNotes.trim() || undefined,
    });

    if (!result.success) {
      setActivityFormError(result.error || 'Failed to add activity.');
      return;
    }

    setShowAddActivityForm(false);
    setActivityFormError(null);
    setNewActivityTitle('');
    setNewActivityNotes('');
    onDataChanged();
  };

  // Quick 1-click add standard duty
  const handleQuickAddStandardDuty = (type: DutyType) => {
    if (!cellModalData) return;
    const result = StorageService.assignDuty(
      cellModalData.volunteer.id,
      cellModalData.dateStr,
      type,
      0.5
    );
    if (!result.success) {
      setActivityFormError(`${type} duty already assigned on this day.`);
      return;
    }
    setActivityFormError(null);
    onDataChanged();
  };

  // Remove activity
  const handleRemoveActivity = (recordId: string) => {
    StorageService.deleteDutyRecord(recordId);
    setEditingRecordId(null);
    onDataChanged();
  };

  // Start editing activity
  const handleStartEdit = (record: DutyRecord) => {
    setEditingRecordId(record.id);
    setEditTitle(record.activityTitle || (record.dutyType === 'Pickup' ? 'Pickup Duty' : record.dutyType === 'Drop' ? 'Drop Duty' : 'Other'));
    setEditPoints(record.points);
    setEditNotes(record.notes || '');
  };

  // Save edited activity
  const handleSaveEdit = (recordId: string) => {
    StorageService.updateDutyRecord(recordId, {
      activityTitle: editTitle.trim(),
      points: Number(editPoints),
      notes: editNotes.trim(),
    });
    setEditingRecordId(null);
    onDataChanged();
  };

  // History modal missed duty submit
  const handleAddMissedDutyInHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerHistoryModal) return;

    const title = historyMissedTitle.trim() || (historyMissedType === 'Pickup' ? 'Pickup Duty' : historyMissedType === 'Drop' ? 'Drop Duty' : 'Other Activity');
    const result = StorageService.addActivityRecord({
      volunteerId: volunteerHistoryModal.id,
      date: historyMissedDate,
      dutyType: historyMissedType,
      activityTitle: title,
      points: Number(historyMissedPoints) || 0.5,
    });

    if (!result.success) {
      alert(result.error || 'Could not record duty.');
      return;
    }

    setHistoryMissedTitle('');
    onDataChanged();
  };

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto">
      {/* Top Banner & Description */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-teal-200 text-xs font-bold mb-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Date-Wise Activity & Points Matrix</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              VOLUNTEER ACTIVITY & POINTS SCREEN
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 mt-0.5">
              Excel-style complete monthly activity table. Click any date cell to view, add, or edit duties and points.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleDownloadCSV}
              id="btn-matrix-download-csv"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export {monthName} Excel</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              id="btn-prev-month"
              title="Previous Month"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-xl font-bold text-sm text-white">
              <CalendarIcon className="w-4 h-4 text-teal-300" />
              <span>{monthName} {selectedYear}</span>
            </div>

            <button
              onClick={handleNextMonth}
              id="btn-next-month"
              title="Next Month"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              id="btn-today-month"
              className="ml-1 px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-teal-100 text-xs font-bold transition"
            >
              Today
            </button>
          </div>

          {/* Direct Pickers */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select month"
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-teal-400"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select year"
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-teal-400"
            >
              {[2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search volunteer name, roll number, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto shrink-0">
          {(['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other'] as const).map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedGroup === grp
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600">
        <span className="font-bold text-slate-800">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400 inline-flex items-center justify-center text-[9px] font-black text-emerald-900">
            ✓
          </span>
          <span>Scheduled Day + Duty Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-teal-50 border-2 border-dashed border-teal-400 inline-flex items-center justify-center text-[9px] font-bold text-teal-800">
            📅
          </span>
          <span>Volunteer's Chosen Duty Day (Click to edit points)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-300 inline-flex items-center justify-center text-[9px] font-black text-indigo-900">
            +
          </span>
          <span>Extra Voluntary Duty</span>
        </div>
      </div>

      {/* Excel-Style Date-Wise Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              {monthName} {selectedYear} Activity Table
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
              {filteredRows.length} Volunteers
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            💡 Tip: Click any number cell to view/edit duties for that date. Click volunteer name for full history.
          </span>
        </div>

        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs">
            {/* Header Row */}
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-20 border-b border-slate-300">
              <tr>
                {/* Fixed Volunteer Column */}
                <th className="sticky left-0 z-30 bg-slate-100 px-3 py-2.5 font-bold border-r border-slate-300 min-w-[180px] sm:min-w-[210px] shadow-sm">
                  Volunteer
                </th>

                {/* Day Columns */}
                {matrix.days.map((day) => {
                  const isWeekend = day.dayOfWeek === 'Sunday' || day.dayOfWeek === 'Saturday';
                  const isToday =
                    today.getFullYear() === selectedYear &&
                    today.getMonth() + 1 === selectedMonth &&
                    today.getDate() === day.dayNum;

                  return (
                    <th
                      key={day.dayNum}
                      className={`px-2 py-2 text-center border-r border-slate-200 font-bold min-w-[46px] ${
                        isToday
                          ? 'bg-teal-100 text-teal-900 ring-2 ring-teal-500 inset-0'
                          : isWeekend
                          ? 'bg-amber-50/70 text-amber-900'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 uppercase leading-tight">
                        {day.shortDay}
                      </div>
                      <div className="text-xs font-black">{day.dayNum}</div>
                    </th>
                  );
                })}

                {/* Monthly Total Points Column */}
                <th className="sticky right-20 sm:right-24 z-20 bg-slate-100 px-3 py-2 text-center font-black border-l border-r border-slate-300 min-w-[80px] sm:min-w-[90px]">
                  <span className="block text-[10px] uppercase text-slate-500">Month</span>
                  <span className="text-xs text-teal-800">Total</span>
                </th>

                {/* Overall Total Points Column */}
                <th className="sticky right-0 z-20 bg-slate-200 px-3 py-2 text-center font-black border-slate-300 min-w-[80px] sm:min-w-[90px] shadow-sm">
                  <span className="block text-[10px] uppercase text-slate-500">Overall</span>
                  <span className="text-xs text-slate-900">Total</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={matrix.days.length + 3}
                    className="text-center py-12 text-slate-400 text-sm font-medium"
                  >
                    No volunteers found matching current search or filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  return (
                    <tr
                      key={row.volunteer.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Volunteer Name Cell (Sticky Left) */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-3 py-2.5 border-r border-slate-300 font-semibold text-slate-900 shadow-sm">
                        <button
                          onClick={() => setVolunteerHistoryModal(row.volunteer)}
                          title="Click to view volunteer history and edit past records"
                          className="text-left group-hover:text-teal-700 flex items-center justify-between w-full cursor-pointer"
                        >
                          <div className="min-w-0">
                            <span className="font-bold block truncate hover:underline">
                              {row.volunteer.name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className={`text-[9px] font-bold px-1 rounded ${
                                  row.volunteer.year === '1st Year'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : row.volunteer.year === '2nd Year'
                                    ? 'bg-blue-50 text-blue-700'
                                    : row.volunteer.year === '3rd Year'
                                    ? 'bg-purple-50 text-purple-700'
                                    : row.volunteer.year === '4th Year'
                                    ? 'bg-amber-50 text-amber-700'
                                    : row.volunteer.year === '5th Year'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {row.volunteer.year}
                              </span>
                              {row.volunteer.rollNumber && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  {row.volunteer.rollNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Day Columns */}
                      {matrix.days.map((day) => {
                        const dayData = row.dailyData[day.dayNum];
                        const points = dayData?.dayPoints || 0;
                        const recordsCount = dayData?.records.length || 0;
                        const isWeekend = day.dayOfWeek === 'Sunday' || day.dayOfWeek === 'Saturday';
                        const isChosenDutyDay = (row.volunteer.dutyDays || []).includes(day.dayOfWeek as any);

                        return (
                          <td
                            key={day.dayNum}
                            onClick={() =>
                              handleOpenCellModal(
                                row.volunteer,
                                day.dateStr,
                                day.dayNum,
                                day.dayOfWeek
                              )
                            }
                            title={`${row.volunteer.name} — ${day.dayNum} ${monthName} (${day.dayOfWeek})${isChosenDutyDay ? ' [CHOSEN DUTY DAY]' : ''}: ${points} pts (${recordsCount} records). Click to edit.`}
                            className={`px-1 py-1.5 text-center border-r border-slate-100 cursor-pointer transition hover:ring-2 hover:ring-teal-500 hover:z-10 select-none ${
                              points > 0
                                ? isChosenDutyDay
                                  ? 'bg-emerald-50 font-black'
                                  : 'bg-indigo-50/70 font-black'
                                : isChosenDutyDay
                                ? 'bg-teal-50/60 font-semibold'
                                : isWeekend
                                ? 'bg-amber-50/20 text-slate-300'
                                : 'text-slate-300 hover:text-slate-600'
                            }`}
                          >
                            {points > 0 ? (
                              <span
                                className={`inline-flex items-center justify-center min-w-[26px] h-6 px-1 rounded-md text-xs font-black shadow-2xs ${
                                  isChosenDutyDay
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 ring-1 ring-emerald-500/30'
                                    : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                }`}
                              >
                                {points}
                              </span>
                            ) : isChosenDutyDay ? (
                              <span
                                className="inline-flex items-center justify-center min-w-[24px] h-5 px-1 rounded border-2 border-dashed border-teal-300 bg-teal-50/80 text-teal-800 text-[10px] font-bold"
                                title="Scheduled shift day (0 pts recorded so far - click to add/edit)"
                              >
                                0
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">0</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Monthly Total Points Cell */}
                      <td className="sticky right-20 sm:right-24 z-10 bg-white group-hover:bg-slate-50 px-2.5 py-2 text-center border-l border-r border-slate-300 font-extrabold text-teal-800">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                          {row.monthlyTotalPoints}
                        </span>
                      </td>

                      {/* Overall Total Points Cell */}
                      <td className="sticky right-0 z-10 bg-slate-100 group-hover:bg-slate-200 px-2.5 py-2 text-center font-black text-slate-900 shadow-sm">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-amber-900">
                          🏆 {row.overallTotalPoints}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Sticky Table Footer (Daily Total Points) */}
            <tfoot className="bg-slate-100 text-slate-900 sticky bottom-0 z-20 border-t-2 border-slate-300 font-bold">
              <tr>
                <td className="sticky left-0 z-30 bg-slate-200 px-3 py-2.5 border-r border-slate-300 font-black text-xs uppercase shadow-sm">
                  Daily Points Total
                </td>

                {matrix.days.map((day) => {
                  const daySum = matrix.columnDailyTotals[day.dayNum] || 0;
                  return (
                    <td
                      key={day.dayNum}
                      className="px-1 py-2 text-center border-r border-slate-200 font-extrabold text-xs"
                    >
                      {daySum > 0 ? (
                        <span className="text-emerald-800">{daySum}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  );
                })}

                <td className="sticky right-20 sm:right-24 z-20 bg-teal-100 px-2.5 py-2 text-center border-l border-r border-slate-300 font-black text-xs text-teal-900">
                  {matrix.grandMonthPointsTotal}
                </td>

                <td className="sticky right-0 z-20 bg-slate-300 px-2.5 py-2 text-center font-black text-xs text-slate-900 shadow-sm">
                  {summaries.reduce((sum, s) => sum + s.totalPoints, 0).toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DAY ACTIVITY DETAILS & EDITOR MODAL (Triggered by clicking any cell) */}
      {/* ========================================================================= */}
      {cellModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-teal-200 block">
                  Day Activity & Points Editor
                </span>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {cellModalData.volunteer.name} — {cellModalData.dayNum} {monthName} {selectedYear}
                </h3>
                <span className="text-xs text-teal-100 font-medium">
                  {cellModalData.dayOfWeek} • {cellModalData.volunteer.year}
                </span>
              </div>

              <button
                onClick={() => setCellModalData(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Volunteer Chosen Day Status Banner */}
              {(() => {
                const isVolunteerChosenDay = (cellModalData.volunteer.dutyDays || []).includes(cellModalData.dayOfWeek as any);

                return (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isVolunteerChosenDay
                        ? 'bg-teal-50 border-teal-200 text-teal-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`w-4 h-4 ${isVolunteerChosenDay ? 'text-teal-700' : 'text-slate-400'}`} />
                      <span>
                        {isVolunteerChosenDay 
                          ? `Assigned Duty Day (${cellModalData.dayOfWeek}) — 1 of 3 shifts` 
                          : `Unscheduled Day (${cellModalData.dayOfWeek}) — Extra volunteer work`}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isVolunteerChosenDay
                          ? 'bg-teal-200 text-teal-950 border border-teal-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isVolunteerChosenDay ? 'Chosen Day' : 'Extra Day'}
                    </span>
                  </div>
                );
              })()}

              {/* Day Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase block">
                    Total for this Day:
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-slate-900">
                      {currentCellTotalPoints}
                    </span>
                    <span className="text-xs font-bold text-teal-700">points</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">
                    Recorded Activities:
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentCellRecords.length} items
                  </span>
                </div>
              </div>

              {activityFormError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs text-amber-900 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{activityFormError}</span>
                </div>
              )}

              {/* List of activities on this day */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Activities Recorded on this Day:
                </h4>

                {currentCellRecords.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    No duties or activities recorded for this date yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentCellRecords.map((rec) => {
                      const isEditing = editingRecordId === rec.id;

                      if (isEditing) {
                        return (
                          <div
                            key={rec.id}
                            className="p-3 bg-teal-50 border border-teal-300 rounded-xl space-y-2.5"
                          >
                            <span className="text-xs font-bold text-teal-900 block">
                              Edit Activity Details:
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Activity Title
                                </label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Points Value
                                </label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={editPoints}
                                  onChange={(e) => setEditPoints(Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Notes / Reason (Optional)
                              </label>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="e.g. Corrected points, substitute driver"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingRecordId(null)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(rec.id)}
                                className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={rec.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                rec.dutyType === 'Pickup'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.dutyType === 'Drop'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.dutyType === 'Pickup' ? (
                                <Car className="w-4 h-4" />
                              ) : rec.dutyType === 'Drop' ? (
                                <PackageCheck className="w-4 h-4" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {rec.activityTitle || (rec.dutyType === 'Pickup' ? 'Pickup Duty' : rec.dutyType === 'Drop' ? 'Drop Duty' : 'Other Activity')}
                                </span>
                                <span className="text-[10px] font-black px-1.5 py-0.2 bg-teal-50 text-teal-800 border border-teal-200 rounded">
                                  +{rec.points} pts
                                </span>
                              </div>
                              {rec.notes && (
                                <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                                  {rec.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions: Edit & Remove */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartEdit(rec)}
                              title="Edit points or title"
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveActivity(rec.id)}
                              title="Remove this duty and reverse points"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Standard Duties (Pickup & Drop) 1-Click Assignment */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Quick Assign Standard Duty:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAddStandardDuty('Pickup')}
                    disabled={hasPickupInCell}
                    id="btn-cell-add-pickup"
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                      hasPickupInCell
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>{hasPickupInCell ? 'Pickup Assigned' : '+ Add Pickup (0.5 pts)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAddStandardDuty('Drop')}
                    disabled={hasDropInCell}
                    id="btn-cell-add-drop"
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                      hasDropInCell
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>{hasDropInCell ? 'Drop Assigned' : '+ Add Drop (0.5 pts)'}</span>
                  </button>
                </div>
              </div>

              {/* Add Custom / Other Activity Form Toggle */}
              <div>
                {!showAddActivityForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddActivityForm(true)}
                    className="w-full py-2 border border-dashed border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-teal-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Custom Activity / Missed Points</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleAddActivitySubmit}
                    className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 uppercase">
                        Add Activity for {cellModalData.dayNum} {monthName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddActivityForm(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                          Type
                        </label>
                        <select
                          value={newDutyType}
                          onChange={(e) => setNewDutyType(e.target.value as DutyType)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                        >
                          <option value="Pickup" disabled={hasPickupInCell}>
                            Pickup {hasPickupInCell ? '(Already added)' : ''}
                          </option>
                          <option value="Drop" disabled={hasDropInCell}>
                            Drop {hasDropInCell ? '(Already added)' : ''}
                          </option>
                          <option value="Other">Other / Special Activity</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                          Points (e.g. 0.5, 1, 2)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={newActivityPoints}
                          onChange={(e) => setNewActivityPoints(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        value={newActivityTitle}
                        onChange={(e) => setNewActivityTitle(e.target.value)}
                        placeholder="e.g. Camp Coordinator, Special Pickup, Event Setup"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={newActivityNotes}
                        onChange={(e) => setNewActivityNotes(e.target.value)}
                        placeholder="Optional remarks"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-xs transition"
                    >
                      Confirm & Save Activity
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setCellModalData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VOLUNTEER COMPLETE ACTIVITY HISTORY MODAL (Triggered by clicking name) */}
      {/* ========================================================================= */}
      {volunteerHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-teal-300 block">
                  Complete Volunteer Record
                </span>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {volunteerHistoryModal.name}
                </h3>
                <span className="text-xs text-slate-300">
                  {volunteerHistoryModal.year} • Roll: {volunteerHistoryModal.rollNumber || 'N/A'} • Phone: {volunteerHistoryModal.phone || 'N/A'}
                </span>
              </div>

              <button
                onClick={() => setVolunteerHistoryModal(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Point Stats */}
              {(() => {
                const volDuties = dutyRecords.filter((d) => d.volunteerId === volunteerHistoryModal.id);
                const totalPoints = volDuties.reduce((acc, d) => acc + (typeof d.points === 'number' ? d.points : 0.5), 0);
                const pickups = volDuties.filter((d) => d.dutyType === 'Pickup').length;
                const drops = volDuties.filter((d) => d.dutyType === 'Drop').length;

                return (
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Points</span>
                      <span className="text-lg font-black text-amber-700">🏆 {totalPoints.toFixed(1)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Duties</span>
                      <span className="text-lg font-black text-slate-900">{volDuties.length}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Pickups</span>
                      <span className="text-lg font-black text-emerald-700">{pickups}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Drops</span>
                      <span className="text-lg font-black text-indigo-700">{drops}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Add Missed Duty Record Form */}
              <form
                onSubmit={handleAddMissedDutyInHistory}
                className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs"
              >
                <span className="font-bold text-teal-900 block">
                  + Add Missed Activity for {volunteerHistoryModal.name}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Date</label>
                    <input
                      type="date"
                      value={historyMissedDate}
                      onChange={(e) => setHistoryMissedDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Type</label>
                    <select
                      value={historyMissedType}
                      onChange={(e) => setHistoryMissedType(e.target.value as DutyType)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    >
                      <option value="Pickup">Pickup Duty</option>
                      <option value="Drop">Drop Duty</option>
                      <option value="Other">Other Activity</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Points</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={historyMissedPoints}
                      onChange={(e) => setHistoryMissedPoints(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs transition"
                    >
                      Add Record
                    </button>
                  </div>
                </div>
              </form>

              {/* History Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-700">
                  Full Historical Duty Timeline
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {(() => {
                    const volRecords = dutyRecords
                      .filter((d) => d.volunteerId === volunteerHistoryModal.id)
                      .sort((a, b) => b.date.localeCompare(a.date));

                    if (volRecords.length === 0) {
                      return (
                        <div className="p-4 text-center text-slate-400">
                          No history found for this volunteer.
                        </div>
                      );
                    }

                    return volRecords.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{r.date}</span>
                          <span className="text-slate-400">({r.day})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.dutyType === 'Pickup'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.dutyType === 'Drop'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.activityTitle || r.dutyType}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-amber-700">+{r.points} pts</span>
                          <button
                            onClick={() => handleRemoveActivity(r.id)}
                            title="Delete this record"
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setVolunteerHistoryModal(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
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
