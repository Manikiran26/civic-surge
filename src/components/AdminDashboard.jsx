import React from "react";

export default function AdminDashboard() {
  return (
    <div className="p-10 min-h-screen bg-gray-950 text-white animate-fadeIn">
      <h1 className="text-2xl font-black mb-6 text-cyan-400 uppercase tracking-widest">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900/80 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-cyan-300 mb-2">Analytics</h2>
          <ul className="text-xs text-gray-400 space-y-2">
            <li>Active Projects: <span className="text-cyan-400 font-bold">42</span></li>
            <li>Feedback Received: <span className="text-cyan-400 font-bold">128</span></li>
            <li>Issues Reported: <span className="text-cyan-400 font-bold">7</span></li>
            <li>Average Satisfaction: <span className="text-cyan-400 font-bold">85%</span></li>
          </ul>
        </div>
        <div className="bg-gray-900/80 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-cyan-300 mb-2">Recent Activity</h2>
          <ul className="text-xs text-gray-400 space-y-2">
            <li>Project "Smart School" marked as completed</li>
            <li>New feedback on "City Hospital"</li>
            <li>Issue reported for "Metro Station"</li>
            <li>Admin login: 2 hours ago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
