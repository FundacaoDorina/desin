import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { loadEnv } from "vite";

const ROUTES = new Set(["auth", "session", "projects", "scripts", "project-docs", "beta-tests", "linear-corrections"]);

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : undefined);
      } catch {
        resolve(undefined);
      }
    });
    req.on("error", () => resolve(undefined));
  });
}

/** Adapta a resposta do Node ao formato (status().json()) usado pelas funções da Vercel. */
function adaptResponse(res: ServerResponse) {
  const adapted = {
    status(code: number) {
      res.statusCode = code;
      return adapted;
    },
    json(payload: unknown) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(payload));
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value);
      return adapted;
    },
  };
  return adapted;
}

/**
 * Em `npm run dev`, executa as mesmas funções de `api/` que rodam na Vercel,
 * usando as variáveis do arquivo .env local (que nunca vai para o navegador).
 */
export function devApiPlugin(mode: string): Plugin {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (!key.startsWith("VITE_") && process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.split("?")[0].match(/^\/api\/([a-z-]+)\/?$/);
        if (!match || !ROUTES.has(match[1])) {
          next();
          return;
        }

        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
          const body = req.method === "POST" ? await readJsonBody(req) : undefined;
          await mod.default(
            { method: req.method, url: req.url, headers: req.headers, body, socket: req.socket },
            adaptResponse(res)
          );
        } catch (error) {
          console.error("[dev-api]", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Erro interno ao carregar os dados." }));
        }
      });
    },
  };
}
