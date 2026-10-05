export function formatDate(dateString) {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function generateRegistrationId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `ACE-${year}-${rand}`;
}

export function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Hackathon':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'Technical Workshop':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'Coding Competition':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'Seminar':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'Cultural Event':
      return 'bg-pink-100 text-pink-800 border border-pink-200';
    case 'Sports Event':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'Innovation Challenge':
      return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}
