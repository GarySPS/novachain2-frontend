// src/pages/AgentMonitorPage.js
import React, { useState, useEffect } from "react";
import { MAIN_API_BASE } from "../config";

export default function AgentMonitorPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${MAIN_API_BASE}/agent/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, []);

  if (loading) return <div className="text-white text-center p-10 pt-24">Loading Monitor...</div>;
  if (error) return <div className="text-red-500 text-center p-10 pt-24">{error}</div>;

  return (
    <div className="pt-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Agent Monitor Dashboard</h1>
      
      <div className="bg-[#0f141c] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No users assigned to you yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">NC-{String(user.id).padStart(7, "0")}</td>
                    <td className="px-6 py-4 font-medium text-white">{user.username || user.email}</td>
                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}