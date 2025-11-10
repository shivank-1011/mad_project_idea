const OpenAI = require("openai");
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.getRecommendation = async (req, res) => {
  const { userPreferences } = req.body;
  try {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your_openai_api_key_here"
    ) {
      console.error("❌ OpenAI API key not configured");
      return res.status(500).json({
        error:
          "OpenAI API key not configured. Please add a valid OPENAI_API_KEY to your .env file.",
      });
    }

    const response = await ai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: JSON.stringify(userPreferences) }],
    });
    res.json({ recommendation: response.choices[0].message.content });
  } catch (err) {
    console.error("💥 Error in getRecommendation:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({
      error: err.message,
      details:
        "Failed to get AI recommendation. Check if OpenAI API key is valid.",
    });
  }
};
