import { useState, useRef, useEffect } from "react";
import { X, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateInquiry } from "@workspace/api-client-react";

const PURPOSES = [
  "Request a Quote",
  "Product Selection Support",
  "Replacement / Compatibility Check",
  "OEM / Custom Project",
  "Distributor / Partnership",
  "Catalog / Drawing Request",
  "Technical Support",
  "Other",
];

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
  defaultPurpose?: string;
}

export function ContactModal({ open, onClose, productName, defaultPurpose }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [submitError, setSubmitError] = useState("");
  const createInquiry = useCreateInquiry();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitError("");
    createInquiry.mutate({ data: {
      contactPerson: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone") || ""),
      companyName: String(form.get("company") || ""),
      purpose: String(form.get("purpose")),
      productInterest: productName ? [productName] : [],
      message: String(form.get("message") || `Website enquiry${productName ? ` for ${productName}` : ""}`),
      leadSource: "Website contact modal",
    } }, { onSuccess: () => setSubmitted(true), onError: () => setSubmitError("We could not send your enquiry. Please try again.") });
  };

  const handleClose = () => {
    setSubmitted(false);
    setFileName("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl max-h-[95vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-heading font-bold text-primary mb-2">Message Sent!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Our team will contact you within 24 hours with technical details and pricing.
            </p>
            <Button onClick={handleClose} className="bg-accent hover:bg-accent/90 text-white border-0 px-8">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7">
            {/* Title */}
            <h2 className="text-2xl font-heading font-bold text-primary text-center mb-6">
              Contact StarShine
            </h2>

            <div className="space-y-3.5">
              {/* Name + Email — 2 columns */}
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  name="name" type="text"
                  placeholder="Name *"
                  required
                  className="w-full border border-gray-200 rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray-400"
                />
                <input
                  name="email" type="email"
                  placeholder="Email *"
                  required
                  className="w-full border border-gray-200 rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray-400"
                />
              </div>

              {/* Tel + Company — 2 columns */}
              <div className="grid grid-cols-2 gap-3.5">
                <input
                  name="phone" type="tel"
                  placeholder="Tel"
                  className="w-full border border-gray-200 rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray-400"
                />
                <input
                  name="company" type="text"
                  placeholder="Company / Brand / Website"
                  className="w-full border border-gray-200 rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray-400"
                />
              </div>

              {/* Purpose */}
              <div className="relative">
                <select
                  required
                  name="purpose"
                  defaultValue={defaultPurpose ?? ""}
                  className="w-full border border-gray-200 rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none bg-white text-gray-700"
                >
                  <option value="" disabled>Purpose *</option>
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Message */}
              <textarea
                name="message" rows={4}
                placeholder={`Project details, model, torque, speed, application, quantity, or anything useful${productName ? `\n\nProduct: ${productName}` : ""}`}
                className="w-full border border-gray-200 rounded-sm px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-gray-400"
              />

              {/* File upload */}
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "w-full border rounded-sm px-4 py-3.5 text-sm font-medium transition-colors text-center",
                    fileName
                      ? "border-primary text-primary bg-primary/5"
                      : "border-accent text-accent hover:bg-accent/5"
                  )}
                >
                  {fileName ? `📎 ${fileName}` : "Browse Files"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.ai,.eps"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                />
                <p className="text-xs text-gray-400 mt-1.5 ml-0.5">
                  Accepted: JPG, JPEG, PNG, PDF, AI, EPS
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                  disabled={createInquiry.isPending}
                className="w-full bg-accent hover:bg-accent/90 text-white border-0 font-semibold text-base mt-1"
              >
                  {createInquiry.isPending ? "Sending…" : "Submit"}
              </Button>
                {submitError && <p className="text-center text-sm text-red-600">{submitError}</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
