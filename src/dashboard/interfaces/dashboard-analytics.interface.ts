export interface DashboardAnalytics {
  year: number;
  months: Array<{
    month: number; // 1 = January, 12 = December
    ordersPlaced: number;
    registeredUsersCumulative: number;
  }>;
  userGrowthPercent: number | null;
}