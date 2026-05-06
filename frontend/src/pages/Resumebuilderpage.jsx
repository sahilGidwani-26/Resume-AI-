import { useState, useRef } from 'react';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

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

const Section = ({ title, children, onAdd, addLabel }) => (
  <div className="card mb-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {onAdd && (
        <button onClick={onAdd} className="text-sm text-sky-400 hover:text-sky-300 border border-sky-500/30 px-3 py-1 rounded-lg hover:bg-sky-500/10 transition-all">
          + {addLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = 'text', rows }) => (
  <div>
    <label className="block text-xs text-slate-500 mb-1">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-field resize-none text-sm"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field text-sm"
      />
    )}
  </div>
);

// Simple Resume Preview Component
const ResumePreview = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  return (
    <div className="bg-white text-slate-900 p-8 rounded-xl text-sm font-body min-h-[600px]" style={{ fontFamily: 'system-ui' }}>
      {/* Header */}
      <div className="border-b-2 border-sky-600 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{pi.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
          {pi.email && <span>✉ {pi.email}</span>}
          {pi.phone && <span>📞 {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span>LinkedIn: {pi.linkedin}</span>}
          {pi.github && <span>GitHub: {pi.github}</span>}
        </div>
        {pi.summary && <p className="mt-3 text-xs text-slate-700 leading-relaxed">{pi.summary}</p>}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-2">Skills</h2>
          <p className="text-xs text-slate-700">{skills.join(' · ')}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-2">Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold text-xs">{exp.role} — {exp.company}</span>
                <span className="text-xs text-slate-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-2">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold text-xs">{edu.degree} in {edu.field}</span>
                <span className="text-xs text-slate-500">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="text-xs text-slate-600">{edu.institution} {edu.gpa && `· GPA: ${edu.gpa}`}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-2">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold text-xs">{p.name}</span>
              {p.techStack && <span className="text-xs text-slate-500"> · {p.techStack}</span>}
              {p.description && <p className="text-xs text-slate-600 mt-0.5">{p.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ResumeBuilderPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [skillInput, setSkillInput] = useState('');
  const [preview, setPreview] = useState(false);

  const updatePI = (field, value) => setForm(f => ({ ...f, personalInfo: { ...f.personalInfo, [field]: value } }));
  
  const addExperience = () => setForm(f => ({
    ...f,
    experience: [...f.experience, { company: '', role: '', startDate: '', endDate: '', current: false, description: '' }]
  }));

  const updateExp = (i, field, value) => setForm(f => ({
    ...f,
    experience: f.experience.map((e, idx) => idx === i ? { ...e, [field]: value } : e)
  }));

  const removeExp = (i) => setForm(f => ({ ...f, experience: f.experience.filter((_, idx) => idx !== i) }));

  const addEducation = () => setForm(f => ({
    ...f,
    education: [...f.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]
  }));

  const updateEdu = (i, field, value) => setForm(f => ({
    ...f,
    education: f.education.map((e, idx) => idx === i ? { ...e, [field]: value } : e)
  }));

  const removeEdu = (i) => setForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
    setSkillInput('');
  };

  const removeSkill = (i) => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const addProject = () => setForm(f => ({
    ...f,
    projects: [...f.projects, { name: '', description: '', techStack: '', link: '' }]
  }));

  const updateProject = (i, field, value) => setForm(f => ({
    ...f,
    projects: f.projects.map((p, idx) => idx === i ? { ...p, [field]: value } : p)
  }));

  const removeProject = (i) => setForm(f => ({ ...f, projects: f.projects.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = savedId ? { id: savedId, ...form } : form;
      const { data } = await userAPI.saveResumeBuilder(payload);
      setSavedId(data.resume._id);
      toast.success('Resume saved! ✨');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: '👤 Personal' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'education', label: '🎓 Education' },
    { id: 'skills', label: '⚡ Skills' },
    { id: 'projects', label: '🚀 Projects' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume <span className="gradient-text">Builder</span></h1>
          <p className="text-slate-400 text-sm mt-1">Build a professional ATS-friendly resume</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="btn-secondary text-sm px-4 py-2.5"
          >
            {preview ? '← Editor' : '👁 Preview'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2.5 disabled:opacity-60">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : '💾 Save'}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="max-w-3xl mx-auto">
          <ResumePreview data={form} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[260px,1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === s.id ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div>
            {activeSection === 'personal' && (
              <Section title="Personal Information">
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputGroup label="Full Name" value={form.personalInfo.fullName} onChange={v => updatePI('fullName', v)} placeholder="John Doe" />
                  <InputGroup label="Email" value={form.personalInfo.email} onChange={v => updatePI('email', v)} placeholder="john@example.com" type="email" />
                  <InputGroup label="Phone" value={form.personalInfo.phone} onChange={v => updatePI('phone', v)} placeholder="+91 9876543210" />
                  <InputGroup label="Location" value={form.personalInfo.location} onChange={v => updatePI('location', v)} placeholder="Mumbai, India" />
                  <InputGroup label="LinkedIn" value={form.personalInfo.linkedin} onChange={v => updatePI('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                  <InputGroup label="GitHub" value={form.personalInfo.github} onChange={v => updatePI('github', v)} placeholder="github.com/johndoe" />
                  <div className="sm:col-span-2">
                    <InputGroup label="Professional Summary" value={form.personalInfo.summary} onChange={v => updatePI('summary', v)} placeholder="A brief 2-3 sentence summary of your professional background..." rows={3} />
                  </div>
                </div>
              </Section>
            )}

            {activeSection === 'experience' && (
              <Section title="Work Experience" onAdd={addExperience} addLabel="Add Experience">
                {form.experience.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No experience added yet. Click "Add Experience" to start.</p>}
                <div className="space-y-4">
                  {form.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5">
                      <div className="flex justify-end mb-3">
                        <button onClick={() => removeExp(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Company" value={exp.company} onChange={v => updateExp(i, 'company', v)} placeholder="Google" />
                        <InputGroup label="Job Title" value={exp.role} onChange={v => updateExp(i, 'role', v)} placeholder="Software Engineer" />
                        <InputGroup label="Start Date" value={exp.startDate} onChange={v => updateExp(i, 'startDate', v)} placeholder="Jan 2022" />
                        <InputGroup label="End Date" value={exp.current ? 'Present' : exp.endDate} onChange={v => updateExp(i, 'endDate', v)} placeholder="Dec 2023" />
                        <div className="sm:col-span-2">
                          <InputGroup label="Description" value={exp.description} onChange={v => updateExp(i, 'description', v)} placeholder="• Led development of..." rows={3} />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-sm text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={exp.current} onChange={e => updateExp(i, 'current', e.target.checked)} className="accent-sky-500" />
                        Currently working here
                      </label>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {activeSection === 'education' && (
              <Section title="Education" onAdd={addEducation} addLabel="Add Education">
                {form.education.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No education added yet.</p>}
                <div className="space-y-4">
                  {form.education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5">
                      <div className="flex justify-end mb-3">
                        <button onClick={() => removeEdu(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Institution" value={edu.institution} onChange={v => updateEdu(i, 'institution', v)} placeholder="IIT Bombay" />
                        <InputGroup label="Degree" value={edu.degree} onChange={v => updateEdu(i, 'degree', v)} placeholder="B.Tech" />
                        <InputGroup label="Field of Study" value={edu.field} onChange={v => updateEdu(i, 'field', v)} placeholder="Computer Science" />
                        <InputGroup label="GPA" value={edu.gpa} onChange={v => updateEdu(i, 'gpa', v)} placeholder="8.5/10" />
                        <InputGroup label="Start Year" value={edu.startDate} onChange={v => updateEdu(i, 'startDate', v)} placeholder="2019" />
                        <InputGroup label="End Year" value={edu.endDate} onChange={v => updateEdu(i, 'endDate', v)} placeholder="2023" />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {activeSection === 'skills' && (
              <Section title="Skills">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Type a skill and press Enter"
                    className="input-field flex-1 text-sm"
                  />
                  <button onClick={addSkill} className="btn-primary px-4 py-2 text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 text-sky-400 text-sm rounded-lg border border-sky-500/20">
                      {skill}
                      <button onClick={() => removeSkill(i)} className="text-sky-600 hover:text-red-400 transition-colors ml-1">×</button>
                    </span>
                  ))}
                  {form.skills.length === 0 && <p className="text-slate-600 text-sm">No skills added yet. Type above to add!</p>}
                </div>
              </Section>
            )}

            {activeSection === 'projects' && (
              <Section title="Projects" onAdd={addProject} addLabel="Add Project">
                {form.projects.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No projects added yet.</p>}
                <div className="space-y-4">
                  {form.projects.map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5">
                      <div className="flex justify-end mb-3">
                        <button onClick={() => removeProject(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Project Name" value={proj.name} onChange={v => updateProject(i, 'name', v)} placeholder="E-Commerce Platform" />
                        <InputGroup label="Tech Stack" value={proj.techStack} onChange={v => updateProject(i, 'techStack', v)} placeholder="React, Node.js, MongoDB" />
                        <InputGroup label="Live Link" value={proj.link} onChange={v => updateProject(i, 'link', v)} placeholder="https://project.com" />
                        <div className="sm:col-span-2">
                          <InputGroup label="Description" value={proj.description} onChange={v => updateProject(i, 'description', v)} placeholder="Built a full-stack e-commerce platform..." rows={2} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}