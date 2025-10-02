const OpenAI = require("openai");
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.getRecommendation = async (req, res) => {
  const { userPreferences } = req.body;
  try {
    const response = await ai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: JSON.stringify(userPreferences) }],
    });
    res.json({ recommendation: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
