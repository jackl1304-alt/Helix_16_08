// Perplexity AI endpoint (antwort strikt auf 3 Wörter begrenzen)
app.post("/api/ai", async (req: Request, res: Response) => {
  try {
    const prompt = req.body?.prompt;
    const model = req.body?.model ?? "sonar";
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Feld 'prompt' (string) ist erforderlich." });
    }

    // Strikte Anweisung
    const strictPrompt = `Antworte NUR mit genau drei deutschen Wörtern, ohne Satzzeichen, ohne Erklärungen. Aufgabe: ${prompt}`;

    let answer = await perplexityChat(strictPrompt, model);

    // Post-Processing: nur die ersten 3 Wörter lassen
    answer = answer
      .replace(/[^\p{L}\p{N}\s\-äöüÄÖÜß]/gu, " ") // Sonderzeichen raus
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");

    if (!answer) answer = "Hallo Hallo Hallo";

    return res.json({ answer });
  } catch (err: any) {
    console.error("AI route error:", err?.message || err);
    return res.status(500).json({ error: "AI-Service momentan nicht verfügbar." });
  }
});
