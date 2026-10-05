import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, GraduationCap, Hash, CheckCircle2, ShieldCheck, Briefcase, Award } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const isStaff = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'faculty' || user?.role === 'organizer';

  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    department: user?.department || (isStaff ? 'Student Affairs & Innovation' : 'Computer Science & Engineering'),
    designation: user?.designation || user?.academic_year || (isStaff ? 'Professor' : '3rd Year'),
    academic_year: user?.academic_year || '3rd Year',
    employee_id: user?.employee_id || user?.student_id || '',
    student_id: user?.student_id || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        department: user.department || (isStaff ? 'Student Affairs & Innovation' : 'Computer Science & Engineering'),
        designation: user.designation || user.academic_year || (isStaff ? 'Professor' : '3rd Year'),
        academic_year: user.academic_year || '3rd Year',
        employee_id: user.employee_id || user.student_id || '',
        student_id: user.student_id || '',
      });
    }
  }, [user, isStaff]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = isStaff
        ? {
            display_name: formData.display_name,
            department: formData.department,
            designation: formData.designation,
            academic_year: formData.designation, // synced for backwards compatibility
            employee_id: formData.employee_id,
            student_id: formData.employee_id,   // synced for existing views
          }
        : {
            display_name: formData.display_name,
            department: formData.department,
            academic_year: formData.academic_year,
            student_id: formData.student_id,
          };

      await updateProfile(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1.5 pb-2 border-b border-slate-200">
        <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          {isStaff ? <Briefcase className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
          <span>{isStaff ? 'Faculty & Staff Directory' : 'Student Identity'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile & Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {isStaff
            ? 'Manage your verified campus faculty and staff institutional credentials.'
            : 'Manage your verified campus student information used on digital event passes.'}
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profile information successfully updated and saved to campus database.</span>
          </div>
        )}

        {/* Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
              alt={user?.display_name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {user?.display_name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isStaff
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {isStaff ? 'Role: Faculty / Admin' : 'Role: Student'}
                </span>
                {isStaff && formData.designation && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Award className="w-3 h-3 mr-1 text-amber-700" />
                    {formData.designation}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 text-xs text-slate-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Code</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {isStaff ? (formData.employee_id || 'FAC-2018-012') : (formData.student_id || '7376211CS142')}
            </span>
          </div>
        </div>

        {/* Dynamic Form based on Staff vs Student */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder={isStaff ? 'e.g. Dr. Sarah Jenkins' : 'e.g. Sanjay Pravin R'}
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isStaff ? 'Department / Campus Office *' : 'Degree Department *'}
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                {isStaff ? (
                  <>
                    <option value="Student Affairs & Innovation">Student Affairs & Innovation</option>
                    <option value="Office of the Principal">Office of the Principal</option>
                    <option value="Office of the Dean (Academics)">Office of the Dean (Academics)</option>
                    <option value="Office of the Dean (Student Affairs)">Office of the Dean (Student Affairs)</option>
                    <option value="Office of the Dean (Research & Development)">Office of the Dean (Research & Development)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Science & Humanities">Science & Humanities</option>
                    <option value="Department of Physical Education">Department of Physical Education</option>
                  </>
                ) : (
                  <>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </>
                )}
              </select>
            </div>

            {/* Staff: Designation (Principal, Dean, Professor, etc.) | Student: Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isStaff ? 'Staff Designation / Academic Position *' : 'Academic Year *'}
              </label>
              {isStaff ? (
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="Principal">Principal</option>
                  <option value="Dean">Dean</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Staff">Staff</option>
                  <option value="Faculty Lead">Faculty Lead</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                </select>
              ) : (
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              )}
            </div>
          </div>

          {/* Staff: Staff Employee ID | Student: Student Roll ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isStaff ? 'Staff / Faculty Employee ID *' : 'Student Roll Number / Registration ID *'}
            </label>
            <input
              type="text"
              required
              value={isStaff ? formData.employee_id : formData.student_id}
              onChange={(e) => {
                const val = e.target.value;
                if (isStaff) {
                  setFormData({ ...formData, employee_id: val, student_id: val });
                } else {
                  setFormData({ ...formData, student_id: val });
                }
              }}
              placeholder={isStaff ? 'e.g. FAC-2018-012 or EMP-1049' : 'e.g. 7376211CS142'}
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isStaff
                ? 'Official faculty and administrative employee identity code recognized by university administration.'
                : 'Verified student roll number mapped to your academic record on the campus portal.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
