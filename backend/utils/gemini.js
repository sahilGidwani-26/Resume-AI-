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
    if (!result.weaknesses?.length) result.weaknesses = ['No quantified achievements', 'Missing professional summary', 'Weak experience bullets'];
    if (!result.improvements?.length) result.improvements = ['Add professional summary', 'Quantify achievements', 'Add ATS keywords', 'Use action verbs'];
    if (!result.missingSkills?.length) result.missingSkills = ['System Design', 'Docker', 'CI/CD', 'Cloud'];
    return result;
  } catch (error) {
    console.error('analyzeResume error:', error.response?.data || error.message);
    throw new Error('AI analysis failed');
  }
};

// ─── GENERATE JOB DESCRIPTIONS ───────────────────────────────────────────────
const generateJobDescription = async (skills, experience, targetRole) => {
  const prompt = `
Suggest 8 suitable jobs. matchScore realistic (60-95). salaryRange in Indian LPA.
Skills: ${skills.join(', ')}
Experience: ${experience}
Target Role: ${targetRole}

Return ONLY raw JSON:
{
  "jobs": [
    { "title": "", "matchScore": 75, "description": "", "requiredSkills": [], "salaryRange": "X-Y LPA", "companies": [], "growth": "" }
  ]
}`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Job generation failed'); }
};

// ─── ROADMAP FROM FORM ────────────────────────────────────────────────────────
const generateRoadmapFromForm = async ({ role, skills, experience, timeline }) => {
  const prompt = `
Create a detailed learning roadmap.
Target Role: ${role}, Skills: ${skills}, Level: ${experience}, Timeline: ${timeline} months

Return ONLY raw JSON:
{
  "overview": "2-3 sentence summary",
  "totalDuration": "${timeline} months",
  "phases": [{ "title": "", "duration": "", "topics": [], "resources": [] }],
  "tips": []
}
Make ${Math.min(Math.ceil(parseInt(timeline) / 2), 5)} phases with 4-6 topics each.`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Roadmap generation failed'); }
};

// ─── ROADMAP FROM RESUME ──────────────────────────────────────────────────────
const generateRoadmapFromResume = async (resumeText) => {
  const prompt = `
Analyze resume and create personalized learning roadmap for next career level.
Resume: ${resumeText}

Return ONLY raw JSON:
{
  "overview": "2-3 sentence personalized summary",
  "totalDuration": "X months",
  "phases": [{ "title": "", "duration": "", "topics": [], "resources": [] }],
  "tips": []
}
Create 3-5 phases based on skill gaps.`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Roadmap generation failed'); }
};

// ─── INTERVIEW QUESTIONS FROM FORM ────────────────────────────────────────────
const generateInterviewFromForm = async ({ role, level, skills, company }) => {
  const prompt = `
Generate realistic interview questions.
Role: ${role}, Level: ${level}, Skills: ${skills}${company ? `, Company: ${company}` : ''}

Return ONLY raw JSON:
{
  "role": "${role}",
  "tip": "One key tip",
  "questions": [{ "question": "", "category": "Technical|Behavioral|System Design|HR", "difficulty": "Easy|Medium|Hard", "hint": "", "keywords": [] }]
}
Generate 15 questions: 5 Technical, 4 Behavioral, 3 HR, 2 System Design, 1 role-specific.`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Interview generation failed'); }
};

// ─── INTERVIEW QUESTIONS FROM RESUME ─────────────────────────────────────────
const generateInterviewFromResume = async (resumeText) => {
  const prompt = `
Generate personalized interview questions from this resume.
Resume: ${resumeText}

Return ONLY raw JSON:
{
  "role": "Detected role",
  "tip": "Personalized tip",
  "questions": [{ "question": "", "category": "Technical|Behavioral|System Design|HR", "difficulty": "Easy|Medium|Hard", "hint": "", "keywords": [] }]
}
Generate 15 personalized questions referencing actual projects and experience.`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Interview generation failed'); }
};

// ─── MOCK INTERVIEW QUESTIONS FROM FORM ──────────────────────────────────────
const generateMockInterviewQuestions = async ({ role, level, skills, company }) => {
  const prompt = `
You are a senior interviewer. Generate 10 mock interview questions for a real interview simulation.
Role: ${role}, Level: ${level}, Skills: ${skills}${company ? `, Company: ${company}` : ''}

Questions should feel like a REAL conversational interview, not generic.

Return ONLY raw JSON:
{
  "questions": [
    {
      "question": "The actual interview question",
      "category": "Technical|Behavioral|HR|System Design",
      "difficulty": "Easy|Medium|Hard",
      "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
    }
  ]
}

Exactly 10 questions: 4 Technical, 3 Behavioral, 2 HR, 1 System Design.`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Mock interview generation failed'); }
};

// ─── MOCK INTERVIEW QUESTIONS FROM RESUME ────────────────────────────────────
const generateMockInterviewFromResume = async (resumeText) => {
  const prompt = `
Analyze this resume and generate 10 realistic mock interview questions tailored to this candidate.
Reference their actual projects, companies, and technologies.

Resume: ${resumeText}

Return ONLY raw JSON:
{
  "role": "Detected target role",
  "questions": [
    {
      "question": "Specific question referencing their experience",
      "category": "Technical|Behavioral|HR|System Design",
      "difficulty": "Easy|Medium|Hard",
      "expectedKeyPoints": ["key point 1", "key point 2"]
    }
  ]
}

Exactly 10 questions: 4 Technical, 3 Behavioral, 2 HR, 1 System Design.`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Mock interview generation failed'); }
};

// ─── EVALUATE ANSWER ──────────────────────────────────────────────────────────
const evaluateAnswer = async ({ question, answer, role, level }) => {
  const prompt = `
Evaluate this interview answer strictly and fairly.
Role: ${role}, Level: ${level}
Question: ${question}
Candidate Answer: ${answer}

SCORING:
- Empty/very short: 10-25
- Vague without examples: 30-50
- Decent with some structure: 51-70
- Good with examples/STAR: 71-85
- Excellent comprehensive: 86-100

Return ONLY raw JSON:
{
  "score": <0-100>,
  "good": "What candidate did well (2-3 specific sentences)",
  "improve": "What needs improvement (2-3 actionable sentences)",
  "ideal": "What ideal answer would include (2-3 sentences with key points)"
}`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Evaluation failed'); }
};

// ─── FINAL INTERVIEW REPORT ───────────────────────────────────────────────────
const generateFinalReport = async ({ questions, answers, feedbacks, role, level }) => {
  const qaSummary = questions.map((q, i) =>
    `Q${i + 1}: ${q}\nAnswer: ${answers[i] || 'No answer'}\nScore: ${feedbacks[i]?.score || 0}/100`
  ).join('\n\n');

  const prompt = `
Provide comprehensive final interview assessment.
Role: ${role}, Level: ${level}

Interview Summary:
${qaSummary}

Return ONLY raw JSON:
{
  "summary": "3-4 sentence honest overall assessment",
  "strengths": ["Specific strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Specific area to improve 1", "Area 2", "Area 3"],
  "tips": ["Actionable tip for next interview 1", "Tip 2", "Tip 3"]
}`;
  try { return await callAI(prompt); }
  catch (error) { throw new Error('Final report generation failed'); }
};

module.exports = {
  analyzeResume,
  generateJobDescription,
  generateRoadmapFromForm,
  generateRoadmapFromResume,
  generateInterviewFromForm,
  generateInterviewFromResume,
  generateMockInterviewQuestions,
  generateMockInterviewFromResume,
  evaluateAnswer,
  generateFinalReport,
};