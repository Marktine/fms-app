import { Hono } from 'hono';
import { AuthRouter } from './modules/auth/auth.router.tsx';
import { AuthService } from './modules/auth/auth.service.ts';
import { AuthRepository } from './modules/auth/auth.repository.ts';
import { DashboardRouter } from './modules/dashboard/dashboard.router.tsx';
import { DashboardService } from './modules/dashboard/dashboard.service.ts';
import { DashboardRepository } from './modules/dashboard/dashboard.repository.ts';

export const router = new Hono();

/*
 * Auth modules
 */
const authRepo = new AuthRepository();
const authService = new AuthService(authRepo);
const authModule = new AuthRouter(authService);

router.route('/auth', authModule.router);

/*
 * Dashboard modules
 */
const dashboardRepo = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepo);
const dashboardModule = new DashboardRouter(dashboardService);

router.route('/dashboard', dashboardModule.router);

router.get('/', (c) => {
  return c.redirect('/auth/login');
});
