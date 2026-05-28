"use client";
import { useState, useEffect } from "react";

export default function StudentPage({ params }) {
  const [activity, setActivity] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [essay, setEssay] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [grading, setGrading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = params?.id || window.location.pathname.split("/").pop();
    fetch(`/api/activities?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setNotFound(true); return; }
        setActivity(data);
      })
      .catch(() => setNotFound(true));
  }, []);

  if (notFound) return <div style={{padding:"2rem"}}>Activity not found.</div>;
  if (!activity) return <div style={{padding:"2rem"}}>Loading...</div>;

  return (
    <div style={{maxWidth:"700px",margin:"2rem auto",padding:"1rem",fontFamily:"sans-serif"}}>
      <h1>{activity.title}</h1>
      <p><strong>Level:</strong> {activity.cefrLevel} | <strong>Type:</strong> {activity.taskType}</p>
      <p><strong>Prompt:</strong> {activity.prompt}</p>
      <p><strong>Target words:</strong> {activity.targetWords}</p>
      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        rows={10}
        style={{width:"100%",padding:"0.5rem",fontSize:"1rem"}}
        placeholder="Write your essay here..."
        disabled={submitted}
      />
      <p>Words: {essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length}</p>
      {!submitted && (
        <button
          onClick={async () => {
            setGrading(true);
            const res = await fetch("/api/grade", {
              method: "POST",
              headers: {"Content-Type":"application/json"},
              body: JSON.stringify({ essay, activity }),
            });
            const data = await res.json();
            setFeedback(data);
            setGrading(false);
            setSubmitted(true);
          }}
          disabled={grading}
          style={{padding:"0.75rem 2rem",fontSize:"1rem",cursor:"pointer"}}
        >
          {grading ? "Grading..." : "Submit"}
        </button>
      )}
      {feedback && (
        <div style={{marginTop:"2rem",padding:"1rem",background:"#f0f0f0",borderRadius:"8px"}}>
          <h2>Feedback</h2>
          <p><strong>Overall:</strong> {feedback.overall}/9</p>
          {Object.entries(feedback.scores).map(([k,v]) => (
            <p key={k}><strong>{k}:</strong> {v}/9</p>
          ))}
          <h3>Strengths</h3>
          <ul>{feedback.strengths?.map((s,i) => <li key={i}>{s}</li>)}</ul>
          <h3>To Improve</h3>
          <ul>{feedback.improvements?.map((s,i) => <li key={i}>{s}</li>)}</ul>
          <p><em>{feedback.comment}</em></p>
        </div>
      )}
    </div>
  );
}