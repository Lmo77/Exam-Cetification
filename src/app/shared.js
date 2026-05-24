"use client";
import { useState, useEffect, useRef } from "react";

export const RUBRIC = [
  { category: "Grammar Accuracy", weight: 25, key: "grammar" },
  { category: "Vocabulary Range", weight: 25, key: "vocabulary" },
  { category: "Task Achievement", weight: 30, key: "task" },
  { category: "Cohesion & Organization", weight: 20, key: "cohesion" },
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "Exam Mode"];
export const TIMER_OPTIONS = [
  { label: "No Timer", value: 0 },
  { label: "20 Minutes", value: 20 },
  { label: "30 Minutes", value: 30 },
  { label: "45 Minutes", value: 45 },
  { label: "60 Minutes", value: 60 },
];
export const TASK_TYPES = ["Opinion Essay", "Email", "Review", "Article", "Story", "Report"];
export const DRAFT_OPTIONS = [1, 2, 3];

export const inputStyle = {
  width: "100%", border: "1px solid #d1d5db", borderRadius: 10,
  padding: "10px 12px", fontSize: 14, boxSizing: "border-box",
  background: "#fff", color: "#111", outline: "none", fontFamily: "inherit",
};
export const cardStyle = {
  background: "#fff", borderRadius: 18,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: 24,
};
export const btnPrimary = {
  background: "#111", color: "#fff", border: "none", borderRadius: 12,
  padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
  width: "100%", fontFamily: "inherit",
};
export const btnSecondary = {
  background: "#fff", color: "#111", border: "1px solid #d1d5db", borderRadius: 12,
  padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
};

export function ScoreBar({ score }) {
  const color = score >= 75 ? "#16a34a" : score >= 55 ? "#ca8a04" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 34, textAlign: "right" }}>{score}%</span>
    </div>
  );
}

export function TimerBadge({ secondsLeft, totalSeconds }) {
  if (totalSeconds === 0) return null;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = secondsLeft / totalSeconds;
  const urgent = pct < 0.25, warning = pct < 0.5;
  return (
    <div style={{
      padding: "6px 14px", borderRadius: 10, fontWeight: 700, fontSize: 15,
      background: urgent ? "#fee2e2" : warning ? "#fef9c3" : "#dcfce7",
      color: urgent ? "#b91c1c" : warning ? "#854d0e" : "#15803d",
      fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em",
    }}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} remaining
    </div>
  );
}