import { Clock, Globe2, Lightbulb, BadgeCheck } from "lucide-react";

const REASONS = [
  {
    icon: Clock,
    title: "58 Years Experience",
    desc: "Established in 1965, decades of manufacturing excellence and continuous innovation."
  },
  {
    icon: Globe2,
    title: "Global Delivery",
    desc: "Export to 80+ countries with reliable logistics and worldwide distribution networks."
  },
  {
    icon: Lightbulb,
    title: "Custom Solutions",
    desc: "OEM/ODM design services to meet any specific application requirements."
  },
  {
    icon: BadgeCheck,
    title: "Quality Certified",
    desc: "ISO9001, CE, SGS, UL certified products guaranteeing reliable performance."
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-primary text-white relative overflow-hidden">
      {/* Abstract background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Why Starshine</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">The Trusted Manufacturer Choice</h3>
          <p className="text-blue-100">
            We don't just build gearboxes; we engineer reliable power transmission solutions that keep global industries moving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {REASONS.map((reason, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20 group-hover:bg-accent group-hover:border-accent transition-colors duration-300 shadow-lg">
                <reason.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-heading font-bold mb-3">{reason.title}</h4>
              <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
                {reason.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
