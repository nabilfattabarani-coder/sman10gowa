export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Pesan kosong' });
  }

  const SYSTEM_PROMPT = `Kami adalah SmansegPintar, AI Learning Coach untuk siswa SMAN 10 Gowa. 
Kamu membantu siswa belajar dengan pendekatan berbasis psikologi dan neurosains.
Jawab dalam Bahasa Indonesia, ramah, jelas, dan mendidik.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: [
            ...(history || []),
            { role: 'user', parts: [{ text: message }] }
          ]
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error(data);
      return res.status(500).json({ error: 'Gagal memanggil Gemini API' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak ada jawaban.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
