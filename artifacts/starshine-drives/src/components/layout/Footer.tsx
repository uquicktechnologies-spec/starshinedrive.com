import { useState } from "react";
import { Link } from "wouter";
import logoAltSrc from "@assets/starshine-logo-alt.webp";
import { cn } from "@/lib/utils";
import { useListPublicWebCategories } from "@workspace/api-client-react";

/* ── Collapsible section (mobile accordion, always-open on desktop) ── */
function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {/* Header — clickable on mobile, plain label on desktop */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-widest text-white pb-2 border-b border-gray-700 md:cursor-default"
      >
        {title}
        <span className="md:hidden text-gray-400 text-lg leading-none w-5 text-center select-none">
          {open ? "−" : "+"}
        </span>
      </button>
      {/* Links — visible always on desktop, toggled on mobile */}
      <div className={cn("overflow-hidden transition-all duration-200 md:block", open ? "mt-4" : "max-h-0 md:max-h-none")}>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const { data: categories } = useListPublicWebCategories();
  const productLinks = (categories ?? []).slice(0, 6).map((c) => ({
    label: c.name,
    href: `/products?category=${c.slug}`,
  }));

  return (
    <footer className="bg-[#0d1b2e] text-white pt-8 pb-4 md:pt-16 md:pb-8 border-t-4 border-accent">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-6 lg:gap-12 mb-0 md:mb-14">

          {/* ── Brand + Contact ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <img
              src={logoAltSrc}
              alt="Starshine Drive"
              className="h-12 w-auto object-contain object-left max-w-[200px]"
              width={200}
              height={48}
              loading="lazy"
              decoding="async"
            />
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Established in 1965, Starshine Drive is a globally trusted manufacturer of
              industrial gearboxes, speed reducers, and power transmission solutions.
            </p>

            {/* Contact cards */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  Ground Floor, Plot No 4, Survey No 251P2,<br />
                  Jetpar Road, Morbi – 363642,<br />
                  Gujarat, India
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-accent/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:+919925001323" className="text-sm text-gray-300 hover:text-accent transition-colors">
                  +91 9925001323
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-accent/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:sales@starshinedrive.com" className="text-sm text-gray-300 hover:text-accent transition-colors">
                  sales@starshinedrive.com
                </a>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/share/1LuQbsgD4K/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-sm bg-white/10 hover:bg-accent/80 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/starshinedrive?igsh=MWEydG85bTYycWV0aQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-sm bg-white/10 hover:bg-accent/80 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>

            {/* Cert badges */}
            <div className="flex flex-wrap gap-2">
              {["ISO 9001", "CE", "SGS", "UL"].map((cert) => (
                <span
                  key={cert}
                  className="text-xs font-bold border border-gray-600 text-gray-400 px-2.5 py-1 rounded-sm hover:border-accent hover:text-accent transition-colors"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* ── Products ── */}
          <div className="lg:col-span-2">
            <FooterSection title="Products">
              <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
                {(productLinks.length > 0 ? productLinks : [{ label: "All Products", href: "/products" }]).map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-accent transition-colors flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>

          {/* ── Industries ── */}
          <div className="lg:col-span-3">
            <FooterSection title="Industries">
              <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
                {[
                  ["Food & Beverage", "/solutions"],
                  ["Packaging Machinery", "/solutions"],
                  ["Conveyor Systems", "/solutions"],
                  ["Crane & Hoist", "/solutions"],
                  ["Mining Industry", "/solutions"],
                  ["Chemical & Process", "/solutions"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-accent transition-colors flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>

          {/* ── Company ── */}
          <div className="lg:col-span-3">
            <FooterSection title="Company">
              <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
                {[
                  ["About Us", "/about"],
                  ["Manufacturing", "/about"],
                  ["Certifications", "/about"],
                  ["Download Center", "/download-center"],
                  ["Get a Quote", "/get-quote"],
                  ["Contact Us", "/contact"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-accent transition-colors flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

            </FooterSection>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-800 pt-3 md:pt-7 mt-2 md:mt-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            <span className="block sm:inline">
              © {new Date().getFullYear()} Starshine Drive. All rights reserved.
            </span>
            <span className="hidden sm:inline">&nbsp;·&nbsp;</span>
            <span className="block sm:inline">
              OEM &amp; Custom Gear Reducer Manufacturer.
            </span>
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="/sitemap.xml" target="_blank" rel="noopener" className="hover:text-gray-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
