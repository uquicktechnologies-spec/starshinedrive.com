import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  Menu,
  Phone,
  Mail,
 
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoSrc from "@assets/starshine-logo.webp";
import { useListPublicWebCategories, useListPublicWebProducts } from "@workspace/api-client-react";
import type { WebProductSummary } from "@workspace/api-client-react";

type SubItem = { name: string; href: string };

type DropdownItem = {
  name: string;
  href: string;
  sub?: SubItem[];
};

type NavLink = {
  name: string;
  href: string;
  dropdown?: DropdownItem[];
};

const STATIC_NAV_LINKS: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Product", href: "/products" },
  { name: "Drive Configurator", href: "/configurator" },
  {
    name: "Solution",
    href: "/solutions",
    dropdown: [
      { name: "Food & Beverage", href: "/solutions/food-beverage" },
      { name: "Packaging", href: "/solutions/packaging" },
      { name: "Conveyor Systems", href: "/solutions/conveyor" },
      { name: "Crane & Hoist", href: "/solutions/crane-hoist" },
      { name: "Mining", href: "/solutions/mining" },
      { name: "Chemical Industry", href: "/solutions/chemical" },
    ],
  },
  {
    name: "Support",
    href: "/support",
    dropdown: [
      { name: "Download Center", href: "/download-center" },
      { name: "FAQs", href: "/faq" },
      { name: "Selection Guide", href: "/selection-guide" },
      { name: "Replacement / MRO", href: "/replacement-support" },
      { name: "Technical Support", href: "/support/technical" },
    ],
  },
  {
    name: "About",
    href: "/about",
    dropdown: [
      { name: "Company Profile", href: "/about/profile" },
      { name: "Manufacturing", href: "/about/manufacturing" },
      { name: "Quality & Certifications", href: "/quality-control" },
      { name: "News", href: "/about/news" },
    ],
  },
  { name: "Contact", href: "/contact" },
];

// ── Desktop mega-menu item (supports 1-level sub) ───────────────────────────
function DesktopDropdownItem({ item }: { item: DropdownItem }) {
  const [subOpen, setSubOpen] = useState(false);

  if (!item.sub) {
    return (
      <Link
        href={item.href}
        className="block px-4 py-2 text-sm text-gray-600 hover:text-accent hover:bg-gray-50 transition-colors"
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div
      className="relative group/sub"
      onMouseEnter={() => setSubOpen(true)}
      onMouseLeave={() => setSubOpen(false)}
    >
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:text-accent hover:bg-gray-50 cursor-pointer transition-colors">
        <span>{item.name}</span>
        <ChevronDown className="w-3 h-3 ml-2 -rotate-90 opacity-50" />
      </div>
      {subOpen && (
        <div className="absolute left-full top-0 w-64 bg-white shadow-xl border border-gray-100 rounded-r-md py-2 z-50">
          {item.sub.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="block px-4 py-2 text-sm text-gray-600 hover:text-accent hover:bg-gray-50 transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile accordion item (supports 2-level nesting) ──────────────────────
function MobileNavItem({
  link,
  onClose,
}: {
  link: NavLink;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [location] = useLocation();

  const isActive = location === link.href;

  if (!link.dropdown) {
    return (
      <div className="border-b border-white/10 last:border-0">
        <Link
          href={link.href}
          className={cn(
            "block px-4 py-4 text-base font-medium transition-colors",
            isActive ? "text-white font-bold" : "text-white hover:bg-white/10"
          )}
          onClick={onClose}
        >
          {link.name}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-b border-white/10 last:border-0">
      {/* Top-level toggle */}
      <button
        className={cn(
          "w-full flex items-center justify-between px-4 py-4 text-base font-medium transition-colors",
          "text-white hover:bg-white/10"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{link.name}</span>
        <ChevronDown
          className={cn("w-5 h-5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Dropdown items */}
      {open && (
        <div className="bg-primary/80">
          {link.dropdown.map((item) => {
            const subIsOpen = openSub === item.name;

            if (!item.sub) {
              return (
                <div key={item.name} className="border-t border-white/10">
                  <Link
                    href={item.href}
                    className="block px-6 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
                    onClick={onClose}
                  >
                    {item.name}
                  </Link>
                </div>
              );
            }

            return (
              <div key={item.name} className="border-t border-white/10">
                {/* Sub-category toggle */}
                <button
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors",
                    subIsOpen ? "bg-accent/80 text-white" : "text-white/90 hover:bg-white/10"
                  )}
                  onClick={() => setOpenSub(subIsOpen ? null : item.name)}
                >
                  <span>{item.name}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      subIsOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Sub-sub items */}
                {subIsOpen && (
                  <div className="bg-black/20">
                    {item.sub!.map((s) => (
                      <div key={s.name} className="border-t border-white/10">
                        <Link
                          href={s.href}
                          className="block pl-10 pr-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={onClose}
                        >
                          {s.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ──────────────────────────────────────────────────────────────
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { data: categories } = useListPublicWebCategories();
  const { data: allProducts } = useListPublicWebProducts<WebProductSummary[]>();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll while the mobile drawer is open so only the drawer's
  // own (thin, styled) scrollbar is used — otherwise the page behind it
  // scrolls too and shows the browser's bulky default scrollbar.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [mobileMenuOpen]);

  const productDropdown: DropdownItem[] | undefined =
    categories && categories.length > 0
      ? categories.map((c) => {
          const categoryProducts = (allProducts ?? []).filter((p) => p.categoryId === c.id);
          return {
            name: c.name,
            href: `/products?category=${c.slug}`,
            sub: categoryProducts.length > 0
              ? categoryProducts.map((p) => ({ name: p.name, href: `/products/${p.slug}` }))
              : undefined,
          };
        })
      : undefined;

  const NAV_LINKS: NavLink[] = STATIC_NAV_LINKS.map((link) =>
    link.name === "Product" ? { ...link, dropdown: productDropdown } : link
  );

  return (
    <>
      {/* Top Announcement Bar — scrolls away naturally, NOT sticky */}
      <div className="bg-gray-100 border-b border-gray-200 hidden sm:block">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span className="font-medium tracking-wide text-gray-800">STARSHINE DRIVE</span>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="hidden md:inline">OEM & Custom Solutions, Gear Reducer Manufacturer Since 1965</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              <a href="mailto:sales@starshinedrive.com" className="hover:text-primary transition-colors">
                sales@starshinedrive.com
              </a>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-primary">
              <Phone className="w-3 h-3" />
              <a href="tel:+919925001323">+91 9925001323</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation — sticky with fixed height, no dancing */}
      <header className={cn("w-full sticky top-0 z-50 py-3 transition-colors duration-200",
        mobileMenuOpen
          ? "bg-primary border-b border-white/10 shadow-none"
          : "bg-white shadow-sm border-b border-gray-100"
      )}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <img
              src={logoSrc}
              alt="Starshine Drive"
              className={cn("h-12 md:h-14 w-auto object-contain cursor-pointer transition-all duration-200",
                mobileMenuOpen && "brightness-0 invert"
              )}
              width={200}
              height={56}
              decoding="async"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <div key={link.name} className="relative group px-3 py-2">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-0.5 text-[14px] font-medium transition-colors whitespace-nowrap",
                    location === link.href
                      ? "text-accent"
                      : "text-gray-700 group-hover:text-accent"
                  )}
                >
                  {link.name}
                  {link.dropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                  )}
                </Link>

                {link.dropdown && (
                  <div className="absolute top-full left-0 mt-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 before:absolute before:top-[-10px] before:left-0 before:right-0 before:h-[10px]">
                    <div className="py-2">
                      {link.dropdown.map((item) => (
                        <DesktopDropdownItem key={item.name} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-4">
            <Link href="/get-quote">
              <Button size="lg" className="font-semibold px-6 bg-accent hover:bg-accent/90 border-0 text-white">Get Quote</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn("xl:hidden p-2 transition-colors duration-200",
              mobileMenuOpen ? "text-white" : "text-gray-600"
            )}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav — full-screen overlay */}
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-x-0 top-[72px] bottom-0 bg-primary z-40 overflow-y-auto thin-scrollbar-dark">

            {/* Nav items */}
            <div className="divide-y divide-white/10">
              {NAV_LINKS.map((link) => (
                <MobileNavItem
                  key={link.name}
                  link={link}
                  onClose={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="p-4 pt-6">
              <Link href="/get-quote" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full py-6 text-base font-semibold bg-accent hover:bg-accent/90 border-0">
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
