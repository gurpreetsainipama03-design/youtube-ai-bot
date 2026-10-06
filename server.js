const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("YouTube AI Bot is online!");
});

async function askGemini(model, question) {
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
                text: `Answer this YouTube Live chat question briefly and naturally. Maximum 2 short sentences. Do not use emojis.

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
    const error = new Error(data?.error?.message || "Gemini API error");
    error.status = response.status;
    throw error;
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function askWithRetry(question) {
  const models = [
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite"
  ];

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const answer = await askGemini(model, question);

        if (answer) {
          return answer;
        }
      } catch (error) {
        console.error(
          `Gemini ${model} attempt ${attempt + 1}:`,
          error.status,
          error.message
        );

        if (![429, 500, 503].includes(error.status)) {
          break;
        }

        if (attempt < 2) {
          await new Promise(resolve =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt))
          );
        }
      }
    }
  }

  throw new Error("Gemini temporarily unavailable.");
}

app.get("/ai", async (req, res) => {
  try {
    const question = req.query.question;

    if (!question) {
      return res.status(400).send("Question nahi mili.");
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).send("GEMINI_API_KEY missing.");
    }

    let answer = await askWithRetry(question);

    // Nightbot urlfetch response ko short rakho
    answer = answer.replace(/\s+/g, " ").trim();

    if (answer.length > 390) {
      answer = answer.substring(0, 387) + "...";
    }

    res.send(answer);

  } catch (error) {
    console.error("Final AI error:", error);
    res.status(503).send("AI temporarily busy. Please try again.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Bot running on port ${PORT}`);
});
