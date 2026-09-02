// import { useEffect, useState } from "react";
// import {
//   Activity,
//   BarChart3,
//   Calendar,
//   CheckCircle2,
//   DollarSign,
//   Target,
//   TrendingUp,
//   Users,
// } from "lucide-react";

// import { getDashboard } from "../../services/api";

// function Dashboard() {
//   const [dashboard, setDashboard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadDashboard = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await getDashboard();

//       setDashboard(response.dashboard);
//     } catch (err) {
//       console.error("Dashboard error:", err);

//       setError(
//         err.message || "Failed to load dashboard"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDashboard();
//   }, []);

//   // ======================================================
//   // LOADING
//   // ======================================================

//   if (loading) {
//     return (
//       <div>
//         <div className="mb-8">
//           <p className="font-inter text-sm font-medium text-[#266DF0]">
//             Overview
//           </p>

//           <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
//             Dashboard
//           </h1>

//           <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
//             Here's what's happening with your sales today.
//           </p>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//           {[1, 2, 3, 4].map((item) => (
//             <div
//               key={item}
//               className="h-[125px] animate-pulse rounded-2xl border border-[#EDEEF0] bg-white"
//             />
//           ))}
//         </div>

//         <div className="mt-6 grid gap-6 xl:grid-cols-3">
//           <div className="h-[400px] animate-pulse rounded-2xl border border-[#EDEEF0] bg-white xl:col-span-2" />

//           <div className="h-[400px] animate-pulse rounded-2xl border border-[#EDEEF0] bg-white" />
//         </div>
//       </div>
//     );
//   }

//   // ======================================================
//   // ERROR
//   // ======================================================

//   if (error) {
//     return (
//       <div>
//         <div className="mb-8">
//           <p className="font-inter text-sm font-medium text-[#266DF0]">
//             Overview
//           </p>

//           <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
//             Dashboard
//           </h1>
//         </div>

//         <div className="rounded-2xl border border-red-100 bg-red-50 p-5 font-inter text-sm text-red-600">
//           <p>{error}</p>

//           <button
//             type="button"
//             onClick={loadDashboard}
//             className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ======================================================
//   // DATA
//   // ======================================================

//   const totals = dashboard?.totals || {};
//   const conversion = dashboard?.conversion || {};
//   const pipeline = dashboard?.pipeline || {};
//   const activities = dashboard?.activities || {};

//   const activityStats = activities.stats || {
//     Pending: 0,
//     Completed: 0,
//     Cancelled: 0,
//     Overdue: 0,
//   };

//   // ======================================================
//   // HELPERS
//   // ======================================================

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(value || 0);
//   };

//   const formatDate = (date) => {
//     if (!date) return "No date";

//     return new Date(date).toLocaleDateString(
//       "en-IN",
//       {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }
//     );
//   };

//   const formatTime = (date) => {
//     if (!date) return "";

//     return new Date(date).toLocaleTimeString(
//       "en-IN",
//       {
//         hour: "2-digit",
//         minute: "2-digit",
//       }
//     );
//   };

//   return (
//     <div>
//       {/* ==================================================
//           HEADER
//       ================================================== */}

//       <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="font-inter text-sm font-medium text-[#266DF0]">
//             Overview
//           </p>

//           <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
//             Dashboard
//           </h1>

//           <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
//             Here's what's happening with your sales today.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={loadDashboard}
//           className="w-fit rounded-xl border border-[#EDEEF0] bg-white px-4 py-2.5 font-inter text-sm font-medium text-[#555E67] transition hover:border-[#D9E5FC] hover:bg-[#F5F8FE] hover:text-[#266DF0]"
//         >
//           Refresh
//         </button>
//       </div>

//       {/* ==================================================
//           TOP STATS
//       ================================================== */}

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <StatCard
//           label="Total Leads"
//           value={totals.leads || 0}
//           icon={Target}
//         />

//         <StatCard
//           label="Customers"
//           value={totals.customers || 0}
//           icon={Users}
//         />

//         <StatCard
//           label="Active Deals"
//           value={totals.deals || 0}
//           icon={BarChart3}
//         />

//         <StatCard
//           label="Pipeline Value"
//           value={formatCurrency(
//             pipeline.totalValue
//           )}
//           icon={Activity}
//         />
//       </div>

//       {/* ==================================================
//           SALES METRICS
//       ================================================== */}

//       <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <MetricCard
//           label="Conversion Rate"
//           value={`${conversion.rate || 0}%`}
//           description={`${conversion.convertedLeads || 0} of ${
//             conversion.totalLeads || 0
//           } leads converted`}
//           icon={TrendingUp}
//         />

//         <MetricCard
//           label="Expected Revenue"
//           value={formatCurrency(
//             pipeline.expectedRevenue
//           )}
//           description="Based on current deal probabilities"
//           icon={DollarSign}
//         />

//         <MetricCard
//           label="Won Deals"
//           value={pipeline.wonCount || 0}
//           description={formatCurrency(
//             pipeline.wonValue
//           )}
//           icon={CheckCircle2}
//         />

//         <MetricCard
//           label="Win Rate"
//           value={`${pipeline.winRate || 0}%`}
//           description={`${
//             pipeline.wonCount || 0
//           } won / ${
//             (pipeline.wonCount || 0) +
//             (pipeline.lostCount || 0)
//           } closed`}
//           icon={TrendingUp}
//         />
//       </div>

//       {/* ==================================================
//           MAIN GRID
//       ================================================== */}

//       <div className="mt-6 grid gap-6 xl:grid-cols-3">
//         {/* ==================================================
//             PIPELINE
//         ================================================== */}

//         <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)] xl:col-span-2">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
//                 Sales Pipeline
//               </h2>

//               <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//                 Deals grouped by stage
//               </p>
//             </div>

//             <BarChart3
//               size={20}
//               className="text-[#266DF0]"
//             />
//           </div>

//           {/* Active pipeline */}
//           <div className="mt-5 rounded-xl bg-[#F5F8FE] p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-inter text-xs font-medium text-[#9CA1AA]">
//                   Active Pipeline
//                 </p>

//                 <p className="mt-1 font-gilroy text-xl font-bold text-[#1D1E20]">
//                   {formatCurrency(
//                     pipeline.activeValue
//                   )}
//                 </p>
//               </div>

//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#266DF0]">
//                 <BarChart3 size={19} />
//               </div>
//             </div>
//           </div>

//           {/* Stages */}
//           <div className="mt-6 space-y-4">
//             {pipeline.stages?.length > 0 ? (
//               pipeline.stages.map((stage) => {
//                 const percentage =
//                   pipeline.totalValue > 0
//                     ? Math.min(
//                         (stage.totalValue /
//                           pipeline.totalValue) *
//                           100,
//                         100
//                       )
//                     : 0;

//                 return (
//                   <div key={stage._id}>
//                     <div className="mb-2 flex items-center justify-between gap-4">
//                       <div className="min-w-0">
//                         <p className="truncate font-inter text-sm font-semibold text-[#232529]">
//                           {stage._id}
//                         </p>

//                         <p className="mt-0.5 font-inter text-xs text-[#9CA1AA]">
//                           {stage.count}{" "}
//                           {stage.count === 1
//                             ? "deal"
//                             : "deals"}
//                         </p>
//                       </div>

//                       <p className="shrink-0 font-inter text-sm font-semibold text-[#232529]">
//                         {formatCurrency(
//                           stage.totalValue
//                         )}
//                       </p>
//                     </div>

//                     <div className="h-2 overflow-hidden rounded-full bg-[#F0F2F5]">
//                       <div
//                         className="h-full rounded-full bg-[#266DF0] transition-all duration-500"
//                         style={{
//                           width: `${percentage}%`,
//                         }}
//                       />
//                     </div>

//                     {stage.expectedRevenue > 0 && (
//                       <p className="mt-1 text-right font-inter text-[10px] text-[#9CA1AA]">
//                         Expected revenue:{" "}
//                         {formatCurrency(
//                           stage.expectedRevenue
//                         )}
//                       </p>
//                     )}
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
//                 No deals in pipeline.
//               </div>
//             )}
//           </div>

//           {/* Won / Lost */}
//           <div className="mt-6 grid gap-3 sm:grid-cols-2">
//             <div className="rounded-xl bg-green-50 p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-inter text-xs text-green-600">
//                     Closed Won
//                   </p>

//                   <p className="mt-1 font-gilroy text-xl font-bold text-green-700">
//                     {formatCurrency(
//                       pipeline.wonValue
//                     )}
//                   </p>

//                   <p className="mt-1 font-inter text-xs text-green-600">
//                     {pipeline.wonCount || 0}{" "}
//                     {pipeline.wonCount === 1
//                       ? "deal"
//                       : "deals"}
//                   </p>
//                 </div>

//                 <CheckCircle2
//                   size={24}
//                   className="text-green-600"
//                 />
//               </div>
//             </div>

//             <div className="rounded-xl bg-red-50 p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-inter text-xs text-red-600">
//                     Closed Lost
//                   </p>

//                   <p className="mt-1 font-gilroy text-xl font-bold text-red-700">
//                     {formatCurrency(
//                       pipeline.lostValue
//                     )}
//                   </p>

//                   <p className="mt-1 font-inter text-xs text-red-600">
//                     {pipeline.lostCount || 0}{" "}
//                     {pipeline.lostCount === 1
//                       ? "deal"
//                       : "deals"}
//                   </p>
//                 </div>

//                 <Target
//                   size={24}
//                   className="text-red-600"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ==================================================
//             ACTIVITY STATS
//         ================================================== */}

//         <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
//                 Activities
//               </h2>

//               <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//                 Current activity status
//               </p>
//             </div>

//             <Calendar
//               size={20}
//               className="text-[#266DF0]"
//             />
//           </div>

//           <div className="mt-6 space-y-3">
//             <ActivityStat
//               label="Pending"
//               value={activityStats.Pending}
//               className="bg-orange-50 text-orange-600"
//             />

//             <ActivityStat
//               label="Completed"
//               value={activityStats.Completed}
//               className="bg-green-50 text-green-600"
//             />

//             <ActivityStat
//               label="Cancelled"
//               value={activityStats.Cancelled}
//               className="bg-red-50 text-red-600"
//             />

//             <ActivityStat
//               label="Overdue"
//               value={activityStats.Overdue}
//               className="bg-red-50 text-red-600"
//             />
//           </div>

//           {/* Activity summary */}
//           <div className="mt-5 rounded-xl border border-[#EDEEF0] bg-[#F8F9FB] p-4">
//             <div className="flex items-center justify-between">
//               <span className="font-inter text-xs text-[#9CA1AA]">
//                 Total tracked
//               </span>

//               <span className="font-gilroy text-lg font-bold text-[#232529]">
//                 {(activityStats.Pending || 0) +
//                   (activityStats.Completed || 0) +
//                   (activityStats.Cancelled || 0)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ==================================================
//           UPCOMING ACTIVITIES
//       ================================================== */}

//       <div className="mt-6 rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
//               Upcoming Activities
//             </h2>

//             <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//               Your next scheduled activities
//             </p>
//           </div>

//           <Calendar
//             size={20}
//             className="text-[#266DF0]"
//           />
//         </div>

//         <div className="mt-5">
//           {activities.upcoming?.length > 0 ? (
//             <div className="divide-y divide-[#EDEEF0]">
//               {activities.upcoming.map(
//                 (activity) => (
//                   <div
//                     key={activity._id}
//                     className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
//                   >
//                     <div className="flex min-w-0 items-start gap-3">
//                       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
//                         <Calendar size={17} />
//                       </div>

//                       <div className="min-w-0">
//                         <p className="truncate font-inter text-sm font-semibold text-[#232529]">
//                           {activity.subject}
//                         </p>

//                         <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//                           {activity.type}

//                           {activity.customer
//                             ? ` • ${activity.customer.name}`
//                             : ""}

//                           {activity.deal
//                             ? ` • ${activity.deal.title}`
//                             : ""}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="shrink-0 sm:text-right">
//                       <p className="font-inter text-sm font-medium text-[#555E67]">
//                         {formatDate(
//                           activity.dueDate
//                         )}
//                       </p>

//                       <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//                         {formatTime(
//                           activity.dueDate
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           ) : (
//             <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
//               No upcoming activities.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ==================================================
//           RECENT ACTIVITIES
//       ================================================== */}

//       <div className="mt-6 rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
//               Recent Activities
//             </h2>

//             <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//               Latest activity updates
//             </p>
//           </div>

//           <Activity
//             size={20}
//             className="text-[#266DF0]"
//           />
//         </div>

//         <div className="mt-5">
//           {activities.recent?.length > 0 ? (
//             <div className="divide-y divide-[#EDEEF0]">
//               {activities.recent.map(
//                 (activity) => (
//                   <div
//                     key={activity._id}
//                     className="flex flex-col gap-2 py-4"
//                   >
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <p className="font-inter text-sm font-semibold text-[#232529]">
//                           {activity.subject}
//                         </p>

//                         <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//                           {activity.type}
//                         </p>
//                       </div>

//                       <span
//                         className={`shrink-0 rounded-full px-2.5 py-1 font-inter text-[10px] font-semibold ${
//                           activity.status ===
//                           "Completed"
//                             ? "bg-green-50 text-green-600"
//                             : activity.status ===
//                               "Cancelled"
//                             ? "bg-red-50 text-red-600"
//                             : "bg-orange-50 text-orange-600"
//                         }`}
//                       >
//                         {activity.status}
//                       </span>
//                     </div>

//                     <div className="flex flex-wrap gap-x-4 gap-y-1 font-inter text-xs text-[#9CA1AA]">
//                       {activity.customer && (
//                         <span>
//                           Customer:{" "}
//                           {activity.customer.name}
//                         </span>
//                       )}

//                       {activity.deal && (
//                         <span>
//                           Deal:{" "}
//                           {activity.deal.title}
//                         </span>
//                       )}

//                       {activity.assignedTo && (
//                         <span>
//                           Assigned to:{" "}
//                           {activity.assignedTo.name}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           ) : (
//             <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
//               No recent activities.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ======================================================
// // STAT CARD
// // ======================================================

// function StatCard({
//   label,
//   value,
//   icon: Icon,
// }) {
//   return (
//     <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
//       <div className="flex items-center justify-between">
//         <p className="font-inter text-sm text-[#9CA1AA]">
//           {label}
//         </p>

//         <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
//           <Icon size={18} />
//         </div>
//       </div>

//       <p className="mt-3 font-gilroy text-3xl font-bold text-[#1D1E20]">
//         {value}
//       </p>
//     </div>
//   );
// }

// // ======================================================
// // METRIC CARD
// // ======================================================

// function MetricCard({
//   label,
//   value,
//   description,
//   icon: Icon,
// }) {
//   return (
//     <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
//       <div className="flex items-center justify-between">
//         <p className="font-inter text-sm text-[#9CA1AA]">
//           {label}
//         </p>

//         <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
//           <Icon size={18} />
//         </div>
//       </div>

//       <p className="mt-3 font-gilroy text-2xl font-bold text-[#1D1E20]">
//         {value}
//       </p>

//       <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
//         {description}
//       </p>
//     </div>
//   );
// }

// // ======================================================
// // ACTIVITY STAT
// // ======================================================

// function ActivityStat({
//   label,
//   value,
//   className,
// }) {
//   return (
//     <div className="flex items-center justify-between rounded-xl border border-[#F0F1F3] p-3">
//       <div className="flex items-center gap-3">
//         <div
//           className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`}
//         >
//           <CheckCircle2 size={16} />
//         </div>

//         <span className="font-inter text-sm font-medium text-[#555E67]">
//           {label}
//         </span>
//       </div>

//       <span className="font-gilroy text-lg font-bold text-[#232529]">
//         {value || 0}
//       </span>
//     </div>
//   );
// }

// export default Dashboard;

import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { useGetDashboardQuery } from "../../store/api/dashboardApi";

function Dashboard() {
  // ======================================================
  // RTK QUERY
  // ======================================================

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDashboardQuery();

  const dashboard = response?.dashboard;

  // ======================================================
  // LOADING
  // ======================================================

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Overview
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Dashboard
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Here's what's happening with your sales today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[125px] animate-pulse rounded-2xl border border-[#EDEEF0] bg-white"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="h-[400px] animate-pulse rounded-2xl border border-[#EDEEF0] bg-white xl:col-span-2" />

          <div className="h-[400px] animate-pulse rounded-2xl border border-[#EDEEF0] bg-white" />
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (isError) {
    return (
      <div>
        <div className="mb-8">
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Overview
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Dashboard
          </h1>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 font-inter text-sm text-red-600">
          <p>
            {error?.data?.message ||
              error?.error ||
              "Failed to load dashboard"}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // DATA
  // ======================================================

  const totals = dashboard?.totals || {};
  const conversion = dashboard?.conversion || {};
  const pipeline = dashboard?.pipeline || {};
  const activities = dashboard?.activities || {};

  const activityStats = activities.stats || {
    Pending: 0,
    Completed: 0,
    Cancelled: 0,
    Overdue: 0,
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div>
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-inter text-sm font-medium text-[#266DF0]">
            Overview
          </p>

          <h1 className="mt-1 font-gilroy text-3xl font-bold tracking-tight text-[#1D1E20]">
            Dashboard
          </h1>

          <p className="mt-2 font-inter text-sm text-[#9CA1AA]">
            Here's what's happening with your sales today.
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={isFetching}
          className="w-fit rounded-xl border border-[#EDEEF0] bg-white px-4 py-2.5 font-inter text-sm font-medium text-[#555E67] transition hover:border-[#D9E5FC] hover:bg-[#F5F8FE] hover:text-[#266DF0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ==================================================
          TOP STATS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={totals.leads || 0}
          icon={Target}
        />

        <StatCard
          label="Customers"
          value={totals.customers || 0}
          icon={Users}
        />

        <StatCard
          label="Active Deals"
          value={totals.deals || 0}
          icon={BarChart3}
        />

        <StatCard
          label="Pipeline Value"
          value={formatCurrency(
            pipeline.totalValue
          )}
          icon={Activity}
        />
      </div>

      {/* ==================================================
          SALES METRICS
      ================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Conversion Rate"
          value={`${conversion.rate || 0}%`}
          description={`${conversion.convertedLeads || 0} of ${
            conversion.totalLeads || 0
          } leads converted`}
          icon={TrendingUp}
        />

        <MetricCard
          label="Expected Revenue"
          value={formatCurrency(
            pipeline.expectedRevenue
          )}
          description="Based on current deal probabilities"
          icon={DollarSign}
        />

        <MetricCard
          label="Won Deals"
          value={pipeline.wonCount || 0}
          description={formatCurrency(
            pipeline.wonValue
          )}
          icon={CheckCircle2}
        />

        <MetricCard
          label="Win Rate"
          value={`${pipeline.winRate || 0}%`}
          description={`${
            pipeline.wonCount || 0
          } won / ${
            (pipeline.wonCount || 0) +
            (pipeline.lostCount || 0)
          } closed`}
          icon={TrendingUp}
        />
      </div>

      {/* ==================================================
          MAIN GRID
      ================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* ==================================================
            PIPELINE
        ================================================== */}

        <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)] xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
                Sales Pipeline
              </h2>

              <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                Deals grouped by stage
              </p>
            </div>

            <BarChart3
              size={20}
              className="text-[#266DF0]"
            />
          </div>

          {/* Active pipeline */}

          <div className="mt-5 rounded-xl bg-[#F5F8FE] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-inter text-xs font-medium text-[#9CA1AA]">
                  Active Pipeline
                </p>

                <p className="mt-1 font-gilroy text-xl font-bold text-[#1D1E20]">
                  {formatCurrency(
                    pipeline.activeValue
                  )}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#266DF0]">
                <BarChart3 size={19} />
              </div>
            </div>
          </div>

          {/* Stages */}

          <div className="mt-6 space-y-4">
            {pipeline.stages?.length > 0 ? (
              pipeline.stages.map((stage) => {
                const percentage =
                  pipeline.totalValue > 0
                    ? Math.min(
                        (stage.totalValue /
                          pipeline.totalValue) *
                          100,
                        100
                      )
                    : 0;

                return (
                  <div key={stage._id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-inter text-sm font-semibold text-[#232529]">
                          {stage._id}
                        </p>

                        <p className="mt-0.5 font-inter text-xs text-[#9CA1AA]">
                          {stage.count}{" "}
                          {stage.count === 1
                            ? "deal"
                            : "deals"}
                        </p>
                      </div>

                      <p className="shrink-0 font-inter text-sm font-semibold text-[#232529]">
                        {formatCurrency(
                          stage.totalValue
                        )}
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#F0F2F5]">
                      <div
                        className="h-full rounded-full bg-[#266DF0] transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    {stage.expectedRevenue > 0 && (
                      <p className="mt-1 text-right font-inter text-[10px] text-[#9CA1AA]">
                        Expected revenue:{" "}
                        {formatCurrency(
                          stage.expectedRevenue
                        )}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
                No deals in pipeline.
              </div>
            )}
          </div>

          {/* Won / Lost */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-xs text-green-600">
                    Closed Won
                  </p>

                  <p className="mt-1 font-gilroy text-xl font-bold text-green-700">
                    {formatCurrency(
                      pipeline.wonValue
                    )}
                  </p>

                  <p className="mt-1 font-inter text-xs text-green-600">
                    {pipeline.wonCount || 0}{" "}
                    {pipeline.wonCount === 1
                      ? "deal"
                      : "deals"}
                  </p>
                </div>

                <CheckCircle2
                  size={24}
                  className="text-green-600"
                />
              </div>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-xs text-red-600">
                    Closed Lost
                  </p>

                  <p className="mt-1 font-gilroy text-xl font-bold text-red-700">
                    {formatCurrency(
                      pipeline.lostValue
                    )}
                  </p>

                  <p className="mt-1 font-inter text-xs text-red-600">
                    {pipeline.lostCount || 0}{" "}
                    {pipeline.lostCount === 1
                      ? "deal"
                      : "deals"}
                  </p>
                </div>

                <Target
                  size={24}
                  className="text-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            ACTIVITY STATS
        ================================================== */}

        <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
                Activities
              </h2>

              <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                Current activity status
              </p>
            </div>

            <Calendar
              size={20}
              className="text-[#266DF0]"
            />
          </div>

          <div className="mt-6 space-y-3">
            <ActivityStat
              label="Pending"
              value={activityStats.Pending}
              className="bg-orange-50 text-orange-600"
            />

            <ActivityStat
              label="Completed"
              value={activityStats.Completed}
              className="bg-green-50 text-green-600"
            />

            <ActivityStat
              label="Cancelled"
              value={activityStats.Cancelled}
              className="bg-red-50 text-red-600"
            />

            <ActivityStat
              label="Overdue"
              value={activityStats.Overdue}
              className="bg-red-50 text-red-600"
            />
          </div>

          {/* Activity summary */}

          <div className="mt-5 rounded-xl border border-[#EDEEF0] bg-[#F8F9FB] p-4">
            <div className="flex items-center justify-between">
              <span className="font-inter text-xs text-[#9CA1AA]">
                Total tracked
              </span>

              <span className="font-gilroy text-lg font-bold text-[#232529]">
                {(activityStats.Pending || 0) +
                  (activityStats.Completed || 0) +
                  (activityStats.Cancelled || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          UPCOMING ACTIVITIES
      ================================================== */}

      <div className="mt-6 rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
              Upcoming Activities
            </h2>

            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
              Your next scheduled activities
            </p>
          </div>

          <Calendar
            size={20}
            className="text-[#266DF0]"
          />
        </div>

        <div className="mt-5">
          {activities.upcoming?.length > 0 ? (
            <div className="divide-y divide-[#EDEEF0]">
              {activities.upcoming.map(
                (activity) => (
                  <div
                    key={activity._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
                        <Calendar size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-inter text-sm font-semibold text-[#232529]">
                          {activity.subject}
                        </p>

                        <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                          {activity.type}

                          {activity.customer
                            ? ` • ${activity.customer.name}`
                            : ""}

                          {activity.deal
                            ? ` • ${activity.deal.title}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="font-inter text-sm font-medium text-[#555E67]">
                        {formatDate(
                          activity.dueDate
                        )}
                      </p>

                      <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                        {formatTime(
                          activity.dueDate
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
              No upcoming activities.
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          RECENT ACTIVITIES
      ================================================== */}

      <div className="mt-6 rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-gilroy text-lg font-bold text-[#1D1E20]">
              Recent Activities
            </h2>

            <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
              Latest activity updates
            </p>
          </div>

          <Activity
            size={20}
            className="text-[#266DF0]"
          />
        </div>

        <div className="mt-5">
          {activities.recent?.length > 0 ? (
            <div className="divide-y divide-[#EDEEF0]">
              {activities.recent.map(
                (activity) => (
                  <div
                    key={activity._id}
                    className="flex flex-col gap-2 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-inter text-sm font-semibold text-[#232529]">
                          {activity.subject}
                        </p>

                        <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
                          {activity.type}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 font-inter text-[10px] font-semibold ${
                          activity.status ===
                          "Completed"
                            ? "bg-green-50 text-green-600"
                            : activity.status ===
                              "Cancelled"
                            ? "bg-red-50 text-red-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 font-inter text-xs text-[#9CA1AA]">
                      {activity.customer && (
                        <span>
                          Customer:{" "}
                          {activity.customer.name}
                        </span>
                      )}

                      {activity.deal && (
                        <span>
                          Deal:{" "}
                          {activity.deal.title}
                        </span>
                      )}

                      {activity.assignedTo && (
                        <span>
                          Assigned to:{" "}
                          {activity.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-[#F8F9FB] p-6 text-center font-inter text-sm text-[#9CA1AA]">
              No recent activities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
      <div className="flex items-center justify-between">
        <p className="font-inter text-sm text-[#9CA1AA]">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 font-gilroy text-3xl font-bold text-[#1D1E20]">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// METRIC CARD
// ======================================================

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-[#EDEEF0] bg-white p-5 shadow-[0_4px_20px_rgba(35,37,41,0.03)]">
      <div className="flex items-center justify-between">
        <p className="font-inter text-sm text-[#9CA1AA]">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F8FE] text-[#266DF0]">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 font-gilroy text-2xl font-bold text-[#1D1E20]">
        {value}
      </p>

      <p className="mt-1 font-inter text-xs text-[#9CA1AA]">
        {description}
      </p>
    </div>
  );
}

// ======================================================
// ACTIVITY STAT
// ======================================================

function ActivityStat({
  label,
  value,
  className,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#F0F1F3] p-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`}
        >
          <CheckCircle2 size={16} />
        </div>

        <span className="font-inter text-sm font-medium text-[#555E67]">
          {label}
        </span>
      </div>

      <span className="font-gilroy text-lg font-bold text-[#232529]">
        {value || 0}
      </span>
    </div>
  );
}

export default Dashboard;