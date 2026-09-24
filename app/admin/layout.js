import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { FiGrid, FiBox, FiCreditCard, FiTag, FiArrowLeft } from "react-icons/fi";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "admin") redirect("/");

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: FiGrid },
    { href: "/admin/products", label: "Products", icon: FiBox },
    { href: "/admin/categories", label: "Categories", icon: FiTag },
    { href: "/admin/payments", label: "Payments", icon: FiCreditCard },
  ];

  return (
    <div className="container-app grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="card p-3">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-slate-100"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="mt-2 flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 lg:border-t lg:border-slate-100 lg:pt-3"
            >
              <FiArrowLeft size={16} />
              Back to store
            </Link>
          </nav>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
