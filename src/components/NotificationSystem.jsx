import React from "react";
import { Bell, MessageCircle } from "lucide-react";

export function NotificationSystem({ notifications = [] }) {
  if (!notifications.length) return null;
  return (
    <div className="notification-stack fixed right-6 z-[9999] flex flex-col gap-3">
      {notifications.map((n, i) => (
        <div key={n.id || i} className={`notification-card ${n.type || "geo"}`}>
          <Bell size={18} className="notification-icon" />
          <div>
            {n.title && <div className="notification-title">{n.title}</div>}
            <div className="notification-message">{n.message}</div>
            {n.type === "geo-detail" && (
              <div className="notification-sub">
                <span>{n.locationLabel}</span>
                <span>{n.status}</span>
                <span>{n.distance}</span>
              </div>
            )}
            {n.type === "geo-detail" && (
              <div className="notification-impact">
                {Number.isFinite(n.completion) ? (
                  <span>Work {n.completion}% complete</span>
                ) : (
                  <span>Work status: {n.status}</span>
                )}
                {n.impact && <span>Impact: {n.impact}</span>}
                {n.citizens && <span>Beneficiaries: {n.citizens}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatbotAssistant({ onSend, messages = [] }) {
  const [input, setInput] = React.useState("");
  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 bg-gray-950/95 border border-cyan-400/20 rounded-2xl shadow-2xl flex flex-col">
      <div className="p-4 border-b border-cyan-400/10 flex items-center gap-2">
        <MessageCircle size={18} className="text-cyan-400" />
        <span className="font-bold text-cyan-300 text-xs uppercase tracking-widest">Civic Assistant</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs text-gray-200">
        {messages.length === 0 ? (
          <div className="text-gray-500 italic">How can I help you today?</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`p-2 rounded-lg ${m.from === "bot" ? "bg-cyan-900/40" : "bg-gray-800/60"}`}>{m.text}</div>
          ))
        )}
      </div>
      <form
        className="flex gap-2 p-3 border-t border-cyan-400/10"
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            onSend(input);
            setInput("");
          }
        }}
      >
        <input
          className="flex-1 bg-gray-900 border border-cyan-400/20 rounded-lg px-3 py-2 text-xs text-white outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a civic question..."
        />
        <button type="submit" className="bg-cyan-500 text-gray-950 px-4 py-2 rounded-lg font-bold text-xs">Send</button>
      </form>
    </div>
  );
}
