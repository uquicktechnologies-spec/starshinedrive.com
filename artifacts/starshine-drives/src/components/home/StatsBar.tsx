import { History, Factory, Truck, Award } from "lucide-react";

const STATS = [
  { icon: History, title: "Since 1965",       subtitle: "58 Years Experience"    },
  { icon: Factory, title: "Start From 1 Unit", subtitle: "No MOQ Required"        },
  { icon: Truck,   title: "15 Days Delivery",  subtitle: "Fast Lead Time"         },
  { icon: Award,   title: "ISO / CE / SGS / UL", subtitle: "Multiple Certifications" },
];

export function StatsBar() {
  return (
    <div className="bg-white border-y border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            // On mobile (2-col): right border on col-0 items (0,2); bottom border on row-0 items (0,1)
            // On desktop (4-col): right border on items 0,1,2 only
            const borderClasses = [
              i % 2 === 0 ? "border-r border-gray-100" : "",          // mobile: right on left-col
              i < 2 ? "border-b border-gray-100" : "",                 // mobile: bottom on top row
              i < 3 ? "lg:border-r lg:border-gray-100" : "lg:border-r-0", // desktop: right except last
              "lg:border-b-0",                                          // desktop: no bottom border
            ].join(" ");
            return (
              <div
                key={stat.title}
                className={`flex flex-col items-center justify-center py-8 px-4 gap-4 text-center ${borderClasses}`}
              >
                <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-heading font-bold text-gray-900 text-[15px] leading-snug tracking-tight">
                    {stat.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
