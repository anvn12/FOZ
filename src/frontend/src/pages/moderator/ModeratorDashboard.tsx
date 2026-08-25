import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModeratorLayout } from "../../components/layout/ModeratorLayout";
import { authFetch } from "../../api/authFetch";

type DashboardMetrics = {
  totalReports: number;
  pendingReview: number;
  resolvedToday: number;
  queueCapacity: number;
};

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reasonType: string;
  details: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    displayName: string;
  };
};

export function ModeratorDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalReports: 0,
    pendingReview: 0,
    resolvedToday: 0,
    queueCapacity: 0,
  });
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, reportsRes] = await Promise.all([
          authFetch("/api/v1/moderation/metrics"),
          authFetch("/api/v1/moderation/reports?limit=50"),
        ]);

        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data);
        }

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setAllReports(data.reports);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openReports = allReports.filter((r) => r.status === "open").slice(0, 5);
  const recentActions = allReports.filter((r) => r.status !== "open").slice(0, 3);

  // Calculate average response time from recent actions
  let avgResponseTime = "0m";
  const resolvedReports = allReports.filter((r) => r.status !== "open");
  if (resolvedReports.length > 0) {
    const totalMs = resolvedReports.reduce((acc, r) => {
      const diff = new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime();
      return acc + (diff > 0 ? diff : 0);
    }, 0);
    const avgMs = totalMs / resolvedReports.length;
    const avgMins = Math.round(avgMs / 60000);
    if (avgMins > 60) {
      avgResponseTime = `${Math.floor(avgMins / 60)}h ${avgMins % 60}m`;
    } else {
      avgResponseTime = `${avgMins}m`;
    }
  }

  function formatTimeAgo(dateString: string) {
    const diffMs = new Date().getTime() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins || 1} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffHrs / 24)} days ago`;
  }

  return (
    <ModeratorLayout>
      {/* Header Section */}
      <section className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Dashboard Overview</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Real-time moderation metrics and status for your current shift.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl font-label-md text-label-md text-secondary hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Data
        </button>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric Card 1: Pending Reviews */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary-fixed rounded-lg text-primary">
              <span className="material-symbols-outlined">pending_actions</span>
            </span>
            <span className="text-tertiary font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +5.2%
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
            Pending Reviews
          </p>
          <h3 className="text-headline-md font-headline-md text-on-surface mt-1">
            {loading ? "..." : metrics.pendingReview}
          </h3>
        </div>

        {/* Metric Card 2: Resolved Today */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-tertiary-fixed rounded-lg text-tertiary">
              <span className="material-symbols-outlined">task_alt</span>
            </span>
            <span className="text-tertiary font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +18%
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
            Resolved Today
          </p>
          <h3 className="text-headline-md font-headline-md text-on-surface mt-1">
            {loading ? "..." : metrics.resolvedToday}
          </h3>
        </div>

        {/* Metric Card 3: Avg Response Time */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-secondary-fixed rounded-lg text-secondary">
              <span className="material-symbols-outlined">timer</span>
            </span>
            <span className="text-tertiary font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              -2m
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
            Avg. Response Time
          </p>
          <h3 className="text-headline-md font-headline-md text-on-surface mt-1">
            {loading ? "..." : avgResponseTime}
          </h3>
        </div>

        {/* Metric Card 4: Queue Capacity */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-error-container rounded-lg text-error">
              <span className="material-symbols-outlined">speed</span>
            </span>
            <span className="text-error font-label-md text-label-md">
              {metrics.queueCapacity > 80 ? "High load" : "Normal"}
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
            Queue Capacity
          </p>
          <h3 className="text-headline-md font-headline-md text-on-surface mt-1">
            {loading ? "..." : `${metrics.queueCapacity}%`}
          </h3>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: High Priority Queue Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30 flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              High Priority Queue
            </h3>
            <Link
              to="/moderator/queue"
              className="text-primary font-label-md text-label-md hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Report ID
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Reported User
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Time in Queue
                  </th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                      Loading reports...
                    </td>
                  </tr>
                ) : openReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-on-surface-variant flex flex-col items-center"
                    >
                      <span className="material-symbols-outlined text-4xl mb-2 text-primary/50">
                        task_alt
                      </span>
                      <p>No high priority reports pending.</p>
                    </td>
                  </tr>
                ) : (
                  openReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface font-medium">
                        #{report.id.substring(0, 6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 ${report.reasonType === "hate_speech" ? "bg-error-container text-on-error-container" : report.reasonType === "harassment" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"} text-[11px] font-bold rounded uppercase`}
                        >
                          {report.reasonType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                        {report.reporter?.displayName || "Anonymous User"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-body-md text-body-md flex items-center gap-1 ${new Date().getTime() - new Date(report.createdAt).getTime() > 1800000 ? "text-error" : "text-on-surface-variant"}`}
                        >
                          {new Date().getTime() - new Date(report.createdAt).getTime() >
                            1800000 && (
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                          )}
                          {formatTimeAgo(report.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/moderator/queue"
                          className="inline-block px-4 py-1.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-90"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Shift Activity Chart */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Shift Activity</h3>
            <p className="font-label-md text-label-md text-on-surface-variant">Volume by Hour</p>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 h-48">
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-full bg-primary-fixed rounded-t-lg transition-all duration-300 group-hover:bg-primary-container"
                style={{ height: "40%" }}
              ></div>
              <span className="font-label-md text-label-md text-on-surface-variant">8AM</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-full bg-primary-fixed rounded-t-lg transition-all duration-300 group-hover:bg-primary-container"
                style={{ height: "65%" }}
              ></div>
              <span className="font-label-md text-label-md text-on-surface-variant">10AM</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-full bg-primary-container rounded-t-lg transition-all duration-300"
                style={{ height: "95%" }}
              ></div>
              <span className="font-label-md text-label-md text-on-surface-variant">12PM</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-full bg-primary-fixed rounded-t-lg transition-all duration-300 group-hover:bg-primary-container"
                style={{ height: "80%" }}
              ></div>
              <span className="font-label-md text-label-md text-on-surface-variant">2PM</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div
                className="w-full bg-primary-fixed rounded-t-lg transition-all duration-300 group-hover:bg-primary-container"
                style={{ height: "55%" }}
              ></div>
              <span className="font-label-md text-label-md text-on-surface-variant">4PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: AI Priority Recommendation Banner */}
        <div className="bg-surface-container-lowest border-l-4 border-tertiary p-6 rounded-xl shadow-sm relative overflow-hidden flex gap-4 items-start opacity-80 grayscale-[20%]">
          <div className="absolute inset-0 bg-tertiary/5 pointer-events-none"></div>
          <div className="bg-tertiary-container p-3 rounded-full text-on-tertiary-container">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div className="relative z-10">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2">
              AI Priority Recommendation
              <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded uppercase tracking-wider">
                Coming Soon
              </span>
            </h4>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Our advanced AI moderation assistant is currently in training. Soon, it will
              automatically detect reporting surges, flag bot patterns, and suggest bulk resolution
              actions.
            </p>
            <button
              disabled
              className="mt-4 flex items-center gap-2 text-tertiary/60 font-label-md text-label-md cursor-not-allowed"
            >
              Feature in development
            </button>
          </div>
        </div>

        {/* Right: Recent Actions Timeline */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Recent Actions</h3>
          {loading ? (
            <div className="text-on-surface-variant text-center">Loading recent actions...</div>
          ) : recentActions.length === 0 ? (
            <div className="text-on-surface-variant text-center">No recent actions recorded.</div>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/40">
              {recentActions.map((action) => (
                <div key={action.id} className="relative pl-10">
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full border-4 border-surface-container-lowest z-10 ${action.status === "dismissed" ? "bg-secondary" : action.status === "escalated" ? "bg-error" : "bg-tertiary"}`}
                  ></div>
                  <p className="font-body-md text-body-md text-on-surface">
                    You{" "}
                    {action.status === "dismissed"
                      ? "dismissed"
                      : action.status === "escalated"
                        ? "escalated"
                        : "resolved"}{" "}
                    <span className="font-bold">#{action.id.substring(0, 6).toUpperCase()}</span>
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {formatTimeAgo(action.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModeratorLayout>
  );
}
