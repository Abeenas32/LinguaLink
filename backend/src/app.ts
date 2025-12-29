import http from "http";
import app from "./server";
import dotenv from "dotenv";
import { initWebSocket } from "./websocket";
import { preloadTranslationModel, isTranslationReady } from './services/translation.service';

dotenv.config();

const server = http.createServer(app);
initWebSocket(server);

const PORT = process.env.PORT || 3000;

// Start server function with model pre-loading
async function startServer() {
  try {
    console.log("🚀 Starting LinguaLink server...");
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 WebSocket server ready`);
      console.log(`📡 API available at http://localhost:${PORT}`);
    });

    // Pre-load translation model in background
    console.log("\n📦 Initializing translation service...");
    console.log("⏳ First-time setup: Downloading translation model (~300MB)");
    console.log("⏳ This will take 2-5 minutes, please wait...\n");
    
    await preloadTranslationModel();
    
    console.log("\n🎉 Translation model ready!");
    console.log("✨ LinguaLink is fully operational!");
    console.log("⚡ All translations will now be instant!\n");

  } catch (error) {
    console.error("\n❌ Failed to load translation model:", error);
    console.log("⚠️  Server is running but translations may not work");
    console.log("💡 Tip: Check your RAM (need at least 512MB available)\n");
  }
}

// Start everything
startServer();