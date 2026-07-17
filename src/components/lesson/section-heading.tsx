/** The mono, uppercase section heading used to separate lesson sections. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-[40px] font-mono text-[15px] uppercase tracking-[0.04em] text-[oklch(0.4_0.02_230)]">
      {children}
    </h2>
  );
}
