export interface DashboardSummary {
  users: {
    total: number;
    active: number;
    suspended: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  categories: number;
  products: number;
}