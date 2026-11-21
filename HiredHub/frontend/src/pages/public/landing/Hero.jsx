import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import Button from '../../../components/common/Button';
import HeroBoard from './HeroBoard';

const GRID = 'linear-gradient(to right, rgb(15 23 42 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.05) 1px, transparent 1px)';
const MASK = 'radial-gradient(ellipse 75% 65% at 50% 25%, #000 25%, transparent 78%)';
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ backgroundImage: GRID, backgroundSize: '44px 44px', maskImage: MASK, WebkitMaskImage: MASK }} />
        <div className="absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute -left-20 top-48 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.09 }}>
          <motion.h1 variants={item} className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Your Career Journey, Organized.
          </motion.h1>
          <motion.p variants={item} className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            HiredHub brings job search and application tracking together. Find roles that match your skills, apply in one step, and follow every application from first click to offer.
          </motion.p>

          <motion.form variants={item} onSubmit={submit} role="search" className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lift sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Job title, skill or company</span>
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm placeholder:text-slate-400 focus:bg-slate-50 focus:outline-none" />
            </label>
            <label className="relative flex-1 sm:border-l sm:border-slate-100">
              <span className="sr-only">Location</span>
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or remote" className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm placeholder:text-slate-400 focus:bg-slate-50 focus:outline-none" />
            </label>
            <Button type="submit" className="sm:px-6">Search jobs</Button>
          </motion.form>

          <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-3">
            <Button to="/jobs" size="lg">Explore Jobs</Button>
            <Button to="/register" variant="secondary" size="lg">Get Started</Button>
          </motion.div>
          <motion.p variants={item} className="mt-4 text-sm text-slate-500">Free for job seekers. Recruiters can post their first role in minutes.</motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}>
          <HeroBoard />
        </motion.div>
      </div>
    </section>
  );
}
