import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { HtmlEscapedString } from 'hono/utils/html';

export type ErrorType = 'FORM_VALIDATION' | 'GLOBAL_TOASTER';

export class AppException extends HTTPException {
  public errorType: ErrorType;
  public htmxFragment: string | HtmlEscapedString | Promise<HtmlEscapedString>;

  constructor(
    status: ContentfulStatusCode,
    options: {
      message: string;
      errorType: ErrorType;
      htmxFragment: string | HtmlEscapedString | Promise<HtmlEscapedString>;
      cause?: unknown;
    },
  ) {
    super(status, { message: options.message, cause: options.cause });
    this.errorType = options.errorType;
    this.htmxFragment = options.htmxFragment;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
