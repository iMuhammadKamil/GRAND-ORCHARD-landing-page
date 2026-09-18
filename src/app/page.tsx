import { Navbar } from "@/components/grand-orchard/navbar";
import { Hero } from "@/components/grand-orchard/hero";
import { Overview } from "@/components/grand-orchard/overview";
import { Amenities } from "@/components/grand-orchard/amenities";
import { Location, ResidentialCommercial } from "@/components/grand-orchard/location";
import { Pricing } from "@/components/grand-orchard/pricing";
import { Hilton } from "@/components/grand-orchard/hilton";
import { Gallery } from "@/components/grand-orchard/gallery";
import { Marquee } from "@/components/grand-orchard/marquee";
import { Faq } from "@/components/grand-orchard/faq";
import { EnquiryForm } from "@/components/grand-orchard/enquiry-form";
import { FinalCta } from "@/components/grand-orchard/final-cta";
import { Footer } from "@/components/grand-orchard/footer";
import { WhatsAppButton } from "@/components/grand-orchard/whatsapp-button";
import { FAQS, FACTS, PROJECT } from "@/lib/grand-orchard";

/** schema.org structured data built strictly from official facts. */
function StructuredData() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: "Grand Orchard",
    developerName: PROJECT.developer,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Link Road, Phase Sector B, DHA",
      addressLocality: "Islamabad",
      addressCountry: "PK",
    },
    numberOfAvailableAccommodationUnits: undefined,
    petsAllowed: undefined,
    description:
      "Grand Orchard is a commercial and residential development at DHA Orchard, DHA Phase I, Islamabad, featuring open-plan apartments with terrace views and modern vertical living with aspects of high-tech green living.",
    amenityFeature: [
      "Mall",
      "4 Layered Security",
      "Foodcourt",
      "Card-Based Community",
      "Supermarket",
      "Tennis Court",
      "Grade AAA Parkings",
      "On-Demand Cleaning Services",
      "Swimming Pool",
      "Ecological Approach",
      "Restaurants and Cafes",
      "Gated Community",
      "Fitness Center",
    ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    additionalProperty: FACTS.map((f) => ({
      "@type": "PropertyValue",
      name: f.term,
      value: f.value,
    })),
  };

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
    </>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <StructuredData />
      <Navbar />
      <main>
        <Hero />
        <Overview />
        <Amenities />
        <Location />
        <ResidentialCommercial />
        <Pricing />
        <Hilton />
        <Marquee />
        <Gallery />
        <Faq />
        <EnquiryForm />
        <FinalCta />
      </main>
      <Footer year={new Date().getFullYear()} />
      <WhatsAppButton />
    </div>
  );
}
