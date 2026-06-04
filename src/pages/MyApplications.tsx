import { useEffect, useState } from 'react';
import { Loader2, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { supabase, type Application } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  reviewed: { label: 'Reviewed', icon: Eye, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function MyApplications() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('applications')
      .select('*, jobs(title, description, skills, profiles(name))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setApplications((data ?? []) as Application[]);
        setLoading(false);
      });
  }, [profile]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Browse jobs and start applying</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const job = app.jobs as any;
            const cfg = statusConfig[app.status];
            const StatusIcon = cfg.icon;

            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">{job?.title ?? 'Unknown Job'}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{job?.profiles?.name ?? 'Company'}</p>

                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job?.description}</p>

                    {job?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.slice(0, 5).map((skill: string) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>

                    {app.match_percentage > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Match score</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${app.match_percentage >= 70 ? 'bg-green-500' : app.match_percentage >= 40 ? 'bg-amber-500' : 'bg-gray-400'}`}
                              style={{ width: `${app.match_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{app.match_percentage}%</span>
                        </div>
                      </div>
                    )}

                    <span className="text-xs text-gray-400">{timeAgo(app.created_at)}</span>
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
