import { Hono } from "hono";
import { z } from 'npm:zod@4.4.3';
import { zValidator } from '@hono/zod-validator';
import { setCookie, deleteCookie } from 'hono/cookie';

import { AuthService } from './auth.service.ts';
import { AppException } from '../../core/AppException.ts';
import { Notification } from '../../ui/components/Notification.tsx';
import { redirectIfAuth } from '../../core/middleware/auth.middleware.ts';
import { AuthorizationPage, AuthPageEnum, LoginCard } from "./views/index.ts";

const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(6),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  error: "Confirm password do not match",
  path: ["confirm_password"],
});

export class AuthRouter {
  public router;

  constructor(private readonly authService: AuthService) {
    this.router = new Hono();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get("/login", redirectIfAuth, (c) => {
      return c.html(<AuthorizationPage authPageType={AuthPageEnum.login} />);
    }); 

    this.router.get("/register", redirectIfAuth, (c) => {
      return c.html(<AuthorizationPage authPageType={AuthPageEnum.register} />);
    });

    this.router.post("/logout", (c) => {
      deleteCookie(c, "token", {
        path: "/",
      });
      const isHtmx = c.req.header('HX-Request') === 'true';
      if (isHtmx) {
        c.header("HX-Redirect", "/auth/login");
        return c.text("Logged out");
      }
      return c.redirect("/auth/login");
    });

    this.router.post("/login", zValidator("form", loginSchema, (result, _c) => {
      if (!result.success) {
        throw new AppException(400, {
          errorType: "FORM_VALIDATION",
          message: "Invalid credentials",
          htmxFragment: <Notification message="Invalid credentials" type='error' />,
        });
      }
    }), async (c) => {
      const { email, password } = c.req.valid("form");
      const loginRes = await this.authService.login(email, password);
      if (loginRes) {
        setCookie(c, "token", loginRes, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        });
        c.header("HX-Redirect", "/dashboard");
        return c.text("Authenticated");
      }
      throw new AppException(400,
        {
          message: "Invalid Credentials",
          errorType: "FORM_VALIDATION",
          htmxFragment: <Notification message="Invalid Credentials" type='error' />,
        }
      )
    });

    this.router.post("/register",zValidator("form", registerSchema, (result, _c) => {
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        const allErrors = [
          ...tree.errors,
          ...Object.values(tree.properties || {}).flatMap((prop) => prop.errors),
        ];
        const errorMessage = allErrors.join("\n");
        throw new AppException(400, {
          errorType: "FORM_VALIDATION",
          message: errorMessage,
          htmxFragment: <Notification message={errorMessage} type='error' />,
        });
      }
    }), async (c) => {
      const { email, password } = c.req.valid("form");
      const { errorMessage, result: createUserResult } = await this.authService.register(email, password);
      if (createUserResult) {
        c.header("HX-Push-Url", "/auth/login");
        c.header("HX-Retarget", "#auth-card");
        c.header("HX-Reswap", "innerHTML");
        return c.html(
          <>
            <h1 id="pageTitle" class="text-3xl mb-6 text-[#2D2A26]">Login</h1>
            <LoginCard />
            <div id="toaster-container" hx-swap-oob="beforeend">
              <Notification message="You can login using your credentials now!" type="success" />
            </div>
          </>
        ); 
      }
      throw new AppException(
        400,
        {
          message: "Something went wrong",
          errorType: "FORM_VALIDATION",
          htmxFragment: <Notification message={errorMessage || ""} type='error' />,
        },
      );
    });
  }
}
