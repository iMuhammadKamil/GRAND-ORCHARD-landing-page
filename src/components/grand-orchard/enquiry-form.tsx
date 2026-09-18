"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Phone } from "lucide-react";
import { SectionHeader } from "./section-header";
import { Reveal } from "./reveal";
import { CONTACT } from "@/lib/grand-orchard";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Status = "idle" | "submitting" | "success" | "error";

const inputCls =
  "w-full border border-paper/25 bg-transparent px-4 py-3.5 text-[0.9375rem] text-paper placeholder:text-paper/40 transition-colors duration-300 focus:border-beige focus:outline-none rounded-none";

const labelCls = "label-caps mb-2.5 block text-paper/60";

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reduce = usePrefersReducedMotion();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    // Lead/enquiry structure matching the official Premier Choice Grand
    // Orchard enquiry section: name, email, phone + submit (call back).
    // API fields not part of this form are sent as neutral defaults.
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      interest: "General Enquiry",
      message: "",
    };

    setStatus("submitting");
    setErrors({});

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setFeedback(data.message ?? "Enquiry sent.");
        form.reset();
      } else {
        setStatus("error");
        setErrors(data.fieldErrors ?? {});
        setFeedback(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setFeedback("Network error — please check your connection and try again.");
    }
  }

  return (
    <section id="enquire" className="bg-ink text-paper" aria-label="Enquiry">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Left: heading + call */}
          <div className="lg:col-span-5">
            <SectionHeader
              number="07"
              label="Enquire"
              lines={["Let's Talk", "About Grand", "Orchard."]}
            />
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-paper/60">
                Share your details and our team will call you back with the latest
                availability, pricing and payment plan information for Grand Orchard.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-10 border border-paper/15 p-6">
                <p className="label-caps flex items-center gap-2.5 text-paper/60">
                  <Phone className="h-4 w-4 text-beige" aria-hidden="true" />
                  Call Our Team
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper/75">
                  Prefer to speak directly? Call our team during business hours, or
                  request a call back using the form.
                </p>
                <a
                  href={CONTACT.phoneHref}
                  className="font-display mt-4 inline-flex items-baseline gap-3 text-2xl text-paper transition-colors hover:text-beige sm:text-3xl"
                >
                  {CONTACT.phoneDisplay}
                </a>
                <p className="label-caps mt-2 text-paper/40">
                  Premier Choice International
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              {status === "success" ? (
                <motion.div
                  initial={reduce ? {} : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full min-h-[420px] flex-col items-center justify-center border border-paper/20 px-8 text-center"
                  role="status"
                >
                  <CheckCircle2 className="h-12 w-12 text-beige" strokeWidth={1.25} aria-hidden="true" />
                  <h3 className="font-display mt-6 text-3xl font-medium">Enquiry Received.</h3>
                  <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-paper/65">
                    {feedback} Our team will contact you shortly regarding Grand Orchard,
                    DHA Phase I, Islamabad.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="label-caps mt-8 border border-paper/40 px-6 py-3.5 text-paper transition-colors hover:bg-paper hover:text-ink"
                  >
                    Send Another Enquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="border border-paper/15 p-6 sm:p-10">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className={labelCls}>
                        Full Name <span aria-hidden="true" className="text-beige">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Your full name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={inputCls}
                      />
                      {errors.name && (
                        <p id="name-error" role="alert" className="mt-2 text-xs text-beige">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className={labelCls}>
                        Email Address <span aria-hidden="true" className="text-beige">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={inputCls}
                      />
                      {errors.email && (
                        <p id="email-error" role="alert" className="mt-2 text-xs text-beige">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className={labelCls}>
                        Phone Number <span aria-hidden="true" className="text-beige">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+92 3XX XXXXXXX"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        className={inputCls}
                      />
                      {errors.phone && (
                        <p id="phone-error" role="alert" className="mt-2 text-xs text-beige">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {status === "error" && Object.keys(errors).length === 0 && (
                    <p role="alert" className="mt-5 border border-beige/40 bg-beige/10 px-4 py-3 text-sm text-beige">
                      {feedback}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="label-caps mt-8 inline-flex w-full items-center justify-center gap-3 bg-paper px-8 py-4.5 text-ink transition-colors duration-300 hover:bg-beige disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      "Request a Call Back"
                    )}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
