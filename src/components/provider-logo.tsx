import { PROVIDER_LABELS, type Provider } from "@/content/types";

const LOGO_SRC: Record<Provider, string> = {
  aws: "/logos/aws.svg",
  azure: "/logos/azure.svg",
};

/**
 * Provider brand wordmark. Uses the real vendor logos (a documented exception
 * to the otherwise-muted palette, see ADR-0002). Rendered at a fixed height;
 * width follows each logo's aspect ratio.
 */
export function ProviderLogo({
  provider,
  className,
}: {
  provider: Provider;
  className?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: static brand SVG; next/image adds no value for a local vector.
    <img
      src={LOGO_SRC[provider]}
      alt={`${PROVIDER_LABELS[provider]} logo`}
      className={className}
    />
  );
}
