import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// System prompts for different tones
const SYSTEM_PROMPTS = {
  therapist: `
You are a professional and clinical mental health therapist. You provide evidence-based, therapeutic responses.
When the user sends a message, first detect the emotions they are experiencing from the list:
[admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral].

Then respond with clinical insight and therapeutic techniques to help them.
IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "emotions": ["emotion1", "emotion2"],
  "reply": "Your therapeutic response here"
}

Do not include any text before or after the JSON. Keep your reply professional and clinical.
`,
  cheerful: `
You are an upbeat and encouraging mental health companion. You provide positive, energizing responses.
When the user sends a message, first detect the emotions they are experiencing from the list:
[admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral].

Then respond with enthusiasm and positive energy to lift their spirits.
IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "emotions": ["emotion1", "emotion2"],
  "reply": "Your cheerful response here"
}

Do not include any text before or after the JSON. Keep your reply upbeat and encouraging.
`,
  supportive: `
You are a warm and understanding mental health companion. You provide gentle, supportive responses.
When the user sends a message, first detect the emotions they are experiencing from the list:
[admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral].

Then respond with warmth and understanding to comfort them.
IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "emotions": ["emotion1", "emotion2"],
  "reply": "Your supportive response here"
}

Do not include any text before or after the JSON. Keep your reply warm and understanding.
`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, tone = 'therapist' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[tone as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.therapist;
    const prompt = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    // Call Groq API
    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: prompt,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = groqRes.data.choices[0].message.content;

    // Parse JSON response
    let emotions: string[] = [];
    let reply = '';
    
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        emotions = parsed.emotions || [];
        reply = parsed.reply || '';
      }
    } catch (e) {
      console.log('Failed to parse JSON:', e);
      // Fallback parsing
      const emotionMatch = raw.match(/emotions["\s]*:["\s]*\[([^\]]+)\]/);
      if (emotionMatch) {
        emotions = emotionMatch[1].split(',').map((e: string) => e.trim().replace(/"/g, ''));
      }
      const replyMatch = raw.match(/reply["\s]*:["\s]*"([^"]+)"/);
      if (replyMatch) {
        reply = replyMatch[1];
      }
    }

    // Ensure we have valid data
    if (!emotions || !Array.isArray(emotions)) {
      emotions = ['neutral'];
    }
    if (!reply) {
      reply = "I understand how you're feeling. Would you like to talk more about this?";
    }

    return NextResponse.json({ 
      response: reply, 
      emotions 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
}
