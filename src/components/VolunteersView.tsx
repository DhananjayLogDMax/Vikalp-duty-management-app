import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RotateCcw,
  Calendar, 
  Phone, 
  Mail,
  Hash, 
  Award, 
  Sparkles,
  X,
  AlertCircle,
  Download,
  GraduationCap,
  Archive,
  Clock,
  HelpCircle
} from 'lucide-react';
import { 
  Volunteer, 
  VolunteerGroup, 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  VolunteerPointsSummary 
} from '../types';
import { StorageService } from '../services/storage';

interface VolunteersViewProps {
  volunteers: Volunteer[];
  summaries: VolunteerPointsSummary[];
  onAddVolunteer: (vol: Omit<Volunteer, 'id' | 'createdAt'>) => void;
  onUpdateVolunteer: (id: string, updates: Partial<Omit<Volunteer, 'id' | 'createdAt'>>) => void;
  onDeleteVolunteer: (id: string) => void;
  onDataChanged: () => void;
}

export const VolunteersView: React.FC<VolunteersViewProps> = ({
  volunteers,
  summaries,
  onAddVolunteer,
  onUpdateVolunteer,
  onDeleteVolunteer,
  onDataChanged,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<VolunteerGroup | 'All' | 'Trash'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState<VolunteerGroup>('1st Year');
  const [formRoll, setFormRoll] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDays, setFormDays] = useState<DayOfWeek[]>([]);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [volToDelete, setVolToDelete] = useState<Volunteer | null>(null);
  const [deleteMode, setDeleteMode] = useState<'trash' | 'permanent'>('trash');

  // Trashed volunteers
  const trashedVolunteers = StorageService.getTrashedVolunteers();

  // Summary mapping
  const summaryMap = new Map<string, VolunteerPointsSummary>();
  summaries.forEach((s) => summaryMap.set(s.volunteerId, s));

  // Counts by year group
  const count1st = volunteers.filter((v) => v.year === '1st Year').length;
  const count2nd = volunteers.filter((v) => v.year === '2nd Year').length;
  const count3rd = volunteers.filter((v) => v.year === '3rd Year').length;
  const count4th = volunteers.filter((v) => v.year === '4th Year').length;
  const count5th = volunteers.filter((v) => v.year === '5th Year').length;
  const countOther = volunteers.filter((v) => v.year === 'Other').length;

  // Filter active/current volunteers
  const filteredVolunteers = volunteers.filter((v) => {
    const matchesGroup = selectedGroup === 'All' || v.year === selectedGroup;
    const matchesActive = !showActiveOnly || v.active;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' ||
      v.name.toLowerCase().includes(q) ||
      (v.rollNumber && v.rollNumber.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q));
    return matchesGroup && matchesActive && matchesSearch;
  });

  // Filter trashed volunteers if trash tab is selected
  const filteredTrash = trashedVolunteers.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    return q === '' ||
      v.name.toLowerCase().includes(q) ||
      (v.rollNumber && v.rollNumber.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q));
  });

  const openAddModal = (defaultYear: VolunteerGroup = '1st Year') => {
    setEditingVolunteer(null);
    setFormName('');
    setFormYear(defaultYear);
    setFormRoll('');
    setFormPhone('');
    setFormEmail('');
    setFormDays(['Monday', 'Wednesday', 'Friday']); // Default 3 days
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Volunteer) => {
    setEditingVolunteer(v);
    setFormName(v.name);
    setFormYear(v.year);
    setFormRoll(v.rollNumber || '');
    setFormPhone(v.phone || '');
    setFormEmail(v.email || '');
    setFormDays([...v.dutyDays]);
    setFormActive(v.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleDaySelection = (day: DayOfWeek) => {
    if (formDays.includes(day)) {
      setFormDays(formDays.filter((d) => d !== day));
    } else {
      if (formDays.length >= 3) {
        setFormError('You can select exactly 3 duty days. Deselect a day first.');
        return;
      }
      setFormError(null);
      setFormDays([...formDays, day]);
    }
  };

  const handleSaveVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter full name.');
      return;
    }
    if (formDays.length !== 3) {
      setFormError('A volunteer must have exactly 3 assigned duty days per week.');
      return;
    }

    if (editingVolunteer) {
      onUpdateVolunteer(editingVolunteer.id, {
        name: formName.trim(),
        year: formYear,
        rollNumber: formRoll.trim() || undefined,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        dutyDays: formDays,
        active: formActive,
      });
    } else {
      onAddVolunteer({
        name: formName.trim(),
        year: formYear,
        rollNumber: formRoll.trim() || undefined,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        dutyDays: formDays,
        active: formActive,
      });
    }

    setIsModalOpen(false);
  };

  // Trash & Restore handlers
  const handleConfirmDelete = () => {
    if (!volToDelete) return;
    if (deleteMode === 'trash') {
      StorageService.trashVolunteer(volToDelete.id);
    } else {
      StorageService.permanentDeleteVolunteer(volToDelete.id);
    }
    setVolToDelete(null);
    onDataChanged();
  };

  const handleRestoreFromTrash = (vol: Volunteer) => {
    StorageService.restoreVolunteer(vol.id);
    onDataChanged();
  };

  const handleEmptyTrash = () => {
    if (confirm(`Are you sure you want to permanently remove all ${trashedVolunteers.length} volunteers in the Trash? All work histories will remain archived in Master Sheet CSV downloads.`)) {
      StorageService.emptyTrash();
      onDataChanged();
    }
  };

  // Export Master Sheet
  const handleExportMasterSheet = () => {
    const csvData = StorageService.exportVolunteerMasterSheetCSV();
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vikalp_Volunteers_Master_Sheet_${StorageService.getTodayDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getYearBadgeStyle = (year: VolunteerGroup) => {
    switch (year) {
      case '1st Year':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '2nd Year':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '3rd Year':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '4th Year':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '5th Year':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                VOLUNTEER MANAGEMENT DASHBOARD
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add, edit, and delete 1st, 2nd, 3rd, 4th, 5th Year & Other volunteers with safe Trash & Excel history
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportMasterSheet}
              id="btn-export-volunteer-master"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download Master Sheet</span>
            </button>

            <button
              onClick={() => openAddModal(selectedGroup !== 'All' && selectedGroup !== 'Trash' ? selectedGroup : '1st Year')}
              id="btn-add-volunteer-top"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md shadow-teal-700/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ADD VOLUNTEER</span>
            </button>
          </div>
        </div>

        {/* 6 Quick Category Cards: 1st, 2nd, 3rd, 4th, 5th Year + Trash */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4">
          {/* 1st Year Card */}
          <div 
            onClick={() => setSelectedGroup('1st Year')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedGroup === '1st Year'
                ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                1st Year
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddModal('1st Year');
                }}
                className="w-4 h-4 rounded bg-emerald-200/60 hover:bg-emerald-300 text-emerald-900 flex items-center justify-center text-[10px] font-bold"
                title="Add 1st Year Volunteer"
              >
                +
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-emerald-900">{count1st}</span>
              <span className="text-[9px] text-emerald-700 font-semibold">vols</span>
            </div>
          </div>

          {/* 2nd Year Card */}
          <div 
            onClick={() => setSelectedGroup('2nd Year')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedGroup === '2nd Year'
                ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                2nd Year
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddModal('2nd Year');
                }}
                className="w-4 h-4 rounded bg-blue-200/60 hover:bg-blue-300 text-blue-900 flex items-center justify-center text-[10px] font-bold"
                title="Add 2nd Year Volunteer"
              >
                +
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-blue-900">{count2nd}</span>
              <span className="text-[9px] text-blue-700 font-semibold">vols</span>
            </div>
          </div>

          {/* 3rd Year Card */}
          <div 
            onClick={() => setSelectedGroup('3rd Year')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedGroup === '3rd Year'
                ? 'bg-purple-50/90 border-purple-500 shadow-xs ring-1 ring-purple-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">
                3rd Year
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddModal('3rd Year');
                }}
                className="w-4 h-4 rounded bg-purple-200/60 hover:bg-purple-300 text-purple-900 flex items-center justify-center text-[10px] font-bold"
                title="Add 3rd Year Volunteer"
              >
                +
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-purple-900">{count3rd}</span>
              <span className="text-[9px] text-purple-700 font-semibold">vols</span>
            </div>
          </div>

          {/* 4th Year Card */}
          <div 
            onClick={() => setSelectedGroup('4th Year')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedGroup === '4th Year'
                ? 'bg-amber-50/90 border-amber-500 shadow-xs ring-1 ring-amber-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                4th Year
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddModal('4th Year');
                }}
                className="w-4 h-4 rounded bg-amber-200/60 hover:bg-amber-300 text-amber-900 flex items-center justify-center text-[10px] font-bold"
                title="Add 4th Year Volunteer"
              >
                +
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-amber-900">{count4th}</span>
              <span className="text-[9px] text-amber-700 font-semibold">vols</span>
            </div>
          </div>

          {/* 5th Year Card */}
          <div 
            onClick={() => setSelectedGroup('5th Year')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedGroup === '5th Year'
                ? 'bg-rose-50/90 border-rose-500 shadow-xs ring-1 ring-rose-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">
                5th Year
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddModal('5th Year');
                }}
                className="w-4 h-4 rounded bg-rose-200/60 hover:bg-rose-300 text-rose-900 flex items-center justify-center text-[10px] font-bold"
                title="Add 5th Year Volunteer"
              >
                +
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-rose-900">{count5th}</span>
              <span className="text-[9px] text-rose-700 font-semibold">vols</span>
            </div>
          </div>

          {/* Trash Bin Card */}
          <div 
            onClick={() => setSelectedGroup('Trash')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedGroup === 'Trash'
                ? 'bg-red-50/90 border-red-500 shadow-xs ring-1 ring-red-500'
                : 'bg-slate-50/60 border-slate-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide flex items-center gap-1">
                <Trash2 className="w-3 h-3 text-red-600" /> Trash Bin
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-red-900">{trashedVolunteers.length}</span>
              <span className="text-[9px] text-red-700 font-semibold">trashed</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteers by name, roll, phone..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50/50 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
            {(['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other', 'Trash'] as const).map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  selectedGroup === grp
                    ? grp === 'Trash'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-teal-800 shadow-xs'
                    : grp === 'Trash'
                    ? 'text-rose-700 hover:text-rose-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grp === 'Trash' && <Trash2 className="w-3 h-3" />}
                <span>{grp === 'Trash' ? `Trash (${trashedVolunteers.length})` : grp}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW: TRASH BIN */}
      {selectedGroup === 'Trash' ? (
        <div className="space-y-3">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-700" />
                <h3 className="font-bold text-rose-950 text-sm">
                  Trash Bin ({trashedVolunteers.length} Volunteers)
                </h3>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                Volunteers in Trash are excluded from active duty schedules. You can restore them anytime or delete them permanently.
              </p>
            </div>

            {trashedVolunteers.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            )}
          </div>

          {filteredTrash.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Trash2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Trash is empty</p>
              <p className="text-xs text-slate-400 mt-1">No volunteers currently in trash bin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTrash.map((vol) => {
                const summary = summaryMap.get(vol.id);
                const totalPoints = summary ? summary.totalPoints : 0;
                const totalDuties = summary ? summary.totalDuties : 0;

                return (
                  <div
                    key={vol.id}
                    className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">
                              {vol.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              {vol.year}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            {vol.rollNumber && (
                              <span className="inline-flex items-center gap-1 font-mono">
                                <Hash className="w-3 h-3 text-slate-400" /> {vol.rollNumber}
                              </span>
                            )}
                            {vol.trashedAt && (
                              <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                                Trashed: {vol.trashedAt.substring(0, 10)}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          In Trash
                        </span>
                      </div>

                      {/* Work dates info */}
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Recorded History:</span>
                        <span className="font-bold text-slate-800">
                          {totalDuties} duties ({totalPoints.toFixed(1)} pts)
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestoreFromTrash(vol)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => {
                          setVolToDelete(vol);
                          setDeleteMode('permanent');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW: ACTIVE VOLUNTEERS DIRECTORY */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredVolunteers.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No volunteers found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting search or add a new volunteer.</p>
              <button
                onClick={() => openAddModal(selectedGroup !== 'All' ? selectedGroup : '1st Year')}
                className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-800 underline cursor-pointer"
              >
                + Add New Volunteer
              </button>
            </div>
          ) : (
            filteredVolunteers.map((vol) => {
              const summary = summaryMap.get(vol.id);
              const totalPoints = summary ? summary.totalPoints : 0;
              const totalDuties = summary ? summary.totalDuties : 0;
              const firstDuty = summary?.firstDutyDate;
              const lastDuty = summary?.lastDutyDate;

              return (
                <div
                  key={vol.id}
                  id={`volunteer-card-manage-${vol.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between gap-3"
                >
                  <div>
                    {/* Top Bar: Name, Year & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">
                            {vol.name}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getYearBadgeStyle(vol.year)}`}>
                            {vol.year}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          {vol.rollNumber && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Hash className="w-3 h-3 text-slate-400" /> {vol.rollNumber}
                            </span>
                          )}
                          {vol.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {vol.phone}
                            </span>
                          )}
                          {vol.email && (
                            <span className="inline-flex items-center gap-1 text-teal-700 font-mono text-[11px]">
                              <Mail className="w-3 h-3 text-teal-600" /> {vol.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active status indicator */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vol.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {vol.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* 3 Assigned Duty Days */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Assigned Shift Days (3/Week):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {vol.dutyDays.map((day) => (
                          <span
                            key={day}
                            className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Work dates span indicator */}
                    {firstDuty && lastDuty && (
                      <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Worked from <strong>{firstDuty}</strong> to <strong>{lastDuty}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Points & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        🏆 {totalPoints.toFixed(1)} Pts
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({totalDuties} duties)
                      </span>
                    </div>

                    {/* Action buttons: Edit & Explicit Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(vol)}
                        id={`btn-edit-volunteer-${vol.id}`}
                        title="Edit volunteer details"
                        className="px-2.5 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 transition border border-slate-200 hover:border-teal-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setVolToDelete(vol);
                          setDeleteMode('trash');
                        }}
                        id={`btn-delete-volunteer-${vol.id}`}
                        title="Delete volunteer"
                        className="px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {volToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {deleteMode === 'trash' ? 'Delete Volunteer' : 'Permanently Delete Volunteer'}
                </h3>
                <p className="text-xs text-slate-500">
                  {volToDelete.name} ({volToDelete.year})
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-4 space-y-1.5">
              {deleteMode === 'trash' ? (
                <>
                  <p className="font-semibold text-slate-800">
                    Are you sure you want to delete <strong>{volToDelete.name}</strong>?
                  </p>
                  <p className="text-slate-500">
                    They will be moved to the <strong>Trash Bin</strong> and removed from the active duty schedule. You can restore them anytime from the Trash tab.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-rose-900">
                    Are you sure you want to permanently delete <strong>{volToDelete.name}</strong>?
                  </p>
                  <p className="text-slate-500">
                    All past work records and duty history will remain archived in downloaded Excel CSV reports.
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVolToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteMode === 'trash' ? 'Move to Trash' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Volunteer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure details and select exactly 3 duty days
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveVolunteer} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Year Group: 1st Year, 2nd Year, 3rd Year, 4th Year, 5th Year, Other */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Group / Year <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other'] as const).map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setFormYear(y)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        formYear === y
                          ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Roll, Phone & Gmail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile (For Login)
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gmail / Email (For Login)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll / Registration ID (Optional)
                </label>
                <input
                  type="text"
                  value={formRoll}
                  onChange={(e) => setFormRoll(e.target.value)}
                  placeholder="e.g. FY-101 / CS-301"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Duty Days Selection (Mandatory Exactly 3 Days) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Assigned Duty Days <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    formDays.length === 3
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Selected: {formDays.length} / 3 days {formDays.length === 3 ? '✓ Complete' : `(Select ${3 - formDays.length} more)`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = formDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-teal-50 text-teal-800 border-teal-500 ring-1 ring-teal-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="form-active-toggle"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="form-active-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Volunteer is Active for duty schedules
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {editingVolunteer ? (
                  <button
                    type="button"
                    onClick={() => {
                      const vol = editingVolunteer;
                      setIsModalOpen(false);
                      setVolToDelete(vol);
                      setDeleteMode('trash');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Volunteer</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formDays.length !== 3}
                    id="btn-save-volunteer"
                    className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md transition ${
                      formDays.length === 3
                        ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {editingVolunteer ? 'Save Changes' : 'Add Volunteer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
