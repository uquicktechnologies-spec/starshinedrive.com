import { ReactNode, useEffect, useRef, useState } from "react";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import {
  LayoutDashboard, Users, UserPlus, FileText, Package, Briefcase, Settings, LogOut,
  Boxes, Database, ShoppingBag, ShoppingCart, ClipboardList, BarChart3, ShieldCheck, Search, Bell, Mail, Globe,
  ImagePlus, Megaphone,
} from "lucide-react";
import logoSrc from "@assets/starshine-logo.webp";
import type { CrmView } from "../crm";
import { useListStockNotifications, useSearchStock, getListStockNotificationsQueryKey, getSearchStockQueryKey } from "@workspace/api-client-react";
import type { SearchStockQueryResult } from "@workspace/api-client-react";
import { usePermissions } from "../../hooks/use-permissions";
import type { CrmModule } from "@workspace/permissions";

interface LayoutProps {
  view: CrmView;
  onNavigate: (view: CrmView, id?: number | null) => void;
  children: ReactNode;
}

export function CrmLayout({ view, onNavigate, children }: LayoutProps) {
  const queryClient = useQueryClient();
  const { can, role, email } = usePermissions();
  const signOut = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/auth/logout`, { method: "POST", credentials: "include" });
    queryClient.clear();
    window.location.href = import.meta.env.BASE_URL;
  };
  const roleLabel = role === "admin" ? "Admin" : role === "manager" ? "Manager" : "Staff Member";

  // Nav visibility is derived from the centralized permission matrix (one module -> one nav
  // entry each), not from ad hoc role lists -- add/adjust access in @workspace/permissions,
  // never by hardcoding a role check here.
  type NavItem = { id: string; label: string; icon: typeof LayoutDashboard; aliases?: string[]; module: CrmModule };

  const visible = (items: NavItem[]) => items.filter(item => can(item.module, "view"));

  const crmNav = visible([
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
    { id: "leads", label: "Unconverted Leads", icon: UserPlus, module: "leads" },
    { id: "customers", label: "Customers", icon: Users, module: "customers" },
    { id: "quotations", label: "Quotations", icon: FileText, aliases: ["quotation-form"], module: "quotations" },
  ]);

  const productNav = visible([
    { id: "products", label: "Products & Services", icon: Package, module: "products" },
    { id: "web-media", label: "Image Library", icon: ImagePlus, module: "webContent" },
  ]);

  const stockNav = visible([
    { id: "stock-dashboard", label: "Stock Dashboard", icon: Boxes, module: "stockDashboard" },
    { id: "purchases", label: "Purchases", icon: ShoppingBag, module: "purchases" },
    { id: "sales", label: "Sales", icon: ShoppingCart, module: "sales" },
    { id: "stock-management", label: "Stock Management", icon: ClipboardList, module: "stock" },
    { id: "reports", label: "Reports", icon: BarChart3, module: "reports" },
  ]);

  const staffNav = visible([
    { id: "executives", label: "Sales Executives", icon: Briefcase, module: "salesExecutives" },
    { id: "staff-roles", label: "Staff Roles", icon: ShieldCheck, module: "staffRoles" },
  ]);

  const bottomNav = visible([
    { id: "web-products", label: "Website Products", icon: Globe, module: "webContent" },
    { id: "master-data", label: "Master Data", icon: Database, module: "suppliers" },
    { id: "email-integration", label: "Email Integration", icon: Mail, module: "emailIntegration" },
    { id: "email-marketing", label: "Bulk Email Marketing", icon: Megaphone, module: "emailMarketing" },
    { id: "settings", label: "Settings", icon: Settings, module: "settings" },
  ]);

  const renderItem = (item: NavItem) => {
    const isActive = view === item.id || item.aliases?.includes(view);
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id as CrmView)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold transition-colors ${
          isActive ? "bg-[#EF6F24] text-white" : "hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
        {item.label}
      </button>
    );
  };

  return (
    <div className="crm-root flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#093C71] text-slate-300 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-5 border-b border-white/10 bg-black/10">
          <img src={logoSrc} alt="Starshine Drive" className="h-9 w-auto object-contain brightness-0 invert" />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-4">
          <div>
            <div className="px-3 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Sales &amp; CRM</div>
            <div className="space-y-1.5">{crmNav.map(renderItem)}</div>
          </div>
          <div>
            <div className="px-3 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Stock</div>
            <div className="space-y-1.5">{stockNav.map(renderItem)}</div>
          </div>
          {staffNav.length > 0 && (
            <div>
              <div className="px-3 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Staff</div>
              <div className="space-y-1.5">{staffNav.map(renderItem)}</div>
            </div>
          )}
          <div>
            <div className="px-3 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Product</div>
            <div className="space-y-1.5">{productNav.map(renderItem)}</div>
          </div>
          {bottomNav.length > 0 && (
            <div>
              <div className="px-3 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Administration</div>
              <div className="space-y-1.5">{bottomNav.map(renderItem)}</div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-sm font-semibold text-white truncate">{roleLabel}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{email}</div>
            </div>
            <button 
              onClick={() => void signOut()}
              className="p-2 rounded-sm hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <HeaderBar onNavigate={onNavigate} />
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function HeaderBar({ onNavigate }: { onNavigate: (view: CrmView, id?: number | null) => void }) {
  const client = useQueryClient();
  const { can } = usePermissions();
  // Both the header search and the notifications bell hit stock-backed
  // endpoints (`/crm/stock/search`, `/crm/stock/notifications`) that the API
  // gates on `stock:view`. Roles without that grant (e.g. plain "staff")
  // would otherwise see a search box / bell that always errors out -- hide
  // them instead so restricted users never see a feature they can't use.
  const canSearchStock = can("stock", "view");
  const [query, setQuery] = useState("");
  // Debounce the network-facing query so a fast typist doesn't fire one
  // search request per keystroke -- only the value after a 300ms pause
  // triggers useSearchStock below.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const { data: results, isLoading: searchLoading, error: searchError } = useSearchStock({ q: debouncedQuery }, { query: { queryKey: getSearchStockQueryKey({ q: debouncedQuery }), enabled: canSearchStock && debouncedQuery.length > 0, placeholderData: keepPreviousData } } as Parameters<typeof useSearchStock<SearchStockQueryResult>>[1]);
  const { data: notifications, error: notificationsError } = useListStockNotifications({ query: { queryKey: getListStockNotificationsQueryKey(), enabled: canSearchStock, placeholderData: keepPreviousData } });

  const handleResultClick = (kind: string) => {
    setShowResults(false);
    setQuery("");
    if (kind === "product") onNavigate("products");
    else if (kind === "purchase") onNavigate("purchases");
    else if (kind === "sale") onNavigate("sales");
    else if (kind === "supplier" || kind === "warehouse" || kind === "category") onNavigate("master-data");
  };

  return (
    <div className="h-16 flex items-center justify-between gap-4 px-8 border-b border-slate-200 bg-white shrink-0">
      <div className="relative w-full max-w-sm">
        {canSearchStock && <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        {canSearchStock && <input
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => { blurTimer.current = setTimeout(() => setShowResults(false), 150); }}
          placeholder="Search products, purchases, sales, suppliers..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#093C71]/30"
        />}
        {canSearchStock && showResults && query && (
          <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-lg" onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}>
            {searchLoading ? (
              <div className="px-3 py-3 text-sm text-slate-500">Loading data...</div>
            ) : searchError ? (
              <div className="px-3 py-3 text-sm text-red-600">Unable to load data. Please try again.</div>
            ) : results?.length ? (
              results.map(r => (
                <button key={`${r.kind}-${r.id}`} onClick={() => handleResultClick(r.kind)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                  <div className="font-bold text-slate-800">{r.label}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{r.kind} · {r.sublabel}</div>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500">No records found.</div>
            )}
          </div>
        )}
      </div>
      {canSearchStock && <div className="relative">
        <button
          onClick={() => { setShowNotifications(v => !v); client.invalidateQueries({ queryKey: getListStockNotificationsQueryKey() }); }}
          className="relative p-2 rounded-sm hover:bg-slate-100 text-slate-500"
        >
          <Bell size={18} />
          {!!notifications?.length && <span className="absolute -top-0.5 -right-0.5 bg-[#EF6F24] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{Math.min(notifications.length, 9)}</span>}
        </button>
        {showNotifications && (
          <div className="absolute right-0 z-30 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-lg" onMouseLeave={() => setShowNotifications(false)}>
            <div className="px-4 py-2.5 border-b border-slate-100 font-bold text-sm text-slate-700">Notifications</div>
            {notificationsError ? (
              <div className="px-4 py-6 text-center text-sm text-red-600">Unable to load data. Please try again.</div>
            ) : notifications?.length ? notifications.map(n => (
              <div key={n.id} className="px-4 py-2.5 border-b border-slate-100 last:border-b-0 text-sm">
                <div className={`font-semibold ${n.severity === "critical" ? "text-red-600" : n.severity === "warning" ? "text-amber-600" : "text-slate-700"}`}>{n.message}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString("en-IN")}</div>
              </div>
            )) : <div className="px-4 py-6 text-center text-sm text-slate-500">No records found.</div>}
          </div>
        )}
      </div>}
    </div>
  );
}
