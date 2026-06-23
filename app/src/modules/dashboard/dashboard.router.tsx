/** @jsxImportSource hono/jsx */

import { Hono } from 'hono';
import { DashboardService } from './dashboard.service.ts';
import { DashboardFilters, DashboardPage } from './views/index.ts';
import { AuthEnv, requireAuth } from '../../core/middleware/auth.middleware.ts';

export class DashboardRouter {
  public router: Hono<AuthEnv>;

  constructor(private readonly dashboardService: DashboardService) {
    this.router = new Hono<AuthEnv>();
    this.router.use('*', requireAuth);
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get('/', async (c) => {
      const userId = c.get('userId');
      const month = c.req.query('month') || undefined;
      const category = c.req.query('category') || undefined;
      const type = c.req.query('type') || undefined;

      const filters = { month, category, type };
      const data = await this.dashboardService.getDashboardData(userId, filters);
      return c.html(<DashboardPage {...data} filters={filters} />);
    });

    this.router.get('/filters', async (c) => {
      const userId = c.get('userId');
      const month = c.req.query('month') || undefined;
      const category = c.req.query('category') || undefined;
      const type = c.req.query('type') || undefined;

      const selected = { month, category, type };
      const filters = await this.dashboardService.getDashboardFilterData(userId);
      return c.html(<DashboardFilters filters={filters} selected={selected} />);
    });
  }
}
