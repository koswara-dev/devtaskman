// Resets backend seed data once before the suite runs, so login tests always see the
// known seeded accounts regardless of what earlier manual/testing sessions left behind.
export default async function globalSetup() {
  const res = await fetch('http://localhost:5000/api/v1/reset', { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Gagal mereset data backend sebelum menjalankan E2E suite: HTTP ${res.status}`);
  }
}
