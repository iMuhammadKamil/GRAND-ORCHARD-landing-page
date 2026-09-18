import { CONTACT } from "@/lib/grand-orchard";

/**
 * Floating WhatsApp contact button (click-to-chat).
 *
 * A plain anchor — no client JavaScript, no hydration surface. Opens the
 * official Premier Choice International WhatsApp number with a simple
 * pre-filled enquiry message. Styled in the site's editorial language
 * (square corners, hairline border, ink surface) with a WhatsApp-green hover
 * for instant recognition.
 */
export function WhatsAppButton() {
  return (
    <a
      href={CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with the Grand Orchard team on WhatsApp"
      className="group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-5 z-30 inline-flex sm:right-6"
    >
      <span className="flex h-12 w-12 items-center justify-center border border-paper/25 bg-ink text-paper transition-colors duration-300 group-hover:border-[#25d366] group-hover:bg-[#25d366] group-hover:text-white motion-reduce:transition-none sm:h-[3.25rem] sm:w-[3.25rem]">
        <WhatsAppGlyph className="h-6 w-6" />
      </span>
    </a>
  );
}

/** Official WhatsApp glyph (Simple Icons path, viewBox 0 0 24 24). */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
