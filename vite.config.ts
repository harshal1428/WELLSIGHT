import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleGeminiChat } from './server/gemini.ts'

function localGeminiRoute(apiKey: string): Plugin {
  return {
    name: 'local-gemini-chat-route',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Allow', 'POST');
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: string) => {
          body += chunk;
          if (body.length > 50000) {
            res.statusCode = 413;
            res.end(JSON.stringify({ error: 'Chat request is too large.' }));
            req.destroy();
          }
        });
        req.on('end', async () => {
          if (res.writableEnded) return;
          const result = await handleGeminiChat(body, apiKey || process.env.GEMINI_API_KEY);
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), localGeminiRoute(env.GEMINI_API_KEY)],
  };
})
