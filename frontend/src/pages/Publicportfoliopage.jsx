import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Link2, GitBranch, Globe,
  Briefcase, GraduationCap, Code2, Award, Loader2, AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getPortfolioBySlug } from '../utils/portfolio.service';

// Initials avatar
const Avatar = ({ name, size = 80 }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white font-black shadow-xl shadow-sky-500/20 shrink-0"
    >
      {initial}
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-10">
    <h2 className="flex items-center gap-2.5 text-base font-bold text-white mb-5 pb-3 border-b border-white/[0.07]">
      <Icon size={18} className="text-sky-400" />
      {title}
    </h2>
    {children}
  </div>
);

const Tag = ({ label }) => (
  <span className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded-lg text-xs font-medium">
    {label}
  </span>
);

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPortfolioBySlug(slug)
      .then(({ data }) => {
        if (data.success) setPortfolio(data.portfolio);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-sky-400" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center gap-4">
      <AlertCircle size={40} className="text-slate-600" />
      <p className="text-slate-400 font-medium">Portfolio not found or not published.</p>
    </div>
  );

  const p = portfolio;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#0d1424] to-[#080d1a] border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <Avatar name={p.name} size={96} />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-black text-white mb-1">{p.name}</h1>
              {p.title && <p className="text-sky-400 font-semibold text-lg mb-4">{p.title}</p>}
              {p.bio && <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{p.bio}</p>}

              {/* Contact links */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
                {p.email && (
                  <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors">
                    <Mail size={13} /> {p.email}
                  </a>
                )}
                {p.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Phone size={13} /> {p.phone}
                  </span>
                )}
                {p.location && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={13} /> {p.location}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                {p.linkedin && (
                  <a href={p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all">
                    <Link2 size={12} /> LinkedIn
                  </a>
                )}
                {p.github && (
                  <a href={p.github.startsWith('http') ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] text-slate-300 rounded-lg hover:bg-white/[0.1] transition-all">
                    <GitBranch size={12} /> GitHub
                  </a>
                )}
                {p.website && (
                  <a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all">
                    <Globe size={12} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Skills */}
        {p.skills?.length > 0 && (
          <Section title="Skills" icon={Code2}>
            <div className="flex flex-wrap gap-2">
              {p.skills.map((s, i) => <Tag key={i} label={s} />)}
            </div>
          </Section>
        )}

        {/* Experience */}
        {p.experience?.length > 0 && (
          <Section title="Work Experience" icon={Briefcase}>
            <div className="space-y-5">
              {p.experience.map((exp, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{exp.role}</h3>
                      <p className="text-sky-400 text-xs font-medium">{exp.company}</p>
                    </div>
                    {exp.duration && (
                      <span className="text-[10px] text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                        {exp.duration}
                      </span>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {p.projects?.length > 0 && (
          <Section title="Projects" icon={Code2}>
            <div className="grid sm:grid-cols-2 gap-4">
              {p.projects.map((proj, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-sky-500/20 transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{proj.name}</h3>
                    <div className="flex gap-1.5">
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="w-6 h-6 flex items-center justify-center bg-sky-500/10 text-sky-400 rounded-md hover:bg-sky-500/20 transition-all">
                          <ExternalLink size={11} />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="w-6 h-6 flex items-center justify-center bg-white/[0.05] text-slate-400 rounded-md hover:bg-white/[0.1] transition-all">
                          <GitBranch size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.description && <p className="text-xs text-slate-400 leading-relaxed flex-1">{proj.description}</p>}
                  {(Array.isArray(proj.techStack) ? proj.techStack : (proj.techStack || '').split(',')).filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(Array.isArray(proj.techStack) ? proj.techStack : proj.techStack.split(','))
                        .filter(Boolean)
                        .map((t, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md">
                            {t.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {p.education?.length > 0 && (
          <Section title="Education" icon={GraduationCap}>
            <div className="space-y-3">
              {p.education.map((edu, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{edu.degree}</h3>
                    <p className="text-sky-400 text-xs mt-0.5">{edu.institution}</p>
                  </div>
                  {edu.year && (
                    <span className="text-[10px] text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      {edu.year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {p.certifications?.length > 0 && (
          <Section title="Certifications" icon={Award}>
            <div className="flex flex-wrap gap-3">
              {p.certifications.map((cert, i) => (
                <div key={i} className="bg-white/[0.03] border border-yellow-500/15 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-yellow-300">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-slate-500 mt-0.5">{cert.issuer} {cert.year && `· ${cert.year}`}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-slate-700 border-t border-white/[0.04]">
        Built with <span className="text-sky-600">ResumeAI</span> · Portfolio generated by AI ✨
      </div>
    </div>
  );
}