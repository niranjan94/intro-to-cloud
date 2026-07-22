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
    signal: {
      title: "Public blob access enabled on a storage account",
      source: "Azure Activity Log",
      time: "2026-06-11 12:26:31 UTC",
      description:
        "The Azure Activity Log recorded a storageAccounts/write enabling public access on the storage account meridianwebassets, followed by a container write setting its $web container to anonymous blob access.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Evidence",
          rows: [
            {
              label: "Operation",
              value: "Microsoft.Storage/storageAccounts/write",
              wide: true,
            },
            { label: "Storage account", value: "meridianwebassets" },
            { label: "allowBlobPublicAccess", value: "true" },
            { label: "Public container", value: "$web (anonymous blob)" },
            {
              label: "Other containers",
              value: "data, backups (remain private)",
            },
            {
              label: "Static website",
              value: "Enabled (index.html)",
              wide: true,
            },
            { label: "Actor", value: "web-platform-sp (service principal)" },
            { label: "Source IP", value: "198.51.100.34 (Meridian egress)" },
          ],
        },
        {
          heading: "Threat intel",
          chips: ["Exfiltration Over Web Service (T1567)"],
          rows: [],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "Change ticket",
              value:
                "CHG-5120 (approved): move the public marketing site to static website hosting, which requires anonymous read on the reserved $web container",
              wide: true,
            },
            {
              label: "Content scan of $web",
              value:
                "Only public marketing assets; the data and backups containers were untouched and stay private",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AZ-STOR-001" },
            { label: "Category", value: "Data exposure" },
            { label: "Detection source", value: "Activity Log" },
            { label: "Region", value: "eastus" },
            { label: "Replication", value: "Geo-redundant (GRS)" },
            { label: "Event time", value: "2026-06-11 12:26:31 UTC" },
          ],
        },
      ],
      raw: `{
  "class_name": "Detection Finding",
  "severity": "Critical",
  "actor": { "app": { "name": "web-platform-sp" } },
  "src_endpoint": { "ip": "198.51.100.34" },
  "finding_info": {
    "title": "Storage account public access enabled",
    "attacks": [{ "technique": { "uid": "T1567", "name": "Exfiltration Over Web Service" } }]
  },
  "resources": [
    { "uid": "meridianwebassets", "type": "Microsoft.Storage/storageAccounts" }
  ],
  "cloud": { "provider": "azure", "region": "eastus" },
  "unmapped": {
    "raw_event": {
      "operationName": "Microsoft.Storage/storageAccounts/write",
      "caller": "web-platform-sp",
      "callerIpAddress": "198.51.100.34",
      "properties": { "allowBlobPublicAccess": true, "staticWebsite": { "enabled": true, "indexDocument": "index.html" } },
      "status": "Succeeded"
    },
    "follow_up_event": {
      "operationName": "Microsoft.Storage/storageAccounts/blobServices/containers/write",
      "resource": "meridianwebassets/$web",
      "properties": { "publicAccess": "Blob" },
      "status": "Succeeded"
    }
  }
}`,
    },
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
