import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, GraduationCap, Hash, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    department: user?.department || 'Computer Science & Engineering',
    academic_year: user?.academic_year || '3rd Year',
    student_id: user?.student_id || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile & Credentials</h1>
        <p className="text-xs text-slate-400">
          Manage your verified campus student information used on digital event passes.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile information successfully updated in the database.</span>
          </div>
        )}

        <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
            alt={user?.display_name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
          />
          <div>
            <h3 className="text-base font-bold text-white">{user?.display_name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Computer Science & Engineering">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Student Affairs & Innovation">Student Affairs & Innovation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Faculty Lead">Faculty Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll ID</label>
            <input
              type="text"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}