import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the "Storage Account Public Access Enabled" catalog event
 * (AZ-STOR-001): Critical, detected via Activity Log, mapped to Exfiltration
 * Over Web Service (T1567). Public storage is a top breach cause, so this looks
 * alarming, but here the only exposed container is the static-website container,
 * change-managed and holding public assets. The correct call is Close, after the
 * checks pass. All instance data is fictional (ADR-0005).
 */
const investigation: Investigation = {
  id: "azure-storage-public",
  title: "Storage account opened up",
  short:
    "A storage account flipped to public access at midday. A leak, or a sanctioned change? Check before you call it.",
  sourcePlatform: "azure",
  difficulty: "standard",
  severity: "critical",
  eventType: "Storage Account Public Access Enabled",
  mitre: "Exfiltration Over Web Service (T1567)",
  detectionSource: "Activity Log",
  evidence: {
    blocks: [
      {
        kind: "summary",
        time: "2026-06-11 12:26:31 UTC",
        source: "Activity Log · Microsoft.Storage/storageAccounts/write",
        message:
          "Public access was enabled on the Meridian storage account meridianwebassets, and its $web container was set to anonymous blob access.",
      },
      {
        kind: "kv",
        title: "Change event",
        rows: [
          {
            label: "Operation",
            value: "Microsoft.Storage/storageAccounts/write",
          },
          { label: "Storage account", value: "meridianwebassets" },
          { label: "allowBlobPublicAccess", value: "true" },
          { label: "Public container", value: "$web (anonymous blob)" },
          {
            label: "Other containers",
            value: "data, backups (remain private)",
          },
          {
            label: "Actor",
            value: "web-platform-sp (service principal)",
          },
          { label: "Source IP", value: "198.51.100.34 (Meridian egress)" },
          { label: "Region", value: "eastus" },
        ],
      },
      {
        kind: "code",
        title: "Activity Log (excerpt)",
        body: `{
  "operationName": "Microsoft.Storage/storageAccounts/write",
  "caller": "web-platform-sp",
  "callerIpAddress": "198.51.100.34",
  "properties": {
    "allowBlobPublicAccess": true,
    "staticWebsite": { "enabled": true, "indexDocument": "index.html" }
  },
  "status": "Succeeded"
}
--
{
  "operationName": "Microsoft.Storage/storageAccounts/blobServices/containers/write",
  "resource": "meridianwebassets/$web",
  "properties": { "publicAccess": "Blob" },
  "status": "Succeeded"
}`,
      },
      {
        kind: "note",
        title: "Context",
        body: "Change ticket CHG-5120 (approved) covers moving Meridian's public marketing site to storage static website hosting, which requires anonymous read on the reserved $web container. The Web Platform team's service principal made the change from Meridian's egress range. A content scan of $web confirms only public marketing assets; the data and backups containers were untouched and stay private.",
      },
    ],
  },
  aspects: [
    {
      id: "account-public-access",
      label: "Account-level public blob access was enabled",
      signal: true,
      reasoning: {
        prompt: "Why flag allowBlobPublicAccess turning true?",
        options: [
          "It instantly makes every container in the account world-readable with no further control",
          "It lifts the account-wide guardrail, so you must confirm which containers actually become reachable and whether any hold sensitive data",
          "It only affects billing and has no security meaning",
        ],
        correct: 1,
      },
      note: "Right to flag. The account flag is a prerequisite, not the exposure itself. What matters is which containers are then set public and what they hold; here only $web is, and it holds public assets.",
    },
    {
      id: "container-anonymous",
      label: "A container was set to anonymous blob access",
      signal: true,
      reasoning: {
        prompt: "Why does an anonymous container deserve a closer look?",
        options: [
          "Anonymous blob access exposes every object in that container to the internet, so you must verify the container's contents and intent",
          "Anonymous access is read-write by default, so the data is already deleted",
          "Containers cannot be made public in Azure, so the log must be wrong",
        ],
        correct: 0,
      },
      note: "Correct to check. The exposed container is the reserved $web container required for static website hosting, and the scan shows only public marketing assets. The private data and backups containers are unaffected.",
    },
    {
      id: "portal-channel",
      label: "The change was applied through a standard Azure management call",
      signal: false,
      note: "The management-plane write is the normal way this setting changes. The channel is not the signal.",
    },
    {
      id: "region-eastus",
      label: "The storage account is in the eastus region",
      signal: false,
      note: "Region is a placement detail, not evidence of intent.",
    },
    {
      id: "replication",
      label: "The account uses geo-redundant replication",
      signal: false,
      note: "Replication is a durability setting and has nothing to do with public exposure.",
    },
    {
      id: "account-name",
      label: "The account name contains the word web",
      signal: false,
      note: "A name is not evidence. It happens to match the purpose, but you confirm intent from the change record, not the label.",
    },
  ],
  extract: [
    {
      id: "account",
      label: "Storage account name",
      hint: "the account in the write operation",
      accept: ["meridianwebassets"],
      normalize: "text",
    },
    {
      id: "container",
      label: "Container that was made public",
      hint: "the reserved static-site container",
      accept: ["$web", "web"],
      normalize: "text",
    },
    {
      id: "ticket",
      label: "Change ticket this maps to",
      hint: "referenced in the context",
      accept: ["CHG-5120"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "The public-access flag and the anonymous container were both worth flagging, and both check out. The only exposed container is the reserved $web container that static website hosting requires, it holds public marketing assets confirmed by a content scan, the data and backups containers remain private, and change ticket CHG-5120 authorizes the move. There is no sensitive exposure. Close it and note the ticket. Had a data container been the one made public, or had there been no change record, this would flip to an immediate escalate: the call turns on what is exposed, not on the word public alone.",
  },
};

export default investigation;
