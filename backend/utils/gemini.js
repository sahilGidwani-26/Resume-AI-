const axios = require('axios');

const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert ATS resume analyzer and career coach.

Analyze this resume and return ONLY valid JSON.

Resume:
${resumeText}

Return this exact JSON format:
{ "atsScore": number, "extractedSkills": [], "missingSkills": [], "improvements": [], "strengths": [], "weaknesses": [], "overallFeedback": "", "jobRecommendations": [ { "title": "", "matchScore": number, "description": "", "requiredSkills": [], "salaryRange": "" } ] }
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let text = response.data.choices[0].message.content;

    text = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(text);

  } catch (error) {
    console.error(error.response?.data || error.message);
    throw new Error('AI analysis failed');
  }
};

const generateJobDescription = async (
  skills,
  experience,
  targetRole
) => {
  const prompt = `
Suggest 8 suitable jobs for this candidate.

Skills: ${skills.join(', ')}
Experience: ${experience}
Target Role: ${targetRole}

Return ONLY valid JSON:
{
  "jobs": [
    {
      "title": "",
      "matchScore": 90,
      "description": "",
      "requiredSkills": [],
      "salaryRange": "",
      "companies": [],
      "growth": ""
    }
  ]
}
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let text = response.data.choices[0].message.content;

    text = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(text);

  } catch (error) {
    console.error(error.response?.data || error.message);
    throw new Error('Job generation failed');
  }
};

module.exports = {
  analyzeResume,
  generateJobDescription,
};

