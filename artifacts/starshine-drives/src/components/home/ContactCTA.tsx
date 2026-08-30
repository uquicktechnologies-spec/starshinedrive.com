import { Button } from "@/components/ui/button";

export function ContactCTA() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="lg:w-1/2 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">Get a Quote</h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-lg">
              Have a specific application in mind? Our engineering team is ready to help you select or customize the perfect power transmission solution.
            </p>
            <div className="flex flex-col gap-4 text-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">1</div>
                <span>Submit your requirements</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">2</div>
                <span>Receive detailed technical specs & CAD</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">3</div>
                <span>Get competitive pricing within 24 hours</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full max-w-md lg:max-w-none">
            <div className="bg-white rounded-md shadow-2xl p-8">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input type="text" className="w-full h-12 px-4 rounded border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input type="email" className="w-full h-12 px-4 rounded border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" placeholder="john@company.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Product Interest</label>
                  <select className="w-full h-12 px-4 rounded border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white">
                    <option>Select a product category...</option>
                    <option>Helical Gear Reducers</option>
                    <option>Worm Gear Reducers</option>
                    <option>Planetary Gearboxes</option>
                    <option>Custom OEM Solution</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Message / Requirements</label>
                  <textarea className="w-full p-4 rounded border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none h-32" placeholder="Tell us about your application, torque requirements, etc..."></textarea>
                </div>

                <Button size="lg" className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow">
                  Submit Request
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
