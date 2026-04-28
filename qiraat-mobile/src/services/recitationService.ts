export type Recitation = {
  id: number;
  title: string;
  reciter_name: string;
  audio_url: string;
  duration: number;
  created_at: string;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
const RECITATIONS_API_URL = `${API_BASE_URL}/api/v1/recitations`;

export async function getRecitations(): Promise<Recitation[]> {
  const response = await fetch(RECITATIONS_API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch recitations.");
  }

  return response.json();
}
