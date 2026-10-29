# 변경 기록

`@nolit/dsh-korean-locale`의 주요 변경 사항을 기록합니다. 영어 기본 문서는
[CHANGELOG.md](CHANGELOG.md)이고, 이 파일은 그 한국어 번역입니다. 버전은
[Semantic Versioning](https://semver.org/)을 따릅니다.

## 0.2.4 — 2026-10-29

### 수정

- DSH `0.2.2-alpha.2`의 첫 실행 온보딩 화면을 번역했습니다.
  `settings.account.onboarding*` 39개 문자열(환영, 용도, 상세 수준, 크레딧,
  건너뛰기 안내)이 영어 대신 한국어로 표시됩니다.
- 로딩 문구 6개의 말줄임표를 마침표 세 개(`...`)에서 줄임표 문자(`…`)로
  바꿨습니다.

### 검증

- 68개 사전 / 3,019개 키가 설치된 DSH `0.2.2-alpha.2` 추출 결과와 일치합니다:
  누락 0, 초과 0, 플레이스홀더 불일치 0.

## 0.2.3 — 2026-10-29

### 변경

- DSH `0.2.2-alpha.2` 기준으로 사전 스냅샷을 갱신했습니다: **68개
  네임스페이스 / 3,019개 문자열** (117개 키 추가, 8개 폐기 키 제거).
- `engines.dsh`를 `>=0.2.2-alpha.2 <0.3.0`으로 올리고, 해당 스냅샷에서
  `data/coverage.json`, `lib/client.js`, `market/index.json`, 릴리스
  메타데이터를 다시 생성했습니다.

### 수정

- 컨텍스트 툴팁 번역에 중복으로 들어간 `%`를 제거했습니다.

### 문서

- 영어 `README.md`를 기본 문서로, `README.ko.md`를 이에 대응하는 한국어
  번역으로 유지합니다.
- 영어·한국어 변경 기록을 추가했습니다.

## 0.2.2 — 2026-10-23

### 수정

- 새로고침 후에도 한국어 폰트 스택이 유지되도록 수정했습니다. 스코프
  스타일시트가 `--dsh-font-family-text`와 `--dsw-font-family`를
  `:root:lang(ko)`와 `body`에 바인딩하고, 본문에 텍스트 좌석을 직접
  적용하며, 코드·터미널 고정폭 좌석은 건드리지 않습니다. 설정 → 모양에서
  직접 고른 폰트는 여전히 우선합니다.

## 0.2.1 — 2026-10-23

### 변경

- 줄바꿈을 정규화하고, 설치 예시의 시스템별 로컬 경로를 `<local-path>`로
  바꾸며, `release.manifest.json`을 추가했습니다.
- 런타임 동작은 바뀌지 않았습니다.

## 0.2.0 — 2026-10-23

### 추가

- DSH `0.2.1-rc.2`용 최초 한국어 언어팩: 65개 사전 / 2,910개 문자열,
  스코프 Pretendard 타이포그래피, 로컬라이즈된 패키지 아이콘, 마켓 피드.

[0.2.4]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/Nolitor/dsh-korean-locale/compare/v0.2.0...v0.2.1
