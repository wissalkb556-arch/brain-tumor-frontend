// Remplace par l'URL de ton API (celle affichée par ngrok, ou ton déploiement final)
   export const API_URL = "https://brain-tumor-api-lc4s.onrender.com";

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
    headers: { "ngrok-skip-browser-warning": "1" },
  });

  if (!response.ok) {
    throw new Error(`Le serveur a répondu avec une erreur (${response.status})`);
  }
  return response.json();
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/`, {
      headers: { "ngrok-skip-browser-warning": "1" },
    });
    return response.ok;
  } catch {
    return false;
  }
}
