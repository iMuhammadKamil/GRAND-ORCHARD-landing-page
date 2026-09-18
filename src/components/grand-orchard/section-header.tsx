import { Reveal } from "./reveal";

/**
 * Numbered editorial section header:
 *  01  PROJECT OVERVIEW
 *  GRAND ORCHARD AT DHA ORCHARD   (large serif lines)
 */
export function SectionHeader({
  number,
  label,
  lines,
  tone = "light",
  align = "left",
  className = "",
}: {
  number: string;
  label: string;
  lines: string[];
  /** light = on dark bg, dark = on light bg */
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  const toneCls = tone === "light" ? "text-paper" : "text-ink";
  const ruleCls = tone === "light" ? "text-paper/70" : "text-ink/60";

  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <Reveal>
        <p
          className={`overline-rule ${ruleCls} ${align === "center" ? "justify-center" : ""}`}
        >
          <span className="tabular-nums">{number}</span>
          <span aria-hidden="true" className="opacity-50">
            /
          </span>
          <span>{label}</span>
        </p>
      </Reveal>
      <h2
        className={`font-display ${toneCls} mt-6 text-[2.5rem] leading-[1.04] font-medium tracking-[-0.01em] sm:text-6xl lg:text-[4.25rem]`}
      >
        {lines.map((line, i) => (
          <span key={line} className="block">
            {line}
            {i < lines.length - 1 ? <span className="sr-only"> </span> : null}
          </span>
        ))}
      </h2>
    </div>
  );
}
