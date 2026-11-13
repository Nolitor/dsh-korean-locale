# Handoff — `@nolit/dsh-korean-locale`

<!-- skeleton:
version: 1.0
kind: handoff
status: active
updated: 2026-11-14
summary: Session handoff for the Korean language pack after the DSH 0.2.2-rc.3 regeneration, with measured state, version ladder, re-extraction steps, and open items.
-->

> Status: active · Version `0.0.1-rc.4` · Last updated 2026-11-14 · Runtime DSH `0.2.2-rc.3` · Node `v24.22.1`

## 1. Measured state (source of truth, not a plan)

| Surface | Measured | How |
| :--- | :--- | :--- |
| Package version | `0.0.1-rc.4` | `package.json`, `market/index.json`, `release.manifest.json` |
| Dictionaries | **77 namespaces / 4,253 keys** | `npm run verify` |
| Runtime snapshot | `@deepseek-ai/dsh 0.2.2-rc.3` | `data/coverage.json` → `source.commit` |
| en↔zh key parity | 0 diffs | `scripts/extract-dictionaries.mjs` report |
| Missing / extra / placeholder mismatches | 0 / 0 / 0 | `npm run verify` |
| Generated browser half | `lib/client.js` rebuilt (260,549 B) | `npm run build` |
| `engines.dsh` | `>=0.2.2-alpha.2 <0.3.0` (rc.3 is inside the window) | `package.json` |

Reproduce:

```bash
node scripts/extract-dictionaries.mjs --out /tmp/dicts   # en/zh + parity report from the installed runtime
npm run build                                            # data/ko.json + styles -> lib/client.js
npm run verify                                           # metadata + coverage + apply + typography + stand-down
```

The extractor executes each installed `lib/client.js` bundle in a `node:vm` sandbox with a stub
plugin context, so `...spread` dictionary bases, shorthand bindings, and interpolated values are
resolved by the engine. Static regex parsing was measured to lose entire spread namespaces
(`schedule.catalog`, `settings.account`, `open-in-app`, `settings.agentPreset`, `sidebarImage`,
`sidebarPdf`) and to report 0 namespaces against the minified rc.3 bundles.

## 2. What changed in this session

- Regenerated the snapshot from the rc.3 runtime: 3 new namespaces (`cuaPermissions`,
  `deepseekChatImport`, `account.notifications`), 460 new strings, 61 retired keys, 5 retired
  namespaces (`schedule.manager`, `permission.access`, `directory-browser`, `inspectorPanel`,
  `contextMenu`), 2 placeholder repairs.
- Korean wording: drafted by the OpenCode/MiniMax pipeline, independently translated and reviewed
  by **Gemini 4 Hydrogen** (466/466 keys + glossary), merged with placeholder/terminology checks.
  **EXAONE `k-exaone_v2.5` could not complete** (no subagent surface; direct API returned
  `429 rate_limit_exceeded` and multi-minute stalls) — the two-model comparison is half open.
- Repaired the corrupted `README.md` (`v0.0.1-0.0.1-rc.1`, `sou0.0.1-rc.1`, `a0.0.1-rc.1ives`) by
  restoring from `HEAD` and re-applying the rc.3 update, instead of patching the corruption.
- Fixed the workspace measurement tool `scripts/measure-locale-delta.mjs` for the minified rc.3
  bundle shape; it had been reporting 0 namespaces.

## 3. Why the version is `rc.4`, not `rc.1`

The `rc.<n>` suffix is the agent history marker (the numeric part `0.0.1` is owner-gated). Sessions
that changed this plugin's files:

| # | Date | Evidence | Correct version |
| :-: | :--- | :--- | :--- |
| 1 | 2026-11-05 | `16cd630` regenerated for DSH 0.2.2-rc.1 | `rc.1` |
| 2 | 2026-11-06 | `b5ba809`, `adefb6f` metadata/README corrected, no bump | `rc.2` (missed) |
| 3 | 2026-11-13 | README.md/README.ko.md rewritten, README corrupted, no bump | `rc.3` (missed) |
| 4 | 2026-11-14 | this regeneration | **`rc.4`** |

## 4. Open items

1. **Workspace boot card is stale.** `bootcards/2026-11-14T0409+0900.md` still records the pack as
   `0.0.1-rc.1`, "68 namespaces / 3,019 keys", and artifact SHA `missing`. Boot cards are
   owner-owned; ask the Master before editing one.
2. **Release artifacts.** `artifacts/SHA256SUMS.*` has no entry for this version; never claim a
   release without a matching hash.
3. **Push.** The submodule commit exists locally only; no remote push was performed.
4. **Wording review coverage.** Reviewers covered the 460 new/changed strings; a full pass over the
   ~3,500 carried-over Korean strings was not done and remains a separate task.
5. **Live profile.** The pack is installed in `~/.dsh/profiles/web`; this session did not restart
   the service. A browser refresh is enough for client-side modules, but a stale installed copy
   must be re-added before the new snapshot shows up.

## 5. Related records

- [CHANGELOG.md](CHANGELOG.md) / [CHANGELOG.ko.md](CHANGELOG.ko.md) — version history
- [README.md](README.md) / [README.ko.md](README.ko.md) — package documentation
- `../docs/HANDOFF.md`, `../docs/RULES.md` — workspace-level handoff and rules
