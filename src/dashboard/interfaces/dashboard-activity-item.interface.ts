export interface DashboardActivityItem {
  id: string;
  type: 'ORDER_PLACED' | 'USER_REGISTERED';
  entityId: string;
  title: string;
  occurredAt: string;
}