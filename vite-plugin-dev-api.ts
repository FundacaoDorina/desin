import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { issueAccessToken } from "./api/_lib/auth";

function readJsonBody(req: IncomingMessage): Promise<{ password?: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? (JSON.parse(raw) as { password?: string }) : {});
      } catch {
        reject(new Error("Corpo da requisição inválido."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

/** Expõe /api/auth localmente quando se usa `npm run dev` (Vite). */
export function devApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    name: "dev-api-auth",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
            const pathname = req.url?.split("?")[0];
            if (pathname !== "/api/auth") {
              next();
              return;
            }

            if (req.method !== "POST") {
              sendJson(res, 405, { error: "Método não permitido." });
              return;
            }

            try {
              const configuredPassword = env.ACCESS_PASSWORD;
              if (!configuredPassword) {
                sendJson(res, 500, { error: "A senha de acesso não foi configurada no .env." });
                return;
              }

              if (!env.ACCESS_TOKEN_SECRET) {
                sendJson(res, 500, { error: "ACCESS_TOKEN_SECRET não configurado no .env." });
                return;
              }

              process.env.ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;

              const body = await readJsonBody(req);
              if (!body.password || body.password !== configuredPassword) {
                sendJson(res, 401, { error: "Senha inválida." });
                return;
              }

              const token = issueAccessToken();
              sendJson(res, 200, { token });
            } catch {
              sendJson(res, 500, { error: "Erro ao processar login." });
            }
      });
    },
  };
}
