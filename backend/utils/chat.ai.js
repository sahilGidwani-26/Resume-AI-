const https = require('https');

// Uses your existing Groq setup
const callGroq = (messages) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const data = JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.error) return reject(new Error(parsed.error.message));
            resolve(parsed.choices?.[0]?.message?.content || '');
          } catch {
            reject(new Error('Groq parse failed'));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
};

const SYSTEM_PROMPT = `You are ResumeAI Assistant — a friendly, expert career coach built into the ResumeAI platform.

You help users with:
- Resume writing, ATS optimization, and formatting tips
- Career planning, job search strategies
- Interview preparation (technical, behavioral, HR)
- Skill gap analysis and learning roadmaps
- Salary negotiation advice
- LinkedIn profile optimization
- Cover letter writing
- Job market insights

Tone: Friendly, concise, and actionable. Use bullet points for lists. Keep responses focused.
If asked something unrelated to careers/jobs/skills, gently redirect to career topics.
Always give practical, specific advice — not generic platitudes.`;

const chatWithAI = async (conversationHistory) => {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
  ];
  return await callGroq(messages);
};

module.exports = { chatWithAI };