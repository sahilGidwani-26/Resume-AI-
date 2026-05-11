const https = require('https');

// ─── Groq API Call (100% Free) ────────────────────────────────────────────────
const callAI = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GROQ_API_KEY not set in .env — Get free key from https://console.groq.com/keys');
  }

  const data = JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
    temperature: 0.7
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return reject(new Error(`Groq Error: ${parsed.error.message}`));
          }
        if (parsed.choices?.[0]?.message?.content) {
  let text = parsed.choices[0].message.content;

  text = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found");
    }

    return resolve(JSON.parse(jsonMatch[0]));
  } catch {
              return reject(new Error('JSON parse failed: ' + text.substring(0, 100)));
            }
          }
          return reject(new Error('No content in Groq response'));
        } catch (e) {
          return reject(new Error('Response parse failed: ' + body.substring(0, 100)));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Groq request timeout')); });
    req.write(data);
    req.end();
  });
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

Return ONLY raw JSON (no markdown, no backticks):
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
    console.error('analyzeResume error:', error.message);
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

Return ONLY raw JSON (no markdown, no backticks):
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

Return ONLY raw JSON (no markdown, no backticks):
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

Return ONLY raw JSON (no markdown, no backticks):
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

Return ONLY raw JSON (no markdown, no backticks):
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

Return ONLY raw JSON (no markdown, no backticks):
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
const generateMockInterviewQuestions = async ({ role, level, skills, company, questionCount = 5 }) => {
  const count = Math.min(Math.max(parseInt(questionCount) || 5, 5), 15);

  // Calculate split: ~30% Easy, ~40% Medium, ~30% Hard
  const easyCount  = Math.round(count * 0.3);
  const hardCount  = Math.round(count * 0.3);
  const mediumCount = count - easyCount - hardCount;

  const prompt = `
You are a senior interviewer. Generate EXACTLY ${count} mock interview questions for a real interview simulation.
Role: ${role}, Level: ${level || 'Junior'}, Skills: ${skills}${company ? `, Company: ${company}` : ''}

STRICT RULES:
- Return EXACTLY ${count} questions in the array — not 9, not 11, exactly ${count}.
- Difficulty distribution: ${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard.
- Mix categories: Technical, Behavioral, HR, System Design.

Return ONLY raw JSON (no markdown, no backticks):
{
  "questions": [
    {
      "question": "The actual interview question",
      "category": "Technical|Behavioral|HR|System Design",
      "difficulty": "Easy|Medium|Hard",
      "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
    }
  ]
}`;

  try { return await callAI(prompt); }
  catch (error) { throw new Error('Mock interview generation failed'); }
};

// ─── MOCK INTERVIEW QUESTIONS FROM RESUME ────────────────────────────────────

const generateMockInterviewFromResume = async (resumeText, questionCount = 5) => {
  const count = Math.min(Math.max(parseInt(questionCount) || 5, 5), 15);

  const easyCount   = Math.round(count * 0.3);
  const hardCount   = Math.round(count * 0.3);
  const mediumCount = count - easyCount - hardCount;

  const prompt = `
Analyze this resume and generate EXACTLY ${count} realistic mock interview questions tailored to this candidate.
Resume: ${resumeText}

STRICT RULES:
- Return EXACTLY ${count} questions in the array — not 9, not 11, exactly ${count}.
- Difficulty distribution: ${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard.
- Base questions on actual skills, projects, and experience from the resume.
- Mix categories: Technical, Behavioral, HR, System Design.

Return ONLY raw JSON (no markdown, no backticks):
{
  "role": "Detected target role from resume",
  "questions": [
    {
      "question": "Specific question referencing their experience",
      "category": "Technical|Behavioral|HR|System Design",
      "difficulty": "Easy|Medium|Hard",
      "expectedKeyPoints": ["key point 1", "key point 2"]
    }
  ]
}`;

  try { return await callAI(prompt); }
  catch (error) { throw new Error('Mock interview generation failed'); }
};

// ─── EVALUATE ANSWER ──────────────────────────────────────────────────────────
const evaluateAnswer = async ({ question, answer, role, level }) => {
    if (!answer || answer.trim().length < 5) {
    return {
      score: 0,
      good: "No meaningful answer was provided.",
      improve: "Please provide a detailed answer to get proper evaluation.",
      ideal: "A complete answer should cover the core concept with examples."
    };
  }
  const prompt = `
Evaluate this interview answer strictly and fairly.
Role: ${role}, Level: ${level}
Question: ${question}
Candidate Answer: ${answer}

Return ONLY raw JSON (no markdown, no backticks):
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

Return ONLY raw JSON (no markdown, no backticks):
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