// src/components/FeedbackList.jsx
// Global civic feedback viewer — reads all saved feedback from localStorage

import { useState } from "react";
import { getFeedback, getAverageRating } from "../utils/feedbackUtils";
import { Star, MessageSquare, ArrowLeft, Filter } from "lucide-react";

const typeLabels = {
  delay: { label: "Work Delay", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  quality: { label: "Quality Issue", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  praise: { label: "Good Work", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  suggestion: { label: "Suggestion", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

export default function FeedbackList({ onBack }) {
  const allFeedbacks = getFeedback().reverse(); // newest first
  const [filter, setFilter] = useState("all");

  const projectIds = [...new Set(allFeedbacks.map((f) => f.projectId))];

  const filtered =
    filter === "all" ? allFeedbacks : allFeedbacks.filter((f) => f.projectId === filter);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 text-cyan-400 text-[10px] uppercase tracking-widest mb-2">
          <MessageSquare size={11} />
          <span>Civic Feedback Registry</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Citizen Reports</h1>
        <p className="text-gray-500 text-sm mt-1">{allFeedbacks.length} report{allFeedbacks.length !== 1 ? "s" : ""} submitted across all projects</p>
      </div>

      {/* Project Filter */}
      {projectIds.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`text-[10px] px-3 py-1.5 rounded-full border font-bold uppercase tracking-widest transition-all ${
              filter === "all"
                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                : "border-gray-700 text-gray-500 hover:border-gray-500"
            }`}
          >
            All
          </button>
          {projectIds.map((id) => {
            const name = allFeedbacks.find((f) => f.projectId === id)?.projectName || id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`text-[10px] px-3 py-1.5 rounded-full border font-bold uppercase tracking-widest transition-all truncate max-w-[180px] ${
                  filter === id
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                    : "border-gray-700 text-gray-500 hover:border-gray-500"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* Average rating banner (if filter applied) */}
      {filter !== "all" && (() => {
        const avg = getAverageRating(filter);
        const count = allFeedbacks.filter((f) => f.projectId === filter).length;
        if (!avg) return null;
        return (
          <div className="mb-5 p-4 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold text-lg">{avg}</span>
                <span className="text-gray-500 text-xs">/ 5</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Reports</p>
              <p className="text-white font-bold text-lg">{count}</p>
            </div>
          </div>
        );
      })()}

      {/* Feedback Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No feedback submitted yet.</p>
          <p className="text-xs mt-1">Be the first to report on a project!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const typeStyle = typeLabels[f.type] || { label: f.type, color: "text-gray-400 bg-gray-800 border-gray-700" };
            return (
              <div
                key={f.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{f.projectName || f.projectId}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{f.name} · {formatDate(f.timestamp)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {f.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < f.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}
                          />
                        ))}
                      </div>
                    )}
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${typeStyle.color}`}>
                      {typeStyle.label}
                    </span>
                  </div>
                </div>
                {f.description && (
                  <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-800 pt-2 mt-2">
                    "{f.description}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
