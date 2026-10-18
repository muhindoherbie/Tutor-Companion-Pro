import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import {
  useActiveClasses,
  useStudentsForClass,
  useAllAssessments,
  dbService,
} from '../../services/database';
import { StudentRow } from '../../types';

interface StudentsScreenProps {
  initialClassId?: string;
  onSelectClass?: (classId: string) => void;
}

export const StudentsScreen: React.FC<StudentsScreenProps> = ({
  initialClassId,
  onSelectClass,
}) => {
  const classes = useActiveClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes[0]?.id ?? '')
  );

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const students = useStudentsForClass(selectedClassId);
  const allAssessments = useAllAssessments();

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');

  // Student form modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);

  // Student form fields
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(selectedClass?.yearOfStudy || 1);

  // Quick Inline Edit Marks state
  const [editingMark, setEditingMark] = useState<{
    studentId: string;
    assessmentId: string;
    currentVal: number;
  } | null>(null);
  const [markInputVal, setMarkInputVal] = useState<string>('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || s.yearOfStudy === yearFilter;
    return matchesSearch && matchesYear;
  });

  const openNewStudentModal = () => {
    setEditingStudent(null);
    setStudentIdNumber(`STD/${new Date().getFullYear()}/${String(students.length + 1).padStart(3, '0')}`);
    setFullName('');
    setGender('female');
    setDateOfBirth('');
    setContactEmail('');
    setContactPhone('');
    setGuardianName('');
    setGuardianPhone('');
    setYearOfStudy(selectedClass?.yearOfStudy || 1);
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (student: StudentRow) => {
    setEditingStudent(student);
    setStudentIdNumber(student.studentIdNumber);
    setFullName(student.fullName);
    setGender(student.gender);
    setDateOfBirth(student.dateOfBirth || '');
    setContactEmail(student.contactEmail || '');
    setContactPhone(student.contactPhone || '');
    setGuardianName(student.guardianName || '');
    setGuardianPhone(student.guardianPhone || '');
    setYearOfStudy(student.yearOfStudy);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !fullName.trim() || !studentIdNumber.trim()) return;

    dbService.saveStudent({
      id: editingStudent?.id,
      classId: selectedClassId,
      studentIdNumber: studentIdNumber.trim(),
      fullName: fullName.trim(),
      gender,
      dateOfBirth: dateOfBirth.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      guardianPhone: guardianPhone.trim() || undefined,
      yearOfStudy: Number(yearOfStudy),
      enrollmentDate: editingStudent?.enrollmentDate || new Date().toISOString().split('T')[0],
      marks: editingStudent?.marks || {},
    });

    setIsStudentModalOpen(false);
  };

  const handleSaveMark = () => {
    if (!editingMark) return;
    const score = parseFloat(markInputVal);
    if (!isNaN(score)) {
      dbService.updateStudentMark(editingMark.studentId, editingMark.assessmentId, score);
    }
    setEditingMark(null);
  };

  const handleExportCSV = () => {
    if (!selectedClass || students.length === 0) return;

    const headers = ['Student ID', 'Full Name', 'Gender', 'Year of Study', 'Contact Email', 'Contact Phone', 'Guardian', 'Average Mark (%)'];
    const rows = students.map((s) => {
      const markValues = Object.values(s.marks || {});
      const avg = markValues.length > 0 ? (markValues.reduce((a, b) => a + b, 0) / markValues.length).toFixed(1) : 'N/A';
      return [
        s.studentIdNumber,
        `"${s.fullName}"`,
        s.gender,
        s.yearOfStudy,
        s.contactEmail || '',
        s.contactPhone || '',
        `"${s.guardianName || ''}"`,
        avg,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_')}_Student_Marks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#00696f]" />
            <span>Students & Academic Gradebook</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Capture complete student biodata, organize cohorts systematically by year of study,
            and maintain real-time marks records across coursework, assignments, and exams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={students.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openNewStudentModal}
            disabled={!selectedClass}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#00696f] hover:bg-[#005358] rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Selector Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-full max-w-xs">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Select Class Cohort
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  onSelectClass?.(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.yearOfStudy ? `(Year ${c.yearOfStudy})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Year of Study
              </label>
              <select
                value={yearFilter}
                onChange={(e) =>
                  setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white"
              >
                <option value="all">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64 self-end">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
            />
          </div>
        </div>
      </div>

      {/* Gradebook Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800">No students found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {students.length === 0
              ? 'No students registered in this class yet. Click "Register Student" to enroll one.'
              : 'No students match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-3">Year</th>
                  <th className="py-3 px-3">Gender</th>
                  {allAssessments.slice(0, 3).map((a) => (
                    <th key={a.id} className="py-3 px-3 text-center truncate max-w-[140px]" title={a.title}>
                      {a.title} ({a.totalMarks}M)
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Average</th>
                  <th className="py-3 px-3 text-center">Standing</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const marksList = Object.values(s.marks || {});
                  const avg = marksList.length > 0 ? marksList.reduce((a, b) => a + b, 0) / marksList.length : null;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#00696f]">
                        {s.studentIdNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {s.fullName}
                        {s.contactEmail && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {s.contactEmail}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-xs font-medium">
                        Year {s.yearOfStudy}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs capitalize">
                        {s.gender}
                      </td>

                      {/* Marks per Assessment */}
                      {allAssessments.slice(0, 3).map((a) => {
                        const currentScore = s.marks?.[a.id];
                        const isEditingThis =
                          editingMark?.studentId === s.id && editingMark?.assessmentId === a.id;

                        return (
                          <td key={a.id} className="py-3 px-3 text-center">
                            {isEditingThis ? (
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  autoFocus
                                  value={markInputVal}
                                  onChange={(e) => setMarkInputVal(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveMark()}
                                  className="w-16 px-1.5 py-0.5 text-center text-xs border border-[#00696f] rounded"
                                />
                                <button
                                  onClick={handleSaveMark}
                                  className="text-xs text-emerald-600 font-bold"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingMark({
                                    studentId: s.id,
                                    assessmentId: a.id,
                                    currentVal: currentScore ?? 0,
                                  });
                                  setMarkInputVal(currentScore !== undefined ? String(currentScore) : '');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors hover:bg-slate-100"
                                title="Click to edit mark"
                              >
                                {currentScore !== undefined ? (
                                  <span
                                    className={
                                      currentScore >= 50 ? 'text-emerald-700' : 'text-red-600'
                                    }
                                  >
                                    {currentScore}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Average */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                        {avg !== null ? (
                          <span className={avg >= 50 ? 'text-slate-900' : 'text-red-600'}>
                            {avg.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Grade Standing */}
                      <td className="py-3 px-3 text-center">
                        {avg !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              avg >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : avg >= 70
                                ? 'bg-teal-100 text-teal-800'
                                : avg >= 50
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {avg >= 80 ? 'Distinction' : avg >= 70 ? 'Credit' : avg >= 50 ? 'Pass' : 'Retake'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditStudentModal(s)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit student biodata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => dbService.deleteStudent(s.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Biodata Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Edit Student Biodata' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Student ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="e.g. DPH/2025/042"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aisha Namubiru"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="student@campus.ac"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+256 701 000 000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Guardian full name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+256 772 000 000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#00696f] hover:bg-[#005358] rounded-xl shadow-xs"
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
