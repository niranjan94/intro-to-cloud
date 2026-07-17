import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { SectionLabel } from "@/components/section-label";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col gap-24">
      <SectionLabel>404</SectionLabel>
      <h1 className="text-heading font-light text-ink-black">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="max-w-[60ch] text-body text-slate-gray">
        The provider or concept you asked for isn&rsquo;t here.
      </p>
      <Link
        href="/"
        className="text-body-sm text-ink-black underline underline-offset-4"
      >
        Back to home
      </Link>
    </PageContainer>
  );
}
