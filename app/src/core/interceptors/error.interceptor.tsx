/** @jsxImportSource hono/jsx */
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AppException } from '../AppException.ts';
import { Notification } from '../../ui/components/Notification.tsx';

type ErrorHandler = (err: Error, c: Context) => Response | Promise<Response> | null;

export class ErrorInterceptorRegistry {
  private handlers = new Map<number, ErrorHandler>();

  constructor() {
    this.registerDefaultHandlers();
  }

  public register(status: number, handler: ErrorHandler) {
    this.handlers.set(status, handler);
  }

  public handle = (err: Error, c: Context): Response | Promise<Response> => {
    const isHtmx = !!(c.req.header('HX-Request')) === true;

    // Custom AppException (for form validation, etc.)
    if (err instanceof AppException) {
      if (isHtmx) {
        if (err.errorType === 'FORM_VALIDATION') {
          c.header('HX-Retarget', '#form-error-message');
          c.header('HX-Reswap', 'innerHTML');
        } else if (err.errorType === 'GLOBAL_TOASTER') {
          c.header('HX-Retarget', '#toaster-container');
          c.header('HX-Reswap', 'beforeend');
        }
        return c.html(err.htmxFragment, err.status);
      }
      return c.json({ error: err.message }, err.status);
    }

    // Standard HTTP Exceptions or Generic Errors
    const status = err instanceof HTTPException ? err.status : 500;
    const handler = this.handlers.get(status);

    if (handler) {
      const response = handler(err, c);
      if (response) return response as Response;
    }

    // Fallback if no specific handler or handler returns null
    if (isHtmx) {
      c.header('HX-Retarget', '#toaster-container');
      c.header('HX-Reswap', 'beforeend');
      return c.html(
        <Notification
          message={err.message || 'An unexpected server error occurred.'}
          type='error'
        />,
        status,
      );
    }

    return c.json({ error: err.message || 'Internal Server Error' }, status);
  };

  private registerDefaultHandlers() {
    // 401 Unauthorized
    this.register(401, (err, c) => {
      const isHtmx = !!(c.req.header('HX-Request')) === true;
      const acceptHeader = c.req.header('accept') || '';
      const isJson = acceptHeader.includes('application/json') || c.req.path.startsWith('/api/');

      if (isJson) {
        return c.json(
          { error: 'Unauthorized', message: err.message || 'Authentication required' },
          401,
        );
      }

      if (isHtmx) {
        c.header('HX-Redirect', '/auth/login');
        return c.text('Unauthorized, redirecting...', 401);
      }

      return c.redirect('/auth/login');
    });

    // 403 Forbidden
    this.register(403, (err, c) => {
      const isHtmx = !!(c.req.header('HX-Request')) === true;
      const acceptHeader = c.req.header('accept') || '';
      const isJson = acceptHeader.includes('application/json') || c.req.path.startsWith('/api/');

      if (isJson) {
        return c.json(
          { error: 'Forbidden', message: err.message || 'Insufficient permissions' },
          403,
        );
      }

      if (isHtmx) {
        c.header('HX-Retarget', '#toaster-container');
        c.header('HX-Reswap', 'beforeend');
        return c.html(
          <Notification
            message={err.message || 'User does not have permission to access the content.'}
            type='error'
          />,
          403,
        );
      }

      // Standard page request fallback
      return c.text('Forbidden: User does not have permission to access the content.', 403);
    });
  }
}

export const globalErrorRegistry = new ErrorInterceptorRegistry();
