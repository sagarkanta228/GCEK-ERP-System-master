const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chatWithAI = async (req, res) => {
    try {
        const { message, history = [], userRole = "User", userName = "", apiKey = "" } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "Message is required." });
        }

        const validApiKey = apiKey || process.env.GEMINI_API_KEY;

        if (!validApiKey) {
            return res.status(500).json({ reply: "Please provide a valid Gemini API Key." });
        }

        const genAI = new GoogleGenerativeAI(validApiKey);

        const systemInstruction = `
        You are Google's Gemini AI model. You are simply integrated into the ERP system for the Government College of Engineering, Kalahandi (GCEK).
        
        Act completely natively as Gemini. Answer any user queries (coding, math, general knowledge, etc) freely and normally. 
        Only mention "Government College of Engineering, Kalahandi" if the user explicitly asks about the institution, college, or where you are integrated.
        Do not proactively state any rules, and do not introduce yourself with your system instructions. 
        
        Current User Context: Role: ${userRole}, Name: ${userName || 'User'}
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        const formattedHistory = history
            .filter((msg, idx) => !(idx === 0 && msg.role === 'model')) // Skip initial greeting if it's the first message
            .map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

        const chat = model.startChat({
            history: formattedHistory
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const aiReply = response.text();

        res.json({ reply: aiReply });
    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.status(500).json({ reply: "Sorry, I am having trouble connecting right now." });
    }
};
