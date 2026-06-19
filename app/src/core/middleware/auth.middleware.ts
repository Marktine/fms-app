import { MiddlewareHandler } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { log } from '../logger.ts';

/**
 * Types defining variables available in the Context's state
 * for authenticated requests.
 */
export interface AuthVariables {
  userId: string;
  userEmail: string;
}

export interface AuthEnv {
  Variables: AuthVariables;
}

/**
 * Middleware that enforces authentication.
 * Verifies JWT token from 'token' cookie.
 * 
 * Supports both traditional HTML/JSON responses and HTMX requests:
 * - Redirects to /auth/login for page requests.
 * - Handles HTMX redirects using the HX-Redirect header.
 * - Responds with 401 Unauthorized for JSON/API requests.
 */
export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = getCookie(c, 'token');

  if (!token) {
    handleUnauthorized();
  }

  const jwtSecret = Deno.env.get('JWT_SECRET');
  if (!jwtSecret) {
    log.error('JWT_SECRET env variable is not set');
    return c.text('Internal Server Error', 500);
  }

  try {
    const payload = await verify(token, jwtSecret, "HS256");
    
    if (!payload || !payload.userId || !payload.email) {
      handleUnauthorized();
    }

    // Set authentication details in context variables
    c.set('userId', payload.userId as string);
    c.set('userEmail', payload.email as string);

    await next();
  } catch (err) {
    if (err instanceof Error) {
      log.warn('JWT verification failed:', err.message);
      handleUnauthorized();
    }
  }
};

/**
 * Custom response handler for unauthorized requests (now throws an exception for the global interceptor to catch)
 */
function handleUnauthorized(): never {
  throw new HTTPException(401, { message: 'Authentication required' });
}

export const redirectIfAuth: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, 'token');

  if (token) {
    const jwtSecret = Deno.env.get('JWT_SECRET');
    if (!jwtSecret) {
      console.error('JWT_SECRET env variable is not set');
      return c.text('Internal Server Error', 500);
    }

    try {
      const payload = await verify(token, jwtSecret, 'HS256');
      if (payload && payload.userId && payload.email) {
        const isHtmx = c.req.header('HX-Request') === 'true';
        if (isHtmx) {
          c.header('HX-Redirect', '/dashboard');
          return c.text('Redirecting...', 302);
        }
        return c.redirect('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        log.error('Token verification failed:', err.message);
        deleteCookie(c, 'token', { path: '/' });
      }
    }
  }

  await next();
};

/**
 * Scaffolding role-based authorization check (RBAC).
 * Enforces that an authenticated user has one of the allowed roles.
 * 
 * Note: Since our schema does not have a role column on the users table yet,
 * this acts as a placeholder that can be extended once roles are added.
 */
export function requireRole(allowedRoles: string[]): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const userId = c.get('userId');
    if (!userId) {
      handleUnauthorized();
    }

    // Placeholder: Look up role in database or JWT claims.
    // e.g., const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    // If the JWT payload contains roles:
    // const roles: string[] = c.get('roles') || [];
    
    // For scaffolding demonstration, we assume a default role of 'USER'.
    const userRole = 'USER'; 

    if (!allowedRoles.includes(userRole)) {
      throw new HTTPException(403, { message: 'Insufficient permissions' });
    }

    await next();
  };
}

/**
 * Scaffolding resource ownership check (ABAC).
 * Ensures that the authenticated user owns/is authorized for the specific resource.
 * 
 * Example usage:
 * router.get('/transactions/:id', requireOwnership(
 *   'id', 
 *   async (userId, transactionId) => {
 *     const transaction = await db.select().from(transactions).where(eq(transactions.id, transactionId));
 *     return transaction && transaction.userId === userId;
 *   }
 * ))
 */
export function requireOwnership(
  paramName: string,
  checkOwnershipFn: (userId: string, resourceId: string) => boolean | Promise<boolean>
): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const userId = c.get('userId');
    const resourceId = c.req.param(paramName);

    if (!userId || !resourceId) {
      throw new HTTPException(403, { message: 'Resource parameters not found' });
    }

    try {
      const isOwner = await checkOwnershipFn(userId, resourceId);
      if (!isOwner) {
        throw new HTTPException(403, { message: 'You do not own this resource' });
      }
    } catch (err) {
      console.error('Error verifying ownership:', err);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }

    await next();
  };
}
