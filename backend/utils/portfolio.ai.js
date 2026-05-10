const axios = require('axios');

// ─── Shared AI caller (same pattern as your gemini.js) ────────────────────────
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

// ─── GENERATE PORTFOLIO DATA FROM FORM ────────────────────────────────────────
const generatePortfolioFromForm = async ({ name, title, email, phone, location, linkedin, github, bio, skills, experience, education, projects, certifications }) => {
  const prompt = `
You are a professional portfolio content writer. Given user's raw info, generate polished, ATS-friendly portfolio content.

User Data:
Name: ${name}
Title: ${title || 'Not specified'}
Email: ${email || ''}
Phone: ${phone || ''}
Location: ${location || ''}
LinkedIn: ${linkedin || ''}
GitHub: ${github || ''}
Bio: ${bio || ''}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills || ''}
Experience: ${JSON.stringify(experience || [])}
Education: ${JSON.stringify(education || [])}
Projects: ${JSON.stringify(projects || [])}
Certifications: ${JSON.stringify(certifications || [])}

Tasks:
1. Write a compelling 3-4 sentence professional bio if bio is weak/empty
2. Improve project descriptions to be impactful and result-focused
3. Improve experience bullet points with action verbs and metrics
4. Suggest 3-5 additional relevant skills based on experience/projects
5. Improve job title if vague

Return ONLY raw JSON:
{
  "name": "${name}",
  "title": "Polished job title",
  "email": "${email || ''}",
  "phone": "${phone || ''}",
  "location": "${location || ''}",
  "linkedin": "${linkedin || ''}",
  "github": "${github || ''}",
  "bio": "Polished professional bio",
  "skills": ["skill1", "skill2"],
  "experience": [{ "company": "", "role": "", "duration": "", "description": "Improved bullet-point description" }],
  "education": [{ "institution": "", "degree": "", "year": "" }],
  "projects": [{ "name": "", "description": "Impactful description", "techStack": [], "liveUrl": "", "githubUrl": "" }],
  "certifications": [{ "name": "", "issuer": "", "year": "" }]
}`;
  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generatePortfolioFromForm error:', error.response?.data || error.message);
    throw new Error('Portfolio generation failed');
  }
};

// ─── GENERATE PORTFOLIO DATA FROM RESUME TEXT ──────────────────────────────────
const generatePortfolioFromResume = async (resumeText) => {
  const prompt = `
You are a professional portfolio content writer. Extract and enhance all relevant info from this resume to create a stunning portfolio.

Resume:
${resumeText}

Extract and improve:
1. Personal details (name, title, email, phone, location, linkedin, github)
2. Write a compelling 3-4 sentence professional bio from the resume
3. All skills mentioned
4. Work experience with polished descriptions
5. Education
6. Projects with impactful descriptions
7. Certifications

Return ONLY raw JSON:
{
  "name": "Full name",
  "title": "Professional title",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "bio": "Compelling 3-4 sentence bio",
  "skills": ["skill1", "skill2"],
  "experience": [{ "company": "", "role": "", "duration": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "year": "" }],
  "projects": [{ "name": "", "description": "", "techStack": [], "liveUrl": "", "githubUrl": "" }],
  "certifications": [{ "name": "", "issuer": "", "year": "" }]
}`;
  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('generatePortfolioFromResume error:', error.response?.data || error.message);
    throw new Error('Portfolio generation from resume failed');
  }
};



// ─── ANALYZE ANY PORTFOLIO TEXT (from URL scrape) ─────────────────────────────
const analyzePortfolioText = async (pageText, url) => {
  const prompt = `
You are a strict professional portfolio reviewer. Analyze this portfolio page content critically.

Source URL: ${url}
Extracted Page Content:
${pageText}

SCORING RULES:
- Missing bio or weak bio: -10 to -15
- No projects visible: -20
- No contact info: -10
- No social links: -10
- Vague descriptions: -10
- Only give 85+ if truly exceptional
- Be precise (e.g., 61, 74, 83)

Return ONLY raw JSON:
{
  "score": <0-100>,
  "grade": "Excellent|Good|Average|Needs Work",
  "summary": "3-4 sentence honest assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": [
    { "section": "Bio", "issue": "what's wrong", "fix": "what to do" },
    { "section": "Projects", "issue": "", "fix": "" },
    { "section": "Skills", "issue": "", "fix": "" }
  ],
  "missingElements": ["element 1", "element 2"]
}`;
  try {
    return await callAI(prompt);
  } catch (error) {
    throw new Error('Portfolio URL analysis failed');
  }
};



// ─── ANALYZE PORTFOLIO ─────────────────────────────────────────────────────────
const analyzePortfolio = async (portfolioData) => {
  const prompt = `
You are a strict professional portfolio reviewer. Analyze this portfolio critically and give actionable feedback.

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

SCORING RULES:
- Missing bio or weak bio: -10 to -15
- No projects: -20
- No GitHub/LinkedIn: -10 each
- No certifications: -5
- Vague experience descriptions: -10
- Few skills (<5): -8
- Only give 85+ if portfolio is truly exceptional
- NEVER give same score twice, be precise (e.g., 61, 74, 83)

Analyze across these dimensions:
1. Completeness (all sections filled)
2. Impact (quantified achievements, action verbs)
3. Presentation (bio quality, descriptions)
4. Online presence (LinkedIn, GitHub, website)
5. Skills coverage
6. Project quality

Return ONLY raw JSON:
{
  "score": <realistic 0-100>,
  "grade": "Excellent|Good|Average|Needs Work",
  "summary": "Honest 3-4 sentence overall assessment",
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "weaknesses": ["Specific weakness 1", "Weakness 2", "Weakness 3", "Weakness 4"],
  "improvements": [
    { "section": "Bio", "issue": "What's wrong", "fix": "Exactly what to do" },
    { "section": "Projects", "issue": "", "fix": "" },
    { "section": "Skills", "issue": "", "fix": "" },
    { "section": "Experience", "issue": "", "fix": "" }
  ],
  "missingElements": ["Missing element 1", "Element 2", "Element 3"],
  "dimensionScores": {
    "completeness": <0-100>,
    "impact": <0-100>,
    "presentation": <0-100>,
    "onlinePresence": <0-100>,
    "skillsCoverage": <0-100>,
    "projectQuality": <0-100>
  }
}`;
  try {
    return await callAI(prompt);
  } catch (error) {
    console.error('analyzePortfolio error:', error.response?.data || error.message);
    throw new Error('Portfolio analysis failed');
  }
};

module.exports = {
  generatePortfolioFromForm,
  generatePortfolioFromResume,
  analyzePortfolio,
   analyzePortfolioText,
};