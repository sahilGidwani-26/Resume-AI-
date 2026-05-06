import { Link } from 'react-router-dom';

const features = [
  { icon: '⚡', title: 'Instant ATS Score', desc: 'Get your resume scored out of 100 by our AI, optimized for modern Applicant Tracking Systems.' },
  { icon: '🎯', title: 'Missing Skills Detection', desc: 'Discover exactly which skills are holding you back from landing your dream role.' },
  { icon: '✨', title: 'AI Improvements', desc: 'Receive actionable, specific suggestions to transform your resume from good to exceptional.' },
  { icon: '💼', title: 'Job Matching', desc: 'Get personalized job recommendations based on your unique skill set and experience.' },
  { icon: '🏗️', title: 'Resume Builder', desc: 'Build a professional, ATS-friendly resume from scratch with our guided builder.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your resume performance and skill gaps with an intuitive dashboard.' },
];

const stats = [
  { value: '10K+', label: 'Resumes Analyzed' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: '3x', label: 'More Interviews' },
  { value: '48hr', label: 'Avg. Time to Hire' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-sky-500 -top-48 -left-48" />
        <div className="orb w-96 h-96 bg-violet-600 -bottom-48 -right-48" />
        <div className="orb w-64 h-64 bg-pink-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Public Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white font-bold">R</div>
          <span className="text-xl font-bold text-white">Resume<span className="gradient-text-blue">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-sky-500/20 mb-8 text-sm text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          Powered by Google Gemini AI
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
          Land Your Dream Job<br />
          <span className="gradient-text">10x Faster</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: '0.1s' }}>
          Upload your resume and get instant AI-powered analysis — ATS score, missing skills,
          improvement suggestions, and personalized job matches.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/signup" className="btn-primary px-8 py-4 text-base">
            Analyze My Resume — Free ↗
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-4 text-base">
            Sign In →
          </Link>
        </div>

        {/* Floating mock score card */}
        <div className="mt-20 relative max-w-xl mx-auto">
          <div className="card glow-blue">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">ATS Score</p>
                <p className="text-5xl font-bold gradient-text-blue">87<span className="text-2xl text-slate-500">/100</span></p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-sky-500/30 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Keyword Optimization</span>
                <span className="text-sky-400 font-medium">92%</span>
              </div>
              <div className="ats-score-bar">
                <div className="h-full w-[92%] bg-gradient-to-r from-sky-500 to-violet-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Skills Match</span>
                <span className="text-violet-400 font-medium">78%</span>
              </div>
              <div className="ats-score-bar">
                <div className="h-full w-[78%] bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['React', 'Node.js', 'TypeScript', 'AWS'].map(s => (
                <span key={s} className="px-2 py-1 bg-sky-500/15 text-sky-400 text-xs rounded-md border border-sky-500/20">{s}</span>
              ))}
              <span className="px-2 py-1 bg-red-500/15 text-red-400 text-xs rounded-md border border-red-500/20">+ Docker missing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger">
          {stats.map((stat) => (
            <div key={stat.label} className="card text-center">
              <p className="text-4xl font-bold gradient-text-blue mb-1">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to<br /><span className="gradient-text">Get Hired Faster</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">Our AI analyzes your resume against thousands of job postings to give you the most actionable insights.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {features.map((f) => (
            <div key={f.title} className="card-hover group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:gradient-text-blue transition-all">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="card glow-purple">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Land More Interviews?</h2>
          <p className="text-slate-400 mb-8">Join thousands of job seekers who've transformed their careers with ResumeAI.</p>
          <Link to="/signup" className="btn-primary inline-block px-10 py-4 text-lg">
            Start for Free — No Credit Card Required
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-slate-600 text-sm">
        <p>© 2025 ResumeAI — Built with ❤️ using MERN + Gemini AI</p>
      </footer>
    </div>
  );
}