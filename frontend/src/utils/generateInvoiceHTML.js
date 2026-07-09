export function generateInvoiceHTML(order, paymentBadgeHtml = '') {
  const lines = [];
  lines.push('<html>');
  lines.push('<head>');
  lines.push('<meta charset="utf-8" />');
  lines.push('<title>Bill</title>');
  lines.push('<style>');
  lines.push('body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }');
  lines.push('h1 { text-align: center; }');
  lines.push('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
  lines.push('th, td { border: 1px solid #e6e8eb; padding: 8px; text-align: left; }');
  lines.push('th { background-color: #f3f4f6; }');
  lines.push('.total { font-weight: bold; }');
  lines.push('.payment-badge { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }');
  lines.push('.center { text-align: center }');
  lines.push('</style>');
  lines.push('</head>');
  lines.push('<body>');
  lines.push('<h1>NOVA MART</h1>');
  lines.push('<p><strong>Invoice Number:</strong> ' + (order.invoiceNumber || '') + '</p>');
  lines.push('<p><strong>Customer:</strong> ' + (order.customerName || '') + '</p>');
  if (order.customerPhone) lines.push('<p><strong>Phone:</strong> ' + order.customerPhone + '</p>');
  lines.push('<p><strong>Payment Method:</strong> ' + (paymentBadgeHtml || (order.paymentMethod || 'Cash')) + '</p>');
  if (order.jazzCashNumber) lines.push('<p><strong>JazzCash Number:</strong> ' + order.jazzCashNumber + '</p>');
  lines.push('<p><strong>Date:</strong> ' + (new Date(order.createdAt || Date.now()).toLocaleDateString()) + '</p>');

  // Items table
  lines.push('<table>');
  lines.push('<thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>');
  lines.push('<tbody>');
  lines.push(order.items.map(item => '<tr>' + '<td>' + item.name + '</td>' + '<td>' + item.quantity + '</td>' + '<td>RS ' + item.price + '</td>' + '<td>RS ' + Math.round(item.price * item.quantity) + '</td>' + '</tr>').join(''));
  lines.push('</tbody>');

  lines.push('<tfoot>');
  lines.push('<tr><td colspan="3">Subtotal</td><td>RS ' + Math.round(order.subtotal) + '</td></tr>');
  if (order.taxPercent > 0) lines.push('<tr><td colspan="3">Tax (' + order.taxPercent + '%)</td><td>RS ' + Math.round(order.taxAmount) + '</td></tr>');
  if (order.discount > 0) lines.push('<tr><td colspan="3">Discount</td><td>-RS ' + Math.round(order.discount) + '</td></tr>');
  lines.push('<tr class="total"><td colspan="3">Total</td><td>RS ' + Math.round(order.total) + '</td></tr>');
  lines.push('</tfoot>');
  lines.push('</table>');

  lines.push('<div class="center" style="margin-top:20px; font-size:12px; color:#666; font-weight:bold;">');
  lines.push('<p>Co-Powered by NOVA MART | Contact US AT 0305-6616939 | Created by SHAHRUKH AMJAD | ALL RIGHTS RESERVED TO SHAHRUKH AMJAD</p>');
  lines.push('</div>');

  lines.push('</body></html>');
  return lines.join('\n');
}
