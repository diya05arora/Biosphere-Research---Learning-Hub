// Helpers to normalize event input values
export function normalizeEventPayload(payload = {}, existing = {}) {
  const { title, description, location, date, startTime, endTime } = payload || {};

  const normalizedTitle = typeof title === 'string' && title.trim() !== ''
    ? title.trim().toLowerCase()
    : (existing.title || '');

  const normalizedDescription = typeof description === 'string' && description.trim() !== ''
    ? description.trim()
    : (existing.description || '');

  const normalizedLocation = typeof location === 'string' && location.trim() !== ''
    ? location.trim().toLowerCase()
    : (existing.location || '');

  const normalizedDate = date ? new Date(date) : (existing.date || null);

  // startTime/endTime are kept as-is if provided; otherwise fallback to existing
  const normalizedStartTime = startTime ? new Date(startTime) : existing.startTime || null;
  const normalizedEndTime = endTime ? new Date(endTime) : existing.endTime || null;

  return {
    title: normalizedTitle,
    description: normalizedDescription,
    location: normalizedLocation,
    date: normalizedDate,
    startTime: normalizedStartTime,
    endTime: normalizedEndTime,
  };
}

export function isValidEventPayload({ title, description, location, date, startTime, endTime }) {
  // basic presence checks; callers may perform more advanced validation
  if (!title || !description || !location || !date || !startTime || !endTime) return false;
  return true;
}
