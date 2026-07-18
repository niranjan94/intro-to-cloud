"use client";

import {
  ArrowCounterClockwiseIcon as ArrowCounterClockwise,
  CaretRightIcon as CaretRight,
  GearIcon as Gear,
  KeyIcon as Key,
  LockKeyIcon as LockKey,
  LockKeyOpenIcon as LockKeyOpen,
  UserIcon as User,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { AccessContent, PlaceId, PrimerKey } from "./data";

/** The order the places sit in, left to right, in the flow diagram. */
const PLACE_ORDER: PlaceId[] = ["you", "provider", "metadata", "guest"];

/** Amber tokens for the private key / "you" side; teal is the shared public side. */
const PRIVATE_FRAME = "border-[oklch(0.82_0.08_70)] bg-[oklch(0.97_0.03_75)]";
const PRIVATE_TEXT = "text-[oklch(0.52_0.1_65)]";

/** One of the two primer cards: public key (padlock) or private key (the only key). */
function PrimerCard({ item }: { item: PrimerKey }) {
  const isPublic = item.kind === "public";
  const Icon = isPublic ? Key : LockKey;
  return (
    <div
      className={cn(
        "rounded-[14px] border-[1.5px] p-[16px]",
        isPublic ? "border-teal-line bg-teal-tint" : PRIVATE_FRAME,
      )}
    >
      <div className="flex items-center gap-[8px]">
        <Icon
          size={17}
          weight="fill"
          aria-hidden
          className={isPublic ? "text-teal" : PRIVATE_TEXT}
        />
        <h4
          className={cn(
            "font-mono text-[13px] font-semibold",
            isPublic ? "text-teal-ink" : PRIVATE_TEXT,
          )}
        >
          {item.label}
        </h4>
      </div>
      <p className="mt-[8px] text-[13px] leading-[1.6] text-body">
        {item.body}
      </p>
    </div>
  );
}

/** A single node in the flow: a person, the control plane, metadata, or the guest. */
function PlaceNode({
  label,
  sub,
  active,
  hasPrivate,
  hasPublic,
}: {
  label: string;
  sub: string;
  active: boolean;
  hasPrivate: boolean;
  hasPublic: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-w-[132px] rounded-[12px] border-[1.5px] p-[12px] transition-colors",
        active
          ? "border-teal-ring bg-teal-tint"
          : "border-line bg-surface-muted",
      )}
    >
      <div
        className={cn(
          "font-mono text-[12px] font-semibold",
          active ? "text-teal-ink" : "text-ink-soft",
        )}
      >
        {label}
      </div>
      <div className="mt-[3px] font-mono text-[10.5px] leading-[1.4] text-ink-muted">
        {sub}
      </div>
      <div className="mt-[10px] flex min-h-[26px] flex-wrap items-center gap-[6px]">
        {hasPrivate ? (
          <span
            className={cn(
              "inline-flex items-center gap-[5px] rounded-full border-[1.5px] px-[8px] py-[3px] font-mono text-[10.5px] font-semibold",
              PRIVATE_FRAME,
              PRIVATE_TEXT,
            )}
          >
            <LockKey size={12} weight="fill" aria-hidden />
            private
          </span>
        ) : null}
        {hasPublic ? (
          <span className="inline-flex items-center gap-[5px] rounded-full border-[1.5px] border-teal-line bg-surface px-[8px] py-[3px] font-mono text-[10.5px] font-semibold text-teal-ink motion-safe:animate-[fadeUp_0.3s_ease_both]">
            <Key size={12} weight="fill" aria-hidden />
            public
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** The command, file, or internal address for the active step, plus a clarifying caption. */
function StepLine({
  line,
  kind,
  caption,
}: {
  line: string;
  kind: "cmd" | "file" | "internal";
  caption?: string;
}) {
  return (
    <>
      {kind === "cmd" ? (
        <CliBlock command={line} />
      ) : (
        <div className="mt-[14px] flex items-center gap-[9px] rounded-[10px] border border-line bg-surface-muted px-[13px] py-[10px]">
          <span
            aria-hidden
            className="shrink-0 rounded-[5px] border border-line bg-surface px-[6px] py-[2px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ink-muted"
          >
            {kind === "file" ? "file" : "internal"}
          </span>
          <code className="break-all font-mono text-[12.5px] text-body">
            {line}
          </code>
        </div>
      )}
      {caption ? (
        <p className="mt-[8px] flex items-start gap-[6px] text-[11.5px] leading-[1.55] text-ink-muted">
          <CaretRight
            size={12}
            weight="bold"
            aria-hidden
            className="mt-[3px] shrink-0 text-teal"
          />
          <span>{caption}</span>
        </p>
      ) : null}
    </>
  );
}

/**
 * The access chapter. It opens with a plain-language primer on what a key pair
 * is (no cryptography assumed), then walks the public key from the moment the
 * pair is created to the moment you log in. The private key never leaves you;
 * the public key travels through the provider and a first-boot agent that writes
 * it into the guest's authorized_keys. Each step is badged with who performs it
 * so it is clear which steps you run and which the provider does for you. Every
 * label and step comes from AccessContent so AWS and Azure stay bespoke.
 */
export function KeyAccess({ content }: { content: AccessContent }) {
  const [step, setStep] = useState(0);
  const last = content.steps.length - 1;
  const current = content.steps[step];
  const youAct = current.agency.startsWith("You");

  const placeById = useMemo(
    () => Object.fromEntries(content.places.map((p) => [p.id, p])),
    [content.places],
  );

  return (
    <div className="mt-[16px]">
      {/* Primer: what a key pair is, before any of the plumbing */}
      <div className="rounded-[18px] border border-line bg-surface p-[20px]">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-teal">
          First, what a key pair is
        </p>
        <p className="mt-[8px] max-w-[68ch] text-pretty text-[13.5px] leading-[1.6] text-body">
          {content.primer.intro}
        </p>
        <div className="mt-[16px] grid grid-cols-1 gap-[12px] min-[560px]:grid-cols-2">
          {content.primer.keys.map((k) => (
            <PrimerCard key={k.kind} item={k} />
          ))}
        </div>
        <p className="mt-[16px] max-w-[68ch] text-pretty text-[13.5px] leading-[1.6] text-body">
          {content.primer.bridge}
        </p>
      </div>

      {/* Flow diagram: the public key's journey across four places */}
      <p className="mt-[24px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink-muted">
        Where each half goes
      </p>
      <div className="mt-[10px] rounded-[18px] border border-line bg-surface p-[18px]">
        <div className="flex flex-col gap-[10px] min-[720px]:flex-row min-[720px]:items-stretch min-[720px]:gap-[6px]">
          {PLACE_ORDER.map((id, i) => {
            const place = placeById[id];
            if (!place) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-[6px] min-[720px]:flex-1"
              >
                <PlaceNode
                  label={place.label}
                  sub={place.sub}
                  active={current.actor === id}
                  hasPrivate={id === "you"}
                  hasPublic={current.publicKeyAt === id}
                />
                {i < PLACE_ORDER.length - 1 ? (
                  <span
                    aria-hidden
                    className="shrink-0 rotate-90 text-line min-[720px]:rotate-0"
                  >
                    <CaretRight size={16} weight="bold" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {current.connect ? (
          <div className="mt-[14px] flex items-center gap-[9px] rounded-[10px] border-[1.5px] border-teal-line bg-teal-tint px-[13px] py-[10px] motion-safe:animate-[fadeUp_0.3s_ease_both]">
            <LockKeyOpen
              size={16}
              weight="bold"
              aria-hidden
              className="shrink-0 text-teal"
            />
            <p className="text-[12.5px] leading-[1.5] text-teal-ink">
              {content.handshake}
            </p>
          </div>
        ) : null}
      </div>

      {/* Step track */}
      <div className="mt-[16px] flex flex-wrap gap-[8px]">
        {content.steps.map((s, i) => {
          const active = i === step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              aria-current={active}
              className={cn(
                "inline-flex items-center gap-[7px] rounded-full border-[1.5px] px-[12px] py-[6px] font-mono text-[12px] transition-colors",
                active
                  ? "border-teal-ring bg-teal-tint text-teal-ink font-semibold"
                  : "border-line bg-surface text-ink-muted hover:text-body",
              )}
            >
              <span
                className={cn("font-bold", active ? "text-teal" : "text-line")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Readout for the active step */}
      <div
        key={step}
        className="mt-[16px] rounded-[18px] border border-line bg-surface-muted p-[20px] motion-safe:animate-[fadeUp_0.3s_ease_both]"
      >
        <div className="flex flex-wrap items-center gap-[10px]">
          <h3 className="text-[16px] font-semibold text-ink-strong">
            {current.title}
          </h3>
          <span
            className={cn(
              "inline-flex items-center gap-[5px] rounded-full border px-[9px] py-[3px] font-mono text-[10.5px] font-semibold",
              youAct
                ? cn(PRIVATE_FRAME, PRIVATE_TEXT)
                : "border-teal-line bg-teal-tint text-teal-ink",
            )}
          >
            {youAct ? (
              <User size={12} weight="bold" aria-hidden />
            ) : (
              <Gear size={12} weight="bold" aria-hidden />
            )}
            {current.agency}
          </span>
        </div>
        <p className="mt-[8px] text-pretty text-[13.5px] leading-[1.6] text-body">
          {current.detail}
        </p>
        <StepLine
          line={current.line}
          kind={current.lineKind}
          caption={current.lineCaption}
        />
      </div>

      {/* Controls */}
      <div className="mt-[16px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(0)}
          className={cn(
            "inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12px] text-ink-soft transition-colors hover:border-ink-muted",
            step === 0 && "invisible",
          )}
        >
          <ArrowCounterClockwise size={14} weight="bold" aria-hidden />
          Restart
        </button>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(
              "inline-flex items-center gap-[6px] rounded-button border border-line bg-surface px-[14px] py-[8px] font-mono text-[12px] text-ink-soft transition-colors hover:border-ink-muted",
              step === 0 && "invisible",
            )}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(last, s + 1))}
            disabled={step === last}
            className="inline-flex items-center gap-[6px] rounded-button bg-primary px-[16px] py-[8px] font-mono text-[12px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {step === last ? "Logged in" : "Next step"}
            <CaretRight size={14} weight="bold" aria-hidden />
          </button>
        </div>
      </div>

      <p className="mt-[16px] font-mono text-[11.5px] leading-[1.6] text-ink-muted">
        {content.authorizedKeysNote}
      </p>
    </div>
  );
}
