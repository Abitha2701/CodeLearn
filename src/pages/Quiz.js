import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { LEARNING_PATHS } from "../data/learningPaths";
import { useProgress } from "../hooks/useProgress";
import { perfScore } from "./logic";

export default function Quiz() {
  const { courseId, itemId } = useParams();
  const { state } = useLocation();
  const name = state?.name || "Learner";
  const email = state?.email || "guest@example.com";
  const navigate = useNavigate();

  const course = LEARNING_PATHS[courseId] || null;

  // ✅ Always call hook, even if course/item invalid
  const { updateMastery, addAttempt, toggleDone } = useProgress(email, courseId);

  // Flatten items
  const allItems = course ? course.modules.flatMap((m) => m.items) : [];
  const item = allItems.find((i) => i.id === itemId);

  // ✅ Only render after hook calls
  if (!course) return <div>❌ Course not found.</div>;
  if (!item) return <div>❌ Item not found.</div>;
  if (item.type !== "quiz") return <div>⚠️ This item is not a quiz.</div>;

  const onSubmit = ({ correct, scorePct, timeSec, hintsUsed }) => {
    const perf = perfScore({
      correct,
      scorePct,
      timeSec,
      expectedTime: 60,
      hintsUsed,
    });

    updateMastery(item.topic, perf);
    addAttempt({
      itemId,
      topic: item.topic,
      difficulty: item.difficulty,
      correct,
      scorePct,
      timeSec,
      hintsUsed,
      ts: Date.now(),
    });
    toggleDone(itemId);

    navigate(`/course/${courseId}`, { state: { name, email } });
  };

  return (
    <div className="quiz-page">
      <h1>📝 {item.title}</h1>
      <p>
        <strong>Topic:</strong> {item.topic} •{" "}
        <strong>Difficulty:</strong> {item.difficulty}
      </p>

      {/* Replace with real quiz UI */}
      <div className="quiz-actions">
        <button
          className="btn btn-success"
          onClick={() =>
            onSubmit({ correct: true, scorePct: 90, timeSec: 40, hintsUsed: 0 })
          }
        >
          ✅ Submit (High score)
        </button>
        <button
          className="btn btn-danger"
          onClick={() =>
            onSubmit({ correct: false, scorePct: 40, timeSec: 80, hintsUsed: 1 })
          }
        >
          ❌ Submit (Low score)
        </button>
      </div>
    </div>
  );
}
