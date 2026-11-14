# Changelog

Notable changes to `@nolit/dsh-korean-locale`. English is the default
language; the Korean companion is [CHANGELOG.ko.md](CHANGELOG.ko.md).
Versions follow [Semantic Versioning](https://semver.org/).

Current version: `0.0.1-rc.4`

## 0.0.1-rc.4 — regenerated against DSH 0.2.2-rc.3; rc ladder corrected — 2026-11-14

The pack had stayed at `0.0.1-rc.1` while two later sessions changed its files without
incrementing the history marker, and one of those sessions left a corrupted `README.md`
(`v0.0.1-rc.1` misprinted as a doubled scheme, `source` and `archives` mangled the same way — a
naive global replacement of the `rc` token). This entry fixes the ladder and the corruption, and
regenerates the dictionary
snapshot against the running rc.3 runtime.

Measured before → after (extracted from the installed `0.2.2-rc.3` client bundles with
`scripts/extract-dictionaries.mjs`; the extractor executes each bundle in a `node:vm` sandbox,
so `...spread` bases and interpolated values resolve instead of being dropped):

| Surface | Before (rc.1 pack) | After (rc.3) |
| :--- | :--- | :--- |
| Namespaces | 74 | **77** |
| Keys | 3,843 | **4,253** |
| New rc.3 namespaces | — | `cuaPermissions` 66, `deepseekChatImport` 31, `account.notifications` 1 |
| New strings translated | — | **461** (362 in surviving namespaces + 98 in the new ones + `contextMenu.back`) |
| Retired namespaces removed | — | none — see the extraction blind spot below |
| Retired keys in surviving namespaces | — | 0 |
| Placeholder repairs | `pluginManager.updateStepInstalling`, `settings.webSearch.baseUrlHint` | `{source}` / `{path}` restored |
| Version | `0.0.1-rc.1` | **`0.0.1-rc.4`** |
| `npm run verify` | 74 / 3,843 | **77 / 4,253**, 0 missing, 0 extra, 0 placeholder mismatches, en/zh parity 0 |

Version ladder (owner instruction: the `rc.<n>` suffix is the agent's history marker, the numeric
part `0.0.1` is owner-gated): rc.1 = 2026-11-05 reset; the 2026-11-06 metadata session changed
`release.manifest.json` and `README.md` without bumping (should have been rc.2); the 2026-11-13
session rewrote both READMEs, corrupted `README.md`, and did not bump (should have been rc.3);
this is the fourth session → **rc.4**. The corrupted README is restored from `HEAD` and then
updated for rc.3 rather than patched in place.

### Extraction blind spot found after the first regeneration

The first regeneration dropped five namespaces (`schedule.manager` 215 keys,
`permission.access` 17, `directory-browser` 13, `inspectorPanel` 5, `contextMenu` 1) because
rc.3 registers them with a **variable payload** (`locale.register(NS, dictionaries)`), the
**three-argument form** (`locale.register(NS, locale, dict)`), or from `lib/client.page.js`
instead of `lib/client.js`. A parser that only accepts an inline object literal cannot bind the
`en`/`zh` dictionaries for those calls, so they looked retired while remaining live in the GUI.
That is a silent regression: `verify.mjs` stays green because it only checks internal
consistency. The extractor now resolves all five shapes (and positional const redefinitions),
and the committed pack carries them again — 237 of the 252 strings are the existing rc.1 Korean
restored verbatim; only `contextMenu.back` is new.

Tooling and review:

- `scripts/extract-dictionaries.mjs` added (contributed by the OpenCode/MiniMax subagent):
  executes the installed client bundles in a sandbox and emits `en.json`, `zh.json`, and a
  parity report.
- The workspace's `scripts/measure-locale-delta.mjs` was updated for the minified rc.3 bundle
  shape (backtick literals, `ctx.effect(() => ctx.locale.register(...))`, `...spread` bases).
  Before the fix it reported 0 namespaces against rc.3.
- Korean wording: drafted by the OpenCode/MiniMax pipeline and independently translated/reviewed
  by **Gemini 4 Hydrogen** (466/466 keys, plus a 20-term glossary), then merged per key with
  placeholder and terminology checks. **EXAONE `k-exaone_v2.5` did not complete**: the provider
  declares no subagent surface (the generic subagent route fails), and the direct
  OpenAI-compatible endpoint answered `/v1/chat/completions` with
  `429 rate_limit_exceeded` plus multi-minute stalls, so a full or sampled comparison could not be
  produced. The EXAONE half of the requested two-model comparison remains open.
- `verify.mjs` now asserts 77 namespaces / 4,253 keys and the `@deepseek-ai/dsh 0.2.2-rc.3`
  source commit.

Not changed, and why:

- `engines.dsh` stays `>=0.2.2-alpha.2 <0.3.0`; 0.2.2-rc.3 is inside that declared window.
- `NOTICE:11` still records `Base version: DSH 0.2.2-alpha.2`; the NOTICE is an attribution
  document owned by the Master, not release metadata.
- `$schema` in `release.manifest.json` remains unresolvable, matching the sibling published
  repository (workspace-wide convention decision, not a per-track defect).

## 0.0.1-rc.1 — published to GitHub; release metadata corrected — 2026-11-06

The two commits carrying the rc.1 regeneration had never been pushed, and
`release.manifest.json` still described the alpha.2 snapshot.

Measured before → after:

| Surface | Before | After |
| :--- | :--- | :--- |
| `origin/main` | `8cf88a3` (2 commits behind local) | **`b5ba809`** (local, remote and superproject gitlink agree) |
| `release.manifest.json` description (en/ko) | 68 dictionaries / 3,019 strings, DSH `0.2.2-alpha.2` | **74 dictionaries / 3,843 strings, DSH `0.2.2-rc.1`** |
| `release.manifest.json` release notes | v0.2.4 first-run onboarding text | **v0.0.1-rc.1 regeneration text** |
| Superproject `.gitmodules` url | `linuxsung/dsh-korean-locale` (301 redirect) | **`Nolitor/dsh-korean-locale`** |
| Superproject gitlink | `16cd630` (existed on no remote) | **`b5ba809`** (pushed) |

Verified after the push: a fresh `git clone --recurse-submodules` of the
repository resolves and `node scripts/verify.mjs` reports 74 namespaces /
3,843 keys. `npm run verify` was re-run before the commit and stayed green.

Not changed, and why:

- `$schema` (`../../release-harness/schema/release.manifest.schema.json`) is
  unresolvable — the path is one level too shallow *and* the target directory is
  empty. It is left as-is because the sibling published repository
  (`Nolitor/dsh-sidebar-manager`) uses the identical path, so this is a
  workspace-wide convention decision, not a per-track defect. Owner decision
  needed.
- `NOTICE:11` still says `Base version: DSH 0.2.2-alpha.2`. Left for the owner
  because the NOTICE is an attribution document, not release metadata.

## 0.0.1-rc.1 — regenerated against DSH 0.2.2-rc.1; owner version ladder — 2026-11-05

Owner decision (2026-11-05): every `@nolit` track reports `0.0.1-rc.N`, and the pack must be
regenerated against the **rc.1** dictionaries, not renamed from the alpha.3 snapshot.

Measured before → after (extracted from the installed rc.1 client bundles):

| Surface | Before (alpha.3) | After (rc.1) |
| :--- | :--- | :--- |
| Namespaces | 69 | **74** |
| Keys | 3,088 | **3,843** |
| New rc.1 namespaces translated | — | `stats` 177, `liveshare` 225, `forgePanel` 253, `creationRecommendations` 55, `pluginRecommendations` 25, `actionCards` 14, `contextMenu` 1 |
| Existing keys added | — | 76 (schedule catalog/manager host copy) |
| Retired keys removed | — | 66 |
| Retired namespaces removed | — | `claude-code-mods`, `deepseek-model-label-1017` (no rc.1 registrations) |
| Registration | `addLanguage({id,label,fallback})` + per-locale `register` | unchanged — already the rc.1 catalogue contract; `ko` selectable with `fallback: "en"` |
| `engines.node` | `>=24` | `>=24.9` (rc.1 minimum) |
| Version | `0.2.5` | `0.0.1-rc.1` |
| `npm test` (`scripts/verify.mjs`) | 69 / 3,088 | **74 / 3,843** namespaces/keys, 0 missing, 0 extra, 0 placeholder mismatches, metadata + typography + stand-down guard green |

Placeholder check: every Korean value carries exactly the `{placeholders}` of its rc.1 English
source (the four rc.1 `frequency.cron`/`cronLocal` values changed shape, so the old Korean text that
mentioned `{expression}` was replaced with the rc.1 wording).

## 0.2.4 — 2026-10-29

### Fixed

- Translate the first-run onboarding screen shipped with DSH `0.2.2-alpha.2`:
  all 39 `settings.account.onboarding*` strings (welcome, purpose, detail level,
  credits, and skip prompts) now render in Korean instead of English.
- Replace three-dot ellipses with the ellipsis character (`…`) in six loading
  messages.

### Verified

- All 68 dictionaries / 3,019 keys match the installed DSH `0.2.2-alpha.2`
  extraction: 0 missing, 0 extra, and 0 placeholder mismatches.

## 0.2.3 — 2026-10-29

### Changed

- Refresh the dictionary snapshot for DSH `0.2.2-alpha.2`: **68 namespaces /
  3,019 strings** (117 keys added, 8 retired keys removed).
- Raise `engines.dsh` to `>=0.2.2-alpha.2 <0.3.0` and regenerate
  `data/coverage.json`, `lib/client.js`, `market/index.json`, and the release
  metadata from that snapshot.

### Fixed

- Remove a duplicate `%` from the context-tooltip translation.

### Documentation

- Keep the English `README.md` as the default document and `README.ko.md` as
  its reciprocal Korean translation.
- Add this changelog in English and Korean.

## 0.2.2 — 2026-10-23

### Fixed

- Persist the Korean font stack across reloads. The scoped stylesheet binds
  `--dsh-font-family-text` and `--dsw-font-family` at `:root:lang(ko)` and on
  `body`, applies the text seat directly to body text, and leaves code and
  terminal monospace seats untouched. An explicit Settings → Appearance font
  still wins.

## 0.2.1 — 2026-10-23

### Changed

- Normalize line endings, replace a machine-specific local path in the install
  example with `<local-path>`, and add `release.manifest.json`.
- No runtime behavior changed.

## 0.2.0 — 2026-10-23

### Added

- Initial Korean language pack for DSH `0.2.1-rc.2`: 65 dictionaries /
  2,910 strings, scoped Pretendard typography, a localized package icon, and a
  marketplace feed.

[0.2.4]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.0...v0.2.1
