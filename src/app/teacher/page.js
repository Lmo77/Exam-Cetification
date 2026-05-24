"use client";
import { useState, useEffect } from "react";
import {
  RUBRIC, CEFR_LEVELS, TIMER_OPTIONS, TASK_TYPES, DRAFT_OPTIONS,
  inputStyle, cardStyle, btnPrimary, btnSecondary, ScoreBar,
} from "../shared";

const DEFAULT_FORM = {
  title: "Opinion Essay Practice",
  cefrLevel: "B1",
  minWords: 120,
  targetWords: 150,
  maxWords: 180,
  timerMinutes: 30,
  requiredDrafts: 2,
  taskType: "Opinion Essay",
  strictness: 60,
  prompt: "Some people believe technology improves education while others think it causes distraction. Discuss both views and give your opinion.",
};

export default function TeacherPage() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => { setActivities(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const activity = await res.json();
    setActivities((prev) => [activity, ...prev]);
    setShowForm(false);
    setForm(DEFAULT_FORM);
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this activity? Students with the link will no longer be able to access it.")) return;
    await fetch(`/api/activities?id=${id}`, { method: "DELETE" });
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${origin}/student/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const f = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>AI ESL Writing Assessment</h1>
            <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>Teacher dashboard — create and manage activities.</p>
          </div>
          <button style={{ ...btnPrimary, width: "auto", padding: "10px 20px" }} onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ New Activity"}
          </button>
        </div>

        {showForm && (
          <div style={{ ...cardStyle, marginBottom: 24, border: "2px solid #fde68a" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 20px" }}>Create New Activity</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Activity Title</label>
                <input style={inputStyle} value={form.title} onChange={(e) => f("title", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>CEFR Level</label>
                <select style={inputStyle} value={form.cefrLevel} onChange={(e) => f("cefrLevel", e.target.value)}>
                  {CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Task Type</label>
                <select style={inputStyle} value={form.taskType} onChange={(e) => f("taskType", e.target.value)}>
                  {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["Min Words", "minWords"], ["Target", "targetWords"], ["Max", "maxWords"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                    <input style={inputStyle} type="number" value={form[key]} onChange={(e) => f(key, Number(e.target.value))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Timer</label>
                  <select style={inputStyle} value={form.timerMinutes} onChange={(e) => f("timerMinutes", Number(e.target.value))}>
                    {TIMER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Required Drafts</label>
                  <select style={inputStyle} value={form.requiredDrafts} onChange={(e) => f("requiredDrafts", Number(e.target.value))}>
                    {DRAFT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                  AI Strictness — <span style={{ fontWeight: 400, color: "#6b7280" }}>{form.strictness < 33 ? "Lenient" : form.strictness < 66 ? "Balanced" : "Strict"}</span>
                </label>
                <input type="range" min={0} max={100} value={form.strictness} onChange={(e) => f("strictness", Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Writing Prompt</label>
                <textarea style={{ ...inputStyle, height: 100, resize: "vertical" }} value={form.prompt} onChange={(e) => f("prompt", e.target.value)} />
              </div>
            </div>
            <button style={{ ...btnPrimary, marginTop: 16, opacity: creating ? 0.6 : 1 }} onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create & Publish Activity"}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "#6b7280", padding: 48 }}>Loading activities...</div>
        ) : activities.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "#6b7280", padding: 48 }}>
            <p style={{ fontSize: 16, margin: 0 }}>No activities yet.</p>
            <p style={{ fontSize: 14, margin: "8px 0 0" }}>Click "+ New Activity" to create your first one.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                origin={origin}
                copiedId={copiedId}
                onCopy={copyLink}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ activity, origin, copiedId, onCopy, onDelete }) {
  const studentUrl = `${origin}/student/${activity.id}`;
  const created = new Date(activity.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{activity.title}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
            {activity.cefrLevel} · {activity.taskType} · {activity.timerMinutes > 0 ? `${activity.timerMinutes} min` : "No timer"} · Created {created}
          </p>
        </div>
        <button style={{ background: "#fff", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 12, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          onClick={() => onDelete(activity.id)}>
          Delete
        </button>
      </div>

      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
        <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>Writing Prompt</p>
        <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{activity.prompt}</p>
      </div>

      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#78350f", margin: "0 0 2px" }}>Student Link</p>
          <code style={{ fontSize: 12, color: "#92400e" }}>{studentUrl}</code>
        </div>
        <button onClick={() => onCopy(activity.id)}
          style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {copiedId === activity.id ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}