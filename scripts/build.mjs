/**
 * .SYNOPSIS
 *   Build the distributable browser half from data/ko.json.
 *
 * .DESCRIPTION
 *   Validates the committed dictionary snapshot, then writes lib/client.js —
 *   a self-contained module-loader factory that registers the ko language and
 *   every namespace dictionary as owned effects. The generated file is
 *   committed so a marketplace install needs no build step.
 *
 * .NOTES
 *   Node 24+. No dependencies. Run: node scripts/build.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(root, 'data', 'ko.json')
const coveragePath = join(root, 'data', 'coverage.json')
const typographyPath = join(root, 'styles', 'typography.css')
const outPath = join(root, 'lib', 'client.js')

/** Locale namespace ids accepted by the runtime are open strings; reject control characters. */
const NAMESPACE_PATTERN = /^[^\u0000-\u001f\u007f]+$/u
/** Placeholder tokens must be balanced and non-nested. */
const PLACEHOLDER_PATTERN = /\{(\w+)\}/g

function fail(message) {
  throw new Error(`build: ${message}`)
}

function validate(dicts, coverage) {
  const namespaces = Object.keys(dicts)
  if (namespaces.length === 0) fail('no namespaces')
  if (namespaces.length !== coverage.namespaces) {
    fail(`coverage namespaces ${coverage.namespaces} != data namespaces ${namespaces.length}`)
  }

  let keys = 0
  for (const ns of namespaces) {
    if (!NAMESPACE_PATTERN.test(ns)) fail(`invalid namespace ${JSON.stringify(ns)}`)
    const dict = dicts[ns]
    if (dict === null || typeof dict !== 'object' || Array.isArray(dict)) fail(`${ns}: not an object`)
    const entries = Object.entries(dict)
    if (entries.length === 0) fail(`${ns}: empty dictionary`)
    for (const [key, value] of entries) {
      if (key.length === 0) fail(`${ns}: empty key`)
      if (typeof value !== 'string') fail(`${ns}.${key}: non-string value`)
      if (value.length === 0 && !['message.stepProcess.sharedPrefix', 'sentenceSeparator', 'cron.part.join'].includes(key)) {
        fail(`${ns}.${key}: unexpected empty value`)
      }
      const opens = (value.match(/\{/g) ?? []).length
      const closes = (value.match(/\}/g) ?? []).length
      if (opens !== closes) fail(`${ns}.${key}: unbalanced placeholder braces`)
      PLACEHOLDER_PATTERN.lastIndex = 0
      let consumed = 0
      for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
        consumed += match[0].length
      }
      if (opens > 0 && consumed === 0) fail(`${ns}.${key}: braces without a {name} placeholder`)
    }
    keys += entries.length
  }

  if (keys !== coverage.keys) fail(`coverage keys ${coverage.keys} != data keys ${keys}`)
  const bad = coverage.report.filter((row) => row.missing || row.extra || row.phBad)
  if (bad.length > 0) fail(`coverage reports ${bad.length} mismatched dictionaries`)
  return { namespaces: namespaces.length, keys }
}

/** Typography binds the text and text-seat variables only: no code/terminal seats and no !important. */
function validateTypography(css) {
  const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const selector of [':root:lang(ko)', 'html:lang(ko)', 'html[lang^="ko" i]', 'html:lang(ko) body']) {
    if (!declarations.includes(selector)) fail(`typography must scope to ${selector}`)
  }
  if (declarations.includes('!important')) fail('typography must not use !important')
  if (/\b(pre|code|kbd|samp|textarea)\b/u.test(declarations)) fail('typography must not target code/terminal elements')
  if (/--ds-font-family-code|--dsh-font-family-code|--dsh-font-family-terminal/u.test(declarations)) {
    fail('typography must not touch code or terminal font seats')
  }
  for (const match of declarations.matchAll(/(?<![\w-])font-family\s*:\s*([^;}]+)/gu)) {
    if (match[1].trim() !== 'var(--dsw-font-family)') {
      fail(`typography font-family must be var(--dsw-font-family) (got ${match[1].trim()})`)
    }
  }
  const properties = [...new Set([...declarations.matchAll(/(--[a-z0-9-]+)\s*:/gu)].map((match) => match[1]))].sort()
  const expected = ['--dsh-font-family-text', '--dsw-font-family']
  if (properties.join(',') !== expected.join(',')) {
    fail(`typography must declare only ${expected.join(' + ')} (got ${properties.join(', ') || 'none'})`)
  }
  if (!/--dsw-font-family\s*:\s*var\(--dsh-font-family-text\)/u.test(declarations)) {
    fail('typography must bind --dsw-font-family to --dsh-font-family-text')
  }
  for (const family of ['"Pretendard Variable"', 'Pretendard', '"SUIT Variable"', 'SUIT', '"Apple SD Gothic Neo"', '"Malgun Gothic"']) {
    if (!declarations.includes(family)) fail(`typography stack is missing ${family}`)
  }
  return css
}

function render(dicts, coverage, stats, typography) {
  const literal = JSON.stringify(dicts, null, 2)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  const source = coverage.source
  return `/**
 * Korean language pack — browser half (module-loader CJS factory).
 *
 * Generated by scripts/build.mjs from data/ko.json and styles/typography.css.
 * Do not edit by hand.
 * Source: ${source.repository} ${source.branch} @ ${source.commit}
 * Base: DSH ${source.baseVersion} · ${stats.namespaces} namespaces · ${stats.keys} keys
 */
window.__ModuleLoader__.load({
  id: "@nolit/dsh-korean-locale",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    /** Korean dictionaries by locale namespace. */
    const dictionaries = ${literal};

    /** Scoped Korean text typography; inert outside html:lang(ko). */
    const TYPOGRAPHY_ID = "@nolit/dsh-korean-locale/typography.css";
    const TYPOGRAPHY_CSS = ${JSON.stringify(typography)};

    /** Required service: the locale registry. */
    const inject = ["locale"];

    /**
     * Inject the scoped typography sheet as an owned effect. The selector keys
     * off <html lang>, maintained by the locale plugin, so no language listener
     * is needed; disposal removes the style element.
     * @param ctx - Client root context.
     */
    function applyTypography(ctx) {
      ctx.effect(() => {
        if (typeof document === "undefined" || !document.head) return () => {};
        document.querySelector(\`style[data-plugin-css="\${TYPOGRAPHY_ID}"]\`)?.remove();
        const style = document.createElement("style");
        style.dataset.plugin = "@nolit/dsh-korean-locale";
        style.dataset.pluginCss = TYPOGRAPHY_ID;
        style.textContent = TYPOGRAPHY_CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, "dsh-korean-locale: typography");
    }

    /**
     * Register the ko language, typography, and every namespace dictionary as
     * owned effects. If another Korean provider already owns the catalog (a
     * future built-in ko or another language pack), stand down instead of
     * competing for the same (namespace, "ko") seats.
     * @param ctx - Client root context.
     */
    function apply(ctx) {
      const hasKorean = ctx.locale.getSnapshot().locales.some(
        (entry) => entry.id.toLowerCase() === "ko",
      );
      if (hasKorean) {
        console.info("[dsh-korean-locale] ko is already registered; standing down.");
        return;
      }

      ctx.effect(
        () => ctx.locale.addLanguage({ id: "ko", label: "한국어", fallback: "en" }),
        "dsh-korean-locale: language",
      );
      applyTypography(ctx);

      for (const [namespace, dictionary] of Object.entries(dictionaries)) {
        ctx.effect(() => {
          try {
            return ctx.locale.register(namespace, "ko", dictionary);
          } catch (error) {
            // A namespace owner may have registered its own ko between the
            // catalog check above and this effect; leave that owner in place.
            console.warn(
              \`[dsh-korean-locale] skipped "\${namespace}": \${error instanceof Error ? error.message : String(error)}\`,
            );
            return () => {};
          }
        }, \`dsh-korean-locale: \${namespace}\`);
      }
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
`
}

const dicts = JSON.parse(readFileSync(dataPath, 'utf8'))
const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'))
const typographySource = validateTypography(readFileSync(typographyPath, 'utf8'))
const typography = typographySource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim()
const stats = validate(dicts, coverage)
const output = render(dicts, coverage, stats, typography)
writeFileSync(outPath, output)
console.log(`build: wrote ${outPath} (${stats.namespaces} namespaces, ${stats.keys} keys, ${Buffer.byteLength(typography)} B typography, ${Buffer.byteLength(output)} bytes)`)
