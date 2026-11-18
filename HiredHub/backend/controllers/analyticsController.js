const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = Application.STATUSES;
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const startOfWeek = (d) => { const x = startOfDay(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const pct = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0);

const statusCounts = (apps) => {
  const c = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  apps.forEach((a) => { c[a.status] += 1; });
  return c;
};

// Last 8 weeks of application counts, oldest first (week starts Monday).
const weeklySeries = (apps, weeks = 8) => {
  const first = startOfWeek(new Date());
  first.setDate(first.getDate() - 7 * (weeks - 1));
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(first); d.setDate(d.getDate() + 7 * i);
    return { weekStart: dayKey(d), count: 0 };
  });
  apps.forEach((a) => {
    const idx = Math.floor((startOfWeek(a.createdAt) - first) / (7 * 864e5));
    if (idx >= 0 && idx < weeks) buckets[idx].count += 1;
  });
  return buckets;
};

exports.seeker = asyncHandler(async (req, res) => {
  const apps = await Application.find({ applicant: req.user._id }).populate('job', 'title company category').sort({ createdAt: -1 }).lean();
  const total = apps.length;
  const byStatus = statusCounts(apps);
  const hist = (a, s) => a.status === s || a.history.some((h) => h.status === s);
  const reachedInterview = apps.filter((a) => hist(a, 'Interview') || a.status === 'Offer').length;
  const reachedOffer = apps.filter((a) => hist(a, 'Offer')).length;

  // Activity = applications sent + status changes, per day for the last 7 days.
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - (6 - i)); return { date: dayKey(d), count: 0 }; });
  const dayIdx = Object.fromEntries(days.map((d, i) => [d.date, i]));
  apps.forEach((a) => a.history.forEach((h) => { const k = dayKey(new Date(h.changedAt)); if (k in dayIdx) days[dayIdx[k]].count += 1; }));

  const cats = {};
  apps.forEach((a) => { const c = (a.job && a.job.category) || 'Other'; cats[c] = (cats[c] || 0) + 1; });
  const topCategories = Object.entries(cats).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 5);

  res.json({
    success: true,
    overview: {
      totalApplications: total, interviews: byStatus.Interview, offers: byStatus.Offer, rejected: byStatus.Rejected,
      savedJobs: await SavedJob.countDocuments({ user: req.user._id }),
    },
    rates: { interviewRate: pct(reachedInterview, total), offerRate: pct(reachedOffer, total), rejectionRate: pct(byStatus.Rejected, total) },
    byStatus,
    applicationsOverTime: weeklySeries(apps),
    weeklyActivity: days,
    topCategories,
    upcomingInterviews: apps.filter((a) => a.interviewDate && new Date(a.interviewDate) >= new Date())
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate)).slice(0, 5)
      .map((a) => ({ _id: a._id, interviewDate: a.interviewDate, job: a.job })),
    recentApplications: apps.slice(0, 5),
  });
});

exports.recruiter = asyncHandler(async (req, res) => {
  const [jobs, apps] = await Promise.all([
    Job.find({ recruiter: req.user._id }).select('title status').lean(),
    Application.find({ recruiter: req.user._id }).populate('job', 'title').populate('applicant', 'name avatar headline').sort({ createdAt: -1 }).lean(),
  ]);
  const byStatus = statusCounts(apps);
  const perJob = {};
  apps.forEach((a) => { if (a.job) perJob[a.job._id] = { title: a.job.title, count: (perJob[a.job._id]?.count || 0) + 1 }; });
  res.json({
    success: true,
    overview: {
      activeJobs: jobs.filter((j) => j.status === 'active').length, totalJobs: jobs.length,
      totalApplicants: apps.length, interviews: byStatus.Interview, hires: byStatus.Offer,
      shortlisted: apps.filter((a) => a.shortlisted).length,
    },
    byStatus,
    applicationsOverTime: weeklySeries(apps),
    topJobs: Object.values(perJob).sort((a, b) => b.count - a.count).slice(0, 5),
    recentApplications: apps.slice(0, 6),
  });
});
