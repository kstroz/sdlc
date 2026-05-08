# Security Exceptions

## What this file is for

`security-exceptions.json` waives HIGH or CRITICAL findings reported by `npm audit`
that we have consciously decided to accept for a bounded period of time, typically
because we cannot upgrade away from the vulnerable package immediately (e.g. the
fix is unreleased upstream, or the upgrade requires a coordinated breaking change).

It is **not** a way to silence findings forever. Every entry has an expiry.

## Where it lives

In a feature branch, the active exceptions file lives at:

```
.pipeline/05-dev/_security-exceptions.json
```

The template that documents the schema lives alongside this doc at
`pipeline/conventions/_global/security-exceptions-template.json`.

## The rule

Every exception entry MUST satisfy all of the following:

1. `expires` is a date no more than **90 days** from `approved_at`.
2. `tracking_ticket` points to a real JIRA ID or GitHub issue URL that captures
   the remediation work.
3. `approver` is a reviewer who is **not** the PR author. Self-approval is not
   permitted.

Entries that fail any of these checks are treated as if they did not exist.

## How `security-reviewing-stage-05` consumes it

When `security-reviewing-stage-05` runs `npm audit` and observes a HIGH or
CRITICAL finding, it cross-references this file by CVE:

- **CVE listed, not expired** -> finding is downgraded from FAIL to **WARN**.
  The PR can proceed but the warning is surfaced in the review summary.
- **CVE listed, expired** -> finding is **FAIL** with the reason
  `expired waiver`. The exception must be renewed (with a fresh approver and a
  new expiry) or the underlying vulnerability must be fixed.
- **CVE not listed** -> finding is **FAIL** as normal.

## How to add an entry

1. Copy a block from `security-exceptions-template.json` into the project's
   `.pipeline/05-dev/_security-exceptions.json`.
2. Fill in `cve`, `package`, `severity`, `reason`, `tracking_ticket`, `expires`
   (<= 90 days out), and your approver's name.
3. Open or update your PR. Have the named approver confirm sign-off in a PR
   comment; they fill in `approver` and `approved_at` at that point.
4. Re-run stage 05; the WARN should appear in place of the original FAIL.
