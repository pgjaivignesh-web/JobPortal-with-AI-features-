import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const isRecruiter = profile?.role === 'recruiter';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            JobPortal
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/jobs" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Browse Jobs
                </Link>
                {isRecruiter ? (
                  <>
                    <Link to="/post-job" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                      Post Job
                    </Link>
                    <Link to="/applicants" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                      Applicants
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-applications" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                      My Applications
                    </Link>
                    <Link to="/resume" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                      My Resume
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 font-medium">{profile?.name || 'User'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isRecruiter ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isRecruiter ? 'Recruiter' : 'Job Seeker'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
            {user ? (
              <>
                <Link to="/jobs" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Browse Jobs</Link>
                {isRecruiter ? (
                  <>
                    <Link to="/post-job" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Post Job</Link>
                    <Link to="/applicants" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Applicants</Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-applications" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">My Applications</Link>
                    <Link to="/resume" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">My Resume</Link>
                  </>
                )}
                <button onClick={handleSignOut} className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Get started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
