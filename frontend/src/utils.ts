export const GENRE_MAP: Record<string, { icon: string; bgClass: string }> = {
  'Dráma':   { icon: '🎭', bgClass: 'drama' },
  'Komédia': { icon: '😄', bgClass: 'comedy' },
  'Muzikál': { icon: '🎵', bgClass: 'musical' },
  'Tragédia':{ icon: '🌹', bgClass: 'tragedy' },
  // English variants as fallback
  'Drama':   { icon: '🎭', bgClass: 'drama' },
  'Comedy':  { icon: '😄', bgClass: 'comedy' },
  'Musical': { icon: '🎵', bgClass: 'musical' },
  'Tragedy': { icon: '🌹', bgClass: 'tragedy' },
};

export function getGenreConfig(genre: string): { icon: string; bgClass: string } {
  return GENRE_MAP[genre] ?? { icon: '🎭', bgClass: 'drama' };
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('sk-SK', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('sk-SK', {
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDayMon(iso: string): { day: string; mon: string } {
  const d = new Date(iso);
  return {
    day: d.getDate().toString(),
    mon: d.toLocaleDateString('sk-SK', { month: 'short' }).replace('.', '').trim().toUpperCase(),
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Converts row number to letter label: 1→A, 2→B, … */
export function rowToLetter(rowNumber: number): string {
  return String.fromCharCode(64 + rowNumber);
}
