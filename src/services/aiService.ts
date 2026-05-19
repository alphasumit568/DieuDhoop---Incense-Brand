export async function getFragranceRecommendation(answers: Record<string, string>) {
  try {
    const response = await fetch("/api/ai/recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI recommendation error:", error);
    // Fallback for demo if API fails
    return {
      name: "Sandalwood Serenity",
      reason: "The deep, woody notes of Sandalwood align with your search for grounding and peace.",
      benefits: "Promotes mental clarity and emotional stability.",
      mood: "Meditative & Grounded"
    };
  }
}
