// Transparent, explainable job-match algorithm (no ML). Total = 100 points:
//   Skills      70  split equally across the job's required skills
//   Experience  15  full if candidate years >= job minimum, else proportional
//   Location    15  full if job city is a preferred location, or the job is Remote and the
//                   candidate listed Remote; half if the job is Remote otherwise, or the
//                   candidate has no preference; else 0
const WEIGHTS = { skills: 70, experience: 15, location: 15 };
const norm = (s) => String(s).trim().toLowerCase();
const r1 = (n) => Math.round(n * 10) / 10;

function computeMatch(user, job) {
  const have = new Set((user.skills || []).map(norm));
  const jobSkills = job.skills || [];
  const matchingSkills = jobSkills.filter((s) => have.has(norm(s)));
  const missingSkills = jobSkills.filter((s) => !have.has(norm(s)));
  const skills = jobSkills.length ? (matchingSkills.length / jobSkills.length) * WEIGHTS.skills : 0;

  const need = job.minExperience || 0;
  const years = user.experienceYears || 0;
  const experience = need === 0 ? WEIGHTS.experience : Math.min(years / need, 1) * WEIGHTS.experience;

  const prefs = (user.preferredLocations || []).map(norm);
  let location = 0;
  if (prefs.includes(norm(job.location))) location = WEIGHTS.location;
  else if (job.workMode === 'Remote') location = prefs.includes('remote') ? WEIGHTS.location : WEIGHTS.location / 2;
  else if (prefs.length === 0) location = WEIGHTS.location / 2;

  return {
    matchPercent: Math.round(skills + experience + location),
    matchingSkills, missingSkills,
    breakdown: { skills: r1(skills), experience: r1(experience), location: r1(location) },
    weights: WEIGHTS,
  };
}

module.exports = { computeMatch, WEIGHTS };
