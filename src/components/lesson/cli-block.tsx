/**
 * A terminal-styled command card: a dark surface with faux window controls and
 * a monospace command line. Used to show the provider's CLI invocation.
 */
export function CliBlock({ command }: { command: string }) {
  return (
    <div className="mt-[14px] rounded-[14px] bg-panel-deep px-[20px] py-[18px]">
      <div className="mb-[12px] flex items-center gap-[8px]">
        <span className="h-[11px] w-[11px] rounded-full bg-[oklch(0.75_0.05_30)]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[oklch(0.85_0.06_90)]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[oklch(0.78_0.08_150)]" />
      </div>
      <div className="break-all font-mono text-[13px] leading-[1.7] text-[oklch(0.88_0.02_195)]">
        <span className="text-[oklch(0.65_0.08_150)]">$ </span>
        {command}
      </div>
    </div>
  );
}
