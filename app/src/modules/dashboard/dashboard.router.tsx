/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { DashboardService } from "./dashboard.service.ts";
import { DashboardPage, DashboardFilters } from "./views/index.ts";
import { requireAuth, AuthEnv } from "../../core/middleware/auth.middleware.ts";

export class DashboardRouter {
  public router: Hono<AuthEnv>;

  constructor(private readonly dashboardService: DashboardService) {
    this.router = new Hono<AuthEnv>();
    this.router.use("*", requireAuth);
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get("/", async (c) => {
      const userId = c.get('userId');
      const data = await this.dashboardService.getDashboardData(userId);
      return c.html(<DashboardPage {...data} />);
    });

    this.router.get("/filters", async (c) => {
      const userId = c.get('userId');
      const filters = await this.dashboardService.getDashboardFilterData(userId);
      return c.html(<DashboardFilters filters={filters} />);
    });
  }
}
