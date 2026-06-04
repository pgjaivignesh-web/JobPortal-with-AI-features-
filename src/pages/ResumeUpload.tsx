import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Save, CheckCircle, Brain, X } from 'lucide-react';
import { supabase, type Resume } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ResumeUpload() {
  const { profile, user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('resumes')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setResume(data as Resume);
          setText(data.text);
        }
        setLoading(false);
      });
  }, [profile]);

  async function handleSave() {
    if (!profile || !text.trim()) return;
    setSaving(true);
    setError('');

    if (resume) {
      const { error } = await supabase
        .from('resumes')
        .update({ text: text.trim() })
        .eq('id', resume.id);
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert({ user_id: profile.id, text: text.trim(), extracted_skills: [] })
        .select()
        .single();
      if (error) setError(error.message);
      else setResume(data as Resume);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExtractSkills() {
    if (!text.trim() || !resume) return;
    setExtracting(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token ?? anonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/ai-features/extract-skills`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Apikey: anonKey,
        },
        body: JSON.stringify({ resumeText: text }),
      });

      if (!res.ok) throw new Error('Failed to extract skills');
      const { skills } = await res.json();

      await supabase
        .from('resumes')
        .update({ extracted_skills: skills })
        .eq('id', resume.id);

      setResume(prev => prev ? { ...prev, extracted_skills: skills } : prev);
    } catch (err) {
      setError('Could not extract skills. Try saving your resume first.');
    }
    setExtracting(false);
  }

  async function removeSkill(skill: string) {
    if (!resume) return;
    const updated = resume.extracted_skills.filter(s => s !== skill);
    await supabase.from('resumes').update({ extracted_skills: updated }).eq('id', resume.id);
    setResume(prev => prev ? { ...prev, extracted_skills: updated } : prev);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Resume</h1>
        <p className="text-gray-500 mt-1">Paste your resume text and let AI extract your skills</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Resume Text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={14}
          placeholder="Paste your full resume content here. Include your experience, education, skills, and projects..."
          className="w-full border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none font-mono"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Resume'}
          </button>
          <button
            onClick={handleExtractSkills}
            disabled={extracting || !resume || !text.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {extracting ? 'Extracting...' : 'AI Extract Skills'}
          </button>
        </div>
        {!resume && (
          <p className="text-xs text-gray-400 mt-2">Save your resume first before extracting skills</p>
        )}
      </div>

      {/* Extracted skills */}
      {resume && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Extracted Skills</h2>
            <span className="text-sm text-gray-400">({resume.extracted_skills.length} found)</span>
          </div>

          {resume.extracted_skills.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No skills extracted yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "AI Extract Skills" to analyze your resume</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {resume.extracted_skills.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium border border-blue-100">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-blue-900 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            These skills are used to calculate your match percentage when applying to jobs.
          </p>
        </div>
      )}
    </div>
  );
}
