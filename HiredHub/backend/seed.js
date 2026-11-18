require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const SavedJob = require('./models/SavedJob');
const Resume = require('./models/Resume');
const fs = require('fs');
const path = require('path');

const companies = [
  ['Razorpay', 'Bengaluru'], ['Zerodha', 'Bengaluru'], ['Swiggy', 'Bengaluru'], ['Freshworks', 'Chennai'],
  ['Postman', 'Bengaluru'], ['Zoho', 'Chennai'], ['CRED', 'Bengaluru'], ['Paytm', 'Noida'],
];
const templates = [
  { title: 'Frontend Engineer', category: 'Engineering', skills: ['React', 'JavaScript', 'Tailwind CSS', 'REST APIs'], level: 'Mid', exp: 2, sal: [1200000, 2200000] },
  { title: 'Backend Engineer', category: 'Engineering', skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'], level: 'Mid', exp: 3, sal: [1500000, 2600000] },
  { title: 'Full Stack Developer', category: 'Engineering', skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'], level: 'Mid', exp: 2, sal: [1400000, 2400000] },
  { title: 'Data Analyst', category: 'Data', skills: ['Python', 'SQL', 'Tableau', 'Statistics'], level: 'Entry', exp: 0, sal: [600000, 1100000] },
  { title: 'Machine Learning Engineer', category: 'Data', skills: ['Python', 'PyTorch', 'SQL', 'Docker'], level: 'Senior', exp: 5, sal: [2800000, 4500000] },
  { title: 'Product Designer', category: 'Design', skills: ['Figma', 'Prototyping', 'User Research'], level: 'Mid', exp: 3, sal: [1300000, 2300000] },
  { title: 'DevOps Engineer', category: 'Engineering', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], level: 'Senior', exp: 5, sal: [2400000, 4000000] },
  { title: 'Software Engineering Intern', category: 'Engineering', skills: ['JavaScript', 'Python', 'Git'], level: 'Entry', exp: 0, sal: [300000, 500000], type: 'Internship' },
];
const modes = ['Remote', 'Hybrid', 'On-site'];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Job, Application, SavedJob, Resume].map((m) => m.deleteMany({})));

  const recruiters = await User.create([
    { name: 'Priya Sharma', email: 'recruiter@hiredhub.dev', password: 'Password123', role: 'recruiter', headline: 'Talent Lead', company: { name: 'Razorpay', website: 'https://razorpay.com', size: '1000+' } },
    { name: 'Rahul Verma', email: 'recruiter2@hiredhub.dev', password: 'Password123', role: 'recruiter', headline: 'Technical Recruiter', company: { name: 'Postman', website: 'https://postman.com', size: '500+' } },
  ]);
  const seeker = await User.create({
    name: 'Aarav Mehta', email: 'seeker@hiredhub.dev', password: 'Password123', role: 'seeker',
    headline: 'Full Stack Developer', skills: ['React', 'JavaScript', 'Node.js', 'Python'], experienceYears: 2,
    preferredLocations: ['Bengaluru', 'Remote'], expectedSalary: 1800000,
    education: [{ school: 'IIT Delhi', degree: 'B.Tech', field: 'Computer Science', startYear: 2018, endYear: 2022 }],
    github: 'https://github.com/aarav', linkedin: 'https://linkedin.com/in/aarav',
  });

  const jobs = [];
  companies.forEach(([name, city], ci) => templates.forEach((t, ti) => {
    if ((ci + ti) % 2) return; // ~half of combinations for variety
    jobs.push({
      title: t.title, category: t.category, skills: t.skills, experienceLevel: t.level, minExperience: t.exp,
      employmentType: t.type || 'Full-time', workMode: modes[(ci + ti) % 3], location: city,
      salary: { min: t.sal[0], max: t.sal[1], currency: 'INR' },
      company: { name, size: '500+' },
      description: `Join ${name} as a ${t.title} and help build products used by millions of people across India.`,
      responsibilities: ['Own features end to end from design to release', 'Collaborate with product and design', 'Write clean, tested, maintainable code', 'Participate in code reviews'],
      qualifications: [`${t.exp}+ years of relevant experience`, 'Strong problem-solving skills', 'Excellent communication'],
      benefits: ['Health insurance', 'Flexible hours', 'Learning budget', 'Stock options'],
      recruiter: recruiters[ci % 2]._id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 864e5),
    });
  }));
  const createdJobs = await Job.insertMany(jobs);

  // --- Candidates, resumes, applications, saved jobs ---
  const upDir = path.join(__dirname, 'uploads');
  fs.mkdirSync(upDir, { recursive: true });
  const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
  const names = ['Ananya Rao', 'Vikram Singh', 'Neha Gupta', 'Karan Patel', 'Sneha Iyer', 'Rohan Das'];
  const pools = [['React', 'JavaScript', 'Tailwind CSS'], ['Python', 'SQL', 'PyTorch'], ['Node.js', 'MongoDB', 'Express'],
    ['Figma', 'Prototyping'], ['AWS', 'Docker', 'Kubernetes'], ['Python', 'Tableau', 'SQL']];
  const extra = await User.create(names.map((n, i) => ({
    name: n, email: `candidate${i + 1}@hiredhub.dev`, password: 'Password123', role: 'seeker', headline: 'Candidate',
    skills: pools[i], experienceYears: (i % 5) + 1, preferredLocations: ['Bengaluru'], expectedSalary: 1500000,
  })));
  const people = [seeker, ...extra];
  const FLOWS = {
    Applied: ['Applied'], Assessment: ['Applied', 'Assessment'], Interview: ['Applied', 'Assessment', 'Interview'],
    Offer: ['Applied', 'Assessment', 'Interview', 'Offer'], Rejected: ['Applied', 'Assessment', 'Rejected'],
  };
  const KEYS = Object.keys(FLOWS);
  const DAY = 864e5;
  const seekerApplied = new Set();
  let appCount = 0;
  for (let pi = 0; pi < people.length; pi++) {
    const p = people[pi];
    const filename = `seed-resume-${pi}.pdf`;
    fs.writeFileSync(path.join(upDir, filename), pdfBytes);
    const resume = await Resume.create({
      user: p._id, originalName: `${p.name.replace(/\s+/g, '_')}_Resume.pdf`, filename,
      mimeType: 'application/pdf', size: pdfBytes.length, isPrimary: true,
    });
    const picked = new Set();
    for (let k = 0; picked.size < (pi === 0 ? 8 : 5); k++) picked.add((pi * 5 + k * 3) % createdJobs.length);
    let i = 0;
    for (const idx of picked) {
      const job = createdJobs[idx];
      const status = KEYS[(pi + i) % KEYS.length];
      i += 1;
      const applied = Date.now() - (3 + ((pi * 7 + i * 6) % 50)) * DAY;
      await Application.create({
        job: job._id, applicant: p._id, recruiter: job.recruiter, resume: resume._id,
        coverLetter: `Hi, I'm excited about the ${job.title} role at ${job.company.name} and believe my background is a strong fit.`,
        status, createdAt: new Date(applied),
        interviewDate: status === 'Interview' ? new Date(Date.now() + (3 + i) * DAY) : undefined,
        notes: pi === 0 && i % 3 === 0 ? 'Follow up next week.' : undefined,
        shortlisted: ['Assessment', 'Interview', 'Offer'].includes(status),
        history: FLOWS[status].map((s, n) => ({
          status: s, by: n === 0 ? 'seeker' : 'recruiter', changedBy: n === 0 ? p._id : job.recruiter,
          changedAt: new Date(Math.min(Date.now(), applied + n * 1.5 * DAY)),
        })),
      });
      if (pi === 0) seekerApplied.add(String(job._id));
      appCount += 1;
    }
  }
  await SavedJob.insertMany(createdJobs.filter((j) => !seekerApplied.has(String(j._id))).slice(0, 4)
    .map((j) => ({ user: seeker._id, job: j._id })));
  console.log(`Seeded ${jobs.length} jobs, ${appCount} applications, 2 recruiters, ${people.length} candidates.`);
  console.log('Seeker:    seeker@hiredhub.dev / Password123');
  console.log('Recruiter: recruiter@hiredhub.dev / Password123');
  console.log('Extra candidates: candidate1..6@hiredhub.dev / Password123');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
