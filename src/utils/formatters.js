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
      return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
    case 'Technical Workshop':
      return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    case 'Coding Competition':
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    case 'Seminar':
      return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
    case 'Cultural Event':
      return 'bg-pink-950/70 text-pink-300 border-pink-800/60';
    case 'Sports Event':
      return 'bg-orange-950/70 text-orange-300 border-orange-800/60';
    case 'Innovation Challenge':
      return 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}