import { Link } from 'react-router-dom';
import { Briefcase, Search, FileText, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Job Matching
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Find Your Dream Job <br />
            <span className="text-blue-400">with AI Assistance</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            JobPortal uses AI to extract skills from your resume and match you with the best opportunities. Smart hiring for modern teams.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {user ? (
              <Link
                to="/jobs"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                Browse Jobs <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need</h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          Built for both job seekers and recruiters. Simple, fast, and powered by AI.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Search,
              title: 'Browse & Apply',
              desc: 'Explore hundreds of open positions and apply with one click',
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: Sparkles,
              title: 'AI Skill Extraction',
              desc: 'Paste your resume and let AI automatically identify your skills',
              color: 'bg-green-50 text-green-600',
            },
            {
              icon: FileText,
              title: 'Smart Matching',
              desc: 'See your match percentage for every job based on your skills',
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: Users,
              title: 'Recruiter Tools',
              desc: 'Post jobs and manage applicants with status tracking',
              color: 'bg-rose-50 text-rose-600',
            },
          ].map(feature => (
            <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Join thousands of professionals finding their next role on JobPortal.</p>
          {!user && (
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/register?role=jobseeker"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                I'm a Job Seeker
              </Link>
              <Link
                to="/register?role=recruiter"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                I'm a Recruiter
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
