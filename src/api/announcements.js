const BASE = "http://localhost:3000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchAnnouncements = async () => {
  const res = await fetch(`${BASE}/announcements`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  const data = await res.json();
  return data.announcements || [];
};

export const createAnnouncement = async ({ title, description, type, audience }) => {
  const res = await fetch(`${BASE}/announcements`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, description, type, audience }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create announcement");
  return data;
};

// ── localStorage-based read tracking ──────────────────────────────────────
const READ_KEY = "read_announcement_ids";

export const getReadIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); }
  catch { return new Set(); }
};

export const markAnnouncementRead = (id) => {
  const ids = getReadIds();
  ids.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
};

export const getUnreadCount = (announcements) => {
  const readIds = getReadIds();
  return announcements.filter(a => !readIds.has(a.id)).length;
};