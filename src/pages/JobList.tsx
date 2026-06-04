import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { supabase, type Job } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function JobList() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    if (profile?.role === 'jobseeker') {
      fetchApplied();
      fetchUserSkills();
    }
  }, [profile]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      )
    );
  }, [search, jobs]);

  async function fetchJobs() {
    const { data } = await supabase
      .from('jobs')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });
    setJobs(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
  }

  async function fetchApplied() {
    if (!profile) return;
    const { data } = await supabase
      .from('applications')
      .select('job_id')
      .eq('user_id', profile.id);
    setAppliedIds(new Set((data ?? []).map(a => a.job_id)));
  }

  async function fetchUserSkills() {
    if (!profile) return;
    const { data } = await supabase
      .from('resumes')
      .select('extracted_skills')
      .eq('user_id', profile.id)
      .maybeSingle();
    if (data?.extracted_skills) setUserSkills(data.extracted_skills);
  }

  function getMatchPct(jobSkills: string[]): number {
    if (!userSkills.length || !jobSkills.length) return 0;
    const resume = userSkills.map(s => s.toLowerCase());
    const matched = jobSkills.filter(s => resume.some(r => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r)));
    return Math.round((matched.length / jobSkills.length) * 100);
  }

  async function handleApply(job: Job) {
    if (!profile) return;
    setApplying(job.id);
    const matchPct = getMatchPct(job.skills);
    await supabase.from('applications').insert({
      user_id: profile.id,
      job_id: job.id,
      status: 'pending',
      match_percentage: matchPct,
    });
    setAppliedIds(prev => new Set([...prev, job.id]));
    setApplying(null);
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">{filtered.length} opportunities available</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, skill, or keyword..."
          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No jobs found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(job => {
            const matchPct = profile?.role === 'jobseeker' ? getMatchPct(job.skills) : 0;
            const isApplied = appliedIds.has(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h2>
                      {profile?.role === 'jobseeker' && matchPct > 0 && (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          matchPct >= 70 ? 'bg-green-100 text-green-700' :
                          matchPct >= 40 ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          {matchPct}% match
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {(job.profiles as any)?.name ?? 'Company'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Remote
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(job.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 6).map(skill => (
                        <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="text-xs text-gray-400 px-2 py-1">+{job.skills.length - 6} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {profile?.role === 'jobseeker' ? (
                      <button
                        onClick={() => handleApply(job)}
                        disabled={isApplied || applying === job.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isApplied
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
                        }`}
                      >
                        {applying === job.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isApplied ? 'Applied' : applying === job.id ? 'Applying...' : 'Apply now'}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/applicants?job=${job.id}`)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
