# 변경 기록

`@nolit/dsh-korean-locale`의 주요 변경 사항을 기록합니다. 영어 기본 문서는
[CHANGELOG.md](CHANGELOG.md)이고, 이 파일은 그 한국어 번역입니다. 버전은
[Semantic Versioning](https://semver.org/)을 따릅니다.

## 0.0.1-rc.4 — DSH 0.2.2-rc.3 기준 재생성, rc 사다리 정정 — 2026-11-14

이 팩은 `0.0.1-rc.1`에 머물러 있었습니다. 이후 두 세션이 파일을 바꾸면서 이력 표식을 올리지
않았고, 그중 한 세션이 `README.md`를 손상시켰습니다(`v0.0.1-rc.1`이 겹쳐 인쇄된 형태, `source`와
`archives`도 같은 방식으로 훼손 — `rc` 토큰을 전역 치환한 흔적). 이 항목은 사다리와 손상을 고치고, 사전
스냅샷을 실행 중인 rc.3 런타임 기준으로 재생성합니다.

측정 전 → 후(설치된 `0.2.2-rc.3` 클라이언트 번들에서 `scripts/extract-dictionaries.mjs`로 추출.
추출기는 각 번들을 `node:vm` 샌드박스에서 실행하므로 `...spread` 기반과 보간 값이 누락되지
않습니다):

| 항목 | 이전(rc.1 팩) | 이후(rc.3) |
| :--- | :--- | :--- |
| 네임스페이스 | 74 | **77** |
| 키 | 3,843 | **4,253** |
| rc.3 신규 네임스페이스 | — | `cuaPermissions` 66, `deepseekChatImport` 31, `account.notifications` 1 |
| 신규 번역 문자열 | — | **460** |
| 폐기 네임스페이스 제거 | — | 없음(아래 추출 사각지대 참고) |
| 잔존 네임스페이스의 폐기 키 | — | 61 |
| placeholder 복구 | `pluginManager.updateStepInstalling`, `settings.webSearch.baseUrlHint` | `{source}` / `{path}` 복원 |
| 버전 | `0.0.1-rc.1` | **`0.0.1-rc.4`** |
| `npm run verify` | 74 / 3,843 | **77 / 4,253**, 누락 0, 초과 0, placeholder 불일치 0, en/zh 패리티 0 |

버전 사다리(소유자 지침: `rc.<n>` 접미사는 에이전트 이력 표식, 숫자부 `0.0.1`은 소유자 승인
영역): rc.1 = 2026-11-05 리셋, 2026-11-06 메타데이터 세션은 범프 없이 파일 변경(rc.2여야 함),
2026-11-13 세션은 README 두 개를 다시 쓰고 `README.md`를 손상시킨 뒤 범프 없음(rc.3이어야 함),
이번이 네 번째 세션 → **rc.4**. 손상된 README는 `HEAD`에서 복원한 뒤 rc.3 기준으로 갱신했습니다.

### 추출 사각지대

첫 재생성은 다섯 네임스페이스를 누락했습니다. rc.3이 이들을 **변수 페이로드**(`locale.register(NS, dictionaries)`), **3인자 형식**(`locale.register(NS, locale, dict)`), 또는 `lib/client.js`가 아닌 `lib/client.page.js`에서 등록하기 때문입니다. 인라인 객체 리터럴만 받는 파서는 이 호출의 `en`/`zh` 사전을 바인딩하지 못해 "폐기"로 오판했고, GUI에서는 여전히 살아 있었습니다. `verify.mjs`는 내부 일관성만 검사하므로 초록으로 남습니다. 추출기는 이제 다섯 가지 형식과 위치 기반 const 재정의를 모두 처리하며, 252개 중 237개는 기존 rc.1 한국어를 그대로 복원하고 신규는 `contextMenu.back` 하나뿐입니다.

검수: 한국어 문구는 OpenCode/MiniMax 파이프라인이 초안을 만들고 **Gemini 4 Hydrogen**이
466개 키 전체를 독립 번역·검수했으며(20개 용어 글로서리 포함), placeholder·용어 일관성 검사를
거쳐 키 단위로 병합했습니다. **EXAONE `k-exaone_v2.5`는 완료하지 못했습니다**: 이 제공자는
서브에이전트 표면을 선언하지 않아 일반 서브에이전트 경로가 실패했고, 직접
`/v1/chat/completions` 호출은 `429 rate_limit_exceeded`와 수 분 단위 지연을 반환했습니다.
따라서 EXAONE 쪽 비교는 미완으로 남아 있습니다.

## 0.0.1-rc.1 — DSH 0.2.2-rc.1 기준 재생성, 버전 사다리 적용 — 2026-11-05

소유자 결정(2026-11-05): 모든 `@nolit` 트랙은 `0.0.1-rc.N`을 보고하며, 이 팩은 alpha.3
스냅샷을 이름만 바꾸는 것이 아니라 **rc.1** 사전 기준으로 재생성해야 합니다.

측정 전 → 후 (설치된 rc.1 클라이언트 번들에서 추출):

| 항목 | 이전 (alpha.3) | 이후 (rc.1) |
| :--- | :--- | :--- |
| 네임스페이스 | 69 | **74** |
| 키 | 3,088 | **3,843** |
| rc.1 신규 네임스페이스 번역 | — | `stats` 177, `liveshare` 225, `forgePanel` 253, `creationRecommendations` 55, `pluginRecommendations` 25, `actionCards` 14, `contextMenu` 1 |
| 기존 네임스페이스 신규 키 | — | 76 (schedule catalog/manager 호스트 문구) |
| 폐기 키 제거 | — | 66 |
| 폐기 네임스페이스 제거 | — | `claude-code-mods`, `deepseek-model-label-1017` (rc.1에 등록 없음) |
| `engines.node` | `>=24` | `>=24.9` (rc.1 최소) |
| 버전 | `0.2.5` | `0.0.1-rc.1` |
| `npm test` (`scripts/verify.mjs`) | 69 / 3,088 | **74 / 3,843**, 누락 0, 초과 0, placeholder 불일치 0 |

모든 한국어 값은 rc.1 영어 원문의 `{placeholder}`와 정확히 일치합니다(rc.1에서 형태가 바뀐
`frequency.cron`/`cronLocal` 4개 값은 `{expression}`을 쓰던 이전 번역을 rc.1 문구로 교체).

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
