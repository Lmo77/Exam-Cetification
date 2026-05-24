"use client";

import {
  RUBRIC, inputStyle, cardStyle, btnPrimary,
  ScoreBar, TimerBadge, useESLState,
} from "../shared";

export default function StudentPage() {
  const s = useESLState();

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "24px 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{s.title || "Writing Activity"}</h1>
          <p style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>
            {s.cefrLevel} {s.taskType}{s.timerMinutes > 0 ? ` • ${s.timerMinutes} min` : ""}
          </p>
        </div>

        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Your Writing</h2>
            <TimerBadge secondsLeft={s.secondsLeft} totalSeconds={s.timerMinutes * 60} />
          </div>

          {s.timerExpired && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>
              ⏰ Time is up! You may still submit your current draft.
            </div>
          )}

          {!s.published ? (
            <div style={{ background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 12, padding: 32, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
              ⏳ Waiting for your teacher to publish the activity…
            </div>
          ) : (
            <>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>Writing Prompt</p>
                <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{s.prompt}</p>
              </div>

              <textarea
                style={{ ...inputStyle, height: 240, resize: "vertical", lineHeight: 1.7 }}
                value={s.studentText}
                onChange={(e) => s.setStudentText(e.target.value)}
                placeholder="Start writing here…"
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: s.wordCountColor }}>
                  Words: {s.wordCount}
                  {s.wordCount < s.minWords && ` — need ${s.minWords - s.wordCount} more`}
                  {s.wordCount > s.maxWords && ` — ${s.wordCount - s.maxWords} over limit`}
                </span>
                <span style={{ color: "#6b7280" }}>Draft {s.currentDraft} of {s.requiredDrafts}</span>
              </div>

              {s.error && (
                <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>{s.error}</div>
              )}

              <button
                style={{ ...btnPrimary, opacity: s.loading ? 0.6 : 1, cursor: s.loading ? "not-allowed" : "pointer" }}
                onClick={s.handleSubmit}
                disabled={s.loading}
              >
                {s.loading ? "⏳ Analysing your writing…" : "Submit for AI Review"}
              </button>

              {s.feedback && !s.feedbackReleased && s.teacherDecision !== "revision" && (
                <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#78350f", fontWeight: 600 }}>
                  ✅ Submitted! Waiting for your teacher to review your feedback…
                </div>
              )}

              {s.teacherDecision === "revision" && (
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#c2410c", fontWeight: 600 }}>
                  ↩ Your teacher has asked you to revise and resubmit. Update your writing above and submit again.
                </div>
              )}
            </>
          )}
        </div>

        {s.feedbackReleased && s.feedback && (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Your Feedback</h2>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>Reviewed and approved by your teacher.</p>
              </div>
              <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 14 }}>
                Band: {s.feedback.suggestedBand}
              </div>
            </div>

            <div style={{ background: "#eff6ff", borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1d4ed8", margin: "0 0 6px" }}>Teacher's Comment</p>
              <p style={{ fontSize: 14, color: "#1e3a8a", margin: 0, lineHeight: 1.6 }}>{s.editedSummary}</p>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 14px" }}>Your Scores</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {RUBRIC.map((r) => (
                  <div key={r.key}>
                    <div style={{ fontSize: 13, marginBottom: 4, color: "#374151" }}>{r.category}</div>
                    <ScoreBar score={s.feedback.scores[r.key]} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#15803d", margin: "0 0 10px" }}>Strengths</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.feedback.strengths.map((str, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#166534", display: "flex", gap: 8 }}>
                      <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span>{str}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: "#fefce8", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#854d0e", margin: "0 0 10px" }}>Areas to Improve</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.feedback.improvements.map((str, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#713f12", display: "flex", gap: 8 }}>
                      <span style={{ color: "#ca8a04", flexShrink: 0 }}>→</span>{str}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}