import { ShieldCheck } from "lucide-react";

const CERTS = ["ISO 9001", "CE", "SGS", "UL"];

export function CertificationsSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary">Quality Certifications</h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {CERTS.map((cert) => (
            <div key={cert} className="flex flex-col items-center gap-4 group">
              <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 group-hover:border-accent group-hover:bg-accent/5 transition-colors">
                <ShieldCheck className="w-10 h-10 text-gray-400 group-hover:text-accent transition-colors" />
              </div>
              <span className="font-bold text-gray-700 tracking-wider group-hover:text-primary transition-colors">{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
