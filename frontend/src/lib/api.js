const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchMatches(username) {
  const res = await fetch(`${API_URL}/api/matches?username=${username}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchWatchlist(username) {
  const res = await fetch(`${API_URL}/api/watchlist?username=${username}`);
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}

export async function fetchCinemas() {
  const res = await fetch(`${API_URL}/api/cinemas`);
  if (!res.ok) throw new Error("Failed to fetch cinemas");
  return res.json();
}

export async function syncWatchlist(username) {
  const res = await fetch(`${API_URL}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  if (!res.ok) throw new Error("Sync failed");
  return res.json();
}
