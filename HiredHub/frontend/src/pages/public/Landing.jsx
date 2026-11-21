import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Hero from './landing/Hero';
import Stats from './landing/Stats';
import FeaturedJobs from './landing/FeaturedJobs';
import HowItWorks from './landing/HowItWorks';
import Features from './landing/Features';
import Testimonials from './landing/Testimonials';
import FinalCTA from './landing/FinalCTA';

export default function Landing() {
  useDocumentTitle();
  const { hash } = useLocation();

  // React Router does not scroll to #anchors on its own
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <Hero />
      <Stats />
      <FeaturedJobs />
      <HowItWorks />
      <Features />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
