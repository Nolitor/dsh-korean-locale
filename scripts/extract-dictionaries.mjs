/**
 * .SYNOPSIS
 *   Extract the shipped client dictionaries from a running DSH installation.
 *
 * .DESCRIPTION
 *   The web GUI's UI copy is not shipped as JSON: every client bundle registers
 *   dictionaries at runtime through `ctx.locale.register(namespace, locales)`
 *   inside `ctx.effect(...)`. rc.3 bundles are minified, so payload shapes vary:
 *
 *     1. inline multi-locale literal   locale.register(`chat`, { zh, en, ... })
 *     2. variable payload              locale.register(NS, dictionaries)     // { zh, en, ... }
 *     3. three-argument form           locale.register(NS, locale, dict)      // inside a for-of
 *     4. page bundles                  lib/client.page.js, not lib/client.js
 *     5. spread bases                  const en = { ...onboardingEn, close: `Close` }
 *
 *   Assuming only shape 1 silently drops whole namespaces (measured: schedule.manager
 *   215 keys, permission.access 17, directory-browser 13, inspectorPanel 5, contextMenu 1).
 *   Minified bundles also redefine short const names, so bindings resolve by source
 *   position, not by name alone.
 *
 *   An execution-based variant (run each bundle against a stub plugin context) reached
 *   only 60 of 77 namespaces because 12 bundles call browser/React APIs at module
 *   scope; the static resolver below is the shipped tool.
 *
 * .NOTES
 *   Node 24+. No dependencies. Run:
 *     node scripts/extract-dictionaries.mjs --out /tmp/dicts
 *     node scripts/extract-dictionaries.mjs --json data/ko.json
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const DEFAULT_DSH = '/home/minami/.local/nodejs/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai'
const argv = process.argv.slice(2)
const opts = { dsh: process.env.DSH_ROOT || DEFAULT_DSH, out: 'dictionaries', json: null }
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--dsh' || argv[i] === '--root') opts.dsh = argv[++i]
  else if (argv[i] === '--out' || argv[i] === '-o') opts.out = argv[++i]
  else if (argv[i] === '--json') opts.json = argv[++i]
  else if (argv[i] === '--help' || argv[i] === '-h') { console.log('usage: node scripts/extract-dictionaries.mjs [--dsh <dir>] [--out <dir>] [--json <pack.json>]'); process.exit(0) }
}
const DSH = opts.dsh
const PACK = opts.json

function readBalancedAny(s, start, open, close) {
  let depth = 0, i = start, quote = null, esc = false
  for (; i < s.length; i++) {
    const c = s[i]
    if (quote) { if (esc) { esc = false; continue } if (c === '\\') { esc = true; continue } if (c === quote) quote = null; continue }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return s.slice(start, i + 1) }
  }
  return null
}
const readBalanced = (s, start) => readBalancedAny(s, start, '{', '}')
const readArray = (s, start) => readBalancedAny(s, start, '[', ']')

function evalLiteral(text) {
  try { const v = JSON.parse(text); if (v && typeof v === 'object') return v } catch {}
  try { const v = vm.runInNewContext('(' + text + ')', Object.create(null), { timeout: 5000 }); if (v && typeof v === 'object') return v } catch {}
  return null
}

function splitArgs(text) {
  const args = []; let depth = 0, cur = '', quote = null, esc = false
  for (const c of text) {
    if (quote) { cur += c; if (esc) { esc = false; continue } if (c === '\\') { esc = true; continue } if (c === quote) quote = null; continue }
    if (c === '"' || c === "'" || c === '`') { quote = c; cur += c; continue }
    if ('{[('.includes(c)) depth++
    else if ('}])'.includes(c)) depth--
    if (c === ',' && depth === 0) { args.push(cur); cur = ''; continue }
    cur += c
  }
  if (cur.trim()) args.push(cur)
  return args.map((a) => a.trim())
}

function readCall(s, open) {
  let depth = 0, quote = null, esc = false
  for (let i = open; i < s.length; i++) {
    const c = s[i]
    if (quote) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === quote) quote = null; continue }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if (c === '(') depth++
    else if (c === ')') { depth--; if (depth === 0) return s.slice(open + 1, i) }
  }
  return null
}

function makeResolver(s) {
  const consts = new Map() // name -> [{pos, kind, text}]
  const re = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*/g
  let m
  while ((m = re.exec(s)) !== null) {
    const at = m.index + m[0].length
    const c = s[at]
    const push = (entry) => {
      const list = consts.get(m[1]) || []
      list.push({ pos: m.index, ...entry })
      consts.set(m[1], list)
    }
    if (c === '{') {
      const text = readBalanced(s, at)
      if (!text) continue
      push({ kind: 'object', text })
      re.lastIndex = at + text.length
    } else if (c === '[') {
      const text = readArray(s, at)
      if (!text) continue
      push({ kind: 'array', text })
      re.lastIndex = at + text.length
    } else if (c === '`' || c === '"' || c === "'") {
      const q = c
      const end = s.indexOf(q, at + 1)
      if (end === -1) continue
      push({ kind: 'string', text: s.slice(at + 1, end) })
      re.lastIndex = end + 1
    } else {
      const mm = /^[A-Za-z_$][\w$]*/.exec(s.slice(at, at + 80))
      if (mm) push({ kind: 'ident', text: mm[0] })
    }
  }
  const cache = new Map()
  const resolveObjectText = (text, seen, pos) => {
    const direct = evalLiteral(text)
    if (direct && typeof direct === 'object') return direct
    const out = {}
    for (const raw of splitArgs(text.slice(1, -1))) {
      if (raw.startsWith('...')) {
        const sp = raw.slice(3).trim().replace(/[),;]+$/, '')
        if (!/^[A-Za-z_$][\w$]*$/.test(sp)) continue
        const base = resolveIdent(sp, pos, seen) || (resolves ? resolves(sp) : null)
        if (base && typeof base === 'object' && !Array.isArray(base)) Object.assign(out, base)
        continue
      }
      const colon = raw.indexOf(':')
      const k = (colon === -1 ? raw : raw.slice(0, colon)).trim().replace(/^[`"']|[`"']$/g, '')
      if (!k) continue
      const vText = colon === -1 ? k : raw.slice(colon + 1).trim()
      if (/^[`"']/.test(vText)) { out[k] = vText.replace(/^[`"']|[`"']$/g, ''); continue }
      if (vText.startsWith('{')) { const v = evalLiteral(vText); if (v) { out[k] = v; continue } }
      if (vText.startsWith('[')) { const v = evalLiteral(vText); if (v) { out[k] = v; continue } }
      const v = resolveIdent(vText, pos, seen)
      if (v !== null && v !== undefined) out[k] = v
    }
    return Object.keys(out).length ? out : null
  }
  const resolveIdent = (name, pos = Infinity, seen = new Set()) => {
    const list = (consts.get(name) || []).filter((e) => e.pos < pos)
    if (!list.length) return null
    const entry = list[list.length - 1]
    const cacheKey = name + '@' + entry.pos
    if (cache.has(cacheKey)) return cache.get(cacheKey)
    if (seen.has(name)) return null
    seen.add(name)
    let value = null
    if (entry.kind === 'object') {
      value = resolveObjectText(entry.text, seen, entry.pos)
    } else if (entry.kind === 'array') {
      value = evalLiteral(entry.text)
    } else if (entry.kind === 'string') {
      value = entry.text
    } else {
      value = resolveIdent(entry.text, entry.pos, seen)
    }
    cache.set(cacheKey, value)
    return value
  }
  return { resolveIdent, consts }
}

/** Normalise a payload (inline literal text or identifier) into {en, zh} dictionaries. */
function payloadDictionaries(payloadText, r, bundle, pos) {
  const out = {}
  let value = null
  if (/^[`"']/.test(payloadText)) return out
  if (payloadText.startsWith('{') || payloadText.startsWith('[')) value = evalLiteral(payloadText)
  else value = r.resolveIdent(payloadText.trim(), pos)
  if ((!value || typeof value !== 'object') && payloadText.startsWith('{')) {
    // inline locale map with shorthand/identifier values ({zh, en: en$1, ...}): resolve entry by entry
    const map = {}
    for (const raw of splitArgs(payloadText.slice(1, -1))) {
      const colon = raw.indexOf(':')
      const k = (colon === -1 ? raw : raw.slice(0, colon)).trim().replace(/^[`"']|[`"']$/g, '')
      if (!/^[a-z]{2}$/.test(k)) continue
      const vText = colon === -1 ? k : raw.slice(colon + 1).trim()
      let v = null
      if (/^[`"']/.test(vText)) continue
      if (vText.startsWith('{')) v = evalLiteral(vText)
      else v = r.resolveIdent(vText, pos)
      if (v && typeof v === 'object') map[k] = v
    }
    if (Object.keys(map).length) value = map
  }
  if (!value || typeof value !== 'object') return out
  if (Array.isArray(value)) {
    // [[locale, dict], ...]
    for (const pair of value) if (Array.isArray(pair) && typeof pair[0] === 'string' && pair[1] && typeof pair[1] === 'object') out[pair[0]] = pair[1]
    return out
  }
  // inline multi-locale map {zh: <obj|ident>, en: <obj|ident>, ...} vs a direct dict
  const keys = Object.keys(value)
  const localeKeys = keys.filter((k) => /^[a-z]{2}$/.test(k))
  const looksLikeMap = localeKeys.length >= 2 && localeKeys.includes('en')
  if (looksLikeMap) {
    for (const lk of localeKeys) {
      const v = value[lk]
      if (v && typeof v === 'object') out[lk] = v
      else if (typeof v === 'string') {
        const resolved = r.resolveIdent(v, pos)
        if (resolved && typeof resolved === 'object') out[lk] = resolved
      }
    }
    return out
  }
  // direct dictionary object: single locale; caller decides (3-arg form passes locale separately)
  out['__direct__'] = value
  return out
}

/** Pull [locale, dict] pairs from an array literal that a for-of loop iterates. */
function loopDictionaries(bundle, r) {
  const pairs = {}
  const re = /for\s*\(\s*const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*of\s+([A-Za-z_$][\w$]*)\s*\)/g
  let m
  while ((m = re.exec(bundle)) !== null) {
    const arr = r.resolveIdent(m[3])
    if (Array.isArray(arr)) for (const pair of arr) if (Array.isArray(pair) && typeof pair[0] === 'string' && pair[1] && typeof pair[1] === 'object') pairs[pair[0]] = pair[1]
  }
  return pairs
}

const enByName = {}, zhByName = {}, nsSource = {}, unresolved = []
const files = []
for (const pkg of fs.readdirSync(DSH).sort()) {
  for (const fname of ['client.js', 'client.page.js']) {
    const f = path.join(DSH, pkg, 'lib', fname)
    if (fs.existsSync(f)) files.push([pkg, f])
  }
}
for (const [pkg, f] of files) {
  const s = fs.readFileSync(f, 'utf8')
  if (!s.includes('locale.register')) continue
  const r = makeResolver(s)
  const loopPairs = loopDictionaries(s, r)
  let idx = 0
  while ((idx = s.indexOf('locale.register(', idx)) !== -1) {
    const open = idx + 'locale.register'.length
    const inner = readCall(s, open)
    idx = open + 1
    if (!inner) { unresolved.push({ pkg, why: 'call' }); continue }
    const args = splitArgs(inner)
    const argRaw = (args[0] || '').trim()
    let ns = argRaw.replace(/^[`"']|[`"']$/g, '')
    if (!/^[`"']/.test(argRaw)) ns = (r.resolveIdent(argRaw, open) ?? null)
    if (typeof ns !== 'string') { unresolved.push({ pkg, why: 'ns', argRaw }); continue }

    const dicts = {}
    if (args.length === 2) {
      Object.assign(dicts, payloadDictionaries(args[1], r, s, open))
      if (dicts.__direct__) delete dicts.__direct__
    } else {
      const localeId = args[1].replace(/^[`"']|[`"']$/g, '')
      const payload = payloadDictionaries(args[2], r, s, open)
      if (payload.__direct__) dicts[localeId] = payload.__direct__
      else Object.assign(dicts, payload)
    }
    if (!dicts.en && loopPairs.en) dicts.en = loopPairs.en
    if (!dicts.zh && loopPairs.zh) dicts.zh = loopPairs.zh
    if (dicts.__direct__) delete dicts.__direct__
    if (!dicts.en || typeof dicts.en !== 'object') { unresolved.push({ pkg, ns, why: 'en' }); continue }
    enByName[ns] = Object.assign(enByName[ns] || {}, dicts.en)
    if (dicts.zh) zhByName[ns] = Object.assign(zhByName[ns] || {}, dicts.zh)
    nsSource[ns] = nsSource[ns] || pkg
  }
}

const rtNs = Object.keys(enByName).sort()
let rtKeys = 0, nulls = 0
for (const n of rtNs) { rtKeys += Object.keys(enByName[n]).length; for (const v of Object.values(enByName[n])) if (v === null) nulls++ }
console.log('RUNTIME:', rtNs.length, 'namespaces |', rtKeys, 'en keys | nulls', nulls, '| unresolved', unresolved.length)
fs.mkdirSync(opts.out, { recursive: true })
fs.writeFileSync(path.join(opts.out, 'en.json'), JSON.stringify(enByName, null, 2) + '\n')
fs.writeFileSync(path.join(opts.out, 'zh.json'), JSON.stringify(zhByName, null, 2) + '\n')
const parity = Object.keys(enByName).sort().map((ns) => ({
  ns,
  enKeys: Object.keys(enByName[ns]).length,
  zhKeys: Object.keys(zhByName[ns] || {}).length,
  parity: JSON.stringify(Object.keys(enByName[ns]).sort()) === JSON.stringify(Object.keys(zhByName[ns] || {}).sort()),
}))
fs.writeFileSync(path.join(opts.out, 'report.json'), JSON.stringify({ source: 'installed client bundles', namespaces: rtNs.length, keys: rtKeys, parity, unresolved }, null, 2) + '\n')
console.log('extract: wrote', path.join(opts.out, 'en.json'), '+ zh.json —', rtNs.length, 'namespaces,', rtKeys, 'keys')
if (PACK) {
  const pack = JSON.parse(fs.readFileSync(PACK, 'utf8'))
  const newNs = rtNs.filter((n) => !pack[n])
  const goneNs = Object.keys(pack).filter((n) => !enByName[n])
  let missing = 0
  for (const ns of rtNs) if (pack[ns]) missing += Object.keys(enByName[ns]).filter((k) => !(k in pack[ns])).length
  let extra = 0
  for (const ns of rtNs) if (pack[ns]) extra += Object.keys(pack[ns]).filter((k) => !(k in enByName[ns])).length
  console.log('== new ns:', newNs)
  console.log('== retired ns:', goneNs)
  console.log('== missing keys:', missing, '| extra keys:', extra)
  const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',')
  let phBad = 0
  for (const ns of rtNs) for (const [k, en] of Object.entries(enByName[ns])) { const ko = pack[ns] && pack[ns][k]; if (typeof ko === 'string' && ph(en) !== ph(ko)) phBad++ }
  console.log('== placeholder mismatches:', phBad)
}
console.log('UNRESOLVED:', JSON.stringify(unresolved.slice(0, 20)))
