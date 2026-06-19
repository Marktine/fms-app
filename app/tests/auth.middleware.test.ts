import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setCookie } from 'hono/cookie';
import { requireAuth, requireRole, redirectIfAuth, AuthEnv } from '../src/core/middleware/auth.middleware.ts';
import { globalErrorRegistry } from '../src/core/interceptors/error.interceptor.tsx';
import { assertEquals } from 'jsr:@std/assert@^1.0.8';

// Set environment secret for JWT before running tests
Deno.env.set('JWT_SECRET', 'test-env-jwt-secret-key-12345');

Deno.test('requireAuth - should authenticate successfully with valid JWT in cookie', async () => {
  const app = new Hono();
  app.onError(globalErrorRegistry.handle);
  
  app.get('/dashboard', requireAuth, (c) => {
    return c.json({
      success: true,
      userId: c.get('userId'),
      userEmail: c.get('userEmail'),
    });
  });

  const payload = {
    userId: 'f87a0da7-67c9-4b68-80f0-8c26bf764fde',
    email: 'testuser@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const jwtSecret = Deno.env.get('JWT_SECRET') || '';
  const token = await sign(payload, jwtSecret);

  const res = await app.request('/dashboard', {
    headers: {
      Cookie: `token=${token}`,
    },
  });

  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.success, true);
  assertEquals(data.userId, 'f87a0da7-67c9-4b68-80f0-8c26bf764fde');
  assertEquals(data.userEmail, 'testuser@example.com');
});

Deno.test('requireAuth - should redirect standard page request to /auth/login when no token cookie', async () => {
  const app = new Hono();
  app.onError(globalErrorRegistry.handle);
  
  app.get('/dashboard', requireAuth, (c) => {
    return c.text('Protected Area');
  });

  const res = await app.request('/dashboard');

  assertEquals(res.status, 302);
  assertEquals(res.headers.get('Location'), '/auth/login');
});

Deno.test('requireAuth - should return 401 JSON when API route requested without token', async () => {
  const app = new Hono();
  app.onError(globalErrorRegistry.handle);
  
  app.get('/api/data', requireAuth, (c) => {
    return c.json({ sensitive: 'data' });
  });

  const res = await app.request('/api/data');

  assertEquals(res.status, 401);
  const data = await res.json();
  assertEquals(data.error, 'Unauthorized');
  assertEquals(data.message, 'Authentication required');
});

Deno.test('requireAuth - should return 401 with HX-Redirect header when HTMX page requests without token', async () => {
  const app = new Hono();
  app.onError(globalErrorRegistry.handle);
  
  app.get('/dashboard', requireAuth, (c) => {
    return c.text('Protected Page');
  });

  const res = await app.request('/dashboard', {
    headers: {
      'HX-Request': 'true',
    },
  });

  assertEquals(res.status, 401);
  assertEquals(res.headers.get('HX-Redirect'), '/auth/login');
});

Deno.test('requireAuth - should handle invalid JWT token and redirect/reject', async () => {
  const app = new Hono();
  app.onError(globalErrorRegistry.handle);
  
  app.get('/dashboard', requireAuth, (c) => {
    return c.text('Protected Area');
  });

  const res = await app.request('/dashboard', {
    headers: {
      Cookie: `token=invalid_jwt_token_payload_sig`,
    },
  });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get('Location'), '/auth/login');
});

Deno.test('requireRole - should allow access when user role matches', async () => {
  const app = new Hono<AuthEnv>();
  app.onError(globalErrorRegistry.handle);
  
  // Set mock authenticated user variables
  app.use('*', async (c, next) => {
    c.set('userId', 'user-123');
    c.set('userEmail', 'user@example.com');
    await next();
  });

  // Role checking middleware
  app.get('/admin', requireRole(['USER', 'ADMIN']), (c) => {
    return c.text('Welcome');
  });

  const res = await app.request('/admin');
  assertEquals(res.status, 200);
  assertEquals(await res.text(), 'Welcome');
});

Deno.test('requireRole - should return 403 Forbidden when user role does not match', async () => {
  const app = new Hono<AuthEnv>();
  app.onError(globalErrorRegistry.handle);
  
  app.use('*', async (c, next) => {
    c.set('userId', 'user-123');
    c.set('userEmail', 'user@example.com');
    await next();
  });

  // Admin only
  app.get('/admin-only', requireRole(['ADMIN']), (c) => {
    return c.text('Welcome Admin');
  });

  const res = await app.request('/admin-only');
  assertEquals(res.status, 403);
  const text = await res.text();
  assertEquals(text, 'Forbidden: User does not have permission to access the content.');
});

Deno.test('redirectIfAuth - should redirect authenticated user to /dashboard', async () => {
  const app = new Hono();
  app.get('/auth/login', redirectIfAuth, (c) => c.text('Login Page'));

  const payload = {
    userId: 'f87a0da7-67c9-4b68-80f0-8c26bf764fde',
    email: 'testuser@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const jwtSecret = Deno.env.get('JWT_SECRET') || '';
  const token = await sign(payload, jwtSecret);

  const res = await app.request('/auth/login', {
    headers: {
      Cookie: `token=${token}`,
    },
  });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get('Location'), '/dashboard');
});

Deno.test('redirectIfAuth - should let unauthenticated user access login page', async () => {
  const app = new Hono();
  app.get('/auth/login', redirectIfAuth, (c) => c.text('Login Page'));

  const res = await app.request('/auth/login');

  assertEquals(res.status, 200);
  assertEquals(await res.text(), 'Login Page');
});

Deno.test('redirectIfAuth - should clear invalid cookie and let user access login page', async () => {
  const app = new Hono();
  app.get('/auth/login', redirectIfAuth, (c) => c.text('Login Page'));

  const res = await app.request('/auth/login', {
    headers: {
      Cookie: `token=invalid-token`,
    },
  });

  assertEquals(res.status, 200);
  assertEquals(await res.text(), 'Login Page');
  
  // Verify that the set-cookie header is present to delete the token
  const setCookieHeader = res.headers.get('set-cookie');
  assertEquals(setCookieHeader?.includes('token=;'), true);
});
