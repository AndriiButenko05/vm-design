import { readFileSync, existsSync } from 'node:fs';

/**
 * Лише для `astro dev`: запити /api/* обслуговує той самий worker/index.js,
 * що й на Cloudflare. Ключ береться з .dev.vars, Place ID — із vars у wrangler.jsonc.
 */
export default function devWorker() {
  return {
    name: 'vm-dev-worker',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        try {
          const { default: worker } = await server.ssrLoadModule('/worker/index.js');
          const headers = Object.entries(req.headers).filter(([, v]) => typeof v === 'string');
          const response = await worker.fetch(new Request(new URL(req.url, 'http://localhost'), { headers }), {
            ...wranglerVars(),
            ...devVars(),
            ASSETS: { fetch: () => new Response('Not found', { status: 404 }) },
          });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

function devVars() {
  if (!existsSync('.dev.vars')) return {};
  return Object.fromEntries(
    readFileSync('.dev.vars', 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim().match(/^([\w.-]+)\s*=\s*(.*)$/))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^(['"])(.*)\1$/, '$2')]),
  );
}

function wranglerVars() {
  const text = readFileSync('wrangler.jsonc', 'utf8').replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(text.replace(/,(\s*[}\]])/g, '$1')).vars ?? {};
}
