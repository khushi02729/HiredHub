import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from './useAuth';
import { errorMessage } from '../services/api';
import { saveJob, unsaveJob } from '../services/jobService';

// Returns toggle(job). `setJobs(updater)` receives a function from the current job array to the next.
// With removeOnUnsave (Saved Jobs page) the card is removed only after the server confirms.
export default function useToggleSave(setJobs, { removeOnUnsave = false } = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return async (job) => {
    if (!user) {
      toast('Sign in to save jobs');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    if (user.role !== 'seeker') { toast('Saving jobs is available on job seeker accounts'); return; }

    const next = !job.isSaved;
    const mark = (saved) => setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, isSaved: saved } : j)));
    if (!(removeOnUnsave && !next)) mark(next);
    try {
      await (next ? saveJob(job._id) : unsaveJob(job._id));
      if (removeOnUnsave && !next) setJobs((prev) => prev.filter((j) => j._id !== job._id));
      toast.success(next ? 'Job saved' : 'Removed from saved jobs');
    } catch (err) {
      if (!(removeOnUnsave && !next)) mark(!next);
      toast.error(errorMessage(err));
    }
  };
}
