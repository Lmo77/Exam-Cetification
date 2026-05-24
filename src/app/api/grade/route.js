import { NextResponse } from "next/server";

export async function POST(request) {
  const { studentText, prompt, cefrLevel, taskType, strictness, minWords, maxWords, currentDraft, requiredDrafts } =
    await request.json();

  const wordCount = studentText.trim().split(/\s+/).length;
  const strictnessLabel = strictness < 33 ? "lenient" : strictness < 66 ? "balanced" : "strict";

  const systemPrompt = `You are an expert ESL writing assessor specialising in CEFR frameworks.
You are grading a ${cefrLevel} level ${taskType.toLowerCase()} submission.
Be ${strictnessLabel} in your assessment.
Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble.
The JSON must have exactly this structure:
{
  "overallLevel": "string (e.g. High B1)",
  "suggestedBand": "string (e.g. B1+)",
  "scores": {
    "grammar": number (0-100),
    "vocabulary": number (0-100),
    "task": number (0-100),
    "cohesion": number (0-100)
  },
  "weightedScore": number (0-100, weighted: grammar 25%, vocabulary 25%, task 30%, cohesion 20%),
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "grammarCorrections": number,
  "vocabularySuggestions": number,
  "summaryComment": "string (2-3 sentences of encouraging, constructive feedback written directly to the student)"
}`;

  const userMessage = `Writing prompt: "${prompt}"
Student submission (Draft ${currentDraft} of ${requiredDrafts}): "${studentText}"
Word count: ${wordCount} (Target: ${minWords}–${maxWords} words)
Assess this against the CEFR ${cefrLevel} descriptor. Return only the JSON object.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: "API error", detail: err }, { status: 500 });
  }

  const data = await response.json();
  const raw = data.content?.map((b) => b.text || "").join("") || "";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
  }
}