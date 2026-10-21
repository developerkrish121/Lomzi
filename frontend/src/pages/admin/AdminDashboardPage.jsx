import { motion } from 'framer-motion';
import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  PackageCheck,
  PackageX,
  ShoppingBag,
  Tags,
  TriangleAlert,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminError, AdminSkeleton } from '@/components/admin/AdminStates';
import { useAdminDashboard } from '@/features/admin/hooks';
import { formatPrice } from '@/features/discovery/format';

const colors = ['#527765', '#d6a66b', '#173d32', '#86a091', '#bb8059', '#708379'];
const cardDefs = [
  ['Total revenue', 'revenue', CircleDollarSign, 'money'],
  ['Today’s revenue', 'todayRevenue', WalletCards, 'money'],
  ['Orders', 'orders', ClipboardList],
  ['Products', 'products', Boxes],
  ['Categories', 'categories', Tags],
  ['Customers', 'users', UsersRound],
  ['Pending orders', 'PENDING', TriangleAlert, 'status'],
  ['Delivered orders', 'DELIVERED', PackageCheck, 'status'],
  ['Low stock', 'lowStockProducts', ShoppingBag],
  ['Out of stock', 'outOfStockProducts', PackageX],
];
function MetricCard({ label, value, Icon, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_12px_35px_rgba(15,35,25,.06)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <strong className="mt-3 block font-display text-2xl font-black text-slate-900">
            {value}
          </strong>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-mint text-forest">
          <Icon className="size-5" />
        </span>
      </div>
    </motion.article>
  );
}
function ChartCard({ title, children }) {
  return (
    <section className="min-w-0 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_12px_35px_rgba(15,35,25,.06)] sm:p-6">
      <h2 className="mb-5 font-display text-lg font-extrabold text-slate-900">{title}</h2>
      <div className="h-64 w-full min-w-0">{children}</div>
    </section>
  );
}
export function AdminDashboardPage() {
  const query = useAdminDashboard();
  if (query.isLoading) return <AdminSkeleton rows={6} />;
  if (query.isError)
    return <AdminError message="Dashboard analytics could not be loaded." retry={query.refetch} />;
  const d = query.data;
  const metrics = cardDefs.map(([label, key, Icon, type]) => ({
    label,
    Icon,
    value:
      type === 'money'
        ? formatPrice(d[key])
        : type === 'status'
          ? d.orderStatusCounts[key]
          : (d.totals[key] ?? d[key]),
  }));
  const availability = [
    { name: 'Available', value: d.productAvailability.available ?? 0 },
    { name: 'Unavailable', value: d.productAvailability.unavailable ?? 0 },
  ];
  return (
    <>
      <AdminPageHeader
        eyebrow="Live operations"
        title="Dashboard"
        description="A real-time view of revenue, orders, inventory and catalogue health."
      />
      <div className="grid grid-cols-1 gap-4 min-[425px]:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} index={index} />
        ))}
      </div>
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.trends}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#527765" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#527765" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis width={44} />
              <Tooltip formatter={(v) => formatPrice(v)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#527765"
                fill="url(#revenueFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Orders trend">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip />
              <Bar dataKey="orders" fill="#173d32" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Category distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={d.categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {d.categoryDistribution.map((entry, i) => (
                  <Cell key={entry.name} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Product availability">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={availability}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
              >
                {availability.map((entry, i) => (
                  <Cell key={entry.name} fill={[colors[0], '#d0d8d3'][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
