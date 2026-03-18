import express from 'express';
import axios from 'axios';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const callGemini = async (prompt) => {
  const response = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
  
  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');
  return text;
};

const parseJSON = (raw) => {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

router.post('/chat', verifyJWT, async (req, res) => {
  try {
    const { docText, messages } = req.body;
    const context = docText?.slice(0, 8000) || '';
    
    if (!context) {
      return res.status(400).json({ message: 'No document text available' });
    }
    
    const history = messages?.slice(-5).map(m => 
      `${m.role}: ${m.content}`
    ).join('\n') || '';

    const prompt = `You are a helpful AI tutor. Answer ONLY from this document:\n${context}\n\n${history ? `Conversation history:\n${history}\n\n` : ''}User's latest question:`;
    
    const response = await callGemini(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ message: error.message || 'AI generation failed' });
  }
});

router.post('/summary', verifyJWT, async (req, res) => {
  try {
    const { docText } = req.body;
    const context = docText?.slice(0, 8000) || '';
    
    if (!context) {
      return res.status(400).json({ message: 'No document text available' });
    }
    
    const prompt = `Create a comprehensive summary of this document with:
1. Key Topics (list 3-5 main topics)
2. Main Concepts (explain the core ideas in 2-3 paragraphs)
3. Important Details (bullet points of key facts)

Document:
${context}`;
    
    const response = await callGemini(prompt);
    res.json({ summary: response });
  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ message: error.message || 'Summary generation failed' });
  }
});

router.post('/explain', verifyJWT, async (req, res) => {
  try {
    const { docText, topic } = req.body;
    const context = docText?.slice(0, 8000) || '';
    
    const prompt = `Explain the concept "${topic}" from this document. 
Use simple language, include relevant analogies, and provide 3 practical examples.
Format with clear sections.

Document:
${context}`;
    
    const response = await callGemini(prompt);
    res.json({ explanation: response });
  } catch (error) {
    console.error('Explain error:', error.message);
    res.status(500).json({ message: error.message || 'Explanation generation failed' });
  }
});

router.post('/flashcards', verifyJWT, async (req, res) => {
  try {
    const { docText, count = 10 } = req.body;
    const context = docText?.slice(0, 8000) || '';
    
    if (!context) {
      return res.status(400).json({ message: 'No document text available' });
    }
    
    const prompt = `Generate ${count} flashcards as a JSON array ONLY. Each card should have "front" (question) and "back" (answer). Cover the most important concepts from the document. Return ONLY the JSON array.

Document:
${context}`;
    
    const raw = await callGemini(prompt);
    const flashcards = parseJSON(raw);
    res.json({ flashcards });
  } catch (error) {
    console.error('Flashcards error:', error.message);
    res.status(500).json({ message: error.message || 'Flashcard generation failed' });
  }
});

router.post('/quiz', verifyJWT, async (req, res) => {
  try {
    const { docText, count = 5 } = req.body;
    const context = docText?.slice(0, 8000) || '';
    
    if (!context) {
      return res.status(400).json({ message: 'No document text available' });
    }
    
    const prompt = `Generate ${count} multiple choice questions as a JSON array ONLY. Each question should have:
- question: the question text
- options: array of 4 choices ["A","B","C","D"]
- correct: index 0-3 of the correct answer
- explanation: brief explanation of the answer

Return ONLY the JSON array.

Document:
${context}`;
    
    const raw = await callGemini(prompt);
    const quiz = parseJSON(raw);
    res.json({ quiz });
  } catch (error) {
    console.error('Quiz error:', error.message);
    res.status(500).json({ message: error.message || 'Quiz generation failed' });
  }
});

export default router;
