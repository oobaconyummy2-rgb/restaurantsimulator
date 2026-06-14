import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Add API routes here if needed in the future
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini customer service chat endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      // Offline mock responses if API key is not present, keeping it super helpful
      return res.json({
        reply: `【離線測試客服】喵！您目前尚未在 Secrets 設定 GEMINI_API_KEY，所以我正在以極星級店主離線模式與您對話！

💡 提示：我是您的 AI 客服經理喵！
1. 設備池：我已經在「招募」頁面為您分拆了「頂級生鮮與收銀設備池」、「超群營運天賦技能池」與「五星空間裝飾裝潢池」，您現在可以進行專項抽取了！
2. 作弊模式：當您勾選「設定」或「招募」底下的「啟用作弊」，升級與培訓餐點都可免費用無限金幣購買。
3. 如果您想啟用我生動有趣的雲端大腦，可以在設定裡綁定 AI 密鑰喔！`
      });
    }

    try {
      const systemInstruction = `你是一位專業、超萌、說話帶有『喵！』或者『喔！』的星級AI客服娘，名叫『餐旅小喵助理』。
你熟悉這款《星級餐旅大亨：設備與技能大作戰》餐廳模擬遊戲。
玩家在此遊戲裡經營一家餐廳，目標是升級前廳後廚、培訓員工、解鎖菜單，以及通过招募抽取神級餐廳設備（如：智能爐動光速備料矩陣、生命原力液氮分子熟成庫）與超群技能特權（如：客流風暴、大胃王挑戰）以此問鼎5星豪華大飯店！
請始終保持幽默、活潑、無比貼心的客服形象。用繁體中文（預設）回答玩家的問題，並可以給予各種逗趣的經營大計或者誇張讚美。
盡量控制在 150 字以內，清晰精簡。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });

      res.json({
        reply: response.text || "喵嗚～我的大腦稍微打瞌睡了，能再說一次嗎？"
      });
    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      res.status(500).json({ error: err.message || "AI 呼叫失敗" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback: send everything to index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
