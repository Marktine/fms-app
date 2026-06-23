import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { router } from './routes.ts';
import { honoLogLayer, type HonoLogLayerVariables } from '@loglayer/hono';
import { log } from './core/logger.ts';
import { globalErrorRegistry } from './core/interceptors/error.interceptor.tsx';

const app = new Hono<{ Variables: HonoLogLayerVariables }>();

app.use('*' as string, honoLogLayer({ instance: log }));
app.onError(globalErrorRegistry.handle);

// Static files (htmx.min.js, etc.)
app.use('/static/*', serveStatic({ root: './' }));

// Main Router
app.route('/', router);

const port = Number(Deno.env.get('PORT') || 3000);
console.log(`Server is running on port ${port}`);

Deno.serve({ port }, app.fetch);
