export type Recitation = {
  id: number;
  title: string;
  reciter_name: string;
  audio_url: string;
  duration: number;
  created_at: string;
};

const RECITATIONS_API_URL = "http://localhost:8000/api/v1/recitations";

export async function getRecitations(): Promise<Recitation[]> {
  const response = await fetch(RECITATIONS_API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch recitations.");
  }

  return response.json();
}
