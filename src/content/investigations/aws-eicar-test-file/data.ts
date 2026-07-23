import type { Investigation } from "@/components/investigation/types";

/**
 * Anchored to the GuardDuty Malware Protection for EC2 finding
 * "Execution:EC2/MaliciousFile" (surfaced through GuardDuty Malware Protection,
 * OCSF Detection Finding, class_uid 2004). GuardDuty's agentless scan matched a
 * known-malware signature against a file on an EBS volume. The severity of a
 * MaliciousFile finding varies with the detected threat; this one carries High.
 * There is no honest ATT&CK technique for a signature match on a test artifact,
 * so `mitre` is left undefined rather than invented. The matched file is the
 * EICAR standard antimalware test file, dropped on a schedule by the SOC's own
 * antimalware control-validation job, so a hash match on a known, inert test
 * string is the control working as designed, not a compromise: the correct call
 * is to close it as a false positive. All instance data is fictional (ADR-0005):
 * org "Meridian", account 400123456789, RFC 1918/5737 addresses, synthetic
 * instance/volume ids. The EICAR SHA-256 is a publicly published constant for a
 * file that contains no viral code.
 */
const investigation: Investigation = {
  id: "aws-eicar-test-file",
  title: "A malicious file on a production host",
  short:
    "GuardDuty's malware scanner flags a malicious file on a production instance. Infection, or something you put there?",
  sourcePlatform: "aws",
  difficulty: "standard",
  severity: "high",
  eventType: "Malicious File Detected",
  detectionSource: "GuardDuty Malware Protection",
  evidence: {
    signal: {
      title: "Malicious file detected on an EC2 instance",
      source: "GuardDuty Malware Protection",
      time: "2026-07-02 03:17:52 UTC",
      description:
        "Amazon GuardDuty Malware Protection for EC2 matched a file against a known-malware signature during an agentless scan of the EBS volume attached to this production instance. The finding reports the threat name, the file's SHA-256 hash and path, and the scan that produced it. GuardDuty reports that a signature matched; it does not determine how the file arrived or whether the detection is expected in this environment.",
      triage: {
        source: "fallback",
        disposition: "investigating",
        confidence: 0,
        note: "Not model-assessed. The pipeline applied the catalog severity and routed this to an analyst for a call.",
      },
      sections: [
        {
          heading: "Threats detected",
          rows: [
            { label: "Threat name", value: "EICAR-Test-File" },
            { label: "Threat severity", value: "High" },
            { label: "File name", value: "control-validation.exe" },
            {
              label: "File path",
              value: "/opt/meridian-secops/av-selftest/control-validation.exe",
              wide: true,
            },
            {
              label: "SHA-256",
              value:
                "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
              wide: true,
            },
            { label: "File size", value: "68 bytes" },
            {
              label: "Volume ARN",
              value:
                "arn:aws:ec2:us-east-1:400123456789:volume/vol-0a1b2c3d4e5f60718",
              wide: true,
            },
          ],
        },
        {
          heading: "Affected resource",
          rows: [
            { label: "Instance", value: "i-0c72e5a913f4b8d60" },
            { label: "Role", value: "Application batch worker" },
            { label: "Network", value: "vpc-0c11 / subnet-0e93 (private)" },
            { label: "Public IP", value: "None" },
            {
              label: "Inbound from internet",
              value: "None (no route, no ELB)",
              wide: true,
            },
          ],
        },
        {
          heading: "Malware scan details",
          rows: [
            {
              label: "Scan ID",
              value:
                "8a1f4c7e2b934d609f183c5e6a2b1d04c7e19b40f2a6d38b0e5c1749a2f6b3d8",
              wide: true,
            },
            { label: "Scan type", value: "On-demand" },
            { label: "Files scanned", value: "254,113" },
            { label: "Snapshot retained", value: "Yes" },
          ],
        },
        {
          heading: "Context",
          rows: [
            {
              label: "File provenance",
              value:
                "Written by svc-secops-validation, the scheduled antimalware control-validation job, which drops the EICAR standard test file to confirm GuardDuty scanning still fires",
              wide: true,
            },
            {
              label: "Change ticket",
              value: "CHG-5233 covers the recurring control-validation test",
              wide: true,
            },
          ],
        },
        {
          heading: "Details",
          rows: [
            { label: "Alert ID", value: "AWS-GD-MAL-206" },
            { label: "Finding type", value: "Execution:EC2/MaliciousFile" },
            { label: "Category", value: "Malware" },
            {
              label: "Detection source",
              value: "GuardDuty Malware Protection",
            },
            { label: "Account", value: "400123456789" },
            { label: "Region", value: "us-east-1" },
            { label: "Event time", value: "2026-07-02 03:17:52 UTC" },
          ],
        },
      ],
      raw: `{
  "class_uid": 2004,
  "class_name": "Detection Finding",
  "activity_id": 1,
  "severity": "High",
  "metadata": {
    "product": { "name": "GuardDuty", "vendor_name": "AWS", "feature": { "name": "Malware Protection for EC2" } },
    "version": "1.1.0"
  },
  "finding_info": { "title": "Malicious file detected on an EC2 instance", "uid": "AWS-GD-MAL-206" },
  "malware": [
    {
      "name": "EICAR-Test-File",
      "classification_ids": [0],
      "path": "/opt/meridian-secops/av-selftest/control-validation.exe",
      "provider": "GuardDuty Malware Protection"
    }
  ],
  "evidences": [
    {
      "file": {
        "name": "control-validation.exe",
        "path": "/opt/meridian-secops/av-selftest/control-validation.exe",
        "size": 68,
        "hashes": [{ "algorithm": "SHA-256", "value": "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f" }]
      }
    }
  ],
  "resources": [
    { "uid": "i-0c72e5a913f4b8d60", "type": "AWS::EC2::Instance", "vpc_uid": "vpc-0c11", "subnet_info": { "uid": "subnet-0e93" }, "ip_addresses": ["10.42.6.51"] }
  ],
  "cloud": { "provider": "aws", "region": "us-east-1", "account": { "uid": "400123456789" } },
  "unmapped": {
    "finding_type": "Execution:EC2/MaliciousFile",
    "threat_name": "EICAR-Test-File",
    "scan_id": "8a1f4c7e2b934d609f183c5e6a2b1d04c7e19b40f2a6d38b0e5c1749a2f6b3d8",
    "scan_type": "ON_DEMAND",
    "files_scanned": 254113,
    "volume_arn": "arn:aws:ec2:us-east-1:400123456789:volume/vol-0a1b2c3d4e5f60718",
    "snapshot_retained": true,
    "placed_by": "svc-secops-validation scheduled antimalware control-validation test",
    "change_ticket": "CHG-5233"
  }
}`,
      unmapped: [
        { label: "finding_type", value: "Execution:EC2/MaliciousFile" },
        { label: "threat_name", value: "EICAR-Test-File" },
        { label: "scan_type", value: "ON_DEMAND" },
        { label: "snapshot_retained", value: "true" },
        {
          label: "placed_by",
          value:
            "svc-secops-validation scheduled antimalware control-validation test",
          wide: true,
        },
        { label: "change_ticket", value: "CHG-5233" },
      ],
    },
  },
  aspects: [
    {
      id: "malware-match",
      label: "A malware signature matched a file on a production EC2 instance",
      signal: true,
      reasoning: {
        prompt:
          "Why flag a malware detection on a production host before you can explain it?",
        options: [
          "Because any malware finding is an active breach until the instance is terminated",
          "Because a confirmed signature match on a production host must be identified and attributed before it can be closed, rather than dismissed on a hunch",
          "Because GuardDuty only reports files that are currently executing",
        ],
        correct: 1,
      },
      note: "You were right to flag it. A malware match on a production instance is never ignored. Flagging it means it must be identified, not that it is automatically an incident; here it identifies cleanly as a test artifact.",
    },
    {
      id: "provenance",
      label: "How the flagged file arrived on the host is not yet established",
      signal: true,
      reasoning: {
        prompt:
          "Why does establishing how the file got onto the host decide this call?",
        options: [
          "Because a file with an unknown origin is always attacker-placed",
          "Because attributing the file to a known process, a change, a job, or a person, is what separates a sanctioned artifact from an intrusion",
          "Because GuardDuty cannot scan a file unless it records who wrote it",
        ],
        correct: 1,
      },
      note: "Correct to check. Provenance is the hinge. Here the file maps to svc-secops-validation, the scheduled antimalware control-validation job, under CHG-5233, which is exactly how this artifact is meant to appear.",
    },
    {
      id: "high-severity",
      label: "The finding is rated High severity",
      signal: false,
      note: "A MaliciousFile finding's severity varies with the detected threat and is a static rating of the signature category. It does not know this specific file is a standard, inert test artifact. The badge is an input to your analysis, not the verdict.",
    },
    {
      id: "malicious-in-type",
      label: "The finding type is Execution:EC2/MaliciousFile",
      signal: false,
      note: "The finding type names the signature category the match fell under, not a judgment on this file. The EICAR string is designed to trip the malicious-file signature, so the word in the type is expected here, not evidence of compromise.",
    },
    {
      id: "exe-extension",
      label: "The matched file has an executable (.exe) extension",
      signal: false,
      note: "The extension does not determine danger, and the scanner matched on content, not on the name. The EICAR string is 68 printable-ASCII bytes and is inert; a copy under any other name would match just the same.",
    },
    {
      id: "snapshot-retained",
      label: "GuardDuty retained an EBS snapshot of the volume",
      signal: false,
      note: "Retaining a snapshot when a file matches is the feature's normal behavior for every malicious-file finding. Seeing it tells you the pipeline did its job, not that this file is dangerous.",
    },
  ],
  extract: [
    {
      id: "threat-name",
      label: "Threat name reported in the finding",
      hint: "the name in the Threats detected section",
      accept: ["EICAR-Test-File", "EICAR", "EICAR Test File", "EICAR-AV-Test"],
      normalize: "text",
    },
    {
      id: "sha256",
      label: "SHA-256 of the matched file",
      hint: "the hash in the Threats detected section",
      accept: [
        "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
      ],
      normalize: "text",
    },
    {
      id: "instance",
      label: "Instance the file was found on",
      hint: "the i-... resource uid",
      accept: ["i-0c72e5a913f4b8d60"],
      normalize: "text",
    },
  ],
  verdict: {
    correct: "close",
    why: "The malware detection was correct to flag and correct to identify, and it resolves the moment you read past the headline. The threat name is EICAR-Test-File, and the file's SHA-256 matches the published 68-byte EICAR standard antimalware test string: an industry-standard, inert artifact that contains no viral code and exists only to prove that a scanner detects something. The file was written by the scheduled antimalware control-validation job (svc-secops-validation) under CHG-5233, which drops the EICAR string on a cadence to confirm GuardDuty's scanning still fires. A signature match on a known test file placed by your own control test is the control working as designed, not a compromise. There is nothing to hand off, so close it as a false positive and note the validation job. Escalating is the tempting wrong call: the finding is High severity, the type is Execution:EC2/MaliciousFile, and the file ends in .exe, all of which read like an incident until you notice the file is provably the harmless test string. Routing is wrong too, because there is no posture gap for another team to remediate; the control is functioning. The lesson: a detector's severity and the word malicious in a finding type describe the signature category, not this specific file. Identify the artifact by name and hash before you act on the badge.",
  },
};

export default investigation;
