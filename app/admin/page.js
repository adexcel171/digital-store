import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";
import Order from "@/models/Order";
import User from "@/models/User";
import { formatCurrency } from "@/lib/format";
import { FiBox, FiUsers, FiShoppingBag, FiTrendingUp } from "react-icons/fi";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [productCount, userCount, orderCount, fundings, orders] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Transaction.find({ type: "FUND", status: "SUCCESS" }).lean(),
    Order.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const totalFunded = fundings.reduce((sum, t) => sum + t.amount, 0);

  return {
    productCount,
    userCount,
    orderCount,
    totalFunded,
    recentOrders: JSON.parse(JSON.stringify(orders)),
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Products", value: stats.productCount, icon: FiBox, color: "bg-brand-50 text-brand-700" },
    { label: "Users", value: stats.userCount, icon: FiUsers, color: "bg-purple-50 text-purple-700" },
    { label: "Orders", value: stats.orderCount, icon: FiShoppingBag, color: "bg-amber-50 text-amber-700" },
    {
      label: "Total funded",
      value: formatCurrency(stats.totalFunded),
      icon: FiTrendingUp,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Overview of your store's performance.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
              <c.icon size={18} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-ink-900">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-bold text-ink-900">Recent orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-50">
                    <td className="py-2.5 font-medium text-ink-800">{o.reference}</td>
                    <td className="py-2.5 text-slate-500">{o.items.length} item(s)</td>
                    <td className="py-2.5 font-semibold text-ink-900">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
