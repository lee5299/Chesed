# 헤세드 새 환경 재현과 릴리스 기록 (22단계)

이 문서는 학생이 직접 쓴 22단계 기록입니다. 제공 문서(`README.md`, `docs/` 아래 기존 문서)와 21단계 학생 설명서(`docs/STUDENT_RUNBOOK.md`)는 고치지 않았고, 이 파일만 새로 추가합니다. 실행 코드는 한 줄도 바꾸지 않았습니다.

- 보안 Agent 이름: **헤세드** (시작 틀 기본 이름 **케셰브**. 실행 창·브라우저 제목에는 케셰브로 표시됩니다)
- 작성일: 2026-10-29
- 버전 상태: **검증 중인 버전 (v1.0 아님)** — 이유는 1-3절

### 확인 표기

21단계 설명서(`docs/STUDENT_RUNBOOK.md`)와 같은 표기를 쓰고, 22단계에 필요한 구분 두 가지를 더했습니다.

| 표기 | 뜻 |
| --- | --- |
| **[코드 확인]** | 저장소 파일을 직접 읽고 대조했습니다. 실행은 하지 않았습니다. |
| **[작업 공간 실행]** | AI가 별도 작업 공간(Linux, Node.js v22.23.4)의 **새 빈 폴더**에 같은 커밋을 내려받아 실행해 확인했습니다. **학생 PC(Windows)에서 한 재현이 아닙니다.** |
| **[PC 확인 필요]** | 학생 PC에서 아직 실행하지 않았습니다. 10장에서 확인한 뒤 결과를 적습니다. |
| **미확인(UNV)** | 실제 연결·권한·설정이 없어 지금은 확인할 수 없습니다. 성공으로 보지 않습니다. |
| **예제 자료(demo)** | `--demo`(실행 도구 `-Demo`, `npm run demo`)로 띄운 제공 예제 데이터(`src/engine.mjs` `demoEngine`) 결과입니다. **실제 연결 결과가 아니며, 재현됨으로 적지 않습니다.** |
| **실제 연결** | 기존 엔진(SDP)·CLCO·OSV에 실제로 연결한 결과입니다. 이 문서 작성 시점까지 실제 연결 결과는 **하나도 없습니다**. |

> **AI 원문 검토는 실행 성공 증명이 아닙니다.** 22단계 판정은 서버의 AI가 같은 커밋의 코드·README·설정 설명·데이터 보존 계획·이 재현 기록을 함께 읽고 서로 맞는지 보는 **원문 검토**입니다. 서버가 새 환경에서 앱을 실행했다는 뜻이 아니고, 이 문서의 재현 기록은 **학생 진술**로 남습니다. 22단계 통과는 원문 검토 기준의 수료이며 실제 운영 인증이나 v1.0 자동 인증이 아닙니다.

---

## 1. 버전과 지원 범위

### 1-1. 대상 소스

| 항목 | 값 | 확인 |
| --- | --- | --- |
| 저장소 | https://github.com/lee5299/Chesed | [작업 공간 실행] `git clone` 성공 |
| 브랜치 | `master` | [작업 공간 실행] `origin/master` |
| 작업 공간에서 재현한 커밋 | `e43ac98833b6d854bb786d60f616e710e3bbd60d` (「보안 Agent 21단계」, 2026-10-29 11:02:18 +0900) | [작업 공간 실행] `git rev-parse HEAD` = `git rev-parse origin/master` |
| 학생 PC 재현 커밋 | 미기록 | [PC 확인 필요] 10장 |
| 1차 커밋(이 문서를 추가한 커밋, 학생 PC 재현 대상) | 미기록 | 커밋 후 2장 표에 직접 적음 |
| 앱 폴더 | 저장소의 `on-client/` (학생 PC: `D:\Chesed\on-client`) | [코드 확인] |

### 1-2. 버전 표시

| 위치 | 값 | 확인 |
| --- | --- | --- |
| `package.json` `name` / `version` | `alekov-client-starter` / `0.2.11` | [코드 확인] |
| `README.md` 첫 줄 | 「내 보안 Agent 시작 틀 0.2.11」 | [코드 확인] |
| `package.json` `engines.node` | `24.19.0` (실행 도구 `tools/start-alekov.ps1`은 22~24 허용) | [코드 확인] |
| API 응답 `meta.starterVersion` | `0.1.0` (`src/server.mjs` 313행 고정값) | [작업 공간 실행] 모든 `/api/*` 응답 |
| `/api/diagnostics` `data.version` | `0.1.0` (`src/server.mjs` 687행 고정값) | [작업 공간 실행] |
| `docs/FINAL_PRODUCT_GUIDE.md` 제목 | 「starter 0.2.9」 | [코드 확인] |

`0.2.11`(package.json)과 `0.1.0`(서버 표시값)이 다릅니다. 21단계에서 발견한 불일치이며, 제공 서버의 값이라 수정하지 않고 그대로 기록합니다. 제공 문서 `FINAL_PRODUCT_GUIDE.md`의 「0.2.9」 표기도 package.json과 다릅니다.

### 1-3. 버전 상태: 검증 중인 버전 (v1.0 아님)

`docs/STUDENT_PROMPTS.md` 22단계와 `docs/FINAL_PRODUCT_GUIDE.md` 8장은 「19단계 실제 실행 연결과 22단계의 같은 최종 소스 누적 재현·공식 접수 연결까지 완료·수용된 경우에만 v1.0」이라고 정합니다. 지금은 아래 항목이 남아 있어 v1.0으로 표시하지 않습니다.

| 남은 항목 | 상태 | 근거 |
| --- | --- | --- |
| 19단계 실제 조치 집행 연결 | 준비되지 않음. `/api/actions/prepare` → 503 `ACTION_UNSUPPORTED` | [작업 공간 실행], 공식 안내 「보안 조치를 실제로 처리하는 연결(19단계 실집행)은 아직 준비되지 않았습니다」 |
| 21·22단계 공식 접수 연결 | 미완료. 워크벤치 「포털 제출 준비」는 13~20단계만 지원, 21·22단계는 저장소 주소·커밋을 직접 입력 | 공식 22단계 안내, `FINAL_PRODUCT_GUIDE.md` 9장 |
| 학생 PC에서 같은 최종 커밋 재현 | 미기록 | 5-2절 표 |
| 실제 SDP·AI·OSV 연결 결과 | 하나도 없음 (모두 연결 없음·예제 자료·확인 불가) | 5-1절 표 |
| 22단계 공개 완료 기준 | `docs/CURRICULUM.json` stage 22: `criteriaStatus: "proposal"`, `runtimeStatus: "planned_not_verified"` | [코드 확인] |

### 1-4. 지원 범위

- 지원하는 실행: Windows + Windows PowerShell 5.1 + Node.js 22~24(기준 24.19.0)에서 `tools/start-alekov.ps1`로 실행, 브라우저 `http://127.0.0.1:5189/`. 세부 조건은 21단계 설명서 2장 그대로입니다. 학생 PC 실행은 [PC 확인 필요].
- 작업 공간(Linux)에서 `node src/server.mjs`를 직접 실행한 결과는 동작 확인일 뿐 지원 환경으로 보장하지 않습니다. Linux에는 PowerShell이 없어 실행 도구 자체는 실행하지 못했습니다.
- 기본 실행(설정 파일 없음)은 「연결 없음」 상태이고, `-Demo`는 예제 자료입니다. 둘 다 실제 연결 성공이 아닙니다.

---

## 2. 커밋 기준 설명

이 문서를 추가하는 커밋은 **문서만** 바뀝니다(`on-client/docs/STUDENT_RELEASE_RECORD.md` 1개 추가). 실행 코드(`src/`, `student/`, `public/`, `tools/`, `vendor/`, `package.json`)는 `e43ac98`과 같습니다. 그래서 작업 공간 재현 결과(5-1절)는 「코드가 같은 이전 커밋」의 결과이며, 제출 커밋 자체를 재현한 것은 아닙니다. 두 커밋의 관계는 커밋 후 아래 명령으로 확인해 적습니다.

```powershell
git -C D:\Chesed diff --stat e43ac98833b6d854bb786d60f616e710e3bbd60d <1차 커밋 40자리>
# 최종 커밋 직전(재현 결과를 적은 뒤): 작업 폴더와 1차 커밋 비교
git -C D:\Chesed diff --stat <1차 커밋 40자리>
```

기대 결과: `on-client/docs/STUDENT_RELEASE_RECORD.md` 한 파일만 표시됨. 다른 파일이 나오면 코드가 다른 것이므로 5장의 작업 공간 결과를 제출 커밋 결과로 쓰지 않습니다.

| 항목 | 값 | 확인 |
| --- | --- | --- |
| 작업 공간 재현 커밋 | `e43ac98833b6d854bb786d60f616e710e3bbd60d` | [작업 공간 실행] |
| 1차 커밋(이 문서 추가, 학생 PC 재현 대상, 40자리) | 미기록 | 커밋 후 직접 적음 |
| 최종 제출 커밋 | 이 문서 안에는 적지 않음 | 커밋은 자기 자신의 번호를 담을 수 없으므로, 재현 결과를 채운 최종 커밋의 40자리는 과제 화면에 입력함. 최종 커밋과 1차 커밋의 차이는 이 문서 1개뿐이어야 함 |
| 학생 PC 재현 커밋(40자리) | 미기록 | 10장 확인 1 |
| `git diff --stat` 결과 | 미기록 | 위 명령 |
| 결론 | 미기록 (예: 「문서 1개만 다름, 실행 코드 동일」) | |

원칙:

1. 문제를 고치면 새 커밋을 만들고, 그 커밋 해시를 이 표와 3장에 새로 적습니다. 이전 결과를 새 커밋 결과로 옮겨 적지 않습니다.
2. **서로 다른 커밋의 통과 결과를 합쳐 최종 버전 전체 성공으로 표시하지 않습니다.** 3장의 단계별 판정은 각 단계 당시 커밋의 판정입니다.
3. 재현 기록을 이 문서에 채워 다시 커밋하면 제출 커밋이 또 바뀝니다. 이때도 위 `git diff --stat`으로 「문서만 다름」을 확인해 적습니다.

---

## 3. 버전 기록

**[작업 공간 실행]** `git log` (새로 내려받은 저장소). 「공식 판정」 칸은 학생 진술만 적었고, 진술이 없는 단계는 미확인입니다.

| 단계 | 커밋 (짧은 / 전체) | 날짜 (+0900) | 메시지 | 공식 판정 |
| --- | --- | --- | --- | --- |
| 13 | `538aa54` / `538aa54023fc1b9e176fb0fe5b5abe705194d675` | 2026-10-19 14:12:01 | 보안 Agent 13단계 (최초 커밋) | 미확인 |
| 13 | `22e50c0` / `22e50c0efda511fdac1d67102ec93aefe2a23f21` | 2026-10-19 16:27:59 | 보안 Agent 13단계 | 미확인 |
| 14 | `3679dcb` / `3679dcbfbe452fe03a4559aa1a504c50366efcf4` | 2026-10-19 17:05:48 | 보안 Agent 14단계 | 미확인 |
| 15 | `a1a5c6e` / `a1a5c6e8698a95ac02e51db6d6ef20005ad070d6` | 2026-10-20 14:24:33 | 보안 Agent 15단계 | 미확인 |
| 16 | `e550918` / `e55091814a896fd6834643c8c6ad4b5f8e5d7308` | 2026-10-20 15:06:45 | 보안 Agent 16단계 | 미확인 |
| 17 | `a7448af` / `a7448af7d8c77ae3e0f04a3b946287b7a24f7ba5` | 2026-10-23 15:51:35 | 보안 Agent 17단계 | 미확인 |
| 18 | `c1638ac` / `c1638ac011e9de1c3924d3466d999fbd6c540ce6` | 2026-10-26 14:27:33 | 보안 Agent 18단계 | 통과 (학생 진술, 2026-10-26) |
| 19 | `6134b0e` / `6134b0e3b3ded5c5fcacb97054bac07aaa89e5d5` | 2026-10-26 15:25:17 | 보안 Agent 19단계 | 통과 (학생 진술, 2026-10-26) |
| 20 | `84fbcf9` / `84fbcf96e53cc9c0a697fed6b142a75ea8e0a098` | 2026-10-26 15:48:12 | 보안 Agent 20단계 | 미확인 |
| 21 | `e43ac98` / `e43ac98833b6d854bb786d60f616e710e3bbd60d` | 2026-10-29 11:02:18 | 보안 Agent 21단계 | 통과 (학생 진술, 2026-10-29) |
| 22 | 미기록 | 미기록 | 미기록 | 미확인 |

> 주석: 위 판정은 **각 단계 당시 커밋의 판정이며 최종 커밋의 판정이 아닙니다.** 18·19·21단계 통과는 각각 `c1638ac`·`6134b0e`·`e43ac98` 기준이고, 최종 커밋 전체의 통과를 뜻하지 않습니다. 19단계 통과는 시험용 원천으로 화면 구분을 본 학습 계약 기준이며, 실제 조치 집행 연결을 인정한 것이 아닙니다(`docs/FINAL_PRODUCT_GUIDE.md` 5장).

---

## 4. 새 환경 재현 절차 (학생 PC, PowerShell)

21단계 설명서 4장과 같은 명령을 쓰고, 폴더만 새 빈 폴더로 바꿉니다. 아래 명령은 학생 PC에서 아직 실행하지 않았습니다 **[PC 확인 필요]**.

### 4-1. 원래 폴더 보존과 대상 기록

1. `D:\Chesed`는 지우거나 옮기지 않습니다. 단계 기록 폴더·루트 `README.md`·`.gitignore`·`*.txt`는 Git에 없으므로 새 폴더에는 생기지 않는 것이 정상입니다.
2. 먼저 원래 폴더의 커밋과 상태를 적습니다.

```powershell
git -C D:\Chesed rev-parse HEAD
git -C D:\Chesed status --porcelain
git -C D:\Chesed remote -v
git -C D:\Chesed branch --show-current
```

`status --porcelain`에 `on-client/` 아래 파일이 나오면 미커밋 변경이 있는 것입니다. 이 경우 새 폴더 재현 결과는 원래 폴더의 작업 상태와 다를 수 있으므로, 먼저 내용을 확인하고 커밋 여부를 정합니다(단계 기록 폴더·루트 파일만 나오는 것은 PC 보관 기록이므로 정상).

### 4-2. 새 빈 폴더에 내려받기

새 폴더 예: `D:\Chesed-repro22` (이미 있으면 다른 이름을 씁니다. 기존 폴더를 덮어쓰지 않습니다).

```powershell
# 방법 1: 원래 폴더를 대상으로 로컬 clone (GitHub push 불필요, 커밋된 내용만 복사)
git clone D:\Chesed D:\Chesed-repro22

# 방법 2: GitHub에서 clone (이미 push한 커밋만 받을 수 있음)
git clone https://github.com/lee5299/Chesed.git D:\Chesed-repro22
```

특정 커밋을 재현하려면 `git -C D:\Chesed-repro22 checkout <40자리 커밋>`을 실행합니다. 이어서 커밋을 대조합니다.

```powershell
git -C D:\Chesed-repro22 rev-parse HEAD
git -C D:\Chesed-repro22 status --porcelain
```

`rev-parse HEAD`가 2장 표의 제출 커밋(또는 재현하려는 커밋)과 같아야 합니다. 공식 안내의 「수료 패키지 내보내기 도구」는 이 저장소에 없으므로 쓰지 않았습니다.

**복사하지 않는 것**: 원래 폴더의 `.env`, 설정 파일(`native.json`·SDP 설정), 인증서·키·토큰, 보관함 폴더. 새 폴더는 Git에 있는 파일만으로 실행합니다. 서버는 `.env`를 읽지 않습니다(6장).

### 4-3. 런타임 확인과 설치

```powershell
cd D:\Chesed-repro22\on-client
node --version
npm --version
git --version
$PSVersionTable.PSVersion
npm run check
```

- `node --version`은 v22~v24여야 합니다(기준 v24.19.0).
- **`npm install`은 하지 않습니다.** `package.json`에 의존성이 없어 설치할 것이 없고, 실행하면 저장소에 없는 `package-lock.json`이 새로 생깁니다(작업 공간에서 확인, 5-1절). 실수로 생겼다면 커밋하지 않습니다.
- `npm run check`는 `node --check student/extension.mjs`(학생 파일 문법 확인)입니다.

### 4-4. 실행 → 브라우저 확인 → 종료 → 재실행

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

1. 정상 시작 신호 (21단계 설명서 4-4): 「케셰브가 켜졌습니다. 브라우저에서 http://127.0.0.1:5189/ 을 여세요.」「서버가 응답한 것만 확인했습니다. AI 연결 상태는 화면에서 따로 확인해 주세요.」「끄려면 이 창에서 Ctrl+C 를 누르세요.」와 서버 줄 「케셰브 연결 확인: http://127.0.0.1:5189」.
2. 브라우저에서 `http://127.0.0.1:5189/`를 열고 5-2절 표 순서대로 누릅니다.
3. 실행 창에서 `Ctrl+C`로 끕니다. 주소를 새로 고쳐 열리지 않으면 꺼진 것입니다.
4. 같은 명령으로 다시 켜고 같은 결과인지 봅니다.
5. 예제 자료 확인은 `-Demo`를 붙여 따로 실행합니다(`... start-alekov.ps1 -Demo`). 이 결과는 비고에 「예제 자료」로 적습니다.

**포트 충돌**: 원래 폴더 `D:\Chesed\on-client`의 앱이 켜져 있으면 「포트 5189 를 다른 프로그램이 쓰고 있습니다. …」가 나옵니다. 원래 앱 창에서 `Ctrl+C`로 먼저 끄는 것이 원칙입니다. 끌 수 없으면 `-Port 5190`으로 실행하고 브라우저 주소도 `:5190`으로 엽니다. `-Port` 옵션은 실행 도구에 있습니다 **[코드 확인]** `tools/start-alekov.ps1` `param` (`ValidateRange(1024, 65535)`), 학생 PC 동작은 **[PC 확인 필요]**.

---

## 5. 재현 기록

결과 값은 네 가지만 씁니다: **재현됨 / 재현 안 됨 / 연결 없음 / 확인 불가**. 「연결 없음」(`ENGINE_NOT_CONNECTED`·`ACTION_UNSUPPORTED` 등)은 재현됨이 아닙니다. 예제 자료(demo) 결과는 결과 칸을 「확인 불가」로 두고 비고에 「예제 자료」라고 적습니다. 기다림(UNV) 항목은 재현 완료로 적지 않습니다.

### 5-1. (가) 작업 공간 재현 결과 — AI가 작업 공간에서 실행, 학생 PC 재현 아님

- 환경: Linux 6.18, Node.js v22.23.4, npm 10.9.9, git 2.43.0, PowerShell 없음, Chromium(Playwright). 수업 기준 Node.js 24.19.0과 다릅니다.
- 폴더: 빈 폴더에 `git clone https://github.com/lee5299/Chesed.git` → `git checkout e43ac98833b6d854bb786d60f616e710e3bbd60d`. 원래 폴더의 설정·인증 파일은 복사하지 않았고 `.env` 없이 실행했습니다. 환경변수 `ON_*`는 `ON_PORT` 외에 없었습니다.
- 실행: 기본 실행 `ON_PORT=5196 node src/server.mjs`, 예제 실행 `ON_PORT=5197 node src/server.mjs --demo`(`npm run demo`와 같은 진입점, 포트만 다름). 각각 켜기 → API 29건 요청 → 브라우저에서 세 메뉴·버튼 확인 → `Ctrl+C`와 같은 신호(SIGINT)로 종료 → 포트 해제 확인 → 재실행 → 같은 확인 → 비교.
- 브라우저: `127.0.0.1` 밖으로 나가는 요청을 막고 기록했습니다. 외부 요청 시도 0건. 브라우저 페이지 실행 오류(pageerror) 0건. 콘솔 메시지는 503 응답에 대한 「Failed to load resource」만 있었습니다(기본 19건, 예제 5건).
- 확인 시각: 2026-10-29 (KST). 아래 표의 시각은 같은 날짜의 시:분입니다.

| 단계 | 기능 | 결과 | 확인 시각 | 근거 | 비고 (예제 자료·미확인 원인) |
| --- | --- | --- | --- | --- | --- |
| 21 | 새 빈 폴더에 커밋 받기 | 재현됨 | 11:16 | `git rev-parse HEAD` = `e43ac98833b6d854bb786d60f616e710e3bbd60d`, `git status --porcelain` 빈 출력, 추적 파일 76개 | 작업 공간 |
| 21 | 런타임 확인·문법 확인 | 재현됨 | 11:18 | `node --version` v22.23.4, `npm run check` 종료 코드 0 | Node 24.19.0이 아님(`npm install` 시 EBADENGINE 경고) |
| 21 | 설치 단계 | 재현됨 | 11:18 | `npm install --ignore-scripts` → 「up to date」, 설치된 패키지 0개 | 저장소에 없던 `package-lock.json`이 생김 → 기록 후 삭제. 설치 단계는 필요 없음 |
| 21 | 서버 시작 신호 | 재현됨 | 11:18 | 「케셰브 연결 확인: http://127.0.0.1:5196」 (Node 22의 SQLite 실험 기능 경고 1줄 함께 출력) | `tools/start-alekov.ps1`이 아니라 `node src/server.mjs` 직접 실행 |
| 21 | 실행 도구 `tools/start-alekov.ps1` | 확인 불가 | — | — | 작업 공간에 PowerShell 없음. 설치하지 않음 → [PC 확인 필요] |
| 21 | 정적 파일·주소 제한 | 재현됨 | 11:19 | `GET /`·`/app.js`·`/student/extension.mjs` 등 8건 200, `/?x=1` 400 `QUERY_REJECTED`, 다른 Host 403 `HOST_REJECTED`, Origin 없는 POST 403 `ORIGIN_REJECTED`, 없는 주소 404 `NOT_FOUND` | 로컬 기능 |
| 21 | 종료·포트 해제 | 재현됨 | 11:21 | 프로세스 종료, `GET /` 연결 실패(curl 종료 코드 7), 같은 포트 다시 열기 가능 | |
| 21 | 재실행 후 같은 결과 | 재현됨 | 11:22 | 1차·2차 API 29건 diff 차이 없음(요청 식별자·시각 제외), 화면 텍스트·버튼·클릭 결과·오류 수 diff 차이 없음 | 기본 실행 기준 |
| 13 | 내 정보·기기·세션 | 연결 없음 | 11:21 | `/api/me`·`/api/devices`·`/api/sessions` 503 `ENGINE_NOT_CONNECTED`. `student-identity`: 「연결 없음」「연결 실패 또는 확인 불가: 기존 서버·에이전트의 연결을 확인할 수 없습니다. 연결 어댑터를 먼저 확인하세요.」 | 기본 실행. 실제 SDP 연결 UNV |
| 13 | 내 정보·기기·세션 (예제) | 확인 불가 | 11:22 | `student-identity`: 「예제 자료」「사용자: 연습 사용자 · ID: practice-user」「기기 상태: 확인 불가 (unknown)」「세션 상태: 활성 (active)」 | 예제 자료 |
| 13 | 다시 불러오기 | 연결 없음 | 11:21 | 「다시 불러오기」 뒤에도 같은 연결 없음 표시 | 기본 실행 |
| 14 | 접속 판정 네 가지 | 연결 없음 | 11:21 | 기본 실행은 `/api/apps` 503이라 업무 앱 버튼 0개(선택 불가), `/api/access` 503 `ENGINE_NOT_CONNECTED` | 실제 판정 UNV |
| 14 | 접속 판정 (예제) | 확인 불가 | 11:22 | 「학습 자료실」 allow(제공 칸 「허용」), 「개발 저장소」 deny(「차단」), 「확인할 업무 앱」 challenge(「추가 확인 필요」). `student-decision`: 「접근 허용 (allow)」「접근 거부 (deny)」「추가 인증 또는 확인 필요 (challenge)」와 판정 이유·시각 | 예제 자료. `unknown` 판정은 예제에도 없어 확인 불가 |
| 14 | 요청 실패 구분 | 확인 불가 | 11:22 | 화면에서 요청 실패를 만들 수 없음. API로만: 없는 앱 → 예제 404 `APP_NOT_FOUND`, 기본 503 | 화면 문구 「요청 실패는 접근 허용 또는 접근 거부 판정이 아닙니다.」는 [코드 확인]만 |
| 15 | 기록 목록·걸러 보기·상세 | 연결 없음 | 11:21 | `/api/events` 503. `student-events`: 「기록을 불러오지 못했습니다: 기존 서버·에이전트의 연결을 확인할 수 없습니다. …」 | 실제 기록 UNV |
| 15 | 기록 목록·걸러 보기·상세 (예제) | 확인 불가 | 11:23 | 「표시 기록: 1건」 `event-01`, 걸러 보기 3개(기록 종류·업무 앱·접속 상태) 값 변경 시 1건 유지, 「event-01 상세」 → 근거 `e-01`·규칙 `rule-01`·상태(access denied, session active, device unknown) | 예제 자료. 빈 목록 화면 확인 불가 |
| 16 | 오류 표시·다시 시도 안내 | 연결 없음 | 11:21 | `student-status`: 「기기 불러오기 실패: …」「세션 불러오기 실패: …」「다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.」, 알림에 자원별 `ENGINE_NOT_CONNECTED` 5건 | 빈 목록·불러오는 중·시간 초과 화면은 확인 불가 |
| 16 | 도움정보 | 재현됨 | 11:21 | 「도움정보 불러오기」 → `student-status`에 `requestId`·`component: on-client`·`version: 0.1.0`·`checkedAt`·`engine.mode: disconnected`·`engine.code: ENGINE_NOT_CONNECTED` 6항목 | 로컬 기능(외부 연결 불필요). 표시 값은 연결 없음 상태 |
| 16 | 미지원 조치 표시 | 확인 불가 | 11:23 | 예제 기록의 `supportedActions`가 빈 배열이라 「<조치> 미지원」 버튼이 나오지 않음. `student-action`: 「지금 기록은 연동 시스템이 지원하는 조치가 없어 「조치 준비」 버튼이 나오지 않는 것이 정상입니다.」 | 예제 자료 |
| 17 | AI 연결 점검 | 연결 없음 | 11:21 | 「AI 연결 점검」 → 서버 503 `ENGINE_NOT_CONNECTED`, 화면 「점검 실패: 권한 준비 중·확인 불가」「오류 코드: AI_REQUEST_UNVERIFIED」「이 결과는 연결 성공이 아니며 …」 | 실제 AI 점검 UNV |
| 17 | AI 연결 점검 (예제) | 확인 불가 | 11:22 | 503 `ON_AI_PROVISIONING_PENDING`, 화면 「오류 코드: ON_AI_PROVISIONING_PENDING」 | 예제 자료. 외부 AI 요청 없음 |
| 17 | 계정 연결·AI 앱 연결 시작 | 연결 없음 | 11:21 | 「계정 연결 시작」 → `NATIVE_HOST_DISABLED`, 「AI 연결 시작」 → `ALEKOV_CONNECT_UNAVAILABLE`(「AI 연결 기능이 아직 준비되지 않았습니다(서버 미준비).」) | `-NativeHostConfig` 없음. UNV |
| 18 | AI 사건 설명 | 확인 불가 | 11:21 | 기본 실행은 기록이 없어 「AI 설명 요청」 버튼이 없음. `/api/ai/explain` 503 `ENGINE_NOT_CONNECTED` | 실제 설명 UNV |
| 18 | AI 사건 설명 (예제) | 확인 불가 | 11:23 | 「AI 설명 요청」 → `student-explanation`: 「AI 설명 실패: …」「오류 코드: ON_AI_PROVISIONING_PENDING」「기록은 그대로입니다. AI 설명 실패는 과제 실패가 아니며 …」 | 예제 자료. 실패 표시만 확인 |
| 19 | 조치 제안과 처리 결과 구분 | 연결 없음 | 11:19 | `/api/actions/prepare` → 503 `ACTION_UNSUPPORTED`(「현재 원천 서버의 조치 연결과 권한 확인을 지원하지 않습니다.」). `student-action`: 「아직 미실행(idle)」「조치 제안만으로는 아무것도 실행되지 않습니다.」 | 19단계 실집행 미준비. 집행 버튼은 누르지 않음(비활성) |
| 20 | 패키지·취약점 대조 | 확인 불가 | 11:21 | 「설치 패키지 조회」 → `not_configured` / `PROJECT_NOT_CONFIGURED`, `student-vulnerabilities`: 「조회 준비 미완료(not_configured)」「… 「취약점 없음」이 아닙니다.」 | `ON_PROJECT_DIRECTORY` 미설정. OSV 실제 조회 UNV |
| 공통 | 새로 고침 뒤 초기화 | 재현됨 | 11:21 | 새로 고침 뒤 AI 점검 칸 「AI 연결 점검 전」, 취약점 칸 「조회 전(idle)」, 조치 칸 「아직 미실행(idle)」으로 돌아옴 | 브라우저 저장소 미사용(7장) |
| 공통 | 예제 실행 재실행 비교 | 확인 불가 | 11:23 | 예제 1차·2차 API 29건·화면 diff 차이 없음, 시작 신호 「케셰브 예제: http://127.0.0.1:5197」 같음 | 예제 자료 |
| 공통 | 실행 후 폴더 변화 | 재현됨 | 11:23 | 기본 2회·예제 2회 실행 후 `git status --porcelain --ignored` 빈 출력. 남은 서버 프로세스 0개 | `npm install`이 만든 lock 파일은 별도(위 설치 단계) |

### 5-2. (나) 학생 PC 재현 — 학생이 직접 확인해 채움

4장 절차로 학생 PC의 새 폴더(예: `D:\Chesed-repro22`)에서 확인합니다. 직접 본 결과만 적고, 확인하지 않은 칸은 「미확인」으로 둡니다.

- 환경: Windows 버전 미확인 / PowerShell 버전 미확인 / Node.js 버전 미확인 / Git 버전 미확인
- 재현 폴더: 미확인 / 재현 커밋(40자리): 미확인

| 단계 | 기능 | 결과 | 확인 시각 | 근거 | 비고 (예제 자료·미확인 원인) |
| --- | --- | --- | --- | --- | --- |
| 21 | 새 빈 폴더에 커밋 받기 (`rev-parse HEAD` 대조) | 미확인 | 미확인 | 미확인 | |
| 21 | 런타임 확인·`npm run check` | 미확인 | 미확인 | 미확인 | |
| 21 | 실행 도구 시작 신호 | 미확인 | 미확인 | 미확인 | |
| 21 | 브라우저 첫 화면(메뉴 3개, 「연결 없음」) | 미확인 | 미확인 | 미확인 | |
| 21 | `Ctrl+C` 종료와 재실행 | 미확인 | 미확인 | 미확인 | |
| 13 | 내 정보·기기·세션과 다시 불러오기 | 미확인 | 미확인 | 미확인 | |
| 14 | 접속 판정 네 가지와 요청 실패 구분 | 미확인 | 미확인 | 미확인 | |
| 15 | 기록 목록·걸러 보기·상세 | 미확인 | 미확인 | 미확인 | |
| 16 | 오류·빈 화면·다시 시도·도움정보·미지원 조치 | 미확인 | 미확인 | 미확인 | |
| 17 | AI 연결 상태 | 미확인 | 미확인 | 미확인 | |
| 18 | 근거 있는 AI 설명 | 미확인 | 미확인 | 미확인 | |
| 19 | 조치 제안과 처리 결과 구분 | 미확인 | 미확인 | 미확인 | |
| 20 | 패키지·취약점 대조 | 미확인 | 미확인 | 미확인 | |
| 공통 | 끄고 다시 켠 뒤 같은 결과 | 미확인 | 미확인 | 미확인 | |
| 공통 | `-Demo` 예제 화면 | 미확인 | 미확인 | 미확인 | 예제 자료 |
| 공통 | 실행 후 `git status --porcelain` 변화 없음 | 미확인 | 미확인 | 미확인 | |

---

## 6. 이동 가능한 구성

### 6-1. 필요한 것

| 항목 | 내용 | 확인 |
| --- | --- | --- |
| 프로그램 | Windows, Windows PowerShell 5.1, Node.js 22~24(기준 24.19.0), Git, 브라우저 | [코드 확인] 21단계 설명서 2장 |
| 파일 | Git에 커밋된 `on-client/` 전체(추적 파일 76개). 다른 파일을 복사할 필요 없음 | [작업 공간 실행] 새 폴더 clone만으로 실행 |
| npm 의존성 | 없음. `dependencies`·`devDependencies` 없음, 외부 패키지 import 없음 → `npm install` 불필요 | [코드 확인] `package.json`, [작업 공간 실행] |
| lock 파일 | 저장소에 `package-lock.json` 등 lock 파일 없음. 의존성이 없어 고정할 버전도 없음. `npm install`을 하면 의존성 없는 lock 파일이 새로 생기므로 하지 않음 | [작업 공간 실행] |
| `node:sqlite` | 서버가 시작할 때 `src/actions/store.mjs`가 `node:sqlite`를 불러옴. Node.js 22 초기 버전에서는 실패할 수 있음(21단계 설명서 2장). v22.23.4에서는 실험 기능 경고 1줄과 함께 동작 | [작업 공간 실행] |

### 6-2. 설정 예시 `.env.example`

`.env.example`은 비밀값이 없는 설정 견본입니다. **서버는 `.env` 파일을 자동으로 읽지 않습니다** (코드에 `.env` 읽기·`dotenv`·`--env-file` 0건) **[코드 확인]**. 값이 필요하면 실행 전에 환경변수로 줍니다. 학생은 AI 주소·열쇠·모델 값을 넣지 않습니다(`docs/FINAL_PRODUCT_GUIDE.md` 3장).

| 키 | 견본 값 | 서버에서 쓰는 곳 | 비고 |
| --- | --- | --- | --- |
| `ON_PORT` | `5189` | `src/server.mjs` 726행 (없으면 5189, 1024~65535만 허용) | 실행 도구는 `-Port` 값을 이 변수로 넘김 |
| `ON_ENGINE_ADAPTER` | `./student/engine-adapter.mjs` | `src/server.mjs` 735행 | 설정하지 않으면 기본 실행은 연결 없음 |
| `ON_AI_MODEL` | `aleph/auto` | `src/ai/service.mjs` 182행 (`createOnAiService`의 모델 기본값) | 실행 도구는 `ON_AI_*` 변수를 지우고 서버를 실행함(`tools/start-alekov.ps1` 110~111행) |
| `ON_PROJECT_DIRECTORY` | (빈 값) | `src/server.mjs` 738행 → `src/vulnerabilities/project-scan.mjs` | 없으면 `not_configured`. 담당자 준비 항목 |
| `ON_APPROVED_PUBLIC_PACKAGES` | `[]` | `src/server.mjs` 737행 (JSON 배열이 아니면 `INVALID_PUBLIC_PACKAGE_LIST`로 시작 실패) | 비어 있으면 OSV 외부 조회 0건 |

### 6-3. 로컬 절대경로·비밀값 의존 점검 **[작업 공간 실행]**

추적 파일 76개를 `git grep -I`(이진 파일 제외)로 검사했습니다(2026-10-29 11:25 KST).

| 검사 | 결과 | 판단 |
| --- | --- | --- |
| 실행 코드(`src`·`student`·`public`·`tools`·`vendor`·`package.json`·`.env.example`)의 사용자별 경로(`D:\`, `/home/`, `/Users/`, `C:\Users`) | 0건 | 실행이 특정 PC 경로에 의존하지 않음 |
| 실행 코드의 드라이브 절대경로 | `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` (`src/ai/credential-vault.mjs` 10행, `src/connection/native-context.mjs` 14행), `SystemRoot`·`WINDIR` = `C:\Windows` (`src/ai/credential-vault.mjs` 96행) | Windows 시스템 경로. 계정 연결·보관함 기능(`-NativeHostConfig`)에서만 쓰는 제공 코드 |
| 문서의 `D:\Chesed` (학생 문서 `docs/STUDENT_RUNBOOK.md` 17건, `docs/img/hesed-folder-structure.svg` 1건) | 18건 | 학생 PC 위치 설명. 실행 의존 아님 |
| 제공 문서의 예시 경로 `C:\AlekovPrivate\...` (`docs/AI_SETUP_GUIDE.md`, `docs/CONNECTION_TROUBLESHOOT.md`, `docs/STUDENT_LAUNCH_GUIDE.md`, `docs/SDP_HOST_CONNECTION.md`), `vendor/NOTICE.md`의 `C:\Work\aleph-workbench` | 문서 예시·출처 표기 | 실행 의존 아님 |
| 실제 값 형태의 비밀 (AI API 열쇠, 앱 전용 열쇠 형식, GitHub 토큰, AWS 접근 키, 개인 키 본문, JWT, 「비밀번호=값」 형태 등 정규식 8종) | 0건 | 비밀값 없음 |
| `sk-`·`secret`·`token` 같은 이름 | 비밀 차단용 정규식·변수명에만 있음 (예: `src/server.mjs` 138행, `student/extension.mjs` 361행) | 비밀값 아님 |
| 추적되는 설정·인증 파일 | `.env.example`(비밀 없음)뿐. `.env`·`.pem`·`.key`·`native.json`·DB 파일 없음 | |

---

## 7. 데이터 보존 계획

### 7-1. 무엇이 어디에 저장되는가 **[코드 확인]**

앱의 Node.js 코드(`src`·`student`·`public`·`vendor`)에는 파일 쓰기 API(`writeFile`·`appendFile`·`mkdir`·`rename`·`unlink` 등)가 0건입니다. 파일을 만드는 곳은 아래 PowerShell 보조 스크립트와 SQLite 조치 저장소뿐이며, 모두 담당자 설정이 있을 때만 동작합니다. 기본·예제 실행 4회 뒤 새 폴더에 생긴 파일은 0개였습니다 **[작업 공간 실행]**.

| 데이터 | 저장 위치 | 언제 생기나 | 근거 |
| --- | --- | --- | --- |
| 학생 코드·학생 문서 | `on-client/` (Git 커밋, GitHub `origin`) | 학생이 커밋할 때 | `git ls-files` |
| 단계 작업 기록 | `D:\Chesed`의 단계 폴더, 루트 `README.md`·`.gitignore`·`*.txt` | 학생이 작성. **Git에 없음 (PC에만 보관)** | 21단계 설명서 3장. 실제 폴더 목록 [PC 확인 필요] |
| 화면 상태 (판정·AI 점검·조회 결과) | 브라우저 메모리만 | 화면을 연 동안 | `localStorage`·`sessionStorage`·IndexedDB·쿠키 사용 0건 (`public/*.js`·`public/*.mjs`·`student/*.mjs`). 새로 고침하면 초기화 [작업 공간 실행] |
| 계정 연결·AI 앱 연결 진행 상태 | 서버 프로세스 메모리 (`Map`) | 연결 진행 중 | `src/connection/manager.mjs` 95·238행 `const flows=new Map()`. 서버를 끄면 사라짐 |
| AI 앱 전용 열쇠 (보관함) | 담당자가 정한 `vaultRoot` 폴더 안 `.alekov-owner.json`(표식)과 `<contextFingerprint>.credential`(레코드), 저장 중 임시 `.alekov-<GUID>.tmp` | `-NativeHostConfig` 실행 + AI 앱 승인 후 | `tools/app-credentials.ps1` 159~166·173·198~199행. 레코드 내용은 Windows DPAPI(`ProtectedData`, `CurrentUser` 범위)로 암호화(183·196행), 소유자만 접근하는 ACL(129~142행). `src/ai/credential-vault.mjs` 32~47행: Windows 전용, 기본 저장 경로 없음, 드라이브 절대경로만 허용 |
| Windows 자격 증명 관리자 | **사용하지 않음** | — | `CredWrite`·`CredRead`·`cmdkey` 등 0건. 위 DPAPI 암호화 파일 방식 |
| 계정 대응(레지스트리) 상태 | 담당자가 정한 `registryRoot` 폴더 안 `.alekov-native-registry.json`, 임시 `.native-*.tmp`, 이전 판 `.native-history-*.bak` | `-NativeHostConfig` 실행 중 | `tools/native-host-registry.ps1` 46·53·63·66행 |
| 호스트 설정 파일 | `prepare-native-host.ps1 -Create`가 만드는 `<HostRoot>\registry`, `<HostRoot>\vault`, `<HostRoot>\native.json` | 담당자 준비 시 | `tools/prepare-native-host.ps1` 2·69행 (「학생 프로젝트 밖의 새 전용 폴더」). `src/connection/native-context.mjs` 41행: 보관함·레지스트리가 프로젝트 안이면 거부 |
| SDP 설정·인증서·키·토큰 | 담당자가 준 파일 (프로젝트 밖) | 담당자 제공 | `src/engine/sdp-host-config.mjs` 111·118행: 설정 파일과 `caFile`·`certFile`·`keyFile`·`tokenFile`이 앱 폴더 안이면 거부 |
| 조치 기록 (SQLite) | 담당자가 미리 만든 기존 SQLite 파일에 `alekov_action_intents`·`alekov_action_state`·`alekov_action_audit` 표 추가 | `--alekov-actions`와 `--alekov-actions-config`, `-NativeHostConfig`, `-SdpHostConfig`를 모두 줄 때만 | `src/actions/store.mjs` 6~8·13·16·21·27행, `src/actions/action-startup-config.mjs` 9행(DB 자동 생성 안 함), `src/server.mjs` 721~722행. 실행 도구는 이 옵션을 넘기지 않음(`tools/start-alekov.ps1` 109행) → **지금은 사용하지 않음** |
| 설치 패키지 조회 | 저장하지 않음. `ON_PROJECT_DIRECTORY`의 `package-lock.json`을 읽기만 함 | 「설치 패키지 조회」를 누를 때 | `src/vulnerabilities/project-scan.mjs` 82·88행 |

### 7-2. 백업과 복원 절차

| 대상 | 백업 | 복원 | 확인 |
| --- | --- | --- | --- |
| 학생 코드·문서 (`on-client/`) | 단계마다 커밋. 원격 백업은 GitHub push(학생 원칙: 제출 직전 push). push 전이라도 `git clone D:\Chesed <다른 폴더>`로 커밋된 내용을 복사할 수 있음 | 새 빈 폴더에 `git clone` → `git rev-parse HEAD`로 커밋 대조 (4장) | clone 복원 [작업 공간 실행], PC [PC 확인 필요] |
| 단계 작업 기록 (Git 밖) | Git에 없으므로 **별도 백업 필요**. 예: `Compress-Archive -Path D:\Chesed\13, D:\Chesed\14 -DestinationPath <백업 폴더>\chesed-records-<날짜>.zip` 처럼 단계 폴더와 루트 `README.md`·`.gitignore`·`*.txt`를 프로젝트 밖으로 압축 복사 | 압축을 **새 폴더**에 풀어 내용을 확인한 뒤 필요한 파일만 옮김. 기존 기록을 덮어쓰지 않음 | [PC 확인 필요] |
| AI 앱 전용 열쇠·보관함·레지스트리 | **백업·복사 대상이 아님.** 열쇠를 화면·채팅·Git·제출물·백업에 넣지 않음 | 새 환경에서는 담당자 절차(호스트 설정 준비 → 계정 연결 → AI 앱 승인)로 새로 발급 | DPAPI `CurrentUser` 범위 암호화이므로 다른 PC·다른 Windows 계정으로 옮긴 파일은 복호화되지 않는 것이 일반 동작입니다. 실제 이동 시험은 하지 않음 → 미확인(UNV) |
| SDP 설정·인증서·토큰 | 백업·복사 대상이 아님 | 담당자에게 다시 받음 | 미확인(UNV) |
| 조치 기록 DB | 현재 사용하지 않음. 사용하게 되면 담당자가 관리하는 DB | — | 미확인(UNV) |
| 화면 상태·연결 진행 상태 | 보존하지 않음 (설계상 메모리만 사용) | 새로 고침·재실행 뒤 「다시 불러오기」, 연결 절차 다시 진행 | [작업 공간 실행] 새로 고침 뒤 초기화 |

### 7-3. 제한

- 백업·복원 절차는 작업 공간에서 Git clone만 확인했고, PC의 압축 백업·복원은 실행하지 않았습니다.
- 보관함·레지스트리·조치 DB는 담당자 설정이 없어 실제로 만들어진 적이 없습니다. 위 내용은 코드 읽기 결과입니다.
- 앱은 학생 데이터를 자동으로 백업하거나 내보내는 기능이 없습니다 **[코드 확인]**.
- 작업 폴더를 지우고 새로 만들지 않습니다(`docs/FINAL_PRODUCT_GUIDE.md` 7장). 새 환경 재현은 항상 새 폴더에서 합니다.

---

## 8. 시연·학생 진술·원문 확인·실제 실행 검증 구분

| 구분 | 무엇인가 | 이 문서에서 해당하는 것 | 증명하는 것 | 증명하지 않는 것 |
| --- | --- | --- | --- | --- |
| 시연 (예제 자료, demo) | `--demo`로 제공 예제 데이터를 표시 | 5-1절 「(예제)」 행 | 화면 구성과 학생 표시 함수가 예제 입력을 구분해 보여 줌 | 실제 SDP·AI·OSV 연결, 실제 판정·기록 |
| 학생 진술 | 학생이 직접 보고 적은 내용 | 3장 18·19·21단계 통과, 5-2절 표(채운 뒤), 10장 결과 | 학생이 그렇게 보았다는 기록 | 서버가 확인한 사실 |
| 원문 확인 (코드 확인) | 저장소 파일을 읽고 대조 | [코드 확인] 표기 전부, 7장 저장 위치 | 코드에 그렇게 쓰여 있음 | 실행했을 때 그렇게 동작함 |
| 실제 실행 검증 (작업 공간) | AI가 작업 공간 새 폴더에서 실행 | [작업 공간 실행] 표기, 5-1절 | 같은 코드가 Linux·Node 22에서 그렇게 동작함 | 학생 PC(Windows)·실행 도구·실제 연결에서의 동작 |
| 실제 실행 검증 (학생 PC) | 학생 PC 새 폴더에서 실행 | 5-2절 (아직 전부 미확인) | — | — |
| 22단계 서버 AI 판정 | 서버 AI가 같은 커밋의 원문끼리 맞는지 판단 | 제출 후 | 원문 사이의 일관성 | **실행 성공** (서버는 새 환경에서 실행하지 않음) |

---

## 9. 기다림(UNV) 목록

| 항목 | 이유 |
| --- | --- |
| 학생 PC 새 폴더 재현 전체 (5-2절) | 학생 PC에서 아직 실행하지 않음 |
| 학생 PC의 Windows·PowerShell·Node.js·Git 버전 | 위와 같음 |
| `tools/start-alekov.ps1` 시작 신호·`-Port`·`-Demo`·`-Background`·`-WaitSeconds` 동작 | 작업 공간에 PowerShell 없음, PC 미실행 |
| Node.js 24.19.0에서의 실행 | 작업 공간은 v22.23.4 |
| 기존 엔진(SDP) 실제 연결, 실제 판정·기록·기기·세션 | `-SdpHostConfig` 설정 미제공 |
| 계정 연결 확인과 AI 앱 승인 | `-NativeHostConfig` 설정·권한 미준비 |
| 실제 AI 연결 점검(verified·test)과 AI 사건 설명 | 위와 같음. 유료 AI 요청은 임의로 실행하지 않음 |
| 19단계 실제 조치 집행과 결과 재조회 | 실집행 연결 미준비 (`ACTION_UNSUPPORTED`) |
| OSV 실제 조회(complete·partial·not_checked) | `ON_PROJECT_DIRECTORY`·허용 목록 미설정 |
| 판정 `unknown`, 요청 실패, 빈 목록, 불러오는 중, 시간 초과 화면 | 예제·연결 없음 실행에서 만들 수 없음 |
| 보관함·레지스트리·조치 DB 생성과 백업·복원, 다른 PC 이동 시 복호화 불가 | 설정 미제공, 실험하지 않음 |
| 단계 작업 기록 압축 백업·복원 | PC에서 실행하지 않음 |
| 21·22단계 공식 접수 연결 | 운영 측 미완료 |
| 13~17·20·22단계 공식 판정 | 학생 진술 없음 → 미확인 |
| 제출 커밋과 `e43ac98`의 차이가 문서 1개뿐인지 | 커밋 후 2장 명령으로 확인 |

---

## 10. 직접 확인할 순서

한 번에 하나씩 진행하고 「결과」 칸에 직접 적습니다. 기존 폴더와 기록은 지우지 않습니다.

**확인 1 — 기존 폴더와 기록이 그대로 남아 있는지**

| 순서 | 할 일 (PowerShell) | 기대 결과 | 결과 |
| --- | --- | --- | --- |
| 1 | `git -C D:\Chesed rev-parse HEAD` | 제출 커밋 40자리 (이 문서를 커밋하기 전이면 `e43ac98833b6d854bb786d60f616e710e3bbd60d`) | |
| 2 | `git -C D:\Chesed status --porcelain` | `on-client/` 아래 미커밋 변경 없음. 단계 폴더·루트 파일 줄만 나오면 PC 보관 기록이므로 정상 | |
| 3 | `Get-ChildItem D:\Chesed -Directory` | `.git`, `on-client`와 단계 폴더가 그대로 있음 (21단계 설명서 3장 기준 13·14·17·18·19·20·21. 22는 이번 단계 기록 폴더를 만들었으면 있음). 실제로 있는 폴더 번호를 적음 | |
| 4 | `Test-Path D:\Chesed\README.md`, `Test-Path D:\Chesed\.gitignore` | 둘 다 `True` | |
| 5 | 4장 절차로 `D:\Chesed-repro22`에서 재현한 뒤 `git -C D:\Chesed status --porcelain`을 다시 실행 | 1·2번과 같은 결과 (새 폴더 재현이 원래 폴더를 바꾸지 않음) | |

**확인 2 — 미완료 항목이 있으면 검증 중인 버전으로 기록**

| 순서 | 할 일 | 기대 결과 | 결과 |
| --- | --- | --- | --- |
| 1 | 1-3절 표의 남은 항목이 아직 남아 있는지 확인 | 하나라도 남아 있으면 이 문서 머리말의 「검증 중인 버전 (v1.0 아님)」을 그대로 둠 | |
| 2 | 5-2절 표를 채운 뒤, 「재현됨」으로 적은 행이 예제 자료·연결 없음이 아닌지 다시 확인 | 예제 자료·연결 없음은 「재현됨」이 아님 | |
| 3 | 제출 후 서버 상태와 판정 설명 확인 | 원문 전달 완료와 AI 검토 통과는 다른 것으로 구분해 적음. 22단계 통과는 원문 검토 기준의 수료이며 운영 인증·v1.0 인증이 아님 | |

확인하지 못한 항목은 「미확인」으로 그대로 둡니다.
