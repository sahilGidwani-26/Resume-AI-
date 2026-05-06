import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../utils/api';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, label: 'Upload PDF', icon: '↑' },
  { id: 2, label: 'AI Processing', icon: '⚡' },
  { id: 3, label: 'View Results', icon: '✓' },
];

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only PDF files up to 5MB are accepted');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF file');
    setUploading(true);
    setCurrentStep(2);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 15;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await resumeAPI.upload(formData);
      clearInterval(interval);
      setProgress(100);
      setCurrentStep(3);
      toast.success('Resume analyzed successfully! 🎯');
      setTimeout(() => navigate(`/analysis/${data.resume._id}`), 800);
    } catch (err) {
      clearInterval(interval);
      setUploading(false);
      setCurrentStep(1);
      setProgress(0);
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Upload Your <span className="gradient-text">Resume</span>
        </h1>
        <p className="text-slate-400 text-lg">Get instant AI analysis, ATS score, and personalized job matches</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-sky-400' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > step.id ? 'bg-sky-500 text-white' :
                currentStep === step.id ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' :
                'bg-slate-800 text-slate-600'
              }`}>
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <span className="text-sm font-medium hidden sm:block">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-px transition-all ${currentStep > step.id ? 'bg-sky-500' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Upload Zone */}
      {!uploading ? (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
                : file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-slate-700 hover:border-slate-500 hover:bg-white/2'
            }`}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="animate-fade-in">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-white font-semibold text-lg mb-1">{file.name}</p>
                <p className="text-slate-500 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <div className="text-6xl mb-4">{isDragActive ? '🎯' : '☁️'}</div>
                <p className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                </p>
                <p className="text-slate-500 mb-4">or click to browse files</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-400 text-sm border border-white/10">
                  <span>📋</span> PDF only · Max 5MB
                </div>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="card border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">💡 For Best Results</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              {[
                'Use a text-based PDF (not scanned image)',
                'Include your skills, experience, and education clearly',
                'Use standard section headings (Experience, Education, Skills)',
                'Keep your resume to 1-2 pages for best ATS performance',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">→</span> {tip}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file}
            className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {file ? '⚡ Analyze with AI →' : 'Select a PDF to continue'}
          </button>
        </div>
      ) : (
        /* Loading State */
        <div className="card text-center py-16">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">AI is Analyzing...</h2>
          <p className="text-slate-400 mb-8">
            {progress < 30 ? 'Extracting text from PDF...' :
             progress < 60 ? 'Running ATS analysis...' :
             progress < 85 ? 'Detecting skills and gaps...' :
             'Generating job recommendations...'}
          </p>

          <div className="w-full max-w-xs mx-auto">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Processing</span>
              <span>{Math.min(Math.round(progress), 100)}%</span>
            </div>
            <div className="ats-score-bar">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-slate-600 text-xs mt-6">This usually takes 15-30 seconds</p>
        </div>
      )}
    </div>
  );
}