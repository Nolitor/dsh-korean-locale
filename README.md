# Korean Language Pack for DeepSeek Harness

> Status: active · v0.2.0 · Last updated: 2026-10-23 · DSH: 0.2.1-rc.2 · Upstream: [discussion #10687](https://github.com/deepseek-ai/deepseek-harness/discussions/10687)

## Index

| Section | Purpose |
|---|---|
| Overview | What the pack adds and how it fits DSH |
| Install | Profile-local install, selection, uninstall |
| Coverage | Shipped namespaces and known limits |
| Typography | Korean font stack, scope, and monospace safety |
| How it works | Public locale API, owned effects, stand-down guard |
| Build and verify | Regenerate the browser half from the data |
| Publishing | Package metadata and market feed |
| License | MIT and translation attribution |

## Overview

Adds **한국어** to **Settings → General → Language** in the DeepSeek Harness
web GUI and serves Korean copy for every shipped client dictionary:
**65 dictionaries, 2,910 strings** for DSH `0.2.1-rc.2`. The set covers the
shipped web surface and optional bundles; a dictionary stays inert until its
feature bundle is enabled.

Korean mode also applies a language-scoped font stack — **Pretendard Variable →
Pretendard → SUIT → Apple SD Gothic Neo → Malgun Gothic → Noto Sans KR** — while
code and terminal surfaces keep DSH's monospace stacks. The stack is local-only:
no webfont is bundled or downloaded.

The pack is a normal DSH language-pack client plugin. It uses the documented
`@deepseek-ai/dsh-client-locale` API — `addLanguage({ id: 'ko', … })` plus
`register(namespace, 'ko', dictionary)` — and adds no Host behavior. Install,
disable, or remove it per profile; nothing outside the profile is modified.

## Install

The pack needs no build step: the generated browser bundle is committed.

```sh
dsh plugin --profile web add @nolit/dsh-korean-locale
```

For a local checkout (this repository), link it instead:

```sh
dsh plugin --profile web add link:C:/Users/nolit/Workspace/projects/dsh-workspace/dsh-korean-locale
```

The command writes the dependency and selects the bundle in
`~/.dsh/profiles/web/package.json`. A running Host normally picks up the new
client bundle through HMR; if **한국어** does not appear in the language row,
restart `dsh web` as the reliable fallback. A plain browser refresh alone does
not replace the Host's loaded module generation.

Then choose **한국어** in **Settings → General → Language**. A Korean browser
selects it automatically once the pack is active. The choice is stored through
the Host settings service in the active profile's Cordis patch
(`locale.preference`), exactly like 中文 and English.

### Uninstall

```sh
dsh plugin --profile web remove @nolit/dsh-korean-locale
```

Restart the Web surface. The language definition and every dictionary are
owned effects of the plugin, so removing it returns the GUI to English. A
stored `preference: ko` may remain in the profile patch; it is inactive while
the definition is absent and can be removed or set to `en`.

## Coverage

The dictionaries cover the packages shipped in DSH `0.2.1-rc.2`: chat,
conversation, trajectory, workspace, sidebar and document previews, settings,
plugins and the plugin market, schedules, sessions, jobs, subagents, skills,
deliverables, voice input, the inspector panel, and the shared `common`
vocabulary. `data/coverage.json` records every namespace, key count, English-key
parity, placeholder parity, and the source commit.

Known limits:

- The **Web GUI only**. The desktop app's native menus, welcome window, and
  update dialogs use a separate resolver that a client plugin cannot patch.
- **Third-party plugin screens** are translated only when the pack carries that
  namespace. The pack covers the shipped dictionaries; a third-party package
  that registers its own Korean dictionary is not overridden.
- Typography applies to the DSH document; content inside iframes or Shadow DOM
  (for example the inspector's DevTools surface) keeps its own font stack.
- A key the pack does not carry falls back to the shipped English string, never
  to a raw key.
- DSH `0.2.1-rc.2` has no built-in `ko`. If a future release ships one, the
  pack detects it in the catalog and stands down instead of competing for the
  same `(namespace, "ko")` registration.

## Typography

Korean mode applies one scoped stylesheet, `styles/typography.css`:

```css
html:lang(ko) body {
  --dsh-font-family-text:
    "Pretendard Variable", Pretendard,
    "SUIT Variable", SUIT,
    "Apple SD Gothic Neo", "Malgun Gothic",
    "Noto Sans KR", "Noto Sans CJK KR", "Nanum Gothic",
    system-ui, sans-serif;
}
```

- **Text seat only** — DSH resolves body text through `--dsh-font-family-text`.
  Code, inline code, and terminal surfaces use separate
  `--ds-font-family-code` / `--dsh-font-family-terminal` seats, so they keep
  their monospace stacks.
- **Language-scoped** — the selector follows `<html lang>`, which the locale
  plugin maintains. Switching to English or Chinese deactivates the rule and
  restores DSH's own stack exactly; no JavaScript listener is needed.
- **No webfonts** — every family is a local system font. Nothing is downloaded
  or bundled beyond the CSS rule itself.
- **User settings win** — the rule avoids a priority override, so an explicit
  text font chosen in Settings → Appearance stays authoritative. Removing the
  pack removes the style element with it.

## How it works

The browser half registers one language definition and one dictionary per
namespace, each as an owned effect:

```js
ctx.effect(() => ctx.locale.addLanguage({ id: 'ko', label: '한국어', fallback: 'en' }))
ctx.effect(() => injectScopedTypography(ctx))
ctx.effect(() => ctx.locale.register(namespace, 'ko', dictionary))
```

`LocaleRuntime` treats the external `ko` exactly like the built-in locales for
selection, persistence, lookup, fallback, `<html lang>`, browser matching, and
late dictionary registration. The pack adds only the coordination an external
language needs:

- **Stand-down guard** — if the catalog already exposes `ko` when the plugin
  applies (future built-in locale or another Korean pack), it registers
  nothing.
- **Per-namespace conflict guard** — if a namespace already gained a `ko`
  owner before the effect runs, that namespace is skipped and the owner's copy
  stays in place.
- **Self-contained bundle** — no dependency on the DSH packages it cooperates
  with, no network access, and no Host mutation.

## Build and verify

Node 24+, no dependencies:

```sh
node scripts/build.mjs     # data/ko.json + styles/typography.css -> lib/client.js
node scripts/verify.mjs    # metadata + coverage + typography + apply contract
```

`data/ko.json` is the committed snapshot extracted from the source branch in
[discussion #10687](https://github.com/deepseek-ai/deepseek-harness/discussions/10687);
`data/coverage.json` records the extraction and parity results.
`styles/typography.css` is the auditable typography source; the build embeds it
in the generated browser half. `lib/client.js` is committed so consumers do not
need the build.

## Publishing

The package is a complete DSH bundle: `dsh.manifestVersion`, `dsh.bundle.patch`,
`dsh.client` (`platform: web`, `immediately: true`), a host no-op entry, a
localized package icon, `locale/en.json`/`locale/ko.json`, the scoped
`styles/typography.css`, and a `market/index.json` feed. Publish with:

```sh
npm publish
```

`prepublishOnly` rebuilds and verifies the artifact. The market feed can be
served from the repository's `market/` directory or merged into a larger index.

## License

MIT. Korean dictionary portions are derived from the `feat/korean-locale`
branch of `deepseek-harness` (commit `1091f232fd`), licensed MIT. See
[NOTICE](NOTICE).
