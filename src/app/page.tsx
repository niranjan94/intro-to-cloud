import { HomeConceptGrid } from "@/components/home-concept-grid";
import { LensRail } from "@/components/lens-rail";
import { PageContainer } from "@/components/page-container";
import { ProviderChooser } from "@/components/provider-chooser";
import { SectionLabel } from "@/components/section-label";
import { getConcept } from "@/content/registry";

export default function Home() {
  const featured = getConcept("object-storage");

  return (
    <PageContainer className="flex flex-col gap-48">
      <section className="grid gap-40 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-24">
          <SectionLabel>LEARN THE CLOUD, CONCEPT FIRST</SectionLabel>
          <h1 className="max-w-[16ch] text-heading-lg font-light text-ink-black">
            The clouds are mostly the same idea, differently branded.
          </h1>
          <p className="max-w-[52ch] text-body text-slate-gray">
            Intro to Cloud teaches provider-agnostic concepts, then lets you
            view each one through the lens of AWS or Azure. Free, open-source,
            no login.
          </p>
          <ProviderChooser />
        </div>
        {featured ? (
          <LensRail concept={featured} className="lg:sticky lg:top-[72px]" />
        ) : null}
      </section>

      <section className="flex flex-col gap-24">
        <SectionLabel>CONCEPTS</SectionLabel>
        <HomeConceptGrid />
      </section>
    </PageContainer>
  );
}
