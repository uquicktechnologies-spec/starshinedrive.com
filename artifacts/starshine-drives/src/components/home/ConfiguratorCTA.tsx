import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

export function ConfiguratorCTA() {
  return (
    <section className="py-24 bg-gray-100 border-y border-gray-200">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Settings2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-6">
          Configure Your Drive
        </h2>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Use our advanced online configurator to find the perfect gearbox for your specific application. Filter by torque, ratio, mounting position, and output type in seconds.
        </p>
        <Link href="/configurator">
          <Button size="lg" className="px-10 py-6 text-lg font-semibold shadow-xl hover:-translate-y-1 transition-transform">
            Start Configurator
          </Button>
        </Link>
      </div>
    </section>
  );
}
