const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("YouTube AI Bot is online!");
});

app.get("/ai", async (req, res) => {
  try {
    const question = req.query.question;

    if (!question) {
      return res.status(400).send("Question nahi mili.");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).send("GEMINI_API_KEY missing.");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Answer this YouTube Live chat question briefly and naturally. Maximum 2 short sentences.

Question: ${question}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).send("Gemini API error. Check Render logs.");
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      console.error("No AI answer:", data);
      return res.status(500).send("AI ne answer nahi ditta.");
    }

    res.send(answer);

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Server error.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Bot running on port ${PORT}`);
});
