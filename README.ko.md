# DeepSeek Harness 한국어 언어팩

[English](README.md) · **한국어**

> 상태: active · v0.2.3 · 최종 갱신: 2026-10-29 · DSH: 0.2.2-alpha.2 · 출처: [discussion #10687](https://github.com/deepseek-ai/deepseek-harness/discussions/10687)

## 인덱스

| 섹션 | 목적 |
|---|---|
| 개요 | 추가되는 기능과 DSH 결합 방식 |
| 설치 | 프로필 격리 설치·선택·제거 |
| 커버리지 | 번역 범위와 한계 |
| v0.2.3 폰트 스택 | 새로고침 후에도 유지되는 한국어 타이포그래피 |
| 타이포그래피 | 한국어 폰트 스택, 스코프, 모노스페이스 보존 |
| 동작 원리 | 공식 로케일 API, 소유 효과, 양보 가드 |
| 빌드·검증 | 데이터에서 브라우저 번들 재생성 |
| 배포 | 패키지 메타데이터와 마켓 피드 |
| 라이선스 | MIT 및 번역 출처 |

## 개요

DeepSeek Harness 웹 GUI의 **설정 → 일반 → 언어**에 **한국어**를 추가하고,
DSH `0.2.2-alpha.2`에 포함된 클라이언트 사전 전체를 한국어로 제공합니다.
**68개 사전, 3,019개 문자열**입니다. 기본 웹 표면과 선택 번들을 함께 담으며, 비활성 번들의 사전은 해당 번들이 켜지기 전까지 소비되지 않습니다.

한국어 모드에서는 **Pretendard Variable → Pretendard → SUIT → Apple SD Gothic Neo → Malgun Gothic → Noto Sans KR** 순의 언어 스코프 폰트 스택을 적용하고, 코드·터미널 영역은 DSH의 고정폭 스택을 그대로 유지합니다. 시스템 로컬 폰트만 사용하며 웹폰트를 번들하거나 내려받지 않습니다.

이 패키지는 DSH의 공식 언어팩 클라이언트 플러그인입니다.
`@deepseek-ai/dsh-client-locale`의 공개 API인
`addLanguage({ id: 'ko', … })`와 `register(namespace, 'ko', dictionary)`만
사용하며 Host 동작은 추가하지 않습니다. 프로필 단위로 설치·비활성·제거할 수
있고, 프로필 밖의 파일은 건드리지 않습니다.

## 설치

생성된 브라우저 번들이 저장소에 포함되어 있어 빌드가 필요 없습니다.

```sh
dsh plugin --profile web add @nolit/dsh-korean-locale
```

이 저장소의 로컬 체크아웃을 쓰는 경우:

```sh
dsh plugin --profile web add link:<local-path>
```

명령은 `~/.dsh/profiles/web/package.json`에 의존성과 번들을 기록합니다.
실행 중인 Host는 보통 HMR로 새 클라이언트 번들을 반영하며, 언어 목록에
**한국어**가 나타나지 않으면 `dsh web`을 재시작하는 것이 확실한 대체
경로입니다. 단순 브라우저 새로고침만으로는 Host가 이미 로드한 모듈 세대가
교체되지 않습니다.

재시작 후 **설정 → 일반 → 언어**에서 **한국어**를 선택하세요. 브라우저
언어가 한국어이면 팩이 활성화되는 즉시 자동 선택됩니다. 선택값은 中文·English와
동일하게 Host 설정 서비스를 통해 활성 프로필의 Cordis patch
(`locale.preference`)에 저장됩니다.

### 제거

```sh
dsh plugin --profile web remove @nolit/dsh-korean-locale
```

웹 화면을 재시작합니다. 언어 정의와 모든 사전은 플러그인의 소유 효과이므로
제거하면 영어로 돌아갑니다. 프로필 patch에 `preference: ko`가 남아 있을 수
있으나 정의가 없으면 비활성이며, 삭제하거나 `en`으로 바꾸면 됩니다.

## 커버리지

DSH `0.2.2-alpha.2`에 포함된 패키지를 다룹니다: 채팅, 대화, 트레이스, 워크스페이스,
사이드바와 문서 미리보기, 설정, 플러그인과 마켓, 스케줄, 세션, 작업, 서브에이전트,
스킬, 산출물, 음성 입력, 인스펙터 패널, 공용 `common` 어휘 등입니다.
`data/coverage.json`에 네임스페이스별 키 수, 영어 키 패리티, 플레이스홀더
패리티, 원본 커밋이 기록되어 있습니다.

한계:

- **웹 GUI 전용**입니다. 데스크톱 앱의 네이티브 메뉴·시작 창·업데이트
  대화상자는 별도 리졸버를 사용하므로 클라이언트 플러그인으로 바꿀 수 없습니다.
- **서드파티 플러그인 화면**은 팩이 해당 네임스페이스를 포함할 때만 번역됩니다.
  팩은 DSH 기본 제공 사전을 대상으로 하며, 서드파티가 자체 한국어 사전을
  등록하면 이를 덮어쓰지 않습니다.
- 타이포그래피는 DSH 문서에 적용되며, iframe이나 Shadow DOM 내부(예:
  인스펙터 DevTools 화면)는 자체 폰트 스택을 유지합니다.
- 팩에 없는 키는 원문 키가 아니라 영어 기본값으로 폴백됩니다.
- DSH `0.2.2-alpha.2`에는 빌트인 `ko`가 없습니다. 향후 빌트인으로 추가되면
  팩은 카탈로그에서 이를 감지하고 같은 `(namespace, "ko")` 자리를 두고
  경쟁하지 않도록 **양보**합니다.

## v0.2.3 — alpha.2 커버리지 갱신과 폰트 스택 지속성

이번 릴리스는 DSH `0.2.2-alpha.2` 기준으로 사전 스냅샷도 갱신합니다
(117개 키 추가, 8개 폐기 키 제거). 아래 타이포그래피 개선은 유지됩니다.

v0.2.1 스타일시트는 `body`에만 바인딩해서, 전체 새로고침 후 코어 토큰 패스나
테마 프리젠터가 한국어 스택을 덮어쓸 수 있었다. v0.2.3는
`--dsh-font-family-text`와 `--dsw-font-family`를 `:root:lang(ko)`와 `body`
양쪽에 바인딩하고, 본문에 직접 폰트 패밀리를 적용하며, 코드·터미널 좌석은
건드리지 않는다. `!important`를 쓰지 않으므로 설정 → 모양에서 직접 고른
폰트는 그대로 우선한다.

## 타이포그래피

한국어 모드에서는 `styles/typography.css` 한 장을 스코프 주입합니다.

```css
:root:lang(ko),
html:lang(ko),
html[lang^="ko" i] {
  --dsh-font-family-text: "Pretendard Variable", Pretendard, /* … */ system-ui, sans-serif;
  --dsw-font-family: var(--dsh-font-family-text), var(--dsh-font-family-text-default);
}

:root:lang(ko) body,
html:lang(ko) body,
html[lang^="ko" i] body {
  /* 같은 좌석 + */
  font-family: var(--dsw-font-family);
}
```

- **본문 좌석 2개를 함께 고정** — DSH 본문은 `--dsw-font-family`로 해석되고,
  코어 토큰 시트가 `body`에서 `--dsh-font-family-text`로 이 값을 조립합니다.
  규칙이 두 변수를 루트와 `body`에 모두 바인딩하므로, 새로고침 후 코어 토큰
  재적용과 테마 프리젠터가 한국어 스택을 덮어쓰지 못합니다. `input`,
  `contenteditable` 같은 텍스트 컨트롤도 같은 좌석을 따릅니다.
- **고정폭 보존** — 코드·인라인 코드·터미널은 별도의
  `--ds-font-family-code` / `--dsh-font-family-terminal` 좌석을 사용합니다.
  스타일시트는 이 변수를 참조하지 않고 `pre`, `code`, `textarea`를 의도적으로
  제외하므로 고정폭 스택이 그대로 유지됩니다.
- **언어 스코프** — 로케일 플러그인이 관리하는 `<html lang>`을 따르며
  `ko-KR` 같은 지역 태그도 포함합니다. English/中文로 전환하면 규칙이 즉시
  비활성화되어 DSH 기본 스택으로 롤백됩니다. JS 리스너가 필요 없습니다.
- **웹폰트 없음** — 모든 패밀리는 시스템 로컬 폰트이며, 다운로드나 번들
  추가가 없습니다.
- **사용자 설정 우선** — 테마 프리젠터가 설정에서 고른 폰트를 인라인 사용자
  속성으로 쓰며, 인라인 스타일은 스타일시트보다 우선합니다. 규칙은
  `!important`를 쓰지 않습니다. 팩을 제거하면 스타일 엘리먼트도 함께
  제거됩니다.

## 동작 원리

브라우저 절반은 언어 정의 하나와 네임스페이스별 사전을 각각 소유 효과로
등록합니다.

```js
ctx.effect(() => ctx.locale.addLanguage({ id: 'ko', label: '한국어', fallback: 'en' }))
ctx.effect(() => injectScopedTypography(ctx))
ctx.effect(() => ctx.locale.register(namespace, 'ko', dictionary))
```

`LocaleRuntime`은 외부 `ko`를 빌트인 로케일과 동일하게 취급합니다. 선택,
영속화, 조회, 폴백, `<html lang>`, 브라우저 매칭, 지연 사전 등록이 모두 같은
경로를 탑니다. 팩이 추가로 담당하는 조정은 두 가지입니다.

- **양보 가드** — 플러그인이 적용될 때 카탈로그에 이미 `ko`가 있으면
  (향후 빌트인 또는 다른 한국어 팩) 아무것도 등록하지 않습니다.
- **네임스페이스 충돌 가드** — 효과 실행 전에 해당 네임스페이스에 `ko`
  소유자가 생겼다면 그 네임스페이스만 건너뛰고 기존 소유자를 유지합니다.
- **자기 완결 번들** — 협력 대상 DSH 패키지에 의존하지 않고, 네트워크
  접근과 Host 변경이 없습니다.

## 빌드·검증

Node 24+, 의존성 없음:

```sh
node scripts/build.mjs     # data/ko.json + styles/typography.css -> lib/client.js
node scripts/verify.mjs    # 메타데이터 + 커버리지 + 타이포그래피 + apply 계약
```

`data/ko.json`은 [discussion #10687](https://github.com/deepseek-ai/deepseek-harness/discussions/10687)의
소스 브랜치에서 추출한 스냅샷이고, `data/coverage.json`은 추출·패리티 결과를
기록합니다. `styles/typography.css`는 감사 가능한 타이포그래피 원본이며,
빌드가 이를 브라우저 번들에 임베드합니다. `lib/client.js`는 저장소에 포함되어
소비자는 빌드할 필요가 없습니다.

## 배포

`dsh.manifestVersion`, `dsh.bundle.patch`, `dsh.client`
(`platform: web`, `immediately: true`), Host no-op 엔트리, 로컬라이즈된
패키지 아이콘, `locale/en.json`·`locale/ko.json`, 스코프 타이포그래피
`styles/typography.css`, `market/index.json` 피드를 갖춘 완전한 DSH
번들입니다.

```sh
npm publish
```

`prepublishOnly`가 산출물을 다시 빌드·검증합니다. 마켓 피드는 저장소의
`market/` 디렉터리에서 제공하거나 더 큰 인덱스에 병합할 수 있습니다.

## 라이선스

MIT. 한국어 사전은 `deepseek-harness`의 `feat/korean-locale` 브랜치
(커밋 `1091f232fd`)에서 파생되었으며 MIT 라이선스를 따릅니다.
자세한 내용은 [NOTICE](NOTICE)를 참고하세요.
