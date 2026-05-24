"use client";

import { useState } from "react";
import {
  RUBRIC, CEFR_LEVELS, TIMER_OPTIONS, TASK_TYPES, DRAFT_OPTIONS,
  inputStyle, cardStyle, btnPrimary, btnSecondary,
  ScoreBar, TimerBadge, useESLState,
} from "../shared";

function TeacherBanner() {
  const [copied, setCopied] = useState(false);
  const studentUrl = typeof window !== "undefined"
    ? window.location.origin + "/"
    : "";
  const copy = () => {
    navigator.clipboard.writeText(studentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{
      background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12,
      padding: "12px 16px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20,
    }}>
      <div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#78350f" }}>🔑 Teacher view</span>
        <span style={{ fontSize: 13, color: "#92400e", marginLeft: 10 }}>
          Share the student link — it hides all teacher controls.
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <code style={{
          fontSize: 12, background: "#fff7ed", border: "1px solid #fed7aa",
          borderRadius: 6, padding: "4px 10px", color: "#7c2d12",
          maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {studentUrl}
        </code>
        <button
          onClick={copy}
          style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
        >
          {copied ? "✓ Copied" : "Copy student link"}
        </button>
      </div>
    </div>
  );
}

export default function TeacherPage() {
  const s = useESLState();

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>AI ESL Writing Assessment</h1>
          <p style={{ color: "#6b7280", marginTop: 6, fontSize: 15 }}>Teacher dashboard — activity builder &amp; grading controls.</p>
        </div>

        <TeacherBanner />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Activity Builder</h2>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Activity Title</label>
              <input style={inputStyle} value={s.title} onChange={(e) => s.setTitle(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>CEFR Level</label>
              <select style={inputStyle} value={s.cefrLevel} onChange={(e) => s.setCefrLevel(e.target.value)}>
                {CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["Min Words", s.minWords, s.setMinWords], ["Target", s.targetWords, s.setTargetWords], ["Max", s.maxWords, s.setMaxWords]].map(([label, val, set]) => (
                <div key={label}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                  <input style={inputStyle} type="number" value={val} onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Timer</label>
                <select style={inputStyle} value={s.timerMinutes} onChange={(e) => s.setTimerMinutes(Number(e.target.value))}>
                  {TIMER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Required Drafts</label>
                <select style={inputStyle} value={s.requiredDrafts} onChange={(e) => s.setRequiredDrafts(Number(e.target.value))}>
                  {DRAFT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Task Type</label>
              <select style={inputStyle} value={s.taskType} onChange={(e) => s.setTaskType(e.target.value)}>
                {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                AI Strictness — <span style={{ fontWeight: 400, color: "#6b7280" }}>
                  {s.strictness < 33 ? "Lenient" : s.strictness < 66 ? "Balanced" : "Strict"}
                </span>
              </label>
              <input type="range" min={0} max={100} value={s.strictness} onChange={(e) => s.setStrictness(Number(e.target.value))} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                <span>Lenient</span><span>Strict</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Prompt</label>
              <textarea style={{ ...inputStyle, height: 120, resize: "vertical" }} value={s.prompt} onChange={(e) => s.setPrompt(e.target.value)} />
            </div>

            <button style={btnPrimary} onClick={s.handlePublish}>
              {s.published ? "✓ Republish Activity" : "Publish Activity"}
            </button>

            {s.published && (
              <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>
                ✓ Activity is live — share the student link above.
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{s.title || "Writing Activity"}</h2>
                  <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
                    {s.cefrLevel} {s.taskType}{s.timerMinutes > 0 ? ` • ${s.timerMinutes} min` : ""}
                  </p>
                </div>
                <TimerBadge secondsLeft={s.secondsLeft} totalSeconds={s.timerMinutes * 60} />
              </div>

              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>Writing Prompt</p>
                <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{s.prompt}</p>
              </div>

              <textarea
                style={{ ...inputStyle, height: 160, resize: "vertical", lineHeight: 1.7, background: "#f9fafb", color: "#6b7280" }}
                value={s.studentText}
                readOnly
                placeholder="Student's response will appear here once they submit."
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: s.wordCountColor }}>Words: {s.wordCount}</span>
                <span style={{ color: "#6b7280" }}>Draft {s.currentDraft} of {s.requiredDrafts}</span>
              </div>
            </div>

            {s.feedback && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20, border: "2px solid #fde68a" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Feedback Report</h2>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>🔑 Teacher only — approve or edit before releasing.</p>
                  </div>
                  <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 14 }}>
                    Suggested Band: {s.feedback.suggestedBand}
                  </div>
                </div>

                <div style={{ background: "#eff6ff", borderRadius: 12, padding: 14 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#1d4ed8", margin: "0 0 6px" }}>Summary Comment (editable)</p>
                  {s.editingFeedback ? (
                    <textarea style={{ ...inputStyle, height: 80 }} value={s.editedSummary} onChange={(e) => s.setEditedSummary(e.target.value)} />
                  ) : (
                    <p style={{ fontSize: 14, color: "#1e3a8a", margin: 0, lineHeight: 1.6 }}>{s.editedSummary}</p>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>CEFR Analysis</p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px" }}>Estimated: {s.feedback.overallLevel}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {RUBRIC.map((r) => (
                        <div key={r.key}>
                          <div style={{ fontSize: 13, marginBottom: 4, color: "#374151" }}>{r.category}</div>
                          <ScoreBar score={s.feedback.scores[r.key]} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                      <span>Weighted Score</span>
                      <span style={{ color: s.feedback.weightedScore >= 70 ? "#16a34a" : s.feedback.weightedScore >= 50 ? "#ca8a04" : "#dc2626" }}>
                        {s.feedback.weightedScore}%
                      </span>
                    </div>
                  </div>

                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 14px" }}>Rubric Weighting</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {RUBRIC.map((r) => (
                        <div key={r.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "#374151" }}>{r.category}</span>
                          <span style={{ fontWeight: 600 }}>{r.weight}%</span>
                        </div>
                      ))}
                    </div>
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

                {s.teacherDecision ? (
                  <div style={{
                    background: s.teacherDecision === "approved" ? "#f0fdf4" : "#fff7ed",
                    color: s.teacherDecision === "approved" ? "#15803d" : "#c2410c",
                    borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 14,
                  }}>
                    {s.teacherDecision === "approved"
                      ? "✓ Feedback approved and visible to student."
                      : "↩ Revision requested."}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={{ ...btnPrimary, width: "auto", flex: 1 }}
                      onClick={() => { s.setTeacherDecision("approved"); s.setFeedbackReleased(true); s.setEditingFeedback(false); }}>
                      ✓ Approve &amp; Release to Student
                    </button>
                    <button style={{ ...btnSecondary, flex: 1 }}
                      onClick={() => { s.setTeacherDecision("revision"); s.setFeedbackReleased(false); }}>
                      ↩ Request Revision
                    </button>
                    <button style={{ ...btnSecondary, flex: 1 }}
                      onClick={() => s.setEditingFeedback((v) => !v)}>
                      {s.editingFeedback ? "✓ Done Editing" : "✎ Edit Feedback"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}