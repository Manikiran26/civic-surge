// src/components/FeedbackForm.jsx
// Civic feedback form with localStorage persistence and success screen

import { useState } from "react";
import { MessageSquare, Send, CheckCircle, Star, AlertTriangle, ThumbsUp, Clock, List } from "lucide-react";
import { projects } from "../data/projects";
import { saveFeedback } from "../utils/feedbackUtils";

const issueTypes = [
  { id: "delay", label: "Work Delay", icon: Clock },
  { id: "quality", label: "Quality Issue", icon: AlertTriangle },
  { id: "praise", label: "Good Work", icon: ThumbsUp },
  { id: "suggestion", label: "Suggestion", icon: MessageSquare },
];

export default function FeedbackForm({ onViewFeedbackList, onBackToMap }) {
  const [step, setStep] = useState(1); // 1=select project, 2=fill form, 3=submitted
  const [selectedProject, setSelectedProject] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [issueType, setIssueType] = useState(null);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [refId, setRefId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = Date.now();
    const feedbackData = {
      id,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      name: name || "Anonymous",
      rating,
      type: issueType,
      description: comment,
      timestamp: new Date().toISOString(),
    };
    saveFeedback(feedbackData);
    setRefId(`HLE-${id.toString().slice(-6)}`);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedProject(null);
    setRating(0);
    setIssueType(null);
    setComment("");
    setName("");
    setRefId("");
  };

  // ── Success Screen ──────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">✅ Feedback Submitted</h2>
        <p className="text-gray-400 text-sm mb-1">
          Thank you, <span className="text-white font-semibold">{name || "Citizen"}</span>. Your report on
        </p>
        <p className="text-cyan-400 font-semibold text-sm mb-6">"{selectedProject?.name}"</p>
        <p className="text-gray-500 text-xs mb-8">
          Your feedback has been logged and contributes to civic transparency.<br />
          Reference ID: <span className="text-gray-300 font-mono">{refId}</span>
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={onViewFeedbackList}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-sm font-bold tracking-wider transition-all"
          >
            <List size={14} />
            View All Feedback
          </button>
          <button
            onClick={onBackToMap}
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            ← Back to Map
          </button>
          <button
            onClick={handleReset}
            className="w-full px-6 py-2 text-gray-600 hover:text-gray-400 text-xs transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-[10px] uppercase tracking-widest mb-2">
          <MessageSquare size={11} />
          <span>Civic Feedback Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Report / Commend a Project</h1>
        <p className="text-gray-500 text-sm mt-1">Your input directly impacts civic oversight</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {["Select Project", "Your Feedback"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                step > i + 1
                  ? "bg-green-500 text-white"
                  : step === i + 1
                  ? "bg-cyan-500 text-gray-950"
                  : "bg-gray-800 text-gray-600"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-xs ${step === i + 1 ? "text-white" : "text-gray-600"}`}>{label}</span>
            {i < 1 && <div className="w-8 h-px bg-gray-800 ml-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Project */}
      {step === 1 && (
        <div>
          <p className="text-sm text-gray-400 mb-4">Which project are you reporting on?</p>
          <div className="grid gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProject(p); setStep(2); }}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-xl px-4 py-3.5 text-left transition-all group"
              >
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.agency}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-600">{p.completion}% done</span>
                  <div className="w-16 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-cyan-500/50 rounded-full" style={{ width: `${p.completion}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Fill Form */}
      {step === 2 && selectedProject && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected project chip */}
          <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-500">Reporting on</p>
              <p className="text-sm font-semibold text-white">{selectedProject.name}</p>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-cyan-400 hover:underline">Change</button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Your Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Citizen name"
              className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-3">Project Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      n <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-xs text-gray-500 self-center">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Issue type */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-3">Feedback Type</label>
            <div className="grid grid-cols-2 gap-2">
              {issueTypes.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setIssueType(id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm transition-all ${
                    issueType === id
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                      : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Description <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Describe what you observed at the project site..."
              className="w-full bg-gray-800 border border-gray-700 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!rating || !issueType}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl transition-all text-sm"
          >
            <Send size={14} />
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}
