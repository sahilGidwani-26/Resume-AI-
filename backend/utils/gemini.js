const axios = require('axios');

const callAI = async (prompt) => {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ResumeAI',
      },
    }
  );

  let text = response.data.choices[0].message.content;
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};

// ─── ANALYZE RESUME ───────────────────────────────────────────────────────────
const analyzeResume = async (resumeText) => {
  const prompt = `
You are a STRICT and HONEST ATS resume analyzer. Analyze resumes critically and realistically.

STRICT SCORING RULES:
- Fresh graduate with 1-2 projects: score 30-50
- Junior developer with internship only: score 40-60
- Mid-level with 1-2 years experience: score 55-72
- Senior with 3+ years: score 73-88
- Only give 85+ if resume is truly exceptional with quantified achievements
- NEVER give same score twice, be precise (e.g., 43, 67, 71)

MANDATORY: Fill ALL fields. weaknesses min 3-5, improvements min 4-6, missingSkills min 4.

Resume:
${resumeText}

Return ONLY raw JSON:
{
  "atsScore": <realistic number>,
  "extractedSkills": ["skill1"],
  "missingSkills": ["missing1", "missing2", "missing3", "missing4"],
  "improvements": ["Improvement 1: detail", "Improvement 2: detail", "Improvement 3: detail", "Improvement 4: detail"],
  "strengths": ["genuine strength 1", "genuine strength 2"],
  "weaknesses": ["Weakness 1: issue", "Weakness 2: issue", "Weakness 3: issue"],
  "overallFeedback": "Honest 3-4 sentence feedback",
  "jobRecommendations": [
    { "title": "", "matchScore": 80, "description": "", "requiredSkills": [], "salaryRange": "X-Y LPA" }
  ]
}`;

  try {
    const result = await callAI(prompt);

    if (!result.weaknesses?.length) {
      result.weaknesses = [
        'No quantified achievements - add numbers and metrics',
        'Missing professional summary section',
        'Work experience bullets lack impact',
      ];
    }
    if (!result.improvements?.length) {
      result.improvements = [
        'Add a 3-4 line professional summary at top',
        'Quantify every achievement with numbers',
        'Add ATS keywords for your target role',
        'Use strong action verbs for bullet points',
      ];
    }
    if (!result.missingSkills?.length) {
      result.missingSkills = ['System Design', 'Docker/Kubernetes', 'CI/CD', 'Cloud (AWS/GCP)'];
    }

    return result;
  } catch (error) {
    console.error('analyzeResume error:', error.response?.data || error.message);
    throw new Error('AI analysis failed');
  }
};

// ─── GENERATE JOB DESCRIPTIONS ───────────────────────────────────────────────
const generateJobDescription = async (skills, experience, targetRole) => {
  const prompt = `
Suggest 8 suitable jobs for this candidate. matchScore must be realistic (60-95). salaryRange in Indian LPA.

Skills: ${skills.join(', ')}
Experience: ${experience}
Target Role: ${targetRole}

Return ONLY raw JSON:
{
  "jobs": [
    {
      "title": "",
      "matchScore": 75,
      "description": "Why this candidate fits",
      "requiredSkills": [],
      "salaryRange": "X-Y LPA",
      "companies": ["Company1", "Company2"],
      "growth": "Career growth description"
    }
  ]
}`;

  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generateJobDescription error:', error.response?.data || error.message);
    throw new Error('Job generation failed');
  }
};

// ─── GENERATE ROADMAP FROM FORM ───────────────────────────────────────────────
const generateRoadmapFromForm = async ({ role, skills, experience, timeline }) => {
  const prompt = `
You are a career advisor. Create a detailed learning roadmap.

Target Role: ${role}
Current Skills: ${skills}
Experience Level: ${experience}
Timeline: ${timeline} months

Return ONLY raw JSON:
{
  "overview": "2-3 sentence summary of the roadmap",
  "totalDuration": "${timeline} months",
  "phases": [
    {
      "title": "Phase title",
      "duration": "e.g. Month 1-2",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      "resources": ["Resource 1", "Resource 2", "Resource 3"]
    }
  ],
  "tips": ["Pro tip 1", "Pro tip 2", "Pro tip 3"]
}

Make ${Math.min(Math.ceil(parseInt(timeline) / 2), 5)} phases. Each phase must have 4-6 topics and 3 resources.`;

  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generateRoadmapFromForm error:', error.response?.data || error.message);
    throw new Error('Roadmap generation failed');
  }
};

// ─── GENERATE ROADMAP FROM RESUME ─────────────────────────────────────────────
const generateRoadmapFromResume = async (resumeText) => {
  const prompt = `
Analyze this resume and create a personalized learning roadmap to help this candidate reach their next career level.

Resume:
${resumeText}

Return ONLY raw JSON:
{
  "overview": "2-3 sentence personalized summary based on resume",
  "totalDuration": "X months",
  "phases": [
    {
      "title": "Phase title",
      "duration": "e.g. Month 1-2",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      "resources": ["Resource 1", "Resource 2", "Resource 3"]
    }
  ],
  "tips": ["Personalized tip 1", "Personalized tip 2", "Personalized tip 3"]
}

Create 3-5 phases based on skill gaps found in the resume.`;

  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generateRoadmapFromResume error:', error.response?.data || error.message);
    throw new Error('Roadmap generation failed');
  }
};

// ─── GENERATE INTERVIEW QUESTIONS FROM FORM ───────────────────────────────────
const generateInterviewFromForm = async ({ role, level, skills, company }) => {
  const prompt = `
You are an expert interview coach. Generate realistic interview questions.

Target Role: ${role}
Level: ${level}
Skills: ${skills}
${company ? `Target Company: ${company}` : ''}

Return ONLY raw JSON:
{
  "role": "${role}",
  "tip": "One key interview tip for this specific role",
  "questions": [
    {
      "question": "Interview question here",
      "category": "Technical|Behavioral|System Design|HR",
      "difficulty": "Easy|Medium|Hard",
      "hint": "How to approach this answer (2-3 sentences)",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Generate exactly 15 questions: 5 Technical, 4 Behavioral, 3 HR, 2 System Design, 1 role-specific.
Mix difficulties: 4 Easy, 7 Medium, 4 Hard.`;

  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generateInterviewFromForm error:', error.response?.data || error.message);
    throw new Error('Interview generation failed');
  }
};

// ─── GENERATE INTERVIEW QUESTIONS FROM RESUME ─────────────────────────────────
const generateInterviewFromResume = async (resumeText) => {
  const prompt = `
Analyze this resume and generate personalized interview questions based on the candidate's actual experience, projects, and skills.

Resume:
${resumeText}

Return ONLY raw JSON:
{
  "role": "Detected role from resume",
  "tip": "One personalized interview tip based on this resume",
  "questions": [
    {
      "question": "Personalized question referencing their actual experience",
      "category": "Technical|Behavioral|System Design|HR",
      "difficulty": "Easy|Medium|Hard",
      "hint": "How to approach this answer (2-3 sentences)",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Generate exactly 15 questions personalized to THIS specific resume.
Reference their actual projects, technologies, and experiences wherever possible.
Mix: 5 Technical, 4 Behavioral, 3 HR, 2 System Design, 1 project-specific.`;

  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generateInterviewFromResume error:', error.response?.data || error.message);
    throw new Error('Interview generation failed');
  }
};

module.exports = {
  analyzeResume,
  generateJobDescription,
  generateRoadmapFromForm,
  generateRoadmapFromResume,
  generateInterviewFromForm,
  generateInterviewFromResume,
};