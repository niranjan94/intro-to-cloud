"use client";

import { Fragment } from "react";
import { Callout } from "@/components/lesson/callout";
import type {
  AgentSetup,
  ResponsibilitySplit,
  SecurityChecklist,
} from "@/components/lesson/lesson-reference";
import { ProjectChapters } from "@/components/lesson/project-chapters";
import { Quiz } from "@/components/lesson/quiz";
import type { Provider } from "@/content/types";
import { ArchitectureMap } from "./architecture-map";
import { BuildSteps } from "./build-steps";
import { CONTENT } from "./data";
import { ProvisionScript } from "./provision-script";
import { RequestFlow } from "./request-flow";

/**
 * The Load-Balanced Web App project's chapters. The guided chapters (plan,
 * request, build, provision) are this build's own interactive components; the
 * shared reference tabs and the quiz are assembled and dispatched by
 * {@link ProjectChapters}, so this file only wires each guided body to its data
 * slice from CONTENT[provider].
 */
export function LoadBalancedChapters({
  provider,
  responsibility,
  security,
  agent,
}: {
  provider: Provider;
  responsibility: ResponsibilitySplit;
  security: SecurityChecklist;
  agent: AgentSetup;
}) {
  const content = CONTENT[provider];
  const guided = content.chapters.slice(0, -1);
  const quizMeta = content.chapters[content.chapters.length - 1];

  const guidedBodies = [
    <ArchitectureMap
      key="plan"
      nodes={content.arch}
      hotspots={content.hotspots}
      hint={content.archHint}
    />,
    <Fragment key="request">
      <RequestFlow flow={content.flow} />
      {content.flow.callouts.map((c) => (
        <Callout key={c.tag} {...c} />
      ))}
    </Fragment>,
    <BuildSteps key="build" steps={content.steps} provider={provider} />,
    <Fragment key="provision">
      <ProvisionScript provision={content.provision} />
      {content.provision.callouts.map((c) => (
        <Callout key={c.tag} {...c} />
      ))}
    </Fragment>,
  ];

  return (
    <ProjectChapters
      provider={provider}
      guided={guided}
      guidedBodies={guidedBodies}
      reference={{ responsibility, security, agent }}
      quizMeta={quizMeta}
      quizBody={<Quiz questions={content.quiz} />}
    />
  );
}
