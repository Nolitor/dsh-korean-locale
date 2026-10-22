/**
 * .SYNOPSIS
 *   Verify the distributable package without a DSH installation.
 *
 * .DESCRIPTION
 *   Checks package metadata, dictionary coverage, generated-artifact shape,
 *   and the browser half's apply contract with a fake locale registry. The
 *   fake registry mirrors the public LocaleRuntime surface used by the pack:
 *   getSnapshot(), addLanguage(), register(), and ctx.effect().
 *
 * .NOTES
 *   Node 24+. No dependencies. Run: node scripts/verify.mjs
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const json = (rel) => JSON.parse(read(rel))

const pkg = json('package.json')
const dicts = json('data/ko.json')
const coverage = json('data/coverage.json')
const client = read('lib/client.js')
const patch = read('cordis.patch.yml')
const typography = read('styles/typography.css')

// --- package metadata -------------------------------------------------------
assert.equal(pkg.name, '@nolit/dsh-korean-locale')
assert.equal(pkg.version, '0.2.0')
assert.equal(pkg.private, false)
assert.equal(pkg.dsh.manifestVersion, 1)
assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
assert.equal(pkg.dsh.client.platform, 'web')
assert.equal(pkg.dsh.client.immediately, true)
assert.deepEqual(pkg.dsh.client.inject, ['@deepseek-ai/dsh-client-locale'])
assert.match(pkg.engines.dsh, /\^?>=?0\.2\.1-rc\.2/)
assert.ok(patch.includes("name: '@nolit/dsh-korean-locale'"), 'bundle patch inserts the package')
assert.ok(!/name:\s*['"][^'"]*\/client['"]/.test(patch), 'bundle patch must not add a browser row')
assert.ok(pkg.files.includes('styles/typography.css'), 'package files must ship the typography source')
assert.equal(pkg.exports['./typography.css'], './styles/typography.css')

for (const rel of ['lib/index.js', 'lib/client.js', 'lib/types/index.d.ts', 'data/ko.json', 'data/coverage.json', 'cordis.patch.yml', 'icon.svg', 'locale/en.json', 'locale/ko.json', 'styles/typography.css']) {
  assert.ok(existsSync(join(root, rel)), `missing ${rel}`)
  assert.ok(statSync(join(root, rel)).size > 0, `empty ${rel}`)
}
assert.ok(statSync(join(root, 'icon.svg')).size <= 256 * 1024, 'icon exceeds 256 KiB')

// --- typography contract ----------------------------------------------------
const typographyDeclarations = typography.replace(/\/\*[\s\S]*?\*\//g, '')
assert.ok(typographyDeclarations.includes('html:lang(ko) body'), 'typography scopes to the Korean locale')
assert.ok(!typographyDeclarations.includes('!important'), 'typography must not use !important')
assert.ok(!/\bfont-family\s*:/u.test(typographyDeclarations), 'typography must not set font-family directly')
assert.ok(!/--ds-font-family-code|--dsh-font-family-code|--dsh-font-family-terminal/u.test(typographyDeclarations), 'typography must not touch code/terminal seats')
const typographyProperties = [...typographyDeclarations.matchAll(/(--[a-z0-9-]+)\s*:/gu)].map((match) => match[1])
assert.deepEqual(typographyProperties, ['--dsh-font-family-text'])
for (const family of ['"Pretendard Variable"', 'Pretendard', '"SUIT Variable"', 'SUIT', '"Apple SD Gothic Neo"', '"Malgun Gothic"', '"Noto Sans KR"']) {
  assert.ok(typographyDeclarations.includes(family), `missing ${family}`)
}

// --- coverage snapshot ------------------------------------------------------
const namespaces = Object.keys(dicts)
assert.equal(namespaces.length, coverage.namespaces)
assert.equal(namespaces.length, 65)
assert.equal(Object.values(dicts).reduce((n, d) => n + Object.keys(d).length, 0), coverage.keys)
assert.equal(coverage.keys, 2910)
assert.equal(coverage.report.filter((row) => row.missing || row.extra || row.phBad).length, 0)
assert.equal(coverage.source.commit, '1091f232fda9a97c525d1553d59f0fd2374c9b3e')

// --- generated artifact contract -------------------------------------------
let captured
const fakeWindow = {
  __ModuleLoader__: {
    load: ({ id, factory }) => {
      assert.equal(id, '@nolit/dsh-korean-locale')
      captured = factory(() => { throw new Error('client bundle must not require modules') })
    },
  },
}
new Function('window', client)(fakeWindow)
assert.equal(typeof captured.apply, 'function')
assert.deepEqual(captured.inject, ['locale'])
assert.ok(client.includes('applyTypography'), 'generated client must inject typography')
assert.ok(client.includes('data-plugin-css'), 'generated client must tag the style element')
assert.ok(client.includes('html:lang(ko) body'), 'generated client must carry the scoped selector')

const styles = []
globalThis.document = {
  head: { appendChild: (style) => { styles.push(style) } },
  querySelector: () => null,
  createElement: () => {
    const style = {
      dataset: {},
      textContent: '',
      remove() {
        const index = styles.indexOf(style)
        if (index >= 0) styles.splice(index, 1)
      },
    }
    return style
  },
}

const added = []
const registered = new Map()
const disposers = []
const baseSnapshot = { locales: [{ id: 'zh', label: '中文', fallback: 'en' }, { id: 'en', label: 'English' }] }
const locale = {
  getSnapshot: () => baseSnapshot,
  addLanguage: (input) => { added.push(input); return () => {} },
  register: (ns, localeId, dict) => {
    assert.equal(localeId, 'ko')
    assert.ok(!registered.has(ns), `duplicate registration for ${ns}`)
    registered.set(ns, dict)
    return () => {}
  },
}
const ctx = {
  locale,
  effect: (callback) => {
    const dispose = callback()
    assert.equal(typeof dispose, 'function')
    disposers.push(dispose)
    return dispose
  },
}
captured.apply(ctx)
assert.equal(added.length, 1)
assert.deepEqual(added[0], { id: 'ko', label: '한국어', fallback: 'en' })
assert.equal(registered.size, namespaces.length)
for (const ns of namespaces) {
  assert.deepEqual(Object.keys(registered.get(ns)).sort(), Object.keys(dicts[ns]).sort(), `keys differ for ${ns}`)
}
assert.equal(registered.get('common').ok, '확인')
assert.equal(registered.get('settings.locale')['language.title'], '언어')
assert.match(registered.get('chat')['message.stepProcess.thinking'], /[가-힣]/)

// --- scoped typography injection ------------------------------------------
assert.equal(styles.length, 1, 'one typography style element')
assert.equal(styles[0].dataset.plugin, '@nolit/dsh-korean-locale')
assert.equal(styles[0].dataset.pluginCss, '@nolit/dsh-korean-locale/typography.css')
assert.ok(styles[0].textContent.includes('html:lang(ko) body'), 'style carries the scoped selector')
assert.ok(styles[0].textContent.includes('--dsh-font-family-text'), 'style carries the text seat')
assert.ok(!styles[0].textContent.includes('!important'), 'style must not use !important')

// --- stand-down guard -------------------------------------------------------
const guarded = []
const guardedLocale = {
  getSnapshot: () => ({ locales: [...baseSnapshot.locales, { id: 'ko', label: '한국어', fallback: 'en' }] }),
  addLanguage: (input) => { guarded.push(input); return () => {} },
  register: () => { guarded.push('register'); return () => {} },
}
captured.apply({ locale: guardedLocale, effect: (callback) => callback() })
assert.deepEqual(guarded, [], 'must stand down when ko already exists')

for (const dispose of disposers.reverse()) dispose()
assert.equal(styles.length, 0, 'disposing the plugin removes the style element')
delete globalThis.document

console.log(`verify: ok — ${namespaces.length} namespaces, ${coverage.keys} keys, metadata + apply contract + typography + stand-down guard`)
