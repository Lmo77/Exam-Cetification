"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { RUBRIC, inputStyle, cardStyle, btnPrimary, ScoreBar, TimerBadge } from "../../shared";

export default function StudentPage({ params }) {
  const { activityId } = params;
  const [activity, setActivity] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [studentText, setStudentText] = useState("");
  const [currentDraft, setCurrentDraft] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [teacherDecision, setTeacherDecision] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [feedbackReleased, setFeedbackReleased] = useState(false);

  useEffect(() => {
    fetch(`/api/activities?id=${activityId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setActivity(data);
        setSecondsLeft(data.timerMinutes * 60);
        if (data.timerMinutes > 0) setTimerRunning(true);
      })
      .catch(() => setNotFound(true));
  }, [activityId]);

  useEffect(() => {
    if (timerRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); setTimerExpired(true); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const wordCount = studentText.trim() === "" ? 0 : studentText.trim().split(/\s+/).length;
  const wordCountColor = !activity ? "#111" : wordCount < activity.minWords ? "#dc2626" : wordCount > activity.maxWords ? "#ca8a04" : "#16a34a";

  const handleSubmit = useCallback(async () => {
    if (!activity) return;
    if (wordCount < activity.minWords) { setError(`Please write at least ${activity.minWords} words. You have ${wordCount}.`); return; }
    setError(null); setLoading(true); setFeedback(null);
    setTeacherDecision(null); setFeedbackReleased(false);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentText, prompt: activity.prompt, cefrLevel: activity.cefrLevel,
          taskType: activity.taskType, strictness: activity.strictness,
          minWords: activity.minWords, maxWords: activity.maxWords,
          currentDraft, requiredDrafts: activity.requiredDrafts,
        }),
      });
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setFeedback(parsed);
      setEditedSummary(parsed.summaryComment);
      if (currentDraft < activity.requiredDrafts) setCurrentDraft((d) => d + 1);
    } catch (err) {
      setError("Failed to get AI feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [studentText, activity, currentDraft, wordCount]);

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...cardStyle, textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Activity not found</p>
        <p style={{ color: "#6b7280", margin: 0 }}>Please check the link your teacher gave you.</p>
      </div>
    </div>
  );

  if (!activity) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6b7280" }}>Loading activity...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "24px 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{activity.title}</h1>
          <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
            {activity.cefrLevel} {activity.taskType}{activity.timerMinutes > 0 ? ` · ${activity.timerMinutes} min` : ""}
          </p>
        </div>

        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Your Writing</h2>
            <TimerBadge secondsLeft={secondsLeft} totalSeconds={activity.timerMinutes * 60} />
          </div>

          {timerExpired && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>
              ⏰ Time is up! You may still submit your current draft.
            </div>
          )}

          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>Writing Prompt</p>
            <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{activity.prompt}</p>
          </div>

          <textarea
            style={{ ...inputStyle, height: 240, resize: "vertical", lineHeight: 1.7 }}
            value={studentText}
            onChange={(e) => setStudentText(e.target.value)}
            placeholder="Start writing here…"
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: wordCountColor }}>
              Words: {wordCount}
              {wordCount < activity.minWords && ` — need ${activity.minWords - wordCount} more`}
              {wordCount > activity.maxWords && ` — ${wordCount - activity.maxWords} over limit`}
            </span>
            <span style={{ color: "#6b7280" }}>Draft {currentDraft} of {activity.requiredDrafts}</span>
          </div>

          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>{error}</div>}

          <button
            style={{ ...btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? "⏳ Analysing your writing…" : "Submit for AI Review"}
          </button>

          {feedback && !feedbackReleased && teacherDecision !== "revision" && (
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#78350f", fontWeight: 600 }}>
              ✅ Submitted! Waiting for your teacher to review your feedback…
            </div>
          )}

          {teacherDecision === "revision" && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#c2410c", fontWeight: 600 }}>
              ↩ Your teacher has asked you to revise and resubmit.
            </div>
          )}
        </div>

        {feedback && (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20, border: "2px solid #fde68a" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>AI Feedback Report</h2>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>🔑 Approve or edit before releasing to the student.</p>
              </div>
              <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 14 }}>
                Suggested Band: {feedback.suggestedBand}
              </div>
            </div>

            <div style={{ background: "#eff6ff", borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1d4ed8", margin: "0 0 6px" }}>Summary Comment</p>
              {editingFeedback
                ? <textarea style={{ ...inputStyle, height: 80 }} value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} />
                : <p style={{ fontSize: 14, color: "#1e3a8a", margin: 0, lineHeight: 1.6 }}>{editedSummary}</p>
              }
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>CEFR Analysis</p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px" }}>Estimated: {feedback.overallLevel}</p>
                {RUBRIC.map((r) => (
                  <div key={r.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, marginBottom: 4, color: "#374151" }}>{r.category}</div>
                    <ScoreBar score={feedback.scores[r.key]} />
                  </div>
                ))}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                  <span>Weighted Score</span>
                  <span style={{ color: feedback.weightedScore >= 70 ? "#16a34a" : feedback.weightedScore >= 50 ? "#ca8a04" : "#dc2626" }}>{feedback.weightedScore}%</span>
                </div>
              </div>
              <div>
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16, marginBottom: 14 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#15803d", margin: "0 0 10px" }}>Strengths</p>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#166534", display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "#16a34a" }}>✓</span>{s}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fefce8", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#854d0e", margin: "0 0 10px" }}>Areas to Improve</p>
                  {feedback.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#713f12", display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "#ca8a04" }}>→</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {teacherDecision ? (
              <div style={{
                background: teacherDecision === "approved" ? "#f0fdf4" : "#fff7ed",
                color: teacherDecision === "approved" ? "#15803d" : "#c2410c",
                borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 14,
              }}>
                {teacherDecision === "approved" ? "✓ Feedback approved and visible to student." : "↩ Revision requested."}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ ...btnPrimary, width: "auto", flex: 1 }}
                  onClick={() => { setTeacherDecision("approved"); setFeedbackReleased(true); setEditingFeedback(false); }}>
                  ✓ Approve & Release
                </button>
                <button style={{ background: "#fff", color: "#111", border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flex: 1 }}
                  onClick={() => { setTeacherDecision("revision"); setFeedbackReleased(false); }}>
                  ↩ Request Revision
                </button>
                <button style={{ background: "#fff", color: "#111", border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flex: 1 }}
                  onClick={() => setEditingFeedback((v) => !v)}>
                  {editingFeedback ? "✓ Done Editing" : "✎ Edit Feedback"}
                </button>
              </div>
            )}
          </div>
        )}

        {feedbackReleased && feedback && (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Your Feedback</h2>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>Reviewed and approved by your teacher.</p>
              </div>
              <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 14 }}>
                Band: {feedback.suggestedBand}
              </div>
            </div>
            <div style={{ background: "#eff6ff", borderRadius: 12, padding: 14 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#1d4ed8", margin: "0 0 6px" }}>Teacher's Comment</p>
              <p style={{ fontSize: 14, color: "#1e3a8a", margin: 0, lineHeight: 1.6 }}>{editedSummary}</p>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 14px" }}>Your Scores</p>
              {RUBRIC.map((r) => (
                <div key={r.key} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, marginBottom: 4, color: "#374151" }}>{r.category}</div>
                  <ScoreBar score={feedback.scores[r.key]} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#15803d", margin: "0 0 10px" }}>Strengths</p>
                {feedback.strengths.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#166534", display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#16a34a" }}>✓</span>{s}
                  </div>
                ))}
              </div>
              <div style={{ background: "#fefce8", borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#854d0e", margin: "0 0 10px" }}>Areas to Improve</p>
                {feedback.improvements.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#713f12", display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#ca8a04" }}>→</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}