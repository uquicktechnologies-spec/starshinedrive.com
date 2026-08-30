import { useLocation, useSearch } from "wouter";
import { usePermissions } from "../hooks/use-permissions";
import { PermissionDenied } from "./crm/shared";
import { CrmLayout } from "./crm/layout";
import { Dashboard } from "./crm/dashboard";
import { Customers } from "./crm/customers";
import { Leads } from "./crm/leads";
import { Quotations } from "./crm/quotations";
import { QuotationForm } from "./crm/quotation-form";
import { Products } from "./crm/products";
import { WebProducts } from "./crm/web-products";
import { WebMedia } from "./crm/web-media";
import { SalesExecutives } from "./crm/sales-executives";
import { Settings } from "./crm/settings";
import { EmailIntegration } from "./crm/email-integration";
import { EmailMarketing } from "./crm/email-marketing";
import { MasterData } from "./crm/stock/master-data";
import { Purchases } from "./crm/stock/purchases";
import { PurchaseForm } from "./crm/stock/purchase-form";
import { Sales } from "./crm/stock/sales";
import { SaleForm } from "./crm/stock/sale-form";
import { StockManagement } from "./crm/stock/stock-management";
import { StockDashboard } from "./crm/stock/dashboard";
import { Reports } from "./crm/stock/reports";
import { StaffRoles } from "./crm/stock/staff-roles";

export type CrmView =
  | "dashboard" | "customers" | "leads" | "quotations" | "quotation-form" | "products" | "web-products" | "web-media" | "executives" | "settings"
  | "email-integration" | "email-marketing"
  | "stock-dashboard" | "master-data" | "purchases" | "purchase-form" | "sales" | "sale-form" | "stock-management" | "stock-pending" | "reports" | "staff-roles";

const VALID_VIEWS: readonly CrmView[] = [
  "dashboard", "customers", "leads", "quotations", "quotation-form", "products", "web-products", "web-media", "executives", "settings",
  "email-integration", "email-marketing",
  "stock-dashboard", "master-data", "purchases", "purchase-form", "sales", "sale-form", "stock-management", "stock-pending", "reports", "staff-roles",
];

function parseCrmSearch(search: string): { view: CrmView; editingId: number | null } {
  const params = new URLSearchParams(search);
  const rawView = params.get("view");
  const view = (VALID_VIEWS as readonly string[]).includes(rawView ?? "") ? (rawView as CrmView) : "dashboard";
  const rawId = params.get("id");
  const editingId = rawId !== null && !Number.isNaN(Number(rawId)) ? Number(rawId) : null;
  return { view, editingId };
}

export default function Crm() {
  // The active CRM section lives in the URL (?view=...&id=...), not just React state,
  // so a page refresh (or a bookmarked/shared link) lands back on the same screen
  // instead of always resetting to the Dashboard.
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { view, editingId } = parseCrmSearch(search);
  const { can } = usePermissions();

  const navigate = (v: CrmView, id: number | null = null) => {
    const params = new URLSearchParams();
    params.set("view", v);
    if (id !== null) params.set("id", String(id));
    setLocation(`/crm?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Every view below is gated on the same centralized permission matrix the API enforces
  // (`can(module, action)`), never on a raw role string -- this is the one place a view
  // maps to its module so both stay in lockstep with @workspace/permissions. A view whose
  // module the current role can't `view` renders <PermissionDenied /> instead of going
  // blank -- the backend still independently enforces on every request either way.
  return (
    <CrmLayout view={view} onNavigate={navigate}>
      {view === "dashboard" && (can("dashboard", "view") ? <Dashboard onNavigate={navigate} /> : <PermissionDenied />)}
      {view === "customers" && (can("customers", "view") ? <Customers /> : <PermissionDenied />)}
      {view === "leads" && (can("leads", "view") ? <Leads /> : <PermissionDenied />)}
      {view === "quotations" && (can("quotations", "view") ? <Quotations onNavigate={navigate} canExport={can("quotations", "export")} /> : <PermissionDenied />)}
      {view === "quotation-form" && (can("quotations", "view") ? <QuotationForm id={editingId} onNavigate={navigate} /> : <PermissionDenied />)}
      {view === "products" && (can("products", "view") ? <Products canEdit={can("products", "edit")} /> : <PermissionDenied />)}
      {view === "web-products" && (can("webContent", "view") ? <WebProducts canEdit={can("webContent", "edit")} /> : <PermissionDenied />)}
      {view === "web-media" && (can("webContent", "view") ? <WebMedia canEdit={can("webContent", "edit")} /> : <PermissionDenied />)}
      {view === "executives" && (can("salesExecutives", "view") ? <SalesExecutives canEdit={can("salesExecutives", "edit")} /> : <PermissionDenied />)}
      {view === "settings" && (can("settings", "view") ? <Settings canEdit={can("settings", "edit")} /> : <PermissionDenied />)}
      {view === "email-integration" && (can("emailIntegration", "view") ? <EmailIntegration /> : <PermissionDenied />)}
      {view === "email-marketing" && (can("emailMarketing", "view") ? <EmailMarketing /> : <PermissionDenied />)}
      {view === "stock-dashboard" && (can("stockDashboard", "view") ? <StockDashboard /> : <PermissionDenied />)}
      {view === "master-data" && (can("suppliers", "view") ? <MasterData canEdit={can("suppliers", "edit")} /> : <PermissionDenied />)}
      {view === "purchases" && (can("purchases", "view") ? <Purchases onNavigate={navigate} canEdit={can("purchases", "edit")} canExport={can("purchases", "export")} /> : <PermissionDenied />)}
      {view === "purchase-form" && (can("purchases", "view") ? <PurchaseForm id={editingId} onNavigate={navigate} /> : <PermissionDenied />)}
      {view === "sales" && (can("sales", "view") ? <Sales onNavigate={navigate} canCreate={can("sales", "create")} canEdit={can("sales", "edit")} canExport={can("sales", "export")} /> : <PermissionDenied />)}
      {view === "sale-form" && (can("sales", "view") ? <SaleForm id={editingId} onNavigate={navigate} /> : <PermissionDenied />)}
      {view === "stock-management" && (can("stock", "view") ? <StockManagement canEdit={can("stockAdjustments", "edit")} canEditMinStock={can("products", "edit")} /> : <PermissionDenied />)}
      {view === "stock-pending" && (can("stock", "view") ? <StockManagement canEdit={can("stockAdjustments", "edit")} canEditMinStock={can("products", "edit")} pendingOnly /> : <PermissionDenied />)}
      {view === "reports" && (can("reports", "view") ? <Reports canExport={can("reports", "export")} /> : <PermissionDenied />)}
      {view === "staff-roles" && (can("staffRoles", "view") ? <StaffRoles /> : <PermissionDenied />)}
    </CrmLayout>
  );
}
