# EV Charging Waitlist Landing Page

This folder contains a static, publish-ready landing page for the first real
Oasis Now EV charging waitlist or lead-capture launch.

Unlike `landing/ev-charging-mvp/`, this artifact is meant to be hostable:

- It does not depend on the repo-local intake API.
- It does not expose the local validation, handoff, or ops workflow.
- It expects the buyer and provider calls to action to point at real hosted
  forms, a waitlist tool, or a thin deployed app.

## Files

- `index.html`: hosted waitlist landing page
- `styles.css`: mobile-first visual system for the public page
- `app.js`: reads simple launch config and enables/disables CTA links
- `config.js`: launch config for buyer/provider URLs and support text

## How To Use

1. Preferred config path:

```powershell
python scripts/configure_waitlist_launch.py `
  --buyer-cta-url https://waitlist.oasisnow.app/buyer-waitlist `
  --provider-cta-url https://waitlist.oasisnow.app/provider-interest `
  --owner-label "Oasis Now launch ops" `
  --support-email support@oasisnow.app
```

This writes a launch-ready `landing/ev-charging-waitlist/config.js` with
public-facing defaults for the page mode and CTA helper copy. If needed, pass
`--market-label`, `--page-mode-label`, `--buyer-cta-label`,
`--provider-cta-label`, or `--cta-helper` to override those values. Use
`--dry-run` if you want to inspect the generated config before writing it.

If the launch operator prefers a reusable handoff file instead of a long CLI,
start from a gitignored local copy:

```powershell
python scripts/init_waitlist_launch_inputs.py
```

This creates
[`docs/business/ev-charging-waitlist-launch-inputs.local.json`](/C:/Users/hieng/Documents/GitHub/oasis_now/docs/business/ev-charging-waitlist-launch-inputs.local.json)
from the checked-in example template. Fill in the real values locally, then run:

```powershell
python scripts/configure_waitlist_launch.py
```

The script auto-loads that gitignored local file when it exists. Explicit CLI
flags still override values loaded from `--inputs-file`, and an explicit
`--inputs-file` path still overrides the default local file.

If you want the scaffold command itself to check the generated draft right
away, append `--validate`:

```powershell
python scripts/init_waitlist_launch_inputs.py --validate
```

That validates the created local JSON and immediately reports which placeholder
CTA, support, or hosted-proof values still need replacement before launch.

If `config.js` already contains real CTA and support values and you want the
same command to seed the local file from that config and then sync the config
again from the generated local draft, use:

```powershell
python scripts/init_waitlist_launch_inputs.py --seed-from-config --write-config
```

This keeps the proof metadata on example defaults until a real hosted page URL
is known, while still letting one command recreate the gitignored draft and
rewrite `landing/ev-charging-waitlist/config.js` from the same staged inputs.

If `landing/ev-charging-waitlist/config.js` already contains the real CTA and
support values, you can avoid retyping them:

```powershell
python scripts/init_waitlist_launch_inputs.py --seed-from-config
```

This copies the current public config fields into the gitignored local JSON and
leaves the proof metadata on its example defaults until a real hosted page URL
is known.

If the hosted page URL and proof details are already known, also fill in the
optional proof metadata fields in that local JSON file:

- `hosted_page_url`
- `proof_capture_method`
- `proof_intake_mode`
- `proof_summary`
- `proof_output_path`
- `proof_notes`

Those fields are not used for `config.js`, but they let
`python scripts/check_waitlist_launch_readiness.py` emit a concrete
copy-paste `capture_live_waitlist_proof.py` command once the bundle is ready to
host. If you set `proof_output_path`, it must be a repo-local `.png` target
under `docs/business/proofs/`, such as
`docs/business/proofs/waitlist-live.png`. If you set `hosted_page_url`, make it
an absolute `http` or `https` URL that does not point at `localhost`,
`127.0.0.1`, another loopback host, or a private-network IP such as
`192.168.x.x`. Reserved placeholder hosts such as `example.com` and `.test`
also fail validation so the staged proof command already points at a real
public target.

If the CTA values are already staged and you only need to add the hosted-page
proof details later, use:

```powershell
python scripts/stage_waitlist_live_proof_inputs.py `
  --hosted-page-url https://waitlist.oasisnow.app/oasis-now-waitlist `
  --proof-summary "Hosted EV charging waitlist is reachable."
python scripts/smoke_test_stage_waitlist_live_proof_inputs.py
```

This updates only the proof-related fields in the gitignored local launch-input
file and keeps the existing CTA, support, and owner values intact.

If the local launch-input file does not exist yet but `config.js` already has
the real CTA and support values, you can create and stage the proof metadata in
one step:

```powershell
python scripts/stage_waitlist_live_proof_inputs.py `
  --create-if-missing `
  --seed-from-config `
  --hosted-page-url https://waitlist.oasisnow.app/oasis-now-waitlist `
  --proof-summary "Hosted EV charging waitlist is reachable."
```

This seeds the gitignored local JSON from the current public config instead of
the checked-in placeholder example, so the proof-staging step stays usable late
in the launch handoff flow.

Optional validation before writing `config.js`:

```powershell
python scripts/validate_waitlist_launch_inputs.py
python scripts/smoke_test_validate_waitlist_launch_inputs.py
```

This reports whether the staged local launch-input file is missing, invalid, or
ready to generate the public waitlist config.

2. Manual fallback: edit `landing/ev-charging-waitlist/config.js` directly and
   set:
   - `buyerCtaUrl`
   - `providerCtaUrl`
   - `marketLabel`
   - `supportEmailText`
3. Run:

```powershell
python scripts/prepare_waitlist_release.py --check-only
```

Optional local HTTP preview:

```powershell
python scripts/preview_static_site.py --site-dir landing/ev-charging-waitlist --open-browser
python scripts/preview_static_site.py --site-dir landing/ev-charging-waitlist --quiet
```

Optional local screenshot capture for launch review:

```powershell
python scripts/capture_static_site_screenshot.py
python scripts/smoke_test_capture_static_site_screenshot.py
```

Optional regression check for the bundling path:

```powershell
python scripts/smoke_test_configure_waitlist_launch.py
python scripts/smoke_test_init_waitlist_launch_inputs.py
python scripts/smoke_test_validate_waitlist_launch_inputs.py
python scripts/smoke_test_waitlist_release.py
```

Optional blocker report before editing or hosting:

```powershell
python scripts/check_waitlist_launch_readiness.py
python scripts/smoke_test_check_waitlist_launch_readiness.py
```

4. Open `landing/ev-charging-waitlist/index.html` locally and confirm both CTA
   buttons are active.
   If you want the same review over HTTP instead of `file://`, use the preview
   server command above.
5. Preferred handoff path for hosting:

```powershell
python scripts/create_waitlist_launch_handoff.py
python scripts/smoke_test_create_waitlist_launch_handoff.py
python scripts/audit_waitlist_release.py
```

This validates the config, creates the release bundle, captures a local HTTP
preview screenshot, and writes `HANDOFF-SUMMARY.json` plus
`HANDOFF-LAUNCH-INPUTS.json` inside the timestamped bundle. The launch-input
report records whether the bundle was generated from a staged local
`ev-charging-waitlist-launch-inputs.local.json` file or from direct config
state only. It also updates `records/releases/ev-charging-waitlist/latest.zip`
and `records/releases/ev-charging-waitlist/latest-release.json` as stable
pointers to the newest handoff artifact. Run the audit command before handing
the archive to a host so the latest alias and the timestamped bundle are still
in sync.
The same handoff run also refreshes stable aliases for
`latest-handoff-summary.json`, `latest-handoff-next-steps.md`,
`latest-hosting-checklist.md`, and `latest-handoff-launch-inputs.json`, so the
newest host-facing artifacts can be reviewed without first resolving the
timestamped bundle path.
The command also echoes the same launch-input status and either the exact live
proof capture command or the proof-metadata staging fallback directly in the
terminal while keeping the machine-readable JSON result on stdout.
If an automation caller only wants stdout JSON, append `--quiet` to suppress
that stderr summary.

If that staged local launch-input file also includes `hosted_page_url` plus
the optional proof metadata fields, the generated `HANDOFF-SUMMARY.json` and
`HANDOFF-NEXT-STEPS.md` now include the exact
`capture_live_waitlist_proof.py` command the host or operator should run after
the page is live. If the hosted URL is not staged yet, the same handoff files
now fall back to the exact `stage_waitlist_live_proof_inputs.py` command needed
to seed or update the proof metadata first.

The handoff flow now rewrites `HOSTING-CHECKLIST.md` with that same staged live
proof command or proof-metadata staging fallback, so the host-facing checklist,
handoff note, and handoff summary stay in sync.

`HANDOFF-SUMMARY.json` and `HANDOFF-LAUNCH-INPUTS.json` now also include a
grouped `next_commands` list so recurring loops or local tools can consume the
same host-review and live-proof steps from the bundle itself without scraping
Markdown prose.

If you want a single local report that tells you whether launch is blocked by
missing launch inputs, config placeholders, missing handoff artifacts, or
still-missing hosted proof,
run:

```powershell
python scripts/check_waitlist_launch_readiness.py
python scripts/check_waitlist_launch_readiness.py --markdown --output records/releases/ev-charging-waitlist/latest-readiness.md
python scripts/check_waitlist_launch_readiness.py --output records/releases/ev-charging-waitlist/latest-readiness.json
```

If the gitignored local launch-input file exists, this report also checks
whether `landing/ev-charging-waitlist/config.js` is still in sync with those
staged values so a stale CTA URL is caught before hosting handoff.

The JSON and Markdown readiness exports also include a structured
`live_proof_handoff` block. It mirrors the current hosted-proof state with the
exact `capture_live_waitlist_proof.py` command when proof metadata is staged,
or the exact `stage_waitlist_live_proof_inputs.py` fallback when it is not.

Those exports now also include grouped `next_commands`, so local tools can use
one normalized launch-command list instead of merging
`recommended_commands` with `live_proof_handoff` manually.

They also surface the stable handoff alias paths for
`latest-handoff-summary.json`, `latest-handoff-next-steps.md`,
`latest-hosting-checklist.md`, and `latest-handoff-launch-inputs.json`, so the
current host-facing bundle files can be opened directly from the readiness
snapshot.

If the current `config.js` is launch-ready but that local launch-input file is
still missing, the readiness report now recommends the
`stage_waitlist_live_proof_inputs.py --create-if-missing --seed-from-config`
shortcut so hosted-proof staging does not fail on a missing file.

When that same local file includes `hosted_page_url` and the optional proof
metadata fields, the readiness report upgrades its recommended hosted-proof
command from a placeholder example to a concrete command that already includes
the real live URL, owner label, capture method, optional proof summary,
optional screenshot output path, and notes.

The `launch` verifier profile also refreshes
`records/releases/ev-charging-waitlist/latest-readiness.md` and
`records/releases/ev-charging-waitlist/latest-readiness.json` from the real
repo state, so both a shareable blocker snapshot and a machine-readable
automation artifact exist even when the terminal output is not handy.

If you only need a faster blocker refresh plus the checked-in MVP readiness
snapshot, use:

```powershell
python scripts/run_local_mvp_checks.py --profile launch_status
```

This lighter profile skips the slower preview, release-bundle, and screenshot
smoke tests while still refreshing the current launch-readiness artifacts and
`docs/business/mvp-status.json`.

6. If you only need the bundle without the preview screenshot, create it with:

```powershell
python scripts/prepare_waitlist_release.py
```

That lighter release path now writes `HOSTING-CHECKLIST.md` with the same
launch-input status plus live-proof capture command or proof-metadata staging
fallback used by the richer handoff workflow, so the operator still gets
actionable next steps even when no preview screenshot is needed.
It also prints that same launch-input status and either the exact live-proof
capture command or the proof-metadata staging fallback directly in the terminal,
so a local operator does not need to open the bundle just to see the next
hosted-proof step.

7. Review the generated `.zip` archive plus `HOSTING-CHECKLIST.md`,
   `release-manifest.json`, `HANDOFF-SUMMARY.json`,
   `HANDOFF-LAUNCH-INPUTS.json`, and `HANDOFF-NEXT-STEPS.md` inside the
   timestamped bundle so the handoff includes the configured CTA targets,
   owner label, preview evidence, the staged launch-input validation snapshot,
   and a shareable checklist for the host or form owner. If you only need the
   newest export quickly, use the stable `latest.zip` alias or inspect
   `latest-release.json` first.
8. Host the generated bundle on a static site provider or another simple web
   host.
9. After the hosted page is reachable, save a hosted-page screenshot under
   `docs/business/proofs/` and update:

```text
docs/business/live-waitlist-proof.json
```

   The preferred `python scripts/capture_live_waitlist_proof.py` path now
   enforces that `--output-path` stays under `docs/business/proofs/` and ends
   in `.png`, so the operator CLI matches the staged launch-input validation.

## Why It Exists

- Removes friction between the current local-only MVP scaffold and the first
  real hosted waitlist proof.
- Keeps the public page narrow and understandable under stress: one buyer path,
  one provider path, clear manual follow-up expectations.
- Lets the team use any hosted form or waitlist tool later without rewriting
  the page itself.
- Preserves the existing repo-local intake, handoff, validation, and ops
  surfaces for internal testing.
