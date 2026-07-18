"use client";

import { SquareIcon as Square } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { ItemModelContent, RecordItem } from "./data";

interface Collection {
  partitionValue: string;
  items: RecordItem[];
}

/** Group items into their item collections by partition-key value. */
function groupByPartition(items: RecordItem[]): Collection[] {
  const order: string[] = [];
  const map = new Map<string, RecordItem[]>();
  for (const item of items) {
    if (!map.has(item.partitionValue)) {
      map.set(item.partitionValue, []);
      order.push(item.partitionValue);
    }
    map.get(item.partitionValue)?.push(item);
  }
  return order.map((partitionValue) => ({
    partitionValue,
    items: map.get(partitionValue) ?? [],
  }));
}

/** Chapter 1: browse items grouped by partition key and inspect one record. */
export function KeyExplorer({ content }: { content: ItemModelContent }) {
  const [selected, setSelected] = useState<string | null>(null);
  const collections = useMemo(
    () => groupByPartition(content.items),
    [content.items],
  );
  const item = content.items.find((i) => i.id === selected) ?? null;

  return (
    <div className="mt-[16px]">
      <div className="grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[18px] border border-line bg-surface p-[18px]">
          <div className="rounded-[12px] border-[1.5px] border-dashed border-teal-line p-[12px]">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-teal-ink">
              {content.tableTerm} · {content.tableName}
            </div>
            <div className="mt-[2px] font-mono text-[10.5px] text-ink-muted">
              {content.scopeLabel}
            </div>

            <div className="mt-[12px] flex flex-col gap-[12px]">
              {collections.map((collection) => (
                <div key={collection.partitionValue}>
                  <div className="flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
                    <span
                      aria-hidden
                      className="h-[7px] w-[7px] rounded-full bg-teal-ring"
                    />
                    {content.partitionKeyName} = {collection.partitionValue}
                  </div>
                  <div className="mt-[6px] flex flex-col gap-[3px] border-l border-line pl-[10px]">
                    {collection.items.map((row) => {
                      const active = selected === row.id;
                      return (
                        <button
                          key={row.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelected(row.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-[10px] rounded-[8px] border px-[10px] py-[7px] text-left transition-colors",
                            active
                              ? "border-[oklch(0.8_0.06_245)] bg-[oklch(0.97_0.025_245)]"
                              : "border-transparent hover:border-line hover:bg-surface-muted",
                          )}
                        >
                          <span className="flex items-center gap-[7px] font-mono text-[12px] text-ink-strong">
                            <span aria-hidden className="text-ink-muted">
                              <Square size={13} />
                            </span>
                            {row.sortValue}
                          </span>
                          <span className="shrink-0 font-mono text-[10.5px] text-ink-muted">
                            {row.attributes.length + 2} fields
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-surface-muted p-[20px]">
          {item ? (
            <>
              <h3 className="text-[15px] font-semibold text-ink-strong">
                One item
              </h3>
              <dl className="mt-[12px] flex flex-col gap-[10px]">
                <div className="grid grid-cols-[110px_1fr] gap-[10px]">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-teal-ink">
                    {content.partitionKeyTerm}
                  </dt>
                  <dd className="break-all font-mono text-[12.5px] text-ink-strong">
                    {item.partitionValue}
                  </dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-[10px]">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-[oklch(0.5_0.08_255)]">
                    {content.sortKeyTerm}
                  </dt>
                  <dd className="break-all font-mono text-[12.5px] text-ink-strong">
                    {item.sortValue}
                  </dd>
                </div>
              </dl>

              <div className="mt-[12px] rounded-[10px] border border-teal-line bg-teal-tint px-[12px] py-[9px]">
                <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-teal">
                  Primary key
                </div>
                <div className="mt-[3px] text-[12px] leading-[1.5] text-teal-ink">
                  {content.primaryKeyLabel}
                </div>
              </div>

              <div className="mt-[14px] font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-muted">
                Free-form attributes
              </div>
              <dl className="mt-[8px] flex flex-col gap-[6px]">
                {item.attributes.map((attr) => (
                  <div
                    key={attr.name}
                    className="flex items-center justify-between gap-[10px] rounded-[8px] border border-line bg-surface px-[11px] py-[7px]"
                  >
                    <dt className="font-mono text-[12px] text-ink-muted">
                      {attr.name}
                    </dt>
                    <dd className="break-all text-right font-mono text-[12px] text-ink-strong">
                      {attr.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-[12px] text-[12.5px] leading-[1.6] text-body">
                Every item here shares the key schema, but the attributes differ
                item to item. Only the key is fixed.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[15px] font-semibold text-ink-strong">
                Pick an item
              </h3>
              <p className="mt-[6px] font-mono text-[12px] text-teal-ink">
                Its key and attributes appear here.
              </p>
              <p className="mt-[10px] text-[13px] leading-[1.6] text-body">
                {content.hint}
              </p>
            </>
          )}
        </div>
      </div>

      <p className="mt-[16px] text-pretty text-[13px] leading-[1.6] text-ink-muted">
        {content.note}
      </p>

      <p className="mt-[18px] font-mono text-[12px] uppercase tracking-[0.04em] text-ink-muted">
        Creating it declares only the key schema
      </p>
      <CliBlock command={content.cli} />
    </div>
  );
}
