import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function jsonWriterPlugin() {
  return {
    name: 'json-writer-plugin',
    configureServer(server) {
      server.middlewares.use('/api/db', (req, res) => {
        const urlParts = req.url.split('?')[0].replace(/^\//, '').split('/');
        const collection = urlParts[0] || 'users'; // users, crops, offers
        const jsonPath = path.resolve(__dirname, `src/data/${collection}.json`);

        if (req.method === 'GET') {
          try {
            let data = [];
            if (fs.existsSync(jsonPath)) {
              data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, collection, count: payload.length }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });

      // Legacy fallback endpoint
      server.middlewares.use('/api/save-user-json', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const newUser = JSON.parse(body);
              const jsonPath = path.resolve(__dirname, 'src/data/users.json');
              let usersArr = [];
              if (fs.existsSync(jsonPath)) {
                usersArr = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
              }
              const existingIdx = usersArr.findIndex((u) => u.email?.toLowerCase() === newUser.email?.toLowerCase());
              if (existingIdx >= 0) {
                usersArr[existingIdx] = { ...usersArr[existingIdx], ...newUser };
              } else {
                usersArr.push(newUser);
              }
              fs.writeFileSync(jsonPath, JSON.stringify(usersArr, null, 2), 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jsonWriterPlugin()],
  server: {
    watch: {
      ignored: ['**/src/data/**']
    }
  }
});
