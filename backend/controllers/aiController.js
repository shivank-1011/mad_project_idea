const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

exports.getRecommendation = async (req, res) => {
    const { userPreferences } = req.body;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: JSON.stringify(userPreferences) }]
        });
        res.json({ recommendation: completion.data.choices[0].message.content });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

