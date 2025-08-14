import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

// Simple Perplexity Chat function placeholder
async function perplexityChat(prompt: string, model: string = "sonar"): Promise<string> {
  try {
    // This is a placeholder implementation since the original function is missing
    // In a real implementation, this would call the Perplexity API
    console.log('Perplexity Chat called with prompt:', prompt.substring(0, 100) + '...');
    
    // Return a simple response based on the prompt
    const responses = [
      "Medizin Regulatorik Innovation",
      "FDA Zulassung Sicherheit",
      "Compliance Überwachung Standards",
      "Diagnostik Therapie Monitoring",
      "Qualität Kontrolle Validierung"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return randomResponse;
  } catch (error) {
    console.error('Perplexity Chat error:', error);
    return "System Fehler Aufgetreten";
  }
}

// Perplexity AI endpoint (antwort strikt auf 3 Wörter begrenzen)
app.post("/api/ai", async (req: Request, res: Response) => {
  try {
    const prompt = req.body?.prompt;
    const model = req.body?.model ?? "sonar";
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Feld 'prompt' (string) ist erforderlich." });
    }

    // Strikte Anweisung
    const strictPrompt = `Antworte NUR mit genau drei deutschen Wörtern, ohne Satzzeichen, ohne Erklärungen. Aufgabe: ${prompt}`;

    let answer = await perplexityChat(strictPrompt, model);

    // Post-Processing: nur die ersten 3 Wörter lassen
    answer = answer
      .replace(/[^\p{L}\p{N}\s\-äöüÄÖÜß]/gu, " ") // Sonderzeichen raus
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");

    if (!answer) answer = "Hallo Hallo Hallo";

    return res.json({ answer });
  } catch (err: any) {
    console.error("AI route error:", err?.message || err);
    return res.status(500).json({ error: "AI-Service momentan nicht verfügbar." });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    // Create HTTP server
    const server: Server = createServer(app);
    
    // Register all routes
    await registerRoutes(app);
    
    // Setup Vite in development mode
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
    } else {
      // Serve static files in production
      app.use(express.static('dist/public'));
      
      // Serve index.html for all non-API routes
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
          res.sendFile('index.html', { root: 'dist/public' });
        }
      });
    }
    
    // Start server
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Helix server running on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Server available at http://0.0.0.0:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⏹️ SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('⏹️ SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});