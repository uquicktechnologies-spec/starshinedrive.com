import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Starshine's helical gear reducers have been powering our main conveyor lines for 5 years without a single failure. The build quality is exceptional.",
    author: "James Anderson",
    role: "Plant Manager, TechPack Solutions"
  },
  {
    quote: "Finding a manufacturer who can handle custom servo gearbox orders at scale with consistent quality was difficult until we partnered with Starshine Drive.",
    author: "Elena Rodriguez",
    role: "Engineering Director, AutoMotion"
  },
  {
    quote: "The 15-day delivery time for standard units has significantly reduced our inventory costs. Their customer support team is always responsive.",
    author: "Michael Chang",
    role: "Procurement Head, HeavyLift Systems"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Testimonials</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-primary">Trusted by Global Manufacturers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((test, i) => (
            <div key={i} className="bg-white p-8 rounded-md shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-8 italic">"{test.quote}"</p>
              <div>
                <h5 className="font-bold text-primary">{test.author}</h5>
                <p className="text-sm text-gray-500">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
