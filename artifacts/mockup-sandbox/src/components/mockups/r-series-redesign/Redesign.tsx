import React from 'react';
import { 
  CheckCircle2, 
  Settings2, 
  ShieldCheck, 
  Droplets, 
  ThermometerSun, 
  Zap, 
  ChevronRight, 
  Download, 
  Mail, 
  ArrowRight,
  Target,
  Gauge,
  Factory,
  HardDrive
} from 'lucide-react';
import './_group.css';

export function Redesign() {
  return (
    <div className="min-h-screen bg-[#081c38] text-white selection:bg-[#EF6F24] selection:text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Navigation / Header - Minimal */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#081c38]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EF6F24] flex items-center justify-center font-condensed font-bold text-lg">S</div>
            <span className="font-condensed font-bold tracking-wider text-sm uppercase text-white/90">Starshine Drive</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#specs" className="text-white/60 hover:text-white transition-colors">Specifications</a>
            <a href="#mounting" className="text-white/60 hover:text-white transition-colors">Mounting</a>
            <a href="#applications" className="text-white/60 hover:text-white transition-colors">Applications</a>
            <a href="#models" className="text-white/60 hover:text-white transition-colors">Models</a>
            <button className="bg-[#EF6F24] hover:bg-[#d65f1a] text-white px-5 py-2 transition-colors font-condensed tracking-wide uppercase text-xs">
              Request Quote
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden tech-grid-lines">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(9,60,113,0.4)_0%,transparent_60%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-8 animate-fade-in-up">
              <div className="flex flex-wrap gap-3">
                <span className="border border-[#EF6F24]/30 bg-[#EF6F24]/10 text-[#EF6F24] px-3 py-1 text-xs font-condensed uppercase tracking-wider">Start From 1 Unit</span>
                <span className="border border-white/20 bg-white/5 text-white/80 px-3 py-1 text-xs font-condensed uppercase tracking-wider">15 Days Delivery</span>
                <span className="border border-white/20 bg-white/5 text-white/80 px-3 py-1 text-xs font-condensed uppercase tracking-wider">OEM Support</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-condensed font-bold leading-[1.1] tracking-tight">
                  R Series <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Helical Gear Reducer</span>
                </h1>
                <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                  The R Series helical gear reducer is an inline, shaft-mounted power transmission solution engineered for demanding industrial environments. With up to 4 helical gear stages, it delivers exceptional efficiency and quiet operation across a wide torque range.
                </p>
                <p className="text-sm text-[#EF6F24] font-medium tracking-wide">
                  Inline helical reducer for shaft-aligned industrial drives, conveyors, process equipment, and OEM machinery.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-xs text-white/40 font-condensed uppercase tracking-widest mb-1">Output Speed</div>
                  <div className="text-2xl font-light">5<span className="text-[#EF6F24]">/</span>415 <span className="text-sm text-white/40">r/min</span></div>
                </div>
                <div>
                  <div className="text-xs text-white/40 font-condensed uppercase tracking-widest mb-1">Power Range</div>
                  <div className="text-2xl font-light">0.12<span className="text-[#EF6F24]">/</span>160 <span className="text-sm text-white/40">kW</span></div>
                </div>
                <div>
                  <div className="text-xs text-white/40 font-condensed uppercase tracking-widest mb-1">Max Torque</div>
                  <div className="text-2xl font-light">18,000 <span className="text-sm text-white/40">N·m</span></div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="bg-[#EF6F24] hover:bg-[#d65f1a] text-white px-8 py-4 flex items-center gap-3 transition-colors group font-condensed uppercase tracking-wider text-sm font-medium">
                  Send Requirements
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border border-white/20 hover:bg-white/5 text-white px-8 py-4 flex items-center gap-3 transition-colors font-condensed uppercase tracking-wider text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Datasheet
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative animate-fade-in-up delay-200">
              <div className="relative z-10 w-full aspect-square max-w-[600px] mx-auto glow-orange rounded-full">
                <img 
                  src="/__mockup/images/r-series/hero.webp" 
                  alt="R Series Helical Gear Reducer" 
                  className="w-full h-full object-contain drop-shadow-2xl scale-110"
                />
              </div>
              
              {/* Technical annotations */}
              <div className="absolute top-1/4 right-0 flex items-center gap-3 opacity-80">
                <div className="h-[1px] w-12 bg-[#EF6F24]"></div>
                <div className="text-xs font-condensed uppercase tracking-widest text-[#EF6F24]">Hardened Gears</div>
              </div>
              <div className="absolute bottom-1/4 left-0 flex items-center gap-3 flex-row-reverse opacity-80">
                <div className="h-[1px] w-12 bg-[#EF6F24]"></div>
                <div className="text-xs font-condensed uppercase tracking-widest text-[#EF6F24]">Modular Flange</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Technical Specifications Grid */}
      <section id="specs" className="py-24 bg-[#051122] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-condensed uppercase text-[#EF6F24] tracking-widest mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Core Data
              </h2>
              <h3 className="text-3xl font-condensed font-semibold">Technical Specifications</h3>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-sm text-white/50 bg-white/5 px-3 py-1 rounded-sm"><ShieldCheck className="w-4 h-4 text-[#EF6F24]"/> ISO 9001</span>
              <span className="flex items-center gap-2 text-sm text-white/50 bg-white/5 px-3 py-1 rounded-sm"><ShieldCheck className="w-4 h-4 text-[#EF6F24]"/> CE</span>
              <span className="flex items-center gap-2 text-sm text-white/50 bg-white/5 px-3 py-1 rounded-sm"><ShieldCheck className="w-4 h-4 text-[#EF6F24]"/> SGS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {[
              { label: "Gear Stages", value: "2–4", icon: Settings2 },
              { label: "Output Torque", value: "85–18,000 N·m", icon: Zap },
              { label: "Output Speed", value: "5–415 r/min", icon: Gauge },
              { label: "Power Range", value: "0.12–160 kW", icon: Target },
              { label: "Gear Ratio", value: "5–200", icon: Settings2 },
              { label: "Mounting", value: "Foot / Flange / Shaft", icon: HardDrive },
              { label: "Protection", value: "IP55 / IP65", icon: ShieldCheck },
              { label: "Lubrication", value: "Oil bath splash", icon: Droplets },
            ].map((spec, i) => (
              <div key={i} className="bg-[#051122] p-8 hover:bg-[#081c38] transition-colors group">
                <spec.icon className="w-6 h-6 text-[#EF6F24] mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="text-xs text-white/40 font-condensed uppercase tracking-widest mb-2">{spec.label}</div>
                <div className="text-lg font-medium tracking-wide">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-sm font-condensed uppercase text-[#EF6F24] tracking-widest mb-2 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Engineering
            </h2>
            <h3 className="text-3xl font-condensed font-semibold">Key Features</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "High Reduction Ratios", desc: "Up to 4-stage helical gear sets arranged compactly for maximum efficiency and reduction.", icon: Settings2 },
              { title: "Long Service Life", desc: "Gears are carburized, hardened, and precision-ground for durability and low noise.", icon: Factory },
              { title: "Modular Architecture", desc: "Easily adapt to foot, flange, or shaft mount configurations without core redesign.", icon: HardDrive },
              { title: "Harsh Environments", desc: "IP55/IP65 protection classes available, shielding internals from dust and water jets.", icon: ShieldCheck },
              { title: "Global Compatibility", desc: "Input shafts and flanges designed for seamless integration with standard IEC motors.", icon: Zap },
              { title: "High Temp Resilience", desc: "Premium Viton seals available for applications operating in elevated temperatures.", icon: ThermometerSun },
            ].map((feat, i) => (
              <div key={i} className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col gap-4 group">
                <div className="w-12 h-12 bg-[#093C71]/50 border border-[#EF6F24]/30 flex items-center justify-center text-[#EF6F24] group-hover:scale-110 transition-transform">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium">{feat.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mounting Variants */}
      <section id="mounting" className="py-24 bg-white/5 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-sm font-condensed uppercase text-[#EF6F24] tracking-widest mb-2">Configurations</h2>
            <h3 className="text-3xl font-condensed font-semibold mb-4">Mounting Variants</h3>
            <p className="text-white/50 text-sm">Versatile integration options to suit your machine's structural requirements.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#051122] border border-white/10 p-10 flex flex-col items-center group">
              <div className="h-64 w-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,111,36,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img src="/__mockup/images/r-series/foot.webp" alt="R Foot-Mounted" className="h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-xl font-medium mb-2 border-b border-[#EF6F24]/30 pb-2">R Series (Foot-Mounted)</h4>
              <p className="text-sm text-white/50 text-center max-w-sm">Standard base mounting for horizontal installations on structural beds.</p>
            </div>
            <div className="bg-[#051122] border border-white/10 p-10 flex flex-col items-center group">
              <div className="h-64 w-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,60,113,0.3)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img src="/__mockup/images/r-series/flange.webp" alt="RF Flange-Mounted" className="h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-xl font-medium mb-2 border-b border-[#EF6F24]/30 pb-2">RF Series (Flange-Mounted)</h4>
              <p className="text-sm text-white/50 text-center max-w-sm">Direct coupling to machine walls or agitator vessels via B5/B14 flanges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Applications */}
      <section id="applications" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="text-sm font-condensed uppercase text-[#EF6F24] tracking-widest mb-2 flex items-center gap-2">
                <Factory className="w-4 h-4" /> Deployment
              </h2>
              <h3 className="text-3xl font-condensed font-semibold">Typical Applications</h3>
            </div>
            <button className="text-sm text-white hover:text-[#EF6F24] transition-colors flex items-center gap-2 font-condensed uppercase tracking-wider">
              View All Industries <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Belt Conveyor Systems", img: "app-belt.webp" },
              { name: "Ceramic Kiln Roller", img: "app-ceramic.webp" },
              { name: "Food & Bev Transfer", img: "app-food.webp" },
              { name: "Glass Sheet Rollers", img: "app-glass.webp" },
              { name: "Industrial Mixers", img: "app-mixer.webp" },
              { name: "Packaging Modules", img: "app-packing.webp" },
              { name: "Roller Conveyor Lines", img: "app-roller.webp" },
              { name: "Woodworking Feed", img: "app-wood.webp" },
            ].map((app, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden bg-[#051122]">
                <img 
                  src={`/__mockup/images/r-series/${app.img}`} 
                  alt={app.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 mix-blend-luminosity group-hover:mix-blend-normal"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081c38] via-[#081c38]/40 to-transparent"></div>
                <div className="absolute inset-0 border border-white/10 group-hover:border-[#EF6F24]/50 transition-colors m-2"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="w-8 h-px bg-[#EF6F24] mb-3 group-hover:w-12 transition-all"></div>
                  <h4 className="text-sm md:text-base font-medium leading-tight group-hover:text-[#EF6F24] transition-colors">{app.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Range Table */}
      <section id="models" className="py-24 bg-[#051122] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-sm font-condensed uppercase text-[#EF6F24] tracking-widest mb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Data Sheet
            </h2>
            <h3 className="text-3xl font-condensed font-semibold">Model Range Selection</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-[#EF6F24]/50 text-xs font-condensed uppercase tracking-wider text-white/60">
                  <th className="py-4 px-6 bg-white/5">Model Size</th>
                  <th className="py-4 px-6 bg-white/5">Stages</th>
                  <th className="py-4 px-6 bg-white/5">Ratio (i)</th>
                  <th className="py-4 px-6 bg-white/5">Output Torque (N·m)</th>
                  <th className="py-4 px-6 bg-white/5">Output Speed (r/min)</th>
                  <th className="py-4 px-6 bg-white/5">Motor Power (kW)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { model: "R17", stages: "2", ratio: "3.83 - 81.64", torque: "85", speed: "17 - 365", power: "0.12 - 0.75" },
                  { model: "R27", stages: "2/3", ratio: "3.37 - 135.09", torque: "130", speed: "10 - 415", power: "0.12 - 3.0" },
                  { model: "R37", stages: "2/3", ratio: "3.33 - 134.82", torque: "200", speed: "10 - 420", power: "0.18 - 3.0" },
                  { model: "R47", stages: "2/3", ratio: "3.83 - 176.88", torque: "300", speed: "8 - 365", power: "0.18 - 5.5" },
                  { model: "R57", stages: "2/3", ratio: "4.39 - 186.89", torque: "450", speed: "7 - 318", power: "0.18 - 7.5" },
                  { model: "R67", stages: "2/3", ratio: "4.29 - 199.81", torque: "600", speed: "7 - 326", power: "0.18 - 7.5" },
                  { model: "R77", stages: "2/3", ratio: "5.31 - 195.24", torque: "820", speed: "7 - 263", power: "0.37 - 11" },
                  { model: "R87", stages: "2/3", ratio: "5.30 - 246.54", torque: "1550", speed: "5 - 264", power: "0.75 - 22" },
                  { model: "R97", stages: "2/3", ratio: "4.50 - 280.76", torque: "3000", speed: "5 - 311", power: "1.5 - 30" },
                  { model: "R107", stages: "2/3", ratio: "5.31 - 251.15", torque: "4300", speed: "5 - 263", power: "3.0 - 45" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-6 font-medium text-[#EF6F24]">{row.model}</td>
                    <td className="py-4 px-6 text-white/80">{row.stages}</td>
                    <td className="py-4 px-6 text-white/80">{row.ratio}</td>
                    <td className="py-4 px-6 text-white/80">{row.torque}</td>
                    <td className="py-4 px-6 text-white/80">{row.speed}</td>
                    <td className="py-4 px-6 text-white/80">{row.power}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/40 mt-4 italic">* Additional larger sizes (R137, R147, R167) available up to 18,000 N·m. Please consult datasheet.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-[#093C71]">
        {/* Abstract gear/machinery graphics */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 mix-blend-overlay" style={{
          backgroundImage: 'radial-gradient(circle at 70% 50%, white 10%, transparent 50%)',
          backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 border border-white/20 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 border border-white/10 rounded-full"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-condensed font-bold mb-6">Need precise power transmission?</h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Our engineering team is ready to assist with sizing, selection, and customization for your specific application requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#EF6F24] hover:bg-[#d65f1a] text-white px-8 py-4 flex items-center justify-center gap-3 transition-colors font-condensed uppercase tracking-wider text-sm font-medium shadow-[0_0_30px_rgba(239,111,36,0.3)] hover:shadow-[0_0_40px_rgba(239,111,36,0.5)]">
              <Mail className="w-4 h-4" />
              Send Requirements
            </button>
            <button className="bg-white hover:bg-white/90 text-[#093C71] px-8 py-4 flex items-center justify-center gap-3 transition-colors font-condensed uppercase tracking-wider text-sm font-bold">
              <Download className="w-4 h-4" />
              Download Datasheet
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-[#051122] py-8 border-t border-white/10 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Starshine Drive. All rights reserved.</p>
      </footer>
    </div>
  );
}
