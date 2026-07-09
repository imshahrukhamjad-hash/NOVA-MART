export function computeSalesData(orders = [], monthsCount = 6, now = new Date()) {
  const months = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth() + 1}`, name: d.toLocaleString('default', { month: 'short' }), sales: 0 });
  }

  const monthMap = Object.fromEntries(months.map(m => [m.key, { ...m }]));
  const orderCounts = Object.fromEntries(months.map(m => [m.key, 0]));

  orders.forEach(order => {
    const date = new Date(order.date || order.createdAt || order.updatedAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (monthMap[key]) monthMap[key].sales += Number(order.total || 0);
    if (orderCounts[key] !== undefined) orderCounts[key]++;
  });

  const salesData = Object.values(monthMap).map(m => ({ name: m.name, sales: Math.round(m.sales) }));
  const ordersPerMonth = months.map(m => ({ name: m.name, value: orderCounts[m.key] }));

  return { salesData, ordersPerMonth };
}

export function hasSales(salesData = []) {
  return (salesData || []).some(d => Number(d.sales) > 0);
}
