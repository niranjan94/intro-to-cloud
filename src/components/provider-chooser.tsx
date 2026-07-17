"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PROVIDER_LABELS, type Provider } from "@/content/types";
import {
  DEFAULT_PROVIDER,
  getStoredProvider,
  setStoredProvider,
} from "@/lib/provider";

/**
 * Landing call-to-action. One primary action into the learner's last-used
 * provider (restored from localStorage after mount) plus a quiet link to the
 * other. The top-bar switcher remains available for switching later.
 */
export function ProviderChooser() {
  const router = useRouter();
  const [stored, setStored] = useState<Provider>(DEFAULT_PROVIDER);
  useEffect(() => {
    setStored(getStoredProvider());
  }, []);

  const other: Provider = stored === "aws" ? "azure" : "aws";

  function go(provider: Provider) {
    setStoredProvider(provider);
    router.push(`/${provider}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-16">
      <Button variant="primary" onClick={() => go(stored)}>
        Start with {PROVIDER_LABELS[stored]}
      </Button>
      <Button variant="ghost" onClick={() => go(other)}>
        or explore {PROVIDER_LABELS[other]}
      </Button>
    </div>
  );
}
