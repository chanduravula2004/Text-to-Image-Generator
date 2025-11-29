// -------------------- FINAL FIXED server.js --------------------

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

// FIXED FETCH for all Node versions 🔥
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const upload = multer();

// Debug logs
console.log("🔥 Using server.js from:", __dirname);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
const publicPath = path.join(__dirname, "public");
console.log("📂 Public folder path:", publicPath);

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Clipdrop API settings
const API_KEY = process.env.CLIPDROP_API_KEY;
const API_URL = "https://clipdrop-api.co/text-to-image/v1";

console.log("🔑 Loaded API KEY:", API_KEY ? "OK" : "MISSING");

if (!API_KEY) {
  console.error("❌ ERROR: CLIPDROP_API_KEY missing in .env file");
  process.exit(1);
}

// Image generation
app.post("/generate", upload.none(), async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const formData = new (require("form-data"))();
    formData.append("prompt", prompt);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      console.log("❌ ClipDrop API Error:", await response.text());
      return res.status(500).json({ error: "Failed to generate image" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("📁 Public folder served:", publicPath);
});
