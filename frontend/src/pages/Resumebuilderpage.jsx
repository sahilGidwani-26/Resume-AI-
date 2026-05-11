import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';
import {
  User, Briefcase, GraduationCap, Zap, Rocket, Award,
  FolderOpen, Eye, EyeOff, Download, Save, Plus, Trash2,
  Lightbulb, CheckCircle2, X, FileText, Loader2,
  Inbox, ArrowRight, Layout
} from 'lucide-react';

const EMPTY_FORM = {
  title: 'My Resume',
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  template: 'modern',
};

const s = (v) => (typeof v === 'string' ? v : v?.name || v?.title || v?.text || String(v ?? ''));

// ─── Template metadata ────────────────────────────────
const TEMPLATES = [
  { id: 'modern',    label: 'Modern',    accent: '#0ea5e9', desc: 'Clean blue accent' },
  { id: 'executive', label: 'Executive', accent: '#1e293b', desc: 'Dark header, premium' },
  { id: 'creative',  label: 'Creative',  accent: '#7c3aed', desc: 'Bold purple two-column' },
  { id: 'minimal',   label: 'Minimal',   accent: '#374151', desc: 'Ultra-clean text-first' },
  { id: 'tech',      label: 'Tech',      accent: '#059669', desc: 'Green monospace style' },
  { id: 'classic',   label: 'Classic',   accent: '#b45309', desc: 'Traditional serif' },
  { id: 'navy',      label: 'Navy Pro',  accent: '#1d4ed8', desc: 'Navy blue professional' },
  { id: 'rose',      label: 'Rose',      accent: '#e11d48', desc: 'Bold rose two-column' },
  { id: 'dark',      label: 'Dark Mode', accent: '#a78bfa', desc: 'Dark background resume' },
];

// ════════════════════════════════════════════════════
// PRINT COLOR FIX — inject once
// ════════════════════════════════════════════════════
const PRINT_STYLE = `
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  }
`;

// ════════════════════════════════════════════════════
// TEMPLATE 1 — MODERN
// ════════════════════════════════════════════════════
const TemplateModern = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => (
    <h2 style={{ fontSize: '10px', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: '7px', borderBottom: '1.5px solid #e0f2fe', paddingBottom: '3px' }}>{title}</h2>
  );
  return (
    <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: '11px', lineHeight: '1.55', color: '#1e293b', background: '#fff', padding: '36px 40px', width: '794px' }}>
      <div style={{ borderBottom: '3px solid #0ea5e9', paddingBottom: '14px', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', color: '#64748b', fontSize: '10px' }}>
          {pi.email && <span>✉ {pi.email}</span>}{pi.phone && <span>📞 {pi.phone}</span>}{pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span>in {pi.linkedin}</span>}{pi.github && <span>gh {pi.github}</span>}{pi.website && <span>🌐 {pi.website}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '9px', color: '#475569', lineHeight: '1.6', fontSize: '10.5px' }}>{pi.summary}</p>}
      </div>
      {skills?.length > 0 && <div style={{ marginBottom: '15px' }}><H title="Skills" /><p style={{ color: '#374151' }}>{skills.map(s).join(' · ')}</p></div>}
      {experience?.length > 0 && <div style={{ marginBottom: '15px' }}><H title="Work Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600, color: '#0f172a', fontSize: '11.5px' }}>{s(e.role)}{e.company ? ` — ${s(e.company)}` : ''}</span><span style={{ color: '#64748b', fontSize: '10px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.description && <p style={{ color: '#475569', marginTop: '2px', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div>)}</div>}
      {education?.length > 0 && <div style={{ marginBottom: '15px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600, color: '#0f172a', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><span style={{ color: '#64748b', fontSize: '10px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.endDate}</span></div><p style={{ color: '#475569' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p></div>)}</div>}
      {projects?.length > 0 && <div style={{ marginBottom: '15px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600, color: '#0f172a', fontSize: '11.5px' }}>{s(p.name)}</span>{p.link && <span style={{ color: '#0ea5e9', fontSize: '10px' }}>{s(p.link)}</span>}</div>{p.techStack && <p style={{ color: '#64748b', fontSize: '10px' }}>{s(p.techStack)}</p>}{p.description && <p style={{ color: '#475569', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
      {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 600, color: '#0f172a' }}>{s(c.name)}</span><span style={{ color: '#64748b', fontSize: '10px' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 2 — EXECUTIVE
// ════════════════════════════════════════════════════
const TemplateExecutive = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>{title}</h2>;
  return (
    <div style={{ fontFamily: "'Georgia',serif", fontSize: '11px', lineHeight: '1.6', color: '#1a1a2e', background: '#fff', width: '794px' }}>
      <div style={{ background: '#1e293b', color: '#fff', padding: '32px 40px 24px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px', color: '#f8fafc' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', color: '#94a3b8', fontSize: '10px' }}>
          {pi.email && <span>{pi.email}</span>}{pi.phone && <span>{pi.phone}</span>}{pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}{pi.github && <span>{pi.github}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '12px', color: '#cbd5e1', lineHeight: '1.65', fontSize: '10.5px', maxWidth: '600px' }}>{pi.summary}</p>}
      </div>
      <div style={{ height: '4px', background: 'linear-gradient(90deg,#f59e0b,#d97706)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
      <div style={{ padding: '24px 40px' }}>
        {skills?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Core Competencies" /><p style={{ color: '#374151' }}>{skills.map(s).join('  ·  ')}</p></div>}
        {experience?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Professional Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '13px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontWeight: 700, color: '#1e293b', fontSize: '12px' }}>{s(e.role)}{e.company ? ` | ${s(e.company)}` : ''}</span><span style={{ color: '#6b7280', fontSize: '10px', fontStyle: 'italic' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.description && <p style={{ color: '#4b5563', marginTop: '4px', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div>)}</div>}
        {education?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '9px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#1e293b', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><span style={{ color: '#6b7280', fontSize: '10px', fontStyle: 'italic' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.endDate}</span></div><p style={{ color: '#4b5563' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p></div>)}</div>}
        {projects?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Notable Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '9px' }}><span style={{ fontWeight: 700, color: '#1e293b', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#6b7280', fontSize: '10px' }}> — {s(p.techStack)}</span>}{p.description && <p style={{ color: '#4b5563', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
        {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 600, color: '#1e293b' }}>{s(c.name)}</span><span style={{ color: '#6b7280', fontSize: '10px', fontStyle: 'italic' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 3 — CREATIVE (FIXED: sidebar color in PDF)
// ════════════════════════════════════════════════════
const TemplateCreative = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => (
    <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.3px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '18px', height: '2px', background: '#7c3aed', display: 'inline-block' }} />{title}
    </h2>
  );
  return (
    <div style={{ fontFamily: "'Trebuchet MS',Arial,sans-serif", fontSize: '11px', lineHeight: '1.55', color: '#1a1a2e', background: '#fff', width: '794px', display: 'flex' }}>
      {/* ── LEFT SIDEBAR — print color fix applied here ── */}
      <div style={{
        width: '210px', flexShrink: 0, padding: '30px 18px',
        background: '#4c1d95', color: '#fff',
        WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#7c3aed', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '26px', fontWeight: 700,
          marginBottom: '12px', color: '#fff',
          WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
        }}>
          {(pi.fullName || 'Y').charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: '#f5f3ff', lineHeight: '1.3' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '12px' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#c4b5fd', marginBottom: '7px' }}>Contact</p>
          {pi.email    && <p style={{ color: '#ddd6fe', fontSize: '9.5px', marginBottom: '4px', wordBreak: 'break-all' }}>{pi.email}</p>}
          {pi.phone    && <p style={{ color: '#ddd6fe', fontSize: '9.5px', marginBottom: '4px' }}>{pi.phone}</p>}
          {pi.location && <p style={{ color: '#ddd6fe', fontSize: '9.5px', marginBottom: '4px' }}>{pi.location}</p>}
          {pi.linkedin && <p style={{ color: '#ddd6fe', fontSize: '9.5px', marginBottom: '4px', wordBreak: 'break-all' }}>{pi.linkedin}</p>}
          {pi.github   && <p style={{ color: '#ddd6fe', fontSize: '9.5px', marginBottom: '4px' }}>{pi.github}</p>}
        </div>
        {skills?.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '12px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#c4b5fd', marginBottom: '7px' }}>Skills</p>
            {skills.map((sk, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '4px',
                padding: '3px 8px', marginBottom: '4px', color: '#ede9fe', fontSize: '9.5px',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
              }}>{s(sk)}</div>
            ))}
          </div>
        )}
      </div>
      {/* ── RIGHT CONTENT ── */}
      <div style={{ flex: 1, padding: '28px 26px' }}>
        {pi.summary && (
          <div style={{
            marginBottom: '18px', borderLeft: '3px solid #7c3aed',
            background: '#f5f3ff', padding: '10px 14px', borderRadius: '0 6px 6px 0',
            WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
          }}>
            <p style={{ color: '#4c1d95', fontSize: '10.5px', lineHeight: '1.65' }}>{pi.summary}</p>
          </div>
        )}
        {experience?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '11px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '11.5px' }}>{s(e.role)}</span><span style={{ color: '#7c3aed', fontSize: '9.5px', fontWeight: 600 }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.company && <p style={{ color: '#6d28d9', fontSize: '10px', marginBottom: '2px' }}>{s(e.company)}</p>}{e.description && <p style={{ color: '#4b5563', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div>)}</div>}
        {education?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><p style={{ color: '#6d28d9', fontSize: '10px' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p><p style={{ color: '#6b7280', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.endDate}</p></div>)}</div>}
        {projects?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#7c3aed', fontSize: '9.5px' }}> · {s(p.techStack)}</span>}{p.description && <p style={{ color: '#4b5563', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
        {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ fontWeight: 600, color: '#1e1b4b' }}>{s(c.name)}</span><span style={{ color: '#7c3aed', fontSize: '9.5px' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 4 — MINIMAL
// ════════════════════════════════════════════════════
const TemplateMinimal = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => <h2 style={{ fontSize: '9px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '10px' }}>{title}</h2>;
  return (
    <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: '11px', lineHeight: '1.65', color: '#111', background: '#fff', padding: '48px 52px', width: '794px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 300, margin: 0, color: '#111', letterSpacing: '2px', textTransform: 'uppercase' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', color: '#666', fontSize: '9.5px', letterSpacing: '0.5px' }}>
          {pi.email && <span>{pi.email}</span>}{pi.phone && <span>{pi.phone}</span>}{pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}{pi.github && <span>{pi.github}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '12px', color: '#444', fontSize: '10.5px', lineHeight: '1.7', maxWidth: '560px' }}>{pi.summary}</p>}
      </div>
      {skills?.length > 0 && <div style={{ marginBottom: '22px' }}><H title="Skills" /><p style={{ color: '#444' }}>{skills.map(s).join('   /   ')}</p></div>}
      {experience?.length > 0 && <div style={{ marginBottom: '22px' }}><H title="Experience" />{experience.map((e, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '13px' }}><p style={{ color: '#888', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' –' : ''}<br />{e.current ? 'Present' : e.endDate}</p><div><p style={{ fontWeight: 600, color: '#111', fontSize: '11.5px', margin: 0 }}>{s(e.role)}</p><p style={{ color: '#666', fontSize: '10px', margin: '1px 0 4px' }}>{s(e.company)}</p>{e.description && <p style={{ color: '#444', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div></div>)}</div>}
      {education?.length > 0 && <div style={{ marginBottom: '22px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}><p style={{ color: '#888', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' –' : ''}<br />{e.endDate}</p><div><p style={{ fontWeight: 600, color: '#111', fontSize: '11.5px', margin: 0 }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</p><p style={{ color: '#666', fontSize: '10px' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p></div></div>)}</div>}
      {projects?.length > 0 && <div style={{ marginBottom: '22px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '9px' }}><span style={{ fontWeight: 600, color: '#111', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#888', fontSize: '9.5px' }}> — {s(p.techStack)}</span>}{p.description && <p style={{ color: '#444', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
      {certifications?.length > 0 && <div style={{ marginBottom: '22px' }}><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ fontWeight: 600, color: '#111' }}>{s(c.name)}</span><span style={{ color: '#888', fontSize: '9.5px' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 5 — TECH
// ════════════════════════════════════════════════════
const TemplateTech = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => <h2 style={{ fontSize: '10px', fontWeight: 700, color: '#059669', marginBottom: '8px', fontFamily: "'Courier New',monospace" }}>{title}</h2>;
  return (
    <div style={{ fontFamily: "'Courier New',monospace", fontSize: '10.5px', lineHeight: '1.6', color: '#0f2510', background: '#fff', width: '794px' }}>
      <div style={{ background: '#f0fdf4', borderTop: '4px solid #059669', padding: '22px 36px 18px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#064e3b' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', color: '#059669', fontSize: '9.5px' }}>
          {pi.email && <span>@ {pi.email}</span>}{pi.phone && <span># {pi.phone}</span>}{pi.location && <span>~ {pi.location}</span>}
          {pi.linkedin && <span>/in {pi.linkedin}</span>}{pi.github && <span>gh/ {pi.github}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '10px', color: '#065f46', lineHeight: '1.65', fontSize: '10px' }}>{pi.summary}</p>}
      </div>
      <div style={{ padding: '18px 36px' }}>
        {skills?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="// tech_stack" /><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{skills.map((sk, i) => <span key={i} style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '4px', padding: '2px 8px', fontSize: '9.5px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{s(sk)}</span>)}</div></div>}
        {experience?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="// experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '11px', borderLeft: '2px solid #059669', paddingLeft: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#064e3b', fontSize: '11px' }}>{s(e.role)}</span><span style={{ color: '#059669', fontSize: '9px' }}>{e.startDate}{e.startDate ? ' → ' : ''}{e.current ? 'now' : e.endDate}</span></div>{e.company && <p style={{ color: '#047857', fontSize: '10px', margin: '1px 0 3px' }}>[{s(e.company)}]</p>}{e.description && <p style={{ color: '#374151', whiteSpace: 'pre-line', fontSize: '10px' }}>{s(e.description)}</p>}</div>)}</div>}
        {education?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="// education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '8px', borderLeft: '2px solid #059669', paddingLeft: '12px' }}><span style={{ fontWeight: 700, color: '#064e3b', fontSize: '11px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><p style={{ color: '#047857', fontSize: '10px' }}>{s(e.institution)}{e.gpa ? ` | GPA: ${e.gpa}` : ''} | {e.startDate}{e.startDate ? '–' : ''}{e.endDate}</p></div>)}</div>}
        {projects?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="// projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '9px', borderLeft: '2px solid #059669', paddingLeft: '12px' }}><span style={{ fontWeight: 700, color: '#064e3b', fontSize: '11px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#059669', fontSize: '9.5px' }}> [{s(p.techStack)}]</span>}{p.description && <p style={{ color: '#374151', marginTop: '2px', fontSize: '10px' }}>{s(p.description)}</p>}</div>)}</div>}
        {certifications?.length > 0 && <div><H title="// certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 600, color: '#064e3b' }}>{s(c.name)}</span><span style={{ color: '#059669', fontSize: '9.5px' }}>{s(c.issuer)}{c.date ? ` | ${c.date}` : ''}</span></div>)}</div>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 6 — CLASSIC
// ════════════════════════════════════════════════════
const TemplateClassic = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => <h2 style={{ fontSize: '12px', fontWeight: 700, color: '#1a1208', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', borderBottom: '1px solid #d97706', paddingBottom: '3px', fontVariant: 'small-caps' }}>{title}</h2>;
  return (
    <div style={{ fontFamily: "'Times New Roman',Times,serif", fontSize: '11.5px', lineHeight: '1.6', color: '#1a1208', background: '#fff', padding: '44px 52px', width: '794px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #92400e', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1a1208', letterSpacing: '1px', fontVariant: 'small-caps' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', marginTop: '6px', color: '#78350f', fontSize: '10px' }}>
          {pi.email && <span>{pi.email}</span>}{pi.phone && <span>{pi.phone}</span>}{pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}{pi.github && <span>{pi.github}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '10px', color: '#3d2000', fontSize: '10.5px', fontStyle: 'italic', lineHeight: '1.65' }}>{pi.summary}</p>}
      </div>
      {skills?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Skills & Expertise" /><p style={{ color: '#3d2000' }}>{skills.map(s).join('  ·  ')}</p></div>}
      {experience?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Professional Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '13px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontWeight: 700, color: '#1a1208', fontSize: '12px', fontVariant: 'small-caps' }}>{s(e.role)}{e.company ? `, ${s(e.company)}` : ''}</span><span style={{ color: '#92400e', fontSize: '10px', fontStyle: 'italic' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.description && <p style={{ color: '#3d2000', marginTop: '4px', whiteSpace: 'pre-line', textAlign: 'justify' }}>{s(e.description)}</p>}</div>)}</div>}
      {education?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '9px', display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 700, color: '#1a1208', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><p style={{ color: '#3d2000' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p></div><span style={{ color: '#92400e', fontSize: '10px', fontStyle: 'italic', flexShrink: 0 }}>{e.startDate}{e.startDate ? '–' : ''}{e.endDate}</span></div>)}</div>}
      {projects?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '9px' }}><span style={{ fontWeight: 700, color: '#1a1208', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#92400e', fontSize: '10px', fontStyle: 'italic' }}> — {s(p.techStack)}</span>}{p.description && <p style={{ color: '#3d2000', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
      {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 600, color: '#1a1208' }}>{s(c.name)}</span><span style={{ color: '#92400e', fontSize: '10px', fontStyle: 'italic' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 7 — NAVY PRO (NEW)
// ════════════════════════════════════════════════════
const TemplateNavy = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => (
    <h2 style={{ fontSize: '10px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '2px solid #1d4ed8' }}>{title}</h2>
  );
  return (
    <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: '11px', lineHeight: '1.6', color: '#0f172a', background: '#fff', width: '794px' }}>
      {/* Header */}
      <div style={{ background: '#1e3a8a', padding: '28px 36px 20px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', color: '#bfdbfe', fontSize: '10px' }}>
          {pi.email && <span>✉ {pi.email}</span>}
          {pi.phone && <span>📞 {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span>🔗 {pi.linkedin}</span>}
          {pi.github && <span>💻 {pi.github}</span>}
        </div>
      </div>
      {/* Accent bar */}
      <div style={{ height: '5px', background: '#fbbf24', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
      <div style={{ padding: '22px 36px' }}>
        {pi.summary && <div style={{ marginBottom: '16px', background: '#eff6ff', borderRadius: '6px', padding: '10px 14px', borderLeft: '4px solid #1d4ed8', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}><p style={{ color: '#1e3a8a', fontSize: '10.5px', lineHeight: '1.65' }}>{pi.summary}</p></div>}
        {skills?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <H title="Skills" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.map((sk, i) => (
                <span key={i} style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 9px', fontSize: '9.5px', fontWeight: 600, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{s(sk)}</span>
              ))}
            </div>
          </div>
        )}
        {experience?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '11px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '11.5px' }}>{s(e.role)}{e.company ? ` — ${s(e.company)}` : ''}</span><span style={{ color: '#6b7280', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.description && <p style={{ color: '#374151', marginTop: '3px', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div>)}</div>}
        {education?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><p style={{ color: '#475569', fontSize: '10px' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p></div><span style={{ color: '#6b7280', fontSize: '9.5px', flexShrink: 0 }}>{e.startDate}{e.startDate ? '–' : ''}{e.endDate}</span></div>)}</div>}
        {projects?.length > 0 && <div style={{ marginBottom: '16px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#3b82f6', fontSize: '9.5px' }}> · {s(p.techStack)}</span>}{p.description && <p style={{ color: '#374151', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
        {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 600, color: '#1e3a8a' }}>{s(c.name)}</span><span style={{ color: '#6b7280', fontSize: '9.5px' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 8 — ROSE (NEW) — two-column like Creative
// ════════════════════════════════════════════════════
const TemplateRose = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => (
    <h2 style={{ fontSize: '10px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '16px', height: '2px', background: '#e11d48', display: 'inline-block' }} />{title}
    </h2>
  );
  return (
    <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: '11px', lineHeight: '1.55', color: '#1a0a0f', background: '#fff', width: '794px', display: 'flex' }}>
      {/* LEFT sidebar */}
      <div style={{ width: '200px', flexShrink: 0, background: '#881337', color: '#fff', padding: '28px 16px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          {(pi.fullName || 'Y').charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: '14px', fontWeight: 700, color: '#ffe4e6', lineHeight: '1.3', margin: '0 0 4px' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
          <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#fda4af', marginBottom: '8px' }}>Contact</p>
          {pi.email    && <p style={{ color: '#fecdd3', fontSize: '9px', marginBottom: '5px', wordBreak: 'break-all' }}>{pi.email}</p>}
          {pi.phone    && <p style={{ color: '#fecdd3', fontSize: '9px', marginBottom: '5px' }}>{pi.phone}</p>}
          {pi.location && <p style={{ color: '#fecdd3', fontSize: '9px', marginBottom: '5px' }}>{pi.location}</p>}
          {pi.linkedin && <p style={{ color: '#fecdd3', fontSize: '9px', marginBottom: '5px', wordBreak: 'break-all' }}>{pi.linkedin}</p>}
          {pi.github   && <p style={{ color: '#fecdd3', fontSize: '9px', marginBottom: '5px' }}>{pi.github}</p>}
        </div>
        {skills?.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#fda4af', marginBottom: '8px' }}>Skills</p>
            {skills.map((sk, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '4px', padding: '3px 8px', marginBottom: '4px', color: '#ffe4e6', fontSize: '9px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{s(sk)}</div>
            ))}
          </div>
        )}
      </div>
      {/* RIGHT content */}
      <div style={{ flex: 1, padding: '26px 24px' }}>
        {pi.summary && <div style={{ marginBottom: '16px', background: '#fff1f2', borderLeft: '3px solid #e11d48', padding: '10px 12px', borderRadius: '0 6px 6px 0', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}><p style={{ color: '#881337', fontSize: '10.5px', lineHeight: '1.65' }}>{pi.summary}</p></div>}
        {experience?.length > 0 && <div style={{ marginBottom: '14px' }}><H title="Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#881337', fontSize: '11.5px' }}>{s(e.role)}</span><span style={{ color: '#e11d48', fontSize: '9.5px', fontWeight: 600 }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.company && <p style={{ color: '#be123c', fontSize: '10px', marginBottom: '2px' }}>{s(e.company)}</p>}{e.description && <p style={{ color: '#4b5563', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div>)}</div>}
        {education?.length > 0 && <div style={{ marginBottom: '14px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#881337', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><p style={{ color: '#be123c', fontSize: '10px' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p><p style={{ color: '#6b7280', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.endDate}</p></div>)}</div>}
        {projects?.length > 0 && <div style={{ marginBottom: '14px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#881337', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#e11d48', fontSize: '9.5px' }}> · {s(p.techStack)}</span>}{p.description && <p style={{ color: '#4b5563', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
        {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ fontWeight: 600, color: '#881337' }}>{s(c.name)}</span><span style={{ color: '#e11d48', fontSize: '9.5px' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TEMPLATE 9 — DARK MODE (NEW)
// ════════════════════════════════════════════════════
const TemplateDark = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  const H = ({ title }) => (
    <h2 style={{ fontSize: '9.5px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #374151' }}>{title}</h2>
  );
  return (
    <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: '11px', lineHeight: '1.6', color: '#e5e7eb', background: '#111827', padding: '36px 40px', width: '794px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <div style={{ marginBottom: '22px', paddingBottom: '16px', borderBottom: '2px solid #7c3aed' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#f9fafb', letterSpacing: '0.5px' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', color: '#9ca3af', fontSize: '10px' }}>
          {pi.email    && <span style={{ color: '#a78bfa' }}>✉ {pi.email}</span>}
          {pi.phone    && <span>📞 {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span style={{ color: '#a78bfa' }}>🔗 {pi.linkedin}</span>}
          {pi.github   && <span>💻 {pi.github}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '10px', color: '#d1d5db', fontSize: '10.5px', lineHeight: '1.65' }}>{pi.summary}</p>}
      </div>
      {skills?.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <H title="Skills" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map((sk, i) => (
              <span key={i} style={{ background: '#1e1b4b', color: '#c4b5fd', border: '1px solid #4c1d95', borderRadius: '4px', padding: '2px 9px', fontSize: '9.5px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{s(sk)}</span>
            ))}
          </div>
        </div>
      )}
      {experience?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Experience" />{experience.map((e, i) => <div key={i} style={{ marginBottom: '11px', borderLeft: '2px solid #7c3aed', paddingLeft: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '11.5px' }}>{s(e.role)}{e.company ? ` — ${s(e.company)}` : ''}</span><span style={{ color: '#a78bfa', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span></div>{e.description && <p style={{ color: '#9ca3af', marginTop: '3px', whiteSpace: 'pre-line' }}>{s(e.description)}</p>}</div>)}</div>}
      {education?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Education" />{education.map((e, i) => <div key={i} style={{ marginBottom: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '11.5px' }}>{s(e.degree)}{e.field ? ` in ${s(e.field)}` : ''}</span><span style={{ color: '#a78bfa', fontSize: '9.5px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.endDate}</span></div><p style={{ color: '#9ca3af', fontSize: '10px' }}>{s(e.institution)}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p></div>)}</div>}
      {projects?.length > 0 && <div style={{ marginBottom: '18px' }}><H title="Projects" />{projects.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><span style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '11.5px' }}>{s(p.name)}</span>{p.techStack && <span style={{ color: '#a78bfa', fontSize: '9.5px' }}> · {s(p.techStack)}</span>}{p.description && <p style={{ color: '#9ca3af', marginTop: '2px' }}>{s(p.description)}</p>}</div>)}</div>}
      {certifications?.length > 0 && <div><H title="Certifications" />{certifications.map((c, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontWeight: 600, color: '#f3f4f6' }}>{s(c.name)}</span><span style={{ color: '#a78bfa', fontSize: '9.5px' }}>{s(c.issuer)}{c.date ? ` · ${c.date}` : ''}</span></div>)}</div>}
    </div>
  );
};

// ─── Template Router ──────────────────────────────────
const ResumePreview = ({ data }) => {
  const props = { data };
  const inner = (() => {
    switch (data.template) {
      case 'executive': return <TemplateExecutive {...props} />;
      case 'creative':  return <TemplateCreative  {...props} />;
      case 'minimal':   return <TemplateMinimal   {...props} />;
      case 'tech':      return <TemplateTech       {...props} />;
      case 'classic':   return <TemplateClassic    {...props} />;
      case 'navy':      return <TemplateNavy       {...props} />;
      case 'rose':      return <TemplateRose       {...props} />;
      case 'dark':      return <TemplateDark       {...props} />;
      default:          return <TemplateModern     {...props} />;
    }
  })();
  return <div id="resume-preview">{inner}</div>;
};

// ─── Template Picker Modal with LIVE PREVIEW ─────────
const DEMO_DATA = {
  personalInfo: { fullName: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', location: 'Mumbai, India', linkedin: 'linkedin.com/in/rahul', github: 'github.com/rahul', summary: 'Full-stack developer with 3+ years of experience building scalable web applications.' },
  experience: [{ role: 'Software Engineer', company: 'Google', startDate: 'Jan 2022', endDate: '', current: true, description: '• Led development of core features\n• Improved performance by 40%' }],
  education: [{ degree: 'B.Tech', field: 'Computer Science', institution: 'IIT Bombay', startDate: '2018', endDate: '2022', gpa: '8.9' }],
  skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
  projects: [{ name: 'E-Commerce App', techStack: 'MERN, Redis', description: 'Built a full-stack platform serving 10k+ users.' }],
  certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', date: 'Mar 2023' }],
};

const TemplatePicker = ({ current, onSelect, onClose, formData }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const previewData = { ...DEMO_DATA, template: hoveredId || current };
  // Use actual form data if it has a name, else use demo
  const liveData = formData?.personalInfo?.fullName
    ? { ...formData, template: hoveredId || current }
    : previewData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh' }}>
        {/* Left: template list */}
        <div className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col">
          <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Choose Template</h2>
            <p className="text-slate-400 text-xs mt-0.5">Hover to preview · {TEMPLATES.length} templates</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => { onSelect(t.id); onClose(); }}
                onMouseEnter={() => setHoveredId(t.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  current === t.id
                    ? 'bg-sky-500/15 border border-sky-500/30'
                    : hoveredId === t.id
                    ? 'bg-white/8 border border-white/15'
                    : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.accent }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{t.label}</p>
                  <p className="text-slate-500 text-xs truncate">{t.desc}</p>
                </div>
                {current === t.id && <CheckCircle2 size={14} className="text-sky-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-white/10">
            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white py-2 transition-colors">
              <X size={14} /> Close
            </button>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex-1 overflow-auto bg-slate-800/50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Eye size={14} />
              Live Preview —
              <span className="text-white font-medium">
                {TEMPLATES.find(t => t.id === (hoveredId || current))?.label}
              </span>
              {hoveredId && hoveredId !== current && (
                <span className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 ml-1">
                  Click to apply
                </span>
              )}
            </p>
          </div>
          {/* Scaled preview */}
          <div style={{ transform: 'scale(0.62)', transformOrigin: 'top left', width: '794px', pointerEvents: 'none' }}>
            <div style={{ background: '#fff', boxShadow: '0 4px 40px rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
              <ResumePreview data={liveData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reusable Components ──────────────────────────────
const InputGroup = ({ label, value, onChange, placeholder, type = 'text', rows }) => (
  <div>
    <label className="block text-xs text-slate-500 mb-1">{label}</label>
    {rows
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="input-field resize-none text-sm" />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-field text-sm" />
    }
  </div>
);

const FormSection = ({ title, children, onAdd, addLabel }) => (
  <div className="card mb-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {onAdd && <button onClick={onAdd} className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-lg hover:bg-sky-500/10 transition-all"><Plus size={13} /> {addLabel}</button>}
    </div>
    {children}
  </div>
);

const SavedResumesDrawer = ({ isOpen, onClose, savedList, onLoad, onDelete, currentId }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-sm bg-slate-900 border-l border-white/10 h-full flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div><h2 className="text-lg font-semibold text-white">Saved Resumes</h2><p className="text-xs text-slate-500 mt-0.5">{savedList.length} resume{savedList.length !== 1 ? 's' : ''} saved</p></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedList.length === 0 ? (
            <div className="text-center py-16 text-slate-600"><Inbox size={40} className="mx-auto mb-3 opacity-40" /><p className="text-sm font-medium">No saved resumes yet</p></div>
          ) : savedList.map(r => (
            <div key={r._id} onClick={() => { onLoad(r); onClose(); }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${currentId === r._id ? 'border-sky-500/50 bg-sky-500/10' : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white font-medium text-sm truncate">{r.title || 'Untitled Resume'}</p>
                    {currentId === r._id && <span className="text-xs text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/20 flex-shrink-0">Active</span>}
                  </div>
                  {r.personalInfo?.fullName && <p className="text-slate-400 text-xs">{r.personalInfo.fullName}</p>}
                  <p className="text-slate-600 text-xs mt-1">Saved {new Date(r.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {r.experience?.length > 0 && <span className="text-xs text-slate-600 flex items-center gap-1"><Briefcase size={10} /> {r.experience.length} exp</span>}
                    {r.skills?.length > 0 && <span className="text-xs text-slate-600 flex items-center gap-1"><Zap size={10} /> {r.skills.length} skills</span>}
                    {r.projects?.length > 0 && <span className="text-xs text-slate-600 flex items-center gap-1"><Rocket size={10} /> {r.projects.length} proj</span>}
                    {r.template && <span className="text-xs text-violet-400 flex items-center gap-1"><Layout size={10} /> {TEMPLATES.find(t => t.id === r.template)?.label || r.template}</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onDelete(r._id); }} className="text-slate-600 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { onLoad(null); onClose(); }} className="w-full btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"><Plus size={14} /> Create New Resume</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────
export default function ResumeBuilderPage() {
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [savedId, setSavedId]             = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [skillInput, setSkillInput]       = useState('');
  const [preview, setPreview]             = useState(false);
  const [savedList, setSavedList]         = useState([]);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [downloading, setDownloading]     = useState(false);
  const [loadingList, setLoadingList]     = useState(true);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // Inject print CSS once
  useEffect(() => {
    const existing = document.getElementById('resume-print-style');
    if (!existing) {
      const style = document.createElement('style');
      style.id = 'resume-print-style';
      style.innerHTML = PRINT_STYLE;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userAPI.getAllBuiltResumes();
        const list = data.resumes || [];
        setSavedList(list);
        if (list.length > 0) { loadIntoForm(list[0]); setSavedId(list[0]._id); }
      } catch { }
      finally { setLoadingList(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIntoForm = r => setForm({ title: r.title || 'My Resume', personalInfo: r.personalInfo || EMPTY_FORM.personalInfo, experience: r.experience || [], education: r.education || [], skills: r.skills || [], projects: r.projects || [], certifications: r.certifications || [], template: r.template || 'modern' });

  const updatePI = (f, v) => setForm(p => ({ ...p, personalInfo: { ...p.personalInfo, [f]: v } }));
  const addExp   = ()        => setForm(p => ({ ...p, experience: [...p.experience, { company: '', role: '', startDate: '', endDate: '', current: false, description: '' }] }));
  const setExp   = (i, f, v) => setForm(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const delExp   = i         => setForm(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  const addEdu   = ()        => setForm(p => ({ ...p, education: [...p.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }] }));
  const setEdu   = (i, f, v) => setForm(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const delEdu   = i         => setForm(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));
  const addSkill = ()        => { if (!skillInput.trim()) return; setForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] })); setSkillInput(''); };
  const delSkill = i         => setForm(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));
  const addProj  = ()        => setForm(p => ({ ...p, projects: [...p.projects, { name: '', description: '', techStack: '', link: '' }] }));
  const setProj  = (i, f, v) => setForm(p => ({ ...p, projects: p.projects.map((x, idx) => idx === i ? { ...x, [f]: v } : x) }));
  const delProj  = i         => setForm(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));
  const addCert  = ()        => setForm(p => ({ ...p, certifications: [...(p.certifications || []), { name: '', issuer: '', date: '', link: '' }] }));
  const setCert  = (i, f, v) => setForm(p => ({ ...p, certifications: (p.certifications || []).map((c, idx) => idx === i ? { ...c, [f]: v } : c) }));
  const delCert  = i         => setForm(p => ({ ...p, certifications: (p.certifications || []).filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.personalInfo.fullName && !form.personalInfo.email) { toast.error('Please add at least your name or email first'); return; }
    setSaving(true);
    try {
      const payload = savedId ? { id: savedId, ...form } : form;
      const { data } = await userAPI.saveResumeBuilder(payload);
      setSavedId(data.resume._id);
      const listRes = await userAPI.getAllBuiltResumes();
      setSavedList(listRes.data.resumes || []);
      toast.success('Resume saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleLoad = resume => {
    if (!resume) { setForm(EMPTY_FORM); setSavedId(null); setActiveSection('personal'); setPreview(false); toast('New blank resume ready', { icon: '📄' }); return; }
    loadIntoForm(resume); setSavedId(resume._id); setPreview(false);
    toast.success(`Loaded: "${resume.title || 'My Resume'}"`, { icon: '📂' });
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    setSavedList(prev => prev.filter(r => r._id !== id));
    if (savedId === id) { setForm(EMPTY_FORM); setSavedId(null); }
    toast.success('Resume deleted');
  };

  const handleDownloadPDF = () => {
    const el = document.getElementById('resume-preview');
    if (!el) { toast.error('Preview element not found. Please refresh.'); return; }
    setDownloading(true);
    const name = form.personalInfo?.fullName || 'Resume';
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) { toast.error('Popup blocked! Please allow popups for this site.'); setDownloading(false); return; }
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${name} - Resume</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; }
    @page { size: A4; margin: 0; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      body { background: white; }
      .topbar { display: none !important; }
      .resume-wrap { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; width: 794px !important; }
    }
    .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 99; background: #0f172a; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .topbar p { color: #94a3b8; font-size: 13px; }
    .save-btn { background: linear-gradient(135deg,#0ea5e9,#8b5cf6); color: white; border: none; border-radius: 8px; padding: 9px 22px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .save-btn:hover { opacity: 0.9; }
    .resume-wrap { margin: 72px auto 32px; width: 794px; background: white; box-shadow: 0 4px 40px rgba(0,0,0,0.15); border-radius: 4px; overflow: hidden; }
  </style>
</head>
<body>
  <div class="topbar">
    <p>📄 ${name} — Resume</p>
    <button class="save-btn" onclick="window.print()">⬇️ Save as PDF (Ctrl+P)</button>
  </div>
  <div class="resume-wrap">${el.outerHTML}</div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setDownloading(false);
    toast.success('New tab opened! Click "Save as PDF" or press Ctrl+P', { duration: 6000 });
  };

  const currentTemplate = TEMPLATES.find(t => t.id === form.template) || TEMPLATES[0];

  const sections = [
    { id: 'personal',       label: 'Personal',       Icon: User,          badge: 0 },
    { id: 'experience',     label: 'Experience',     Icon: Briefcase,     badge: form.experience.length },
    { id: 'education',      label: 'Education',      Icon: GraduationCap, badge: form.education.length },
    { id: 'skills',         label: 'Skills',         Icon: Zap,           badge: form.skills.length },
    { id: 'projects',       label: 'Projects',       Icon: Rocket,        badge: form.projects.length },
    { id: 'certifications', label: 'Certifications', Icon: Award,         badge: (form.certifications || []).length },
  ];

  if (loadingList) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={36} className="text-sky-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your saved resumes...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 py-8">

      {templatePickerOpen && (
        <TemplatePicker
          current={form.template}
          formData={form}
          onSelect={id => { setForm(p => ({ ...p, template: id })); toast.success(`Template: ${TEMPLATES.find(t => t.id === id)?.label}`); }}
          onClose={() => setTemplatePickerOpen(false)}
        />
      )}

      <SavedResumesDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} savedList={savedList} onLoad={handleLoad} onDelete={handleDelete} currentId={savedId} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume <span className="gradient-text">Builder</span></h1>
          <p className="text-slate-400 text-sm mt-1">Build a professional ATS-friendly resume</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setTemplatePickerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:glass-light border border-violet-500/30 text-sm font-medium text-violet-300 hover:text-violet-200 transition-all">
            <Layout size={15} />
            <span className="hidden sm:inline">{currentTemplate.label}</span>
            <div className="w-3 h-3 rounded-full" style={{ background: currentTemplate.accent }} />
          </button>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:glass-light border border-white/10 text-sm font-medium text-slate-300 hover:text-white transition-all">
            <FolderOpen size={15} />
            <span className="hidden sm:inline">My Resumes</span>
            {savedList.length > 0 && <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">{savedList.length}</span>}
          </button>
          <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 btn-secondary text-sm px-4 py-2.5">
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{preview ? 'Back to Edit' : 'Preview'}</span>
          </button>
          <button onClick={handleDownloadPDF} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-all disabled:opacity-50">
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span className="hidden sm:inline">{downloading ? 'Opening...' : 'Download PDF'}</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60">
            {saving ? <><Loader2 size={14} className="animate-spin" /><span>Saving...</span></> : <><Save size={14} /><span>Save</span></>}
          </button>
        </div>
      </div>

      {/* Title + Status */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="bg-transparent text-slate-300 border-b border-slate-700 hover:border-slate-500 focus:border-sky-500 outline-none px-1 py-1 text-sm transition-colors w-44" placeholder="Resume title..." />
        {savedId
          ? <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Saved to account</span>
          : <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Not saved yet</span>
        }
      </div>

      {/* Preview */}
      <div style={{ display: preview ? 'block' : 'none' }}>
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-slate-400 text-sm flex items-center gap-2"><FileText size={14} /> A4 Preview — <span className="text-violet-400">{currentTemplate.label}</span> template</p>
          <div className="flex gap-2">
            <button onClick={() => setTemplatePickerOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-violet-300 border border-violet-500/30 hover:bg-violet-500/10 transition-all">
              <Layout size={14} /> Change Template
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-500 hover:bg-green-400 text-white transition-all">
              <Download size={15} /> Download as PDF
            </button>
          </div>
        </div>
        {/* FIX: width sirf 794px, no extra stretch */}
        <div className="overflow-x-auto">
          <div style={{ width: '794px', background: '#fff', boxShadow: '0 4px 40px rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
            <ResumePreview data={form} />
          </div>
        </div>
      </div>

      {/* Editor */}
      {!preview && (
        <div className="grid lg:grid-cols-[220px,1fr] gap-6">
          <div className="space-y-1">
            {sections.map(({ id, label, Icon, badge }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${activeSection === id ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="flex items-center gap-2"><Icon size={15} /> {label}</span>
                {badge > 0 && <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center">{badge}</span>}
              </button>
            ))}
            <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <p className="text-xs text-violet-400 font-medium mb-2 flex items-center gap-1.5"><Layout size={12} /> Template</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: currentTemplate.accent }} />
                  <span className="text-xs text-slate-300 font-medium">{currentTemplate.label}</span>
                </div>
                <button onClick={() => setTemplatePickerOpen(true)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors underline">Change</button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 leading-relaxed flex gap-1.5">
                <Lightbulb size={12} className="text-yellow-400 mt-0.5 shrink-0" />
                <span>Fill → <span className="text-sky-400">Preview</span> → <span className="text-green-400">Download PDF</span></span>
              </p>
            </div>
          </div>

          <div>
            {activeSection === 'personal' && (
              <FormSection title="Personal Information">
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputGroup label="Full Name *"       value={form.personalInfo.fullName}  onChange={v => updatePI('fullName', v)}  placeholder="Rahul Sharma" />
                  <InputGroup label="Email *"           value={form.personalInfo.email}     onChange={v => updatePI('email', v)}     placeholder="rahul@example.com" type="email" />
                  <InputGroup label="Phone"             value={form.personalInfo.phone}     onChange={v => updatePI('phone', v)}     placeholder="+91 9876543210" />
                  <InputGroup label="Location"          value={form.personalInfo.location}  onChange={v => updatePI('location', v)}  placeholder="Mumbai, India" />
                  <InputGroup label="LinkedIn URL"      value={form.personalInfo.linkedin}  onChange={v => updatePI('linkedin', v)}  placeholder="linkedin.com/in/yourname" />
                  <InputGroup label="GitHub URL"        value={form.personalInfo.github}    onChange={v => updatePI('github', v)}    placeholder="github.com/yourname" />
                  <InputGroup label="Portfolio Website" value={form.personalInfo.website}   onChange={v => updatePI('website', v)}   placeholder="https://yourportfolio.dev" />
                  <div />
                  <div className="sm:col-span-2">
                    <InputGroup label="Professional Summary" value={form.personalInfo.summary} onChange={v => updatePI('summary', v)}
                      placeholder="Results-driven engineer with 3+ years of full-stack experience..." rows={4} />
                  </div>
                </div>
              </FormSection>
            )}

            {activeSection === 'experience' && (
              <FormSection title="Work Experience" onAdd={addExp} addLabel="Add Experience">
                {form.experience.length === 0 && <div className="text-center py-12 text-slate-600"><Briefcase size={44} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No experience added yet</p><p className="text-xs mt-1">Click "+ Add Experience" above</p></div>}
                <div className="space-y-4">
                  {form.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience #{i + 1}</span>
                        <button onClick={() => delExp(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all"><Trash2 size={11} /> Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Company"    value={exp.company}   onChange={v => setExp(i, 'company', v)}   placeholder="Google" />
                        <InputGroup label="Job Title"  value={exp.role}      onChange={v => setExp(i, 'role', v)}      placeholder="Software Engineer" />
                        <InputGroup label="Start Date" value={exp.startDate} onChange={v => setExp(i, 'startDate', v)} placeholder="Jan 2022" />
                        <div>
                          <InputGroup label="End Date" value={exp.current ? '' : exp.endDate} onChange={v => setExp(i, 'endDate', v)} placeholder="Dec 2023" />
                          <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer select-none">
                            <input type="checkbox" checked={exp.current} onChange={e => setExp(i, 'current', e.target.checked)} className="accent-sky-500 w-3.5 h-3.5" /> Currently working here
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <InputGroup label="Responsibilities & Achievements" value={exp.description} onChange={v => setExp(i, 'description', v)} placeholder="• Led development of microservices serving 1M+ users" rows={4} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>
            )}

            {activeSection === 'education' && (
              <FormSection title="Education" onAdd={addEdu} addLabel="Add Education">
                {form.education.length === 0 && <div className="text-center py-12 text-slate-600"><GraduationCap size={44} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No education added yet</p></div>}
                <div className="space-y-4">
                  {form.education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Education #{i + 1}</span>
                        <button onClick={() => delEdu(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all"><Trash2 size={11} /> Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Institution"    value={edu.institution} onChange={v => setEdu(i, 'institution', v)} placeholder="IIT Bombay" />
                        <InputGroup label="Degree"         value={edu.degree}      onChange={v => setEdu(i, 'degree', v)}      placeholder="B.Tech / MCA / BCA" />
                        <InputGroup label="Field of Study" value={edu.field}       onChange={v => setEdu(i, 'field', v)}       placeholder="Computer Science" />
                        <InputGroup label="GPA / %"        value={edu.gpa}         onChange={v => setEdu(i, 'gpa', v)}         placeholder="8.5/10 or 85%" />
                        <InputGroup label="Start Year"     value={edu.startDate}   onChange={v => setEdu(i, 'startDate', v)}   placeholder="2019" />
                        <InputGroup label="End Year"       value={edu.endDate}     onChange={v => setEdu(i, 'endDate', v)}     placeholder="2023" />
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>
            )}

            {activeSection === 'skills' && (
              <FormSection title="Skills">
                <p className="text-xs text-slate-500 mb-4">Add technical and soft skills. Press Enter or click Add.</p>
                <div className="flex gap-2 mb-5">
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, Node.js, Python, SQL..." className="input-field flex-1 text-sm" />
                  <button onClick={addSkill} className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap flex items-center gap-1.5"><Plus size={13} /> Add</button>
                </div>
                {form.skills.length === 0
                  ? <div className="text-center py-10 text-slate-600 border-2 border-dashed border-slate-700 rounded-xl"><Zap size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No skills yet — type above and press Enter!</p></div>
                  : <><p className="text-xs text-slate-500 mb-3">{form.skills.length} skill{form.skills.length !== 1 ? 's' : ''}</p>
                    <div className="flex flex-wrap gap-2">
                      {form.skills.map((skill, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-400 text-sm rounded-lg border border-sky-500/20">
                          {s(skill)}<button onClick={() => delSkill(i)} className="text-sky-600 hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
                        </span>
                      ))}
                    </div></>
                }
              </FormSection>
            )}

            {activeSection === 'projects' && (
              <FormSection title="Projects" onAdd={addProj} addLabel="Add Project">
                {form.projects.length === 0 && <div className="text-center py-12 text-slate-600"><Rocket size={44} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No projects added yet</p></div>}
                <div className="space-y-4">
                  {form.projects.map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project #{i + 1}</span>
                        <button onClick={() => delProj(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all"><Trash2 size={11} /> Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Project Name"      value={proj.name}      onChange={v => setProj(i, 'name', v)}      placeholder="E-Commerce Platform" />
                        <InputGroup label="Tech Stack"        value={proj.techStack} onChange={v => setProj(i, 'techStack', v)} placeholder="React, Node.js, MongoDB" />
                        <InputGroup label="GitHub / Live URL" value={proj.link}      onChange={v => setProj(i, 'link', v)}      placeholder="https://github.com/you/project" />
                        <div />
                        <div className="sm:col-span-2">
                          <InputGroup label="Description" value={proj.description} onChange={v => setProj(i, 'description', v)} placeholder="Built a full-stack platform with Razorpay integration..." rows={3} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>
            )}

            {activeSection === 'certifications' && (
              <FormSection title="Certifications" onAdd={addCert} addLabel="Add Certification">
                {(!form.certifications || form.certifications.length === 0) && <div className="text-center py-12 text-slate-600"><Award size={44} className="mx-auto mb-3 opacity-30" /><p className="font-medium">No certifications added yet</p></div>}
                <div className="space-y-4">
                  {(form.certifications || []).map((cert, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certification #{i + 1}</span>
                        <button onClick={() => delCert(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all"><Trash2 size={11} /> Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Certification Name"   value={cert.name}   onChange={v => setCert(i, 'name', v)}   placeholder="AWS Solutions Architect" />
                        <InputGroup label="Issuing Organization" value={cert.issuer} onChange={v => setCert(i, 'issuer', v)} placeholder="Amazon Web Services" />
                        <InputGroup label="Date Earned"          value={cert.date}   onChange={v => setCert(i, 'date', v)}   placeholder="March 2024" />
                        <InputGroup label="Verify URL"           value={cert.link}   onChange={v => setCert(i, 'link', v)}   placeholder="https://verify.credly.com/..." />
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>
            )}

            <div className="mt-6 flex items-center justify-between p-4 rounded-xl glass border border-white/5 gap-4">
              <p className="text-slate-500 text-sm hidden sm:flex items-center gap-2">
                {savedId ? <><CheckCircle2 size={14} className="text-green-400" /> Progress saved</> : <><Lightbulb size={14} className="text-yellow-400" /> Save to access from any device</>}
              </p>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setTemplatePickerOpen(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 text-violet-300 border-violet-500/20"><Layout size={14} /> Template</button>
                <button onClick={() => setPreview(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"><Eye size={14} /> Preview <ArrowRight size={13} /></button>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60 flex items-center gap-2">
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Resume</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden preview for PDF */}
      {!preview && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden', pointerEvents: 'none', width: '794px' }}>
          <ResumePreview data={form} />
        </div>
      )}
    </div>
  );
}