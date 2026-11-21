import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import { GuestRoute, ProtectedRoute } from './routes/guards';
import Landing from './pages/public/Landing';
import JobsPage from './pages/public/JobsPage';
import JobDetails from './pages/public/JobDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Overview from './pages/seeker/Overview';
import MyApplications from './pages/seeker/MyApplications';
import SavedJobs from './pages/seeker/SavedJobs';
import Analytics from './pages/seeker/Analytics';
import ResumePage from './pages/seeker/ResumePage';
import Profile from './pages/seeker/Profile';
import RecruiterOverview from './pages/recruiter/RecruiterOverview';
import MyJobs from './pages/recruiter/MyJobs';
import JobForm from './pages/recruiter/JobForm';
import Applicants from './pages/recruiter/Applicants';
import CompanyProfile from './pages/recruiter/CompanyProfile';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="jobs" element={<JobsPage basePath="/jobs" />} />
        <Route path="jobs/:id" element={<JobDetails basePath="/jobs" />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute roles={['seeker']} />}>
        <Route path="dashboard" element={<DashboardLayout role="seeker" />}>
          <Route index element={<Overview />} />
          <Route path="jobs" element={<JobsPage basePath="/dashboard/jobs" embedded />} />
          <Route path="jobs/:id" element={<JobDetails basePath="/dashboard/jobs" embedded />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="saved" element={<SavedJobs />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['recruiter']} />}>
        <Route path="recruiter" element={<DashboardLayout role="recruiter" />}>
          <Route index element={<RecruiterOverview />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id/edit" element={<JobForm />} />
          <Route path="jobs/:jobId/applicants" element={<Applicants />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
