"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Sofa, 
  LayoutDashboard, 
  Users, 
  Store, 
  Ruler, 
  FileText, 
  ShoppingCart, 
  Package, 
  Palette,
  LogOut 
} from "lucide-react";
import styles from "./layout.module.css";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const role = (session?.user as any)?.role || "User";

  let pageTitle = 'Dashboard';
  if (pathname) {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments.pop();
    if (lastSegment) {
      pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
  }

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1.5rem', background: 'transparent' }}>
          <img src="/logo.png" alt="My Home Sofas Logo" style={{ width: '100%', maxWidth: '220px', height: 'auto', objectFit: 'contain' }} />
        </div>
        <nav className={styles.nav}>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            <LayoutDashboard size={20} /> <span className={styles.navText}>Dashboard</span>
          </Link>

          {role === 'Admin' && (
            <Link 
              href="/admin/stores" 
              className={`${styles.navItem} ${pathname?.startsWith('/admin/stores') ? styles.active : ''}`}
            >
              <Store size={20} /> <span className={styles.navText}>Stores</span>
            </Link>
          )}

          <Link 
            href="/customers" 
            className={`${styles.navItem} ${pathname?.startsWith('/customers') ? styles.active : ''}`}
          >
            <Users size={20} /> <span className={styles.navText}>Customers</span>
          </Link>

          <Link 
            href="/measurements" 
            className={`${styles.navItem} ${pathname?.startsWith('/measurements') ? styles.active : ''}`}
          >
            <Ruler size={20} /> <span className={styles.navText}>Measurements</span>
          </Link>

          <Link 
            href="/quotations" 
            className={`${styles.navItem} ${pathname?.startsWith('/quotations') ? styles.active : ''}`}
          >
            <FileText size={20} /> <span className={styles.navText}>Quotations</span>
          </Link>

          <Link 
            href="/orders" 
            className={`${styles.navItem} ${pathname?.startsWith('/orders') ? styles.active : ''}`}
          >
            <ShoppingCart size={20} /> <span className={styles.navText}>Orders</span>
          </Link>

          <Link 
            href="/inventory" 
            className={`${styles.navItem} ${pathname?.startsWith('/inventory') ? styles.active : ''}`}
          >
            <Package size={20} /> <span className={styles.navText}>Inventory</span>
          </Link>

          <Link 
            href="/materials" 
            className={`${styles.navItem} ${pathname?.startsWith('/materials') ? styles.active : ''}`}
          >
            <Palette size={20} /> <span className={styles.navText}>Materials</span>
          </Link>

          <Link 
            href="/expenses" 
            className={`${styles.navItem} ${pathname?.startsWith('/expenses') ? styles.active : ''}`}
          >
            <FileText size={20} /> <span className={styles.navText}>Expenses</span>
          </Link>

          <Link 
            href="/employees" 
            className={`${styles.navItem} ${pathname?.startsWith('/employees') ? styles.active : ''}`}
          >
            <Users size={20} /> <span className={styles.navText}>Employees</span>
          </Link>

          <Link 
            href="/invoices" 
            className={`${styles.navItem} ${pathname?.startsWith('/invoices') ? styles.active : ''}`}
          >
            <FileText size={20} /> <span className={styles.navText}>Invoices</span>
          </Link>

          <Link 
            href="/transporters" 
            className={`${styles.navItem} ${pathname?.startsWith('/transporters') ? styles.active : ''}`}
          >
            <Package size={20} /> <span className={styles.navText}>Logistics</span>
          </Link>

          {role === 'Admin' && (
            <Link 
              href="/settings" 
              className={`${styles.navItem} ${pathname?.startsWith('/settings') ? styles.active : ''}`}
            >
              <LayoutDashboard size={20} /> <span className={styles.navText}>Settings</span>
            </Link>
          )}
        </nav>

        <div className={styles.userArea}>
          <div className={`mb-4 ${styles.userInfo}`}>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{session.user?.name}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Role: {role}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`btn btn-outline`}
            style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem' }}
          >
            <LogOut size={18} /> <span className={styles.logoutText}>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>
            {pageTitle}
          </h2>
          <div className={styles.headerActions}>
            {/* Header actions like notifications */}
          </div>
        </header>

        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
