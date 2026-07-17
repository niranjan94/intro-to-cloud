/**
 * A small, neutral pill marking a concept whose lesson is still being written.
 * Deliberately understated — it signals "not finished yet" without competing
 * with the teal used for live, provider-specific content.
 */
export function WipBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-[5px] border border-line bg-surface-muted px-[6px] py-[1px] font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] text-faint"
      title="Lesson in progress"
    >
      WIP
    </span>
  );
}
