import {
  ArrowBendUpRightIcon as ArrowBendUpRight,
  EnvelopeIcon as Envelope,
  FunnelIcon as Funnel,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Bespoke Evidence view for the "Suspicious Inbox Forwarding" Investigation.
 * The typed evidence blocks cannot capture the shape that matters here: a
 * rendered mailbox rule alongside the lookalike phishing email that preceded it.
 * This is the escape hatch permitted by ADR-0004, referenced from the data
 * module by `evidence.componentKey`. All content is fictional (ADR-0005).
 */
export default function EntraInboxForwardingEvidence() {
  return (
    <div className="mt-[16px] flex flex-col gap-[14px]">
      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-muted">
          <span>2026-07-08 14:52:10 UTC</span>
          <span>·</span>
          <span>Entra Identity Protection · Defender for Cloud Apps</span>
        </div>
        <p className="mt-[10px] text-[15px] leading-[1.6] text-ink-strong">
          A new inbox rule was created on the mailbox j.okafor@meridian.example,
          minutes after a successful sign-in from an address the account had not
          used before.
        </p>
      </div>

      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <p className="flex items-center gap-[7px] font-mono text-[11.5px] uppercase tracking-[0.05em] text-teal">
          <Funnel size={14} weight="bold" aria-hidden />
          Inbox rule
        </p>
        <div className="mt-[12px] rounded-[10px] border border-line bg-surface-muted p-[14px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[14px] font-semibold text-ink-strong">
              &ldquo;RSS Feeds&rdquo;
            </span>
            <span className="rounded-[5px] border border-line bg-surface px-[6px] py-[1px] font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
              enabled
            </span>
          </div>
          <dl className="mt-[10px] flex flex-col gap-[7px] font-mono text-[12px]">
            <div className="flex flex-wrap gap-x-[10px]">
              <dt className="text-ink-muted">When</dt>
              <dd className="text-ink-soft">
                a message arrives (all messages)
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-[10px]">
              <dt className="text-ink-muted">Do</dt>
              <dd className="flex items-center gap-[6px] text-ink-soft">
                <ArrowBendUpRight
                  size={13}
                  weight="bold"
                  aria-hidden
                  className="text-[oklch(0.5_0.16_25)]"
                />
                forward to collector-9f2@mailfence-proxy.example
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-[10px]">
              <dt className="text-ink-muted">Then</dt>
              <dd className="text-ink-soft">
                mark as read, move to folder &ldquo;RSS Feeds&rdquo;, stop
                processing more rules
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-[10px] text-[12.5px] leading-[1.6] text-ink-muted">
          The &ldquo;RSS Feeds&rdquo; folder sits at the bottom of the mailbox
          and the owner has never opened it.
        </p>
      </div>

      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <p className="flex items-center gap-[7px] font-mono text-[11.5px] uppercase tracking-[0.05em] text-teal">
          <Envelope size={14} weight="bold" aria-hidden />
          Preceding message (delivered 41 minutes earlier)
        </p>
        <div className="mt-[12px] rounded-[10px] border border-line bg-surface-muted p-[14px]">
          <dl className="flex flex-col gap-[4px] font-mono text-[12px]">
            <div className="flex flex-wrap gap-x-[10px]">
              <dt className="w-[52px] text-ink-muted">From</dt>
              <dd className="text-ink-soft">
                IT Service Desk &lt;no-reply@meridian-support.example&gt;
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-[10px]">
              <dt className="w-[52px] text-ink-muted">To</dt>
              <dd className="text-ink-soft">j.okafor@meridian.example</dd>
            </div>
            <div className="flex flex-wrap gap-x-[10px]">
              <dt className="w-[52px] text-ink-muted">Subject</dt>
              <dd className="text-ink-soft">
                Action required: your mailbox storage is full
              </dd>
            </div>
          </dl>
          <p className="mt-[10px] border-t border-line pt-[10px] text-[13px] leading-[1.6] text-body">
            Your mailbox has reached 100% of its storage quota and will stop
            receiving mail within 24 hours. Verify your account now to restore
            full capacity.
          </p>
          <p className="mt-[8px] overflow-x-auto rounded-[8px] border border-line bg-surface px-[11px] py-[7px] font-mono text-[12px] text-ink-soft">
            https://meridian-support.example/owa/verify?id=okafor
          </p>
        </div>
      </div>

      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-teal">
          Sign-in that created the rule
        </p>
        <dl className="mt-[10px] flex flex-col gap-[7px] font-mono text-[12px]">
          <div className="flex flex-wrap gap-x-[10px]">
            <dt className="text-ink-muted">User</dt>
            <dd className="text-ink-soft">j.okafor@meridian.example</dd>
          </div>
          <div className="flex flex-wrap gap-x-[10px]">
            <dt className="text-ink-muted">Source IP</dt>
            <dd className="text-ink-soft">192.0.2.77 (Lagos, NG)</dd>
          </div>
          <div className="flex flex-wrap gap-x-[10px]">
            <dt className="text-ink-muted">Usual location</dt>
            <dd className="text-ink-soft">Manchester, GB (198.51.100.0/24)</dd>
          </div>
          <div className="flex flex-wrap gap-x-[10px]">
            <dt className="text-ink-muted">MFA</dt>
            <dd className="text-ink-soft">
              satisfied by token replay (no interactive prompt)
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
