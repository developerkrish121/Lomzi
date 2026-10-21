import { adminDashboardService } from '@/services/adminDashboardService.js';

export const adminDashboardController = {
  async get(_req, res) {
    return res.status(200).json({ success: true, dashboard: await adminDashboardService.get() });
  },
};
