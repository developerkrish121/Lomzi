export const DELIVERY_FEE = 40;
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PACKING: 'Packing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
export const ACTIVE_TIMELINE = ['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function estimatedDelivery(createdAt = new Date()) {
  const from = new Date(createdAt);
  from.setMinutes(from.getMinutes() + 30);
  const to = new Date(createdAt);
  to.setMinutes(to.getMinutes() + 45);
  const formatter = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `${formatter.format(from)}–${formatter.format(to)}`;
}
