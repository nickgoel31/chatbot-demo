import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { Lead } from "../types/index";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  positive: boolean;
}

function MetricCard({ title, value, change, icon, positive }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span
          className={cn(
            "text-sm font-medium",
            positive ? "text-emerald-600" : "text-red-500"
          )}
        >
          {change}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{title}</p>
    </div>
  );
}

interface DashboardProps {
  leads: Lead[];
}

export default function Dashboard({ leads }: DashboardProps) {
  const [metrics, setMetrics] = useState({
    totalLeads: 1240,
    newRegistrations: 45,
    pendingApps: 82,
    enrollmentRate: 18.5,
  });

  // Update metrics based on leads count
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalLeads: 1240 + leads.length - 5,
      newRegistrations: leads.filter(l => l.status === "New").length + 40,
    }));
  }, [leads]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white shadow-sm">
              ED
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Education CRM</h1>
              <p className="text-xs text-slate-400">Admissions Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live System
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-medium text-white">
              AS
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Admissions Overview 👋</h2>
          <p className="mt-1 text-slate-500">Track and manage student applications for the 2026 Intake.</p>
        </div>

        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Leads"
            value={metrics.totalLeads.toLocaleString()}
            change="+15.2%"
            icon="👥"
            positive={true}
          />
          <MetricCard
            title="New Registrations"
            value={metrics.newRegistrations.toString()}
            change="+12.4%"
            icon="📝"
            positive={true}
          />
          <MetricCard
            title="Pending Apps"
            value={metrics.pendingApps.toString()}
            change="-5.2%"
            icon="⏳"
            positive={false}
          />
          <MetricCard
            title="Enrollment Rate"
            value={`${metrics.enrollmentRate.toFixed(1)}%`}
            change="+2.4%"
            icon="🎓"
            positive={true}
          />
        </div>

        {/* Leads Table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Student Leads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Fee Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-6 py-4">{lead.course}</td>
                    <td className="px-6 py-4 font-mono text-xs">{lead.phone || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        lead.status === "Enrolled" ? "bg-emerald-100 text-emerald-700" :
                        lead.status === "New" ? "bg-blue-100 text-blue-700" :
                        lead.status === "Interested" ? "bg-violet-100 text-violet-700" :
                        lead.status === "Waitlisted" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.feePaid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick CRM Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">CRM Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: "➕", label: "Add Lead", action: "add_lead" },
                { icon: "✉️", label: "Send Offer", action: "send_offer" },
                { icon: "📅", label: "Interview", action: "schedule_interview" },
                { icon: "📞", label: "Call Student", action: "call" },
                { icon: "📊", label: "App Report", action: "report" },
                { icon: "💰", label: "Fee Payment", action: "payment" },
                { icon: "🎓", label: "Scholarship", action: "scholarship" },
                { icon: "✏️", label: "Rename", action: "rename" },
              ].map((item) => (
                <button
                  key={item.action}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Admissions Feed</h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Live
              </span>
            </div>
            <div className="space-y-4">
              {[
                { icon: "🎓", text: "Rahul S. enrolled in B.Tech CS", time: "2 min ago" },
                { icon: "📝", text: "New lead from LinkedIn: Amit P.", time: "15 min ago" },
                { icon: "⏳", text: "Waitlist updated for MBA", time: "1 hour ago" },
                { icon: "📧", text: "Offer letters sent to 5 candidates", time: "3 hours ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                  <span className="text-lg">{activity.icon}</span>
                  <div>
                    <p className="text-sm text-slate-700">{activity.text}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          <p>Education CRM v2.6 — Ghaziabad Admissions Portal</p>
        </footer>
      </main>
    </div>
  );
}
