import { HomeConceptGrid } from "@/components/home-concept-grid";
import { PageContainer } from "@/components/page-container";
import { ProviderChooser } from "@/components/provider-chooser";
import { SectionLabel } from "@/components/section-label";

export default function Home() {
  return (
    <PageContainer className="flex flex-col gap-96">
      <section className="flex flex-col gap-24">
        <SectionLabel>LEARN THE CLOUD, CONCEPT FIRST</SectionLabel>
        <h1 className="max-w-[16ch] text-heading-lg font-light text-ink-black">
          The clouds are mostly the same idea, differently branded.
        </h1>
        <p className="max-w-[60ch] text-body text-slate-gray">
          Intro to Cloud teaches provider-agnostic concepts, then lets you view
          each one through the lens of AWS or Azure. Free, open-source, no
          login. Pick a provider to begin — you can switch at any time.
        </p>
        <ProviderChooser />
      </section>

      <section className="flex flex-col gap-24">
        <SectionLabel>CONCEPTS</SectionLabel>
        <HomeConceptGrid />
      </section>
    </PageContainer>
  );
}
