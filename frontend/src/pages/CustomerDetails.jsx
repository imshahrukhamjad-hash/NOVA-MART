import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/customers/${id}`);
        setCustomer(res.data.customer);
        setOrders(res.data.orders);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);

  if (loading || !customer) return <div className="card p-6">Loading...</div>;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{customer.name}</h3>
          <div className="text-muted text-sm">{customer.phone} • {customer.email}</div>
          {customer.address && <div className="text-sm mt-2">{customer.address}</div>}
          {customer.notes && <div className="text-sm mt-2 text-neutral-400">{customer.notes}</div>}
        </div>
      </div>

      <h4 className="font-semibold mb-2">Orders</h4>
      {orders.length === 0 ? (
        <div className="text-muted">No orders yet for this customer.</div>
      ) : (
        <div className="divide-y divide-neutral-800">
          {orders.map(o => (
            <div key={o._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{o.invoiceNumber}</div>
                <div className="text-muted text-sm">{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod} • RS {Math.round(o.total)}</div>
              </div>
              <div>
                <button onClick={() => navigate(`/dashboard/billing?orderId=${o._id}`)} className="btn btn-ghost">Open in Billing</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
