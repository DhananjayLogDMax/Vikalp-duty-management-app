import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  History, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Car, 
  PackageCheck, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  FileSpreadsheet, 
  X, 
  Check, 
  AlertCircle,
  FileDown,
  Clock,
  Sparkles,
  Lock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { 
  Volunteer, 
  DutyRecord, 
  VolunteerPointsSummary, 
  DutyType, 
  VolunteerGroup 
} from '../types';
import { StorageService } from '../services/storage';

interface RecordsViewProps {
  volunteers: Volunteer[];
  dutyRecords: DutyRecord[];
  summaries: VolunteerPointsSummary[];
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onDeleteDuty: (recordId: string) => void;
  onUpdateDuty?: (
    recordId: string,
    updates: {
      volunteerId?: string;
      dutyType?: DutyType;
      date?: string;
      notes?: string;
    }
  ) => void;
  onOpenRecordDutyForDate?: (date: string) => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  volunteers,
  dutyRecords,
  summaries,
  isAdmin = false,
  onRequireAdmin,
  onDeleteDuty,
  onUpdateDuty,
  onOpenRecordDutyForDate,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'monthly' | 'calendar' | 'history' | 'stats'>('excel');
  const [adminWarningModal, setAdminWarningModal] = useState<string | null>(null);

  // Month & Year selection for monthly tab
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August (1-indexed)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState<string>(StorageService.getTodayDateString());
  const [calendarMonth, setCalendarMonth] = useState<number>(8); // August
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  // History Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [historyGroup, setHistoryGroup] = useState<VolunteerGroup | 'All'>('All');
  const [historyDutyType, setHistoryDutyType] = useState<DutyType | 'All'>('All');
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('All');

  // Excel Master Sheet State
  const [excelSearch, setExcelSearch] = useState('');
  const [excelGroup, setExcelGroup] = useState<VolunteerGroup | 'All'>('All');
  const [excelSortBy, setExcelSortBy] = useState<'points_asc' | 'points_desc' | 'name' | 'duties'>('points_asc');

  // Edit Duty Modal State (Allows manual correction if wrong volunteer was selected)
  const [editingRecord, setEditingRecord] = useState<DutyRecord | null>(null);
  const [editVolunteerId, setEditVolunteerId] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editDutyType, setEditDutyType] = useState<DutyType>('Pickup');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  // Open Edit Modal with current values
  const handleStartEdit = (record: DutyRecord) => {
    // Restrict editing past date records if not admin
    if (StorageService.isDatePast(record.date) && !isAdmin) {
      setAdminWarningModal('Volunteers are only permitted to manage duties for the present day. Modifying past day duty records requires Administrator login.');
      return;
    }

    setEditingRecord(record);
    setEditVolunteerId(record.volunteerId);
    setEditDate(record.date);
    setEditDutyType(record.dutyType);
    setEditNotes(record.notes || '');
    setEditError(null);
  };

  const handleDeleteWithGuard = (record: DutyRecord) => {
    if (StorageService.isDatePast(record.date) && !isAdmin) {
      setAdminWarningModal('Volunteers are not allowed to delete past day records. Deleting historical duty records is strictly reserved for Administrators.');
      return;
    }

    if (confirm(`Remove this ${record.dutyType} duty record for ${record.volunteerName} on ${record.date}? Points will be automatically recalculated.`)) {
      onDeleteDuty(record.id);
    }
  };

  // Submit Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateDuty) return;

    if (!editVolunteerId) {
      setEditError('Please select a volunteer.');
      return;
    }
    if (!editDate) {
      setEditError('Please select a valid date.');
      return;
    }

    // Check duplicate if moved or changed volunteer
    const isDuplicate = dutyRecords.some(
      (d) =>
        d.id !== editingRecord.id &&
        d.volunteerId === editVolunteerId &&
        d.date === editDate &&
        d.dutyType === editDutyType
    );

    if (isDuplicate) {
      const vol = volunteers.find((v) => v.id === editVolunteerId);
      setEditError(`${vol?.name || 'This volunteer'} is already marked for ${editDutyType} duty on ${editDate}.`);
      return;
    }

    onUpdateDuty(editingRecord.id, {
      volunteerId: editVolunteerId,
      dutyType: editDutyType,
      date: editDate,
      notes: editNotes.trim() || undefined,
    });

    setEditingRecord(null);
  };

  // 1. EXCEL MASTER SHEET COMPUTATIONS
  const excelData = volunteers.map((vol) => {
    const volDuties = dutyRecords
      .filter((d) => d.volunteerId === vol.id)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const pickupDuties = volDuties.filter((d) => d.dutyType === 'Pickup');
    const dropDuties = volDuties.filter((d) => d.dutyType === 'Drop');
    const totalDuties = volDuties.length;
    const totalPoints = totalDuties * 0.5;

    return {
      volunteer: vol,
      pickupDuties,
      dropDuties,
      allDuties: volDuties,
      totalPickup: pickupDuties.length,
      totalDrop: dropDuties.length,
      totalDuties,
      totalPoints,
    };
  });

  const filteredExcelData = excelData
    .filter((item) => {
      const matchesGroup = excelGroup === 'All' || item.volunteer.year === excelGroup;
      const matchesSearch =
        excelSearch.trim() === '' ||
        item.volunteer.name.toLowerCase().includes(excelSearch.toLowerCase()) ||
        (item.volunteer.rollNumber && item.volunteer.rollNumber.toLowerCase().includes(excelSearch.toLowerCase())) ||
        (item.volunteer.phone && item.volunteer.phone.includes(excelSearch)) ||
        item.allDuties.some((d) => d.date.includes(excelSearch));
      return matchesGroup && matchesSearch;
    })
    .sort((a, b) => {
      if (excelSortBy === 'points_asc') {
        return a.totalPoints - b.totalPoints || a.volunteer.name.localeCompare(b.volunteer.name);
      }
      if (excelSortBy === 'points_desc') {
        return b.totalPoints - a.totalPoints || a.volunteer.name.localeCompare(b.volunteer.name);
      }
      if (excelSortBy === 'duties') {
        return b.totalDuties - a.totalDuties || a.volunteer.name.localeCompare(b.volunteer.name);
      }
      return a.volunteer.name.localeCompare(b.volunteer.name);
    });

  // Grand totals for Excel Sheet
  const totalMasterPickups = excelData.reduce((acc, curr) => acc + curr.totalPickup, 0);
  const totalMasterDrops = excelData.reduce((acc, curr) => acc + curr.totalDrop, 0);
  const totalMasterDuties = totalMasterPickups + totalMasterDrops;
  const totalMasterPoints = totalMasterDuties * 0.5;

  // Export Excel Master Sheet (CSV with all dates and columns)
  const handleExportMasterExcelCSV = () => {
    const csv = StorageService.exportVolunteerMasterSheetCSV(volunteers, dutyRecords);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vikalp_Volunteers_Points_and_Duty_Dates_Sheet_${StorageService.getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. MONTHLY RECORDS DATA
  const monthlyRows = StorageService.getMonthlyRecords(selectedYear, selectedMonth);
  const totalMonthlyPickup = monthlyRows.reduce((sum, r) => sum + r.pickupCount, 0);
  const totalMonthlyDrop = monthlyRows.reduce((sum, r) => sum + r.dropCount, 0);
  const totalMonthlyDuties = totalMonthlyPickup + totalMonthlyDrop;
  const totalMonthlyPoints = totalMonthlyDuties * 0.5;

  // Export Monthly CSV
  const handleExportMonthlyCSV = () => {
    const csv = StorageService.exportMonthlySummaryCSV(selectedYear, selectedMonth);
    const monthName = months.find((m) => m.value === selectedMonth)?.name || 'Month';
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vikalp_Duty_Report_${monthName}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Full History CSV
  const handleExportFullHistoryCSV = () => {
    const csv = StorageService.exportDutyRecordsCSV(dutyRecords);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vikalp_Full_Duty_History_${StorageService.getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. CALENDAR COMPUTATIONS
  const firstDayOfMonth = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();

  const selectedDateDuties = dutyRecords.filter((d) => d.date === calendarDate);
  const selectedDatePickups = selectedDateDuties.filter((d) => d.dutyType === 'Pickup');
  const selectedDateDrops = selectedDateDuties.filter((d) => d.dutyType === 'Drop');

  const prevCalMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextCalMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // 4. HISTORY FILTERED DATA
  const filteredHistory = dutyRecords
    .filter((d) => {
      const matchesSearch =
        historySearch.trim() === '' ||
        d.volunteerName.toLowerCase().includes(historySearch.toLowerCase()) ||
        d.date.includes(historySearch) ||
        (d.notes && d.notes.toLowerCase().includes(historySearch.toLowerCase()));
      const matchesGroup = historyGroup === 'All' || d.year === historyGroup;
      const matchesType = historyDutyType === 'All' || d.dutyType === historyDutyType;
      const matchesMonth = historyMonthFilter === 'All' || d.date.startsWith(historyMonthFilter);
      return matchesSearch && matchesGroup && matchesType && matchesMonth;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      {/* Top Header Card & Sub-Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Duty Records & Excel Sheets
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              View all volunteers with points and duty dates in an Excel-like column grid, edit mistaken entries, or download reports.
            </p>
          </div>

          {/* Export Master Excel Sheet Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMasterExcelCSV}
              id="btn-download-master-excel"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel Sheet</span>
            </button>
          </div>
        </div>

        {/* 5 Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('excel')}
            id="tab-excel-master"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-1 cursor-pointer ${
              activeTab === 'excel'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
            <span>Excel Master Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            id="tab-monthly-record"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-1 cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
            <span>Monthly Record</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            id="tab-calendar-record"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-1 cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            id="tab-duty-history"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-1 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-700" />
            <span>Duty History Log</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            id="tab-statistics"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-1 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* 1. EXCEL MASTER SHEET TAB */}
      {activeTab === 'excel' && (
        <div className="space-y-4">
          {/* Top Info Banner with Quick Metrics */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                  Excel Spreadsheet Matrix
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  All Volunteers with Points & Duty Dates
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Inspect the exact dates each volunteer performed Pickups and Drops. Easily download this sheet as a formatted CSV compatible with Microsoft Excel and Google Sheets.
                </p>
              </div>

              <button
                onClick={handleExportMasterExcelCSV}
                id="btn-download-matrix-csv"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Sheet (.CSV)</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800">
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-300 uppercase font-bold block">Total Volunteers</span>
                <span className="text-lg font-black text-white mt-0.5 block">{volunteers.length}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Pickup Shifts</span>
                <span className="text-lg font-black text-emerald-300 mt-0.5 block">{totalMasterPickups}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Drop Shifts</span>
                <span className="text-lg font-black text-indigo-300 mt-0.5 block">{totalMasterDrops}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-amber-300 uppercase font-bold block">Total Points</span>
                <span className="text-lg font-black text-amber-300 mt-0.5 block">{totalMasterPoints.toFixed(1)} pts</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={excelSearch}
                onChange={(e) => setExcelSearch(e.target.value)}
                placeholder="Search volunteer name, roll, phone, or specific date (e.g. 2026-08-24)..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
              />
            </div>

            {/* Year Group Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
              {(['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setExcelGroup(group)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    excelGroup === group
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={excelSortBy}
              onChange={(e) => setExcelSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shrink-0 cursor-pointer"
            >
              <option value="points_asc">Points: Lowest First (Fair)</option>
              <option value="points_desc">Points: Highest First</option>
              <option value="duties">Most Duties Completed</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Excel-like Spreadsheet Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-10 text-center border-r border-slate-200 bg-slate-200/60">#</th>
                    <th className="py-3 px-3.5 border-r border-slate-200 min-w-[150px]">Volunteer Name</th>
                    <th className="py-3 px-3 border-r border-slate-200 w-24">Year</th>
                    <th className="py-3 px-3 border-r border-slate-200 w-24">Roll No</th>
                    <th className="py-3 px-3 border-r border-slate-200 min-w-[120px]">3 Days</th>
                    <th className="py-3 px-3 border-r border-slate-200 text-center w-20 bg-emerald-50/60 text-emerald-900">Pickup</th>
                    <th className="py-3 px-3 border-r border-slate-200 text-center w-20 bg-indigo-50/60 text-indigo-900">Drop</th>
                    <th className="py-3 px-3 border-r border-slate-200 text-center w-20 font-black">Duties</th>
                    <th className="py-3 px-3 border-r border-slate-200 text-right w-24 bg-amber-50/60 text-amber-900 font-black">Points</th>
                    <th className="py-3 px-3.5 border-r border-slate-200 min-w-[200px]">Pickup Duty Dates</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Drop Duty Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredExcelData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-slate-400 italic">
                        No volunteers match the search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredExcelData.map((row, idx) => (
                      <tr key={row.volunteer.id} className="hover:bg-slate-50/90 transition-colors group font-sans">
                        {/* Row Index */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-400 font-mono text-[11px] bg-slate-50/40">
                          {idx + 1}
                        </td>

                        {/* Volunteer Name */}
                        <td className="py-2.5 px-3.5 border-r border-slate-200">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {row.volunteer.name}
                          </span>
                          {row.volunteer.phone && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {row.volunteer.phone}
                            </span>
                          )}
                        </td>

                        {/* Year */}
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.volunteer.year === '1st Year' ? 'bg-emerald-50 text-emerald-700' :
                            row.volunteer.year === '2nd Year' ? 'bg-blue-50 text-blue-700' :
                            row.volunteer.year === '3rd Year' ? 'bg-purple-50 text-purple-700' :
                            row.volunteer.year === '4th Year' ? 'bg-amber-50 text-amber-700' :
                            row.volunteer.year === '5th Year' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.volunteer.year}
                          </span>
                        </td>

                        {/* Roll Number */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                          {row.volunteer.rollNumber || '—'}
                        </td>

                        {/* Assigned 3 Days */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-[11px] text-slate-600">
                          <div className="flex flex-wrap gap-1">
                            {row.volunteer.dutyDays.map((d) => (
                              <span key={d} className="px-1 py-0.2 bg-slate-100 rounded text-[9px] font-semibold text-slate-700">
                                {d.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Pickup Count */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-emerald-800 bg-emerald-50/20">
                          {row.totalPickup}
                        </td>

                        {/* Drop Count */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-indigo-800 bg-indigo-50/20">
                          {row.totalDrop}
                        </td>

                        {/* Total Duties */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-extrabold text-slate-900">
                          {row.totalDuties}
                        </td>

                        {/* Total Points */}
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-black text-amber-700 bg-amber-50/20 text-sm">
                          {row.totalPoints.toFixed(1)}
                        </td>

                        {/* Pickup Duty Dates */}
                        <td className="py-2.5 px-3.5 border-r border-slate-200">
                          {row.pickupDuties.length === 0 ? (
                            <span className="text-slate-300 italic text-[10px]">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.pickupDuties.map((d) => (
                                <span
                                  key={d.id}
                                  title={`${d.date} (${d.day}) - Pickup`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-mono font-bold"
                                >
                                  <span>{d.date}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Drop Duty Dates */}
                        <td className="py-2.5 px-3.5">
                          {row.dropDuties.length === 0 ? (
                            <span className="text-slate-300 italic text-[10px]">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.dropDuties.map((d) => (
                                <span
                                  key={d.id}
                                  title={`${d.date} (${d.day}) - Drop`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-mono font-bold"
                                >
                                  <span>{d.date}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
                    <td colSpan={5} className="py-3 px-3.5 text-right uppercase tracking-wider text-[11px] text-slate-300">
                      Master Column Totals:
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-300 font-black text-sm">
                      {totalMasterPickups}
                    </td>
                    <td className="py-3 px-3 text-center text-indigo-300 font-black text-sm">
                      {totalMasterDrops}
                    </td>
                    <td className="py-3 px-3 text-center text-white font-black text-sm">
                      {totalMasterDuties}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300 font-black text-sm">
                      {totalMasterPoints.toFixed(1)} pts
                    </td>
                    <td colSpan={2} className="py-3 px-3.5 text-slate-400 text-[11px] italic">
                      All volunteer historical dates accounted for
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MONTHLY RECORD TAB */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Month & Year Selectors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Report for <strong className="text-slate-900 uppercase">{months.find(m => m.value === selectedMonth)?.name} {selectedYear}</strong>
              </span>
              <button
                onClick={handleExportMonthlyCSV}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Monthly Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Volunteer</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3 text-center">Pickup</th>
                    <th className="py-3 px-3 text-center">Drop</th>
                    <th className="py-3 px-3 text-center">Total Duties</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No volunteer duties recorded for this month.
                      </td>
                    </tr>
                  ) : (
                    monthlyRows.map((row) => (
                      <tr key={row.volunteerId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {row.volunteerName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            row.year === '2nd Year' ? 'bg-blue-50 text-blue-700' :
                            row.year === '3rd Year' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.year}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-emerald-800">
                          {row.pickupCount}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-indigo-800">
                          {row.dropCount}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {row.totalDuties}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-700 text-sm">
                          {row.points.toFixed(1)} <span className="text-[10px] font-semibold text-slate-400">pts</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Totals */}
            <div className="bg-slate-900 text-white p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">
                  Total Pickup Duties
                </span>
                <span className="text-lg font-black text-emerald-300 mt-0.5 block">
                  {totalMonthlyPickup}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">
                  Total Drop Duties
                </span>
                <span className="text-lg font-black text-indigo-300 mt-0.5 block">
                  {totalMonthlyDrop}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">
                  Total Duties
                </span>
                <span className="text-lg font-black text-white mt-0.5 block">
                  {totalMonthlyDuties}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-teal-200 uppercase font-bold block">
                  Total Points Awarded
                </span>
                <span className="text-lg font-black text-amber-300 mt-0.5 block">
                  {totalMonthlyPoints.toFixed(1)} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALENDAR / DAY RECORD TAB */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Calendar Grid (7 columns) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-slate-900 text-sm">
                {months.find((m) => m.value === calendarMonth)?.name} {calendarYear}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevCalMonth}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextCalMonth}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty padding days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-11 rounded-lg bg-slate-50/50" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const mStr = String(calendarMonth).padStart(2, '0');
                const dStr = String(dayNum).padStart(2, '0');
                const fullDateStr = `${calendarYear}-${mStr}-${dStr}`;

                const dayDuties = dutyRecords.filter((d) => d.date === fullDateStr);
                const hasDuties = dayDuties.length > 0;
                const isSelected = calendarDate === fullDateStr;

                return (
                  <button
                    key={fullDateStr}
                    onClick={() => setCalendarDate(fullDateStr)}
                    className={`h-11 rounded-xl p-1 flex flex-col items-center justify-between text-xs transition border cursor-pointer ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800 font-bold shadow-xs'
                        : hasDuties
                        ? 'bg-amber-50 text-slate-900 border-amber-200 hover:bg-amber-100/70 font-bold'
                        : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] leading-none">{dayNum}</span>
                    {hasDuties && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-teal-900 text-teal-100'
                          : 'bg-amber-200/80 text-amber-900'
                      }`}>
                        {dayDuties.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
            <div className="border-b border-slate-100 pb-3 mb-3">
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                Selected Date Record
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                {StorageService.getDayOfWeekFromDate(calendarDate).toUpperCase()}
              </h3>
              <p className="text-xs font-bold text-slate-600">
                {StorageService.formatDateFormatted(calendarDate)}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-80">
              {/* Pickup Group */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>PICKUP DUTIES ({selectedDatePickups.length})</span>
                </div>
                {selectedDatePickups.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic pl-5">
                    No pickup duties recorded for this date.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDatePickups.map((d) => (
                      <div
                        key={d.id}
                        className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-700 font-bold">✓</span>
                          <span className="font-bold text-slate-900">{d.volunteerName}</span>
                          <span className="text-[10px] text-slate-500">({d.year})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-emerald-800">
                            +{d.points.toFixed(1)} pts
                          </span>
                          <button
                            onClick={() => handleStartEdit(d)}
                            title="Edit volunteer name or details if mistakenly recorded"
                            className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop Group */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-1.5">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>DROP DUTIES ({selectedDateDrops.length})</span>
                </div>
                {selectedDateDrops.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic pl-5">
                    No drop duties recorded for this date.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDateDrops.map((d) => (
                      <div
                        key={d.id}
                        className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-700 font-bold">✓</span>
                          <span className="font-bold text-slate-900">{d.volunteerName}</span>
                          <span className="text-[10px] text-slate-500">({d.year})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-indigo-800">
                            +{d.points.toFixed(1)} pts
                          </span>
                          <button
                            onClick={() => handleStartEdit(d)}
                            title="Edit volunteer name or details if mistakenly recorded"
                            className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {onOpenRecordDutyForDate && (
              <div className="pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => onOpenRecordDutyForDate(calendarDate)}
                  className="w-full py-2 px-3 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>+ Record Duty for this Date</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DUTY HISTORY LOG TAB (WITH EDIT AND DELETE) */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter by volunteer name or date..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Duty Type filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                {(['All', 'Pickup', 'Drop'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setHistoryDutyType(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      historyDutyType === type
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Year filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                {(['All', '2nd Year', '3rd Year', 'Other'] as const).map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setHistoryGroup(grp)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      historyGroup === grp
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>Showing <strong>{filteredHistory.length}</strong> duty records</span>
              <button
                onClick={handleExportFullHistoryCSV}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Export Complete Audit Trail
              </button>
            </div>
          </div>

          {/* History Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date & Day</th>
                    <th className="py-3 px-3">Volunteer</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Duty Type</th>
                    <th className="py-3 px-3 text-right">Points</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No duty records match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">
                            {StorageService.formatDateFormatted(d.date)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {d.day}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {d.volunteerName}
                          {d.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal italic">
                              Note: {d.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            d.year === '2nd Year' ? 'bg-blue-50 text-blue-700' :
                            d.year === '3rd Year' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {d.year}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            d.dutyType === 'Pickup'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}>
                            {d.dutyType === 'Pickup' ? <Car className="w-3 h-3" /> : <PackageCheck className="w-3 h-3" />}
                            {d.dutyType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-700">
                          +{d.points.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Manual Edit Button */}
                            <button
                              onClick={() => handleStartEdit(d)}
                              title="Edit / Update if mistakenly assigned"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteWithGuard(d)}
                              title="Delete accidental record (Admin only for past dates)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. STATISTICS & ANALYTICS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Duties Logged</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{dutyRecords.length}</span>
              <span className="text-[11px] text-teal-700 font-semibold">Across all sessions</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Duties</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {dutyRecords.filter((d) => d.dutyType === 'Pickup').length}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Morning shifts</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop Duties</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {dutyRecords.filter((d) => d.dutyType === 'Drop').length}
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold">Evening shifts</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Points Awarded</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {(dutyRecords.length * 0.5).toFixed(1)}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">+0.5 per shift</span>
            </div>
          </div>

          {/* Group Breakdown Bar Charts */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Duty Distribution by Volunteer Group
            </h3>

            {(['2nd Year', '3rd Year', 'Other'] as const).map((year) => {
              const count = dutyRecords.filter((d) => d.year === year).length;
              const pct = dutyRecords.length > 0 ? Math.round((count / dutyRecords.length) * 100) : 0;

              return (
                <div key={year} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{year}</span>
                    <span className="font-semibold text-slate-500">
                      {count} duties ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        year === '2nd Year' ? 'bg-blue-500' :
                        year === '3rd Year' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT / UPDATE DUTY RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-200" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Update Duty Record
                  </h3>
                  <p className="text-[11px] text-teal-100">
                    Fix wrong volunteer name, duty date, or shift type
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Volunteer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Volunteer Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editVolunteerId}
                  onChange={(e) => setEditVolunteerId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                >
                  <option value="">-- Choose correct volunteer --</option>
                  {volunteers.map((v) => {
                    const currentSummary = summaries.find((s) => s.volunteerId === v.id);
                    const pts = currentSummary?.totalPoints ?? 0;
                    return (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.year}) - Currently {pts.toFixed(1)} pts
                      </option>
                    );
                  })}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Select the volunteer who actually performed this duty.
                </span>
              </div>

              {/* Duty Date Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Duty Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                />
                {editDate && (
                  <span className="text-[11px] text-teal-700 font-bold mt-1 block">
                    Day: {StorageService.getDayOfWeekFromDate(editDate)}
                  </span>
                )}
              </div>

              {/* Duty Type Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Duty Shift Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditDutyType('Pickup')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      editDutyType === 'Pickup'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Pickup (Morning)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditDutyType('Drop')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      editDutyType === 'Drop'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Drop (Evening)</span>
                  </button>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Notes / Correction Reason (Optional)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Corrected mistaken volunteer name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save & Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Authorization Required Warning Modal */}
      {adminWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-amber-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Admin Authority Required</h3>
                  <p className="text-xs text-amber-100">Past Day Duty Protection</p>
                </div>
              </div>
              <button
                onClick={() => setAdminWarningModal(null)}
                className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-950 leading-relaxed">
                  {adminWarningModal}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminWarningModal(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                {onRequireAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminWarningModal(null);
                      onRequireAdmin();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    Sign in as Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
