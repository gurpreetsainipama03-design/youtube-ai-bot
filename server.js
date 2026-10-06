const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("YouTube AI Bot is online!");
});

app.get("/ai", async (req, res) => {
  try {
    const question = req.query.question;

    if (!question) {
      return res.send("Question nahi mili.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer this YouTube Live chat question briefly and naturally. 
Question: ${question}`
    });

    res.send(response.text);
  } catch (error) {
    console.error(error);
    res.status(500).send("AI response error.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Bot running on port ${PORT}`);
});
