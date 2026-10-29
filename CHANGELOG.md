# Changelog

Notable changes to `@nolit/dsh-korean-locale`. English is the default
language; the Korean companion is [CHANGELOG.ko.md](CHANGELOG.ko.md).
Versions follow [Semantic Versioning](https://semver.org/).

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

[0.2.3]: https://github.com/linuxsung/dsh-korean-locale/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/linuxsung/dsh-korean-locale/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/linuxsung/dsh-korean-locale/compare/v0.2.0...v0.2.1
