export function waLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const num = cleaned.startsWith('0') ? `62${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function formatDateId(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventSchedule(eventDate: string, endDate?: string): string {
  const start = formatDateId(eventDate);
  if (!endDate || endDate === eventDate) return start;
  return `${start} – ${formatDateId(endDate)}`;
}
