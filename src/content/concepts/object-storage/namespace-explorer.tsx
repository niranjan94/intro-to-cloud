"use client";

import { useMemo, useState } from "react";
import { CliBlock } from "@/components/lesson/cli-block";
import { cn } from "@/lib/utils";
import type { NamespaceContent, NamespaceObject } from "./data";

type View = "flat" | "folders";

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  object?: NamespaceObject;
}

/** Build a folder tree from flat keys by splitting on the delimiter. */
function buildTree(objects: NamespaceObject[], delimiter: string): TreeNode[] {
  const roots: TreeNode[] = [];

  for (const object of objects) {
    const parts = object.key.split(delimiter);
    let level = roots;
    let prefix = "";

    parts.forEach((part, i) => {
      prefix = prefix ? `${prefix}${delimiter}${part}` : part;
      const isLeaf = i === parts.length - 1;
      let node = level.find((n) => n.name === part);
      if (!node) {
        node = { name: part, path: prefix, children: [] };
        level.push(node);
      }
      if (isLeaf) node.object = object;
      level = node.children;
    });
  }

  return roots;
}

function ObjectRow({
  object,
  label,
  selected,
  onSelect,
}: {
  object: NamespaceObject;
  label: string;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const active = selected === object.key;
  return (
    <button
      type="button"
      onClick={() => onSelect(object.key)}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-[10px] rounded-[8px] border px-[10px] py-[7px] text-left transition-colors",
        active
          ? "border-teal-ring bg-teal-tint"
          : "border-transparent hover:border-line hover:bg-surface-muted",
      )}
    >
      <span className="flex items-center gap-[7px] font-mono text-[12px] text-ink-strong">
        <span aria-hidden className="text-ink-muted">
          ▢
        </span>
        {label}
      </span>
      <span className="shrink-0 font-mono text-[11px] text-ink-muted">
        {object.size}
      </span>
    </button>
  );
}

function TreeBranch({
  nodes,
  depth,
  selected,
  onSelect,
}: {
  nodes: TreeNode[];
  depth: number;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      {nodes.map((node) =>
        node.object && node.children.length === 0 ? (
          <div key={node.path} style={{ paddingLeft: depth * 16 }}>
            <ObjectRow
              object={node.object}
              label={node.name}
              selected={selected}
              onSelect={onSelect}
            />
          </div>
        ) : (
          <div key={node.path}>
            <div
              style={{ paddingLeft: depth * 16 }}
              className="flex items-center gap-[7px] px-[10px] py-[6px] font-mono text-[12px] text-ink-muted"
            >
              <span aria-hidden className="text-[oklch(0.6_0.09_75)]">
                ▸
              </span>
              {node.name}/
            </div>
            <TreeBranch
              nodes={node.children}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          </div>
        ),
      )}
    </div>
  );
}

/** Chapter 1: show the flat namespace and the folder illusion side by side. */
export function NamespaceExplorer({ content }: { content: NamespaceContent }) {
  const [view, setView] = useState<View>("flat");
  const [selected, setSelected] = useState<string | null>(null);
  const tree = useMemo(
    () => buildTree(content.objects, content.delimiter),
    [content.objects, content.delimiter],
  );
  const selectedObject =
    content.objects.find((o) => o.key === selected) ?? null;
  const url = selectedObject
    ? content.urlTemplate.replace("{key}", selectedObject.key)
    : null;
  const objectArticle = /^[aeiou]/i.test(content.objectTerm) ? "an" : "a";

  return (
    <div className="mt-[16px]">
      <div
        className="flex gap-[2px]"
        role="tablist"
        aria-label="Namespace view"
      >
        {(
          [
            { id: "flat", label: "Flat · how it is stored" },
            { id: "folders", label: "Folders · how the console shows it" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            onClick={() => setView(tab.id)}
            className={cn(
              "flex-none whitespace-nowrap rounded-t-[10px] border-b-2 px-[14px] py-[10px] font-mono text-[12px] transition-colors max-[520px]:text-[11px]",
              view === tab.id
                ? "border-teal-ring text-ink-strong"
                : "border-transparent text-ink-muted hover:text-body",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[18px] min-[820px]:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[18px] rounded-tl-none border border-line bg-surface p-[18px]">
          {content.account ? (
            <div className="rounded-[14px] border-[1.5px] border-dashed border-[oklch(0.8_0.03_235)] p-[12px]">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[oklch(0.55_0.04_235)]">
                {content.account.term} · {content.account.name}
              </div>
              <div className="mt-[3px] font-mono text-[10.5px] text-ink-muted">
                {content.account.sub}
              </div>
              <ContainerBox
                content={content}
                view={view}
                tree={tree}
                selected={selected}
                onSelect={setSelected}
                nested
              />
            </div>
          ) : (
            <ContainerBox
              content={content}
              view={view}
              tree={tree}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </div>

        <div className="rounded-[18px] border border-line bg-surface-muted p-[20px]">
          {selectedObject && url ? (
            <>
              <h3 className="text-[15px] font-semibold text-ink-strong">
                One {content.objectTerm.toLowerCase()}
              </h3>
              <dl className="mt-[12px] flex flex-col gap-[12px]">
                <div>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
                    {content.keyTerm}
                  </dt>
                  <dd className="mt-[3px] break-all font-mono text-[13px] text-ink-strong">
                    {selectedObject.key}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
                    Address
                  </dt>
                  <dd className="mt-[3px] break-all font-mono text-[12px] text-teal-ink">
                    {url}
                  </dd>
                </div>
              </dl>
              <p className="mt-[14px] text-[13px] leading-[1.6] text-body">
                The {content.keyTerm.toLowerCase()} is the whole string, slashes
                and all. There is no folder object above it: the slashes only
                shape how tools draw the tree.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[15px] font-semibold text-ink-strong">
                Pick {objectArticle} {content.objectTerm.toLowerCase()}
              </h3>
              <p className="mt-[6px] font-mono text-[12px] text-teal-ink">
                Its key and URL appear here.
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
        Uploading builds the key, not a folder
      </p>
      <CliBlock command={content.cli} />
    </div>
  );
}

function ContainerBox({
  content,
  view,
  tree,
  selected,
  onSelect,
  nested = false,
}: {
  content: NamespaceContent;
  view: View;
  tree: TreeNode[];
  selected: string | null;
  onSelect: (key: string) => void;
  nested?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border-[1.5px] border-dashed border-teal-line p-[12px]",
        nested && "mt-[10px]",
      )}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-teal-ink">
        {content.containerTerm} · {content.containerName}
      </div>
      <div className="mt-[2px] font-mono text-[10.5px] text-ink-muted">
        {content.containerSub}
      </div>
      <div className="mt-[10px]">
        {view === "flat" ? (
          <div className="flex flex-col gap-[2px]">
            {content.objects.map((object) => (
              <ObjectRow
                key={object.key}
                object={object}
                label={object.key}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <TreeBranch
            nodes={tree}
            depth={0}
            selected={selected}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  );
}
