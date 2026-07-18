# Intro to Cloud

An open-source, client-side, no-login interactive web app that teaches basic cloud concepts.

The app is **concept-first**: it presents provider-agnostic cloud concepts (Object Storage, Virtual Machines, DNS, and so on) and lets you view each one through the lens of a chosen cloud provider (AWS or Azure). Switching providers changes the concrete examples, not the concepts themselves, so you learn the idea once and see how each vendor names and shapes it.

## Why this exists

This project was born out of years of teaching cloud concepts to juniors and to people who had never touched the cloud before. Every lesson is built around the concepts and terms that actually confused people, and around the actual questions I was asked. It is not a reference manual or an exam-prep dump. It is the explanation I wished existed the first time someone asked me "wait, what is a VPC, really?"

The result is deliberately provider-agnostic. Most beginners get lost switching between AWS and Azure vocabulary before they have understood the underlying idea. Here the idea comes first, and the provider is just a lens you toggle.

## How it is organized

- **Concept** — a provider-agnostic cloud idea (Object Storage, Compute, Networking). Concepts are the stable spine of the app and do not change when you switch providers.
- **Provider** — a cloud vendor you choose between: AWS or Azure. Choosing one changes the concrete examples shown for a concept.
- **Lens** — a single provider's realization of a concept. The AWS lens on Object Storage is Amazon S3; the Azure lens is Blob Storage.
- **Service** — the named provider product a lens points at (Amazon S3, Azure Blob Storage).
- **Stage** — a step in the learning path that groups related concepts in the sidebar (Foundations, Storing data, Reaching users, Going further). Stages run in dependency order, so the catalog reads as an order to follow rather than a tech taxonomy.

Concepts are catalogued in `src/content/registry.ts`. Every concept shows up in navigation; a concept renders a full lesson once one has been authored for the active provider, and a "coming soon" state otherwise.

## Concepts covered

| Stage | Concept | AWS | Azure |
| --- | --- | --- | --- |
| Foundations | Virtual Network | Amazon VPC | Azure Virtual Network |
| Foundations | Virtual Machines | Amazon EC2 | Azure Virtual Machines |
| Storing data | Object Storage | Amazon S3 | Azure Blob Storage |
| Storing data | Relational Database | Amazon RDS | Azure SQL Database |
| Reaching users | DNS | Amazon Route 53 | Azure DNS |
| Reaching users | Content Delivery | Amazon CloudFront | Azure Front Door |
| Going further | Block Storage | Amazon EBS | Azure Managed Disks |
| Going further | Containers | Amazon ECS | Azure Container Apps |
| Going further | Serverless Functions | AWS Lambda | Azure Functions |
| Going further | NoSQL Database | Amazon DynamoDB | Azure Cosmos DB |

All ten concepts have full lessons for both providers today. There are also **projects** — guided, end-to-end builds that assemble concepts into a working system (starting with Web Server on a VM), catalogued in `src/content/projects.ts`.

## Getting started

This is a [Next.js](https://nextjs.org) app. Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other useful scripts:

```bash
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # Biome checks
pnpm format   # Biome formatting
```

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with React
- Tailwind CSS and shadcn/ui components
- [Biome](https://biomejs.dev) for linting and formatting
- Fully client-side and static: no backend, no accounts, no tracking

## Contributing

The most valuable contribution is sharpening a lesson so it clears up something that confused you when you were learning, or adding a new concept or project. Lessons live under `src/content/concepts/<concept>/` as per-provider React components; see an authored concept such as `object-storage` or `virtual-network` for the shape to follow, and projects under `src/content/projects/`. Architectural decisions are recorded in `docs/adr/`.

## License

[MIT](./LICENSE) © Niranjan Rajendran
