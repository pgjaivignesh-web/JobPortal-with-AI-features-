import { useEffect, useState } from 'react';
import { Loader2, Users, ChevronDown, CheckCircle, XCircle, Eye, Clock, Sparkles } from 'lucide-react';
import { supabase, type Job, type Application } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600' },
  { value: 'reviewed', label: 'Reviewed', icon: Eye, color: 'text-blue-600' },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle, color: 'text-green-600' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600' },
];

interface AppWithDetails extends Application {
  profiles?: { name: string };
  jobs?: Job;
}

export default function ViewApplicants() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [applications, setApplications] = useState<AppWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    fetchJobs();
  }, [profile]);

  useEffect(() => {
    fetchApplications();
  }, [selectedJob, jobs]);

  async function fetchJobs() {
    if (!profile) return;
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('recruiter_id', profile.id)
      .order('created_at', { ascending: false });
    setJobs(data ?? []);
    setLoading(false);
  }

  async function fetchApplications() {
    if (!profile) return;
    setLoading(true);
    let query = supabase
      .from('applications')
      .select('*, profiles(name), jobs(title, skills, recruiter_id)')
      .order('created_at', { ascending: false });

    if (selectedJob !== 'all') {
      query = query.eq('job_id', selectedJob);
    }

    const { data } = await query;
    // Filter to only this recruiter's job applications
    const myJobIds = new Set(jobs.map(j => j.id));
    const filtered = (data ?? []).filter(a => myJobIds.has(a.job_id));
    setApplications(filtered as AppWithDetails[]);
    setLoading(false);
  }

  async function updateStatus(appId: string, status: string) {
    setUpdating(appId);
    await supabase.from('applications').update({ status }).eq('id', appId);
    setApplications(prev =>
      prev.map(a => a.id === appId ? { ...a, status: status as Application['status'] } : a)
    );
    setUpdating(null);
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 mt-1">Review and manage candidates for your jobs</p>
      </div>

      {/* Job filter */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedJob('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedJob === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Jobs
          </button>
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors max-w-[200px] truncate ${
                selectedJob === job.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {job.title}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No applicants yet</p>
          <p className="text-gray-400 text-sm mt-1">Share your job postings to attract candidates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-700">
                        {(app.profiles?.name ?? 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{app.profiles?.name ?? 'Applicant'}</p>
                      <p className="text-sm text-gray-500">{(app.jobs as any)?.title ?? 'Unknown Job'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {app.match_percentage > 0 && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${app.match_percentage >= 70 ? 'bg-green-500' : app.match_percentage >= 40 ? 'bg-amber-500' : 'bg-gray-400'}`}
                              style={{ width: `${app.match_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{app.match_percentage}% match</span>
                        </div>
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{timeAgo(app.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColors[app.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>

                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      disabled={updating === app.id}
                      className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {updating === app.id ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
