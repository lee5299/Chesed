# 헤세드 총공세 작업 기록 (22단계 다음 · 내 PC에서 쓰는 앱으로 완성)

- 앱 이름: 헤세드 (기본 이름 케셰브)
- 작전: 화면 틀 **관제 대시보드형**(맨 위 상태 카드 네 개, 아래 추이와 기록) · 포장 형태 **포장 없이 프로젝트 폴더에서 실행**(`npm run package-app` 실행하지 않음)
- 시작 틀: 0.2.11 → **0.2.21** (2026-11-01)
- 값 구분 원칙: 화면과 이 문서에서 **이 PC 실측**, **예제 자료(설명용 값)**, **연결 없음(SDP 미연결)**, **확인 불가**를 섞지 않습니다.

## 0. 시작 틀 0.2.21 업데이트 (2026-11-01)

| 항목 | 내용 |
|---|---|
| 받은 파일 | `alekov-starter-0.2.21.zip`, `update-alekov-0.2.21.ps1` (공식 다운로드 페이지, SHA-256 공식 값과 일치) |
| 공식 도구 미리보기 결과(예상) | `UPDATE_FILE_MODIFIED` — `docs/AI_SETUP_GUIDE.md`, `tools/start-alekov.ps1` 두 파일이 공식 0.2.11 고정값과 다름 |
| 원인 확인 | 두 파일은 13단계 첫 커밋부터 그 상태였고, 학생 수정이 아니라 0.2.12 이전 공식 문구(계정 연결 자동 준비 이전 안내)였음 |
| 적용 방식 | 도구의 고정 목록에 있는 제공 파일 45개만 0.2.21 판으로 교체. 파일마다 도구에 적힌 SHA-256과 대조. `student/`, 학생 문서(`docs/STUDENT_RUNBOOK.md`, `docs/STUDENT_RELEASE_RECORD.md`, `docs/img/`), `.git`, 계정 연결 설정은 건드리지 않음 |
| 새로 생긴 제공 기능 | 보호 현황의 「내 PC 상태」(`public/pc-status-view.mjs`, `src/pc-status.mjs`, 학생 API `GET /api/pc/status`), 꾸밈 파일 `student/appearance.json` 지원, 참고 코드 `examples/pc-saas/` |
| 되돌리기 | 업데이트 전 상태는 Git 커밋 `0f8d4ae`(22단계)에 그대로 있음 |

## 1일차 · 22단계 프로젝트를 다시 실행하고 핵심 기능 3가지를 고릅니다

### 실행 방법 (기존 프로젝트 폴더에서)

```powershell
cd E:\chesed\on-client
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1          # 기본 실행(연결 없음)
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Demo    # 예제 자료
```

브라우저에서 `http://127.0.0.1:5189` 를 엽니다. 끄기는 실행 창에서 `Ctrl+C`.

### 확인한 환경과 범위

| 구분 | 내용 |
|---|---|
| 확인한 곳 | 클라우드 작업 사본(Linux, Node 22.23.4)에서 22단계 학생 코드 + 0.2.21 제공 파일로 기본 실행·예제 실행을 열어 화면 문구를 기록(2026-11-01 13:52) |
| 아직 확인하지 않은 것 | 사용자 PC(Windows, E:\chesed)에서의 실행 — **미확인**. Windows 방화벽·Windows 기록은 Windows에서만 조회되므로 이 점검표에서는 확인 불가 |

### 기능 점검표 (지금 화면에서 실제로 되는 것 / 안 되는 것)

| 기능 (단계) | 기본 실행(연결 없음) | 예제 실행(-Demo) | 판단 |
|---|---|---|---|
| 로그인 사용자·기기·세션 표시 (13) | 「연결 실패 또는 확인 불가」를 정상처럼 보이지 않게 표시 | 예제 사용자·기기·세션 표시(예제 자료 표시) | 표시 됨 · 실제 SDP 값은 미연결 |
| 업무 앱 접근 판정 (14) | 앱 선택 전 안내 표시 | 앱 선택 전 안내 표시 | 표시 틀 됨 · 실제 판정은 SDP 미연결 |
| 보안 기록 목록·걸러 보기·상세 (15) | 「기록을 불러오지 못했습니다」 | 예제 기록 1건, 종류·앱·상태 걸러 보기, 상세 | 됨(예제) · 실제 기록은 미연결 |
| 오류·빈 화면·다시 시도·도움정보 (16) | 기기·세션 실패 안내와 「다시 불러오기 직접 누르기」 | 알림 목록 | 됨 |
| AI 연결 상태 (17) | 「AI 연결 점검 전」 | 같음 | 표시 틀 됨 · 실제 연결은 학원 계정 승인 필요 |
| AI 사건 설명 (18) | 「기록을 먼저 고르세요」 | 같음 | 표시 틀 됨 · 실제 설명은 AI 연결 필요 |
| 조치 제안·처리 결과 (19) | 「조치 준비 버튼이 없는 것이 정상」 | 같음 | 지원 조치 없음(정상 표시) · 실제 집행 연결 없음 |
| 설치 패키지 취약점 조회 (20) | 「조회 전」, 직접 누를 때만 조회 | 같음 | 됨(조회는 누를 때) |
| 내 PC 상태 (0.2.21 제공) | CPU·메모리·디스크·네트워크 실측, 방화벽·Windows 기록은 Linux라 확인 불가 | 같음(예제 모드에서도 PC 값은 실측) | 제공 기능으로 됨 · 학생 구현 아님 |
| 내 PC 값의 추이·주의 알림·조회 기록 | 없음 | 없음 | **아직 안 됨** |

### 매일 쓰고 싶은 핵심 기능 3가지 (다듬을 순서)

1. **내 PC 상태** — CPU·메모리·디스크를 잰 시각·단위와 함께 맨 위 상태 카드로 보여 주고, 직전 대비와 이 화면 안의 추이를 더함 (2일차)
2. **연결·방화벽·Windows 기록 점검** — 네트워크 구성, 방화벽 프로필, 최근 24시간 경고·오류 건수를 읽기만 해서 보여 주고, SDP 연결 상태는 따로 표시 (3일차)
3. **주의 알림** — 기준을 넘은 관찰과 읽지 못한 항목을 「판정이 아닌 근거」로 모아 보여 줌, 「다시 조회」와 오류 화면 포함 (4일차)

고친 위치는 `student/extension.mjs`(필요하면 `student/appearance.json`)뿐이며, 제공 파일(`public/`, `src/`, `tools/`)은 고치지 않습니다.

## 2일차 · 내 PC의 CPU·메모리·디스크를 실제로 재서 보여 줍니다

| 구분 | 내용 |
|---|---|
| 제공 부분(다시 만들지 않음) | 값 조회 `GET /api/pc/status` 와 측정 코드 `src/pc-status.mjs`(CPU 200ms 표본, 메모리, 앱이 있는 디스크 여유 공간), 보호 현황의 「내 PC 상태」 카드 `public/pc-status-view.mjs` |
| 내가 만든 부분 | `student/extension.mjs` 의 `createPcDashboard` — 학생 API `api.get('/api/pc/status')` 로 같은 제공 값을 받아 **맨 위 상태 카드 4개**(CPU 사용률·메모리 사용량·디스크 남은 공간·Windows 방화벽)로 보여 주고, 고른 개선 한 가지로 **직전 대비 변화(%p)와 이 화면 안의 추이(최근 20회 그래프, 최저·평균·최고)** 를 더함 |
| 단위·시각 | 값마다 단위(%, GB)와 잰 시각을 붙임. 1분보다 오래된 값은 「오래됨 · 현재 값 아님」으로 표시하고 비교·추이에 넣지 않음 |
| 읽지 못한 값 | 0이나 예시 값 대신 「확인 불가」와 이유(권한 없음·시간 초과·이 운영체제에서는 조회 안 함·응답 형식 확인 불가)와 다음 할 일 |
| 권한 | 일반 권한으로만 읽음. 관리자 권한 요청 없음 |
| 저장 | 추이·조회 기록은 화면 메모리에만 두고 저장·외부 전송·AI 전송을 하지 않음 |

확인 방법: 작업 관리자(성능 탭)와 가까운 시각에 같은 단위로 비교합니다. CPU는 200ms 짧은 표본이라 작업 관리자 값과 순간적으로 다를 수 있습니다. 값의 출처는 `student/extension.mjs` 의 `read()` → `api.get('/api/pc/status')` → `src/pc-status.mjs` 입니다.

## 3일차 · 연결 상태, 방화벽 설정, 이벤트를 읽기만 해서 보여 줍니다

- 「연결·방화벽·Windows 기록 (읽기만 함)」 칸에 네트워크 구성(인터페이스·IPv4 개수, 인터넷 접속이나 ZTNA 허용 결과가 아님), Windows 방화벽 세 프로필(Domain·Private·Public), 최근 24시간 System·Application 경고·오류 건수(최대 5,000건, **침해·공격 탐지 결과가 아님**)를 보여 줍니다.
- 방화벽·보안 설정은 읽기만 하고 바꾸지 않습니다. 권한 때문에 못 읽으면 「확인 불가 — 읽기 권한이 없습니다」와 「관리자 권한으로 바꾸지 마세요」 안내를 보여 줍니다.
- **SDP 서버** 줄은 PC 조회와 따로 표시합니다: 연결됨 / **SDP 미연결**(기본 실행) / 예제 자료 · SDP 실제 연결 아님 / 확인 불가(미연결로 단정하지 않음).
- 공격이나 침투를 흉내 내는 시험은 하지 않았습니다.

## 4일차 · 화면을 다듬고, 다시 조회와 오류 화면을 만듭니다

| 항목 | 내용 |
|---|---|
| 배치 | `student/appearance.json` 으로 앱 이름 「헤세드」, 카드 배치는 기본(`default`). 「학생 상태·알림 표시」 칸 맨 위에 내 PC 관제 → 기존 16단계 상태·알림 표시 순서. 처음에 학생 카드 먼저(`student-first`)로 했으나 제공 「AI 연결」 카드(계정 연결 시작·AI 연결 시작 버튼)가 도움정보 아래로 밀려 찾기 어려워서 기본 배치로 되돌림(2026-11-01) |
| 다시 조회 | 「다시 조회」 버튼. 누르면 버튼 글자가 「읽는 중…」, 카드 배지가 「읽는 중…」, 영역에 `aria-busy`. 읽는 동안 중복 요청을 막고, 자동 조회·자동 재시도는 없음 |
| 오류 화면 | 조회 실패 시 실패 코드와 「다음에 할 일」 3가지(앱 창 확인 → 다시 조회 직접 누르기 → 도움정보 확인)를 `role="alert"` 로 표시. 카드는 「이번 조회 확인 불가」로 바꾸고 이전 값을 현재 값처럼 남기지 않음 |
| 일부 실패 | 읽지 못한 항목만 이유와 다음 할 일로 따로 안내 |
| 키보드 | 버튼은 기본 button 요소. 읽는 동안에도 포커스가 버튼에 남음(`disabled` 대신 `aria-disabled`), 화면을 다시 그려도 포커스 유지 |
| 고친 파일 | `student/extension.mjs`, `student/appearance.json` 뿐. 제공 화면(`public/app.js`, `public/style.css`, `src/`)은 고치지 않음 |

### 2~4일차 검증 (클라우드 작업 사본, Playwright, 2026-11-01)

| 시험 | 결과 |
|---|---|
| 실제 조회(Linux) | CPU·메모리·디스크·네트워크 실측 4/6, 방화벽·Windows 기록은 「이 운영체제에서는 조회하지 않습니다」로 확인 불가, 일부 실패 안내 표시 |
| Windows 응답 흉내(CPU 95%, 메모리 90%, 디스크 5%, Public 꺼짐, 기록 권한 없음) | 주의 관찰 4건 + 확인 불가 1건, 직전 대비 +%p 표시 |
| 조회 실패(503) | 오류 안내와 다음 할 일 3가지, 카드 「이번 조회 확인 불가」, 이전 값 시각만 안내 |
| 오래된 값(5분 전) | 「오래됨 · 현재 값 아님」, 비교·추이·관찰 제외 |
| 키보드 | Tab 으로 버튼 포커스 → Enter 로 조회, 조회 뒤에도 포커스 유지 |
| 기존 13~22단계 학생 표시 | 모두 그대로 표시 |

※ 위 「Windows 응답 흉내」는 시험용 응답이며 실제 PC 값이 아닙니다. 사용자 PC(Windows)에서의 실제 화면 확인은 **미확인**입니다.

## 5일차 · 다른 사람이 내 안내만 보고 따라 실행하게 합니다

- 실행 안내 한 장: [QUICKSTART.md](QUICKSTART.md)
- 다른 사람의 첫 사용 관찰: **미실시** (가상 결과를 만들지 않음)
- 내가 직접 다시 실행: 클라우드에서 새 폴더에 앱 폴더만 복사해 `node src/server.mjs` 로 켜고 화면(200)·학생 모듈·PC 조회 응답을 확인(2026-11-01 13:55). Windows PowerShell 실행 도구로의 재실행은 **미확인**
- 보완한 것: Node 버전, `npm install` 불필요, 관리자 권한 불필요, 포트 사용 중·실행 정책·권한 없음일 때 할 일을 안내에 적음

## 6일차 · 포장은 건너뛰고, 제출할 커밋을 확인합니다

- 포장(`npm run package-app`)은 실행하지 않았고 새 포장 스크립트도 만들지 않았습니다.
- 마무리 자료 제출은 이미 승인된 상태이며, 총공세 결과는 새 커밋으로 GitHub에 올린 뒤 필요하면 메모리얼 파크 포트폴리오의 「내용 다듬기」에서 새 커밋 번호로 다시 올릴 수 있습니다.
- 커밋·push 와 40자리 커밋 번호 확인은 사용자 PC에서 합니다(아래 명령). push 가 거절되면 `--force` 를 쓰지 않고 원인부터 확인합니다.

```powershell
cd E:\chesed
git status
git add on-client/student/extension.mjs on-client/student/appearance.json on-client/docs/FINAL_ASSAULT.md on-client/docs/QUICKSTART.md on-client/docs/COMPLETION_RECORD.md
git add -u on-client
git add on-client/docs/PACKAGE_APP.md on-client/docs/PC_SAAS_REFERENCE.md on-client/docs/PC_SAAS_SOURCES.md on-client/examples on-client/public/pc-status-view.mjs on-client/public/student-appearance.mjs on-client/src/engine/student-engine-ipc.mjs on-client/src/engine/student-engine-worker.mjs on-client/src/engine/trusted-app-assembly.mjs on-client/src/pc-status.mjs on-client/src/student-appearance-files.mjs on-client/src/student-appearance.mjs on-client/tools/export-student-package.mjs on-client/tools/install-packaged-app.ps1 on-client/tools/package-app-support.mjs on-client/tools/package-app.mjs on-client/tools/package-finish-materials.mjs on-client/tools/provided-runtime.mjs
git commit -m "보안 Agent 총공세: 0.2.21 업데이트, 내 PC 관제 대시보드"
git push
git rev-parse HEAD
```

## 7일차 · 완성본을 시연하고, 한계와 근거를 정리합니다

### 제공 기능과 내가 만든 기능

| 구분 | 내용 |
|---|---|
| 제공 | 화면 틀·메뉴·앱 서버, 내 PC 값 조회(`/api/pc/status`)와 「내 PC 상태」 카드, AI 연결 절차, 패키지 조회 서버, 꾸밈 검증기 |
| 내가 만든 것(13~22단계) | `student/extension.mjs` 의 사용자·기기·세션, 접근 판정, 기록 목록·걸러 보기·상세, 오류·빈 화면·도움정보, AI 연결 상태, AI 사건 설명, 조치 상태, 취약점 조회 표시, 학생 문서(STUDENT_RUNBOOK, STUDENT_RELEASE_RECORD) |
| 내가 만든 것(총공세) | 내 PC 관제 대시보드(상태 카드 4개·직전 대비·추이·연결/방화벽/기록 읽기·SDP 분리·주의 관찰·조회 기록·다시 조회·오류 화면), `student/appearance.json`, QUICKSTART, 이 기록 |

### 시연 순서 (약 3분)

1. `tools\start-alekov.ps1` 로 켜고 `http://127.0.0.1:5189` 를 엽니다. 위쪽 「연결 없음」 표시를 보여 줍니다.
2. **내 PC 상태**: 「다시 조회」 → 상태 카드 4개의 값·단위·잰 시각 → 한 번 더 눌러 직전 대비와 추이 그래프가 쌓이는 것을 보여 줍니다.
3. **연결·방화벽·Windows 기록**: 읽기만 한다는 안내, 경고·오류 건수가 침해 판정이 아니라는 문구, SDP 서버 「SDP 미연결」이 PC 조회와 따로 적힌 것을 보여 줍니다.
4. **주의 알림**: 주의 관찰 목록(없으면 「안전 판정이 아님」 문구)과 조회 기록을 보여 줍니다.
5. 실패 화면: 앱 창에서 `Ctrl+C` 로 서버를 끈 뒤 「다시 조회」 → 오류 안내와 「이번 조회 확인 불가」를 보여 주고, 다시 켭니다.

### 한계 (확인 불가·미구현으로 남은 것)

- 실제 SDP(접근 제어)·XDR 서버 연결 없음: 기본 실행은 「SDP 미연결」, 사용자·기기·세션·기록·판정은 실제 값이 아님
- 실제 조치 집행 연결 없음(지원 조치 없음 표시가 정상)
- 앱 안 AI 설명은 학원 계정 승인이 필요하며 수료 뒤에는 쓸 수 없다고 봄
- CPU는 200ms 짧은 표본, 디스크는 앱이 있는 드라이브 하나, Windows 기록은 최근 24시간 최대 5,000건 일부 집계
- 추이·조회 기록은 저장하지 않음(새로 고치면 초기화)
- 사용자 PC(Windows)에서 방화벽·Windows 기록 실제 조회 화면, 다른 사람의 첫 사용 관찰은 **미확인/미실시**

### 근거

| 근거 | 위치 |
|---|---|
| 13~22단계 공식 판정 | ALEPH 방어전 상황실 판정 기록(코드 원문 검토 통과, 실행 검증 아님) |
| 총공세 화면 시험 결과 | 이 문서 「2~4일차 검증」 |
| 실행 안내 | [QUICKSTART.md](QUICKSTART.md), [STUDENT_RUNBOOK.md](STUDENT_RUNBOOK.md) |
| 최종 커밋 | 6일차 명령의 `git rev-parse HEAD` 결과 — 미확인(사용자 PC에서 push 뒤 기록) |

## 완성 기록

공식 「완성 기록틀」 원문에 확인한 값만 채운 파일: [COMPLETION_RECORD.md](COMPLETION_RECORD.md)

## 수료 전에 꼭 읽어 주세요 — 처리 기록 (2026-11-01)

| 항목 | 처리 |
|---|---|
| 1. 확인받은 기능 | 13~22단계는 코드 원문 검토로 통과(실행·실제 서버 연결 검증 아님). 「서버 연결 안 함」은 기본 실행의 정상 표시 |
| 2. 포트폴리오 | 사용자가 나중에 직접 진행 |
| 3. 내 PC에서 계속 쓰기 | 수료용 도구 0.1.1(SHA-256 `9fef0746…5834274` 일치)을 on-client에 설치(추가 17개, 동일 1개 건너뜀, 기존 파일 덮어쓰기 없음). `tools\start-standalone.ps1` 로 워크벤치·학원 계정 없이 실행. 내보내기 `tools/export-student-package.mjs` 로 `E:\hesed-package` 에 따로 보관(비밀 설정·키 파일 자동 제외). 수료용 도구 파일은 총공세 커밋에 섞지 않음 |
| 4. AI 보안 도우미 | 키트 1.0(SHA-256 `5154fb5a…3e28f`)을 프로젝트 밖 `E:\AI보안도우미` 에 풂. 점검 자료 수집·AI 대화는 사용자 PC에서 직접 실행 |

## 수업용 AI 검토 (방어전 상황실 「제출 전에 수업용 AI에게 검토를 받아 보세요」, 2026-11-01 14:40)

올린 자료: 대시보드 코드 발췌, FINAL_ASSAULT.md, COMPLETION_RECORD.md, QUICKSTART.md, appearance.json (5개 묶음으로 나뉘어 검토, AI 연결은 검토에서 제외 요청)

| 지적 | 처리 |
|---|---|
| 조회 뒤 화면 갱신 중 예외가 나면 대기 표시(`aria-busy`)·버튼이 복구되지 않을 수 있음 | 반영 — `read()` 의 갱신 부분을 try/catch/finally 로 감싸 오류 안내(`STUDENT_RENDER_FAILED`)와 버튼 복구 |
| CPU 표본 시간이 응답에 없으면 200ms 로 단정해 표시 | 반영 — 값이 없으면 「표본 시간 확인 불가」 |
| 네트워크는 인터페이스·IPv4 개수일 뿐 현재 연결 상태가 아님 | 유지 — 제공 조회가 연결 여부를 주지 않으므로 화면에 「인터넷 접속이나 ZTNA 허용을 확인한 결과가 아님」으로 표시, 연결됨으로 추정하지 않음 |
| Windows PC 실측·다른 사람 사용 관찰·push·40자리 커밋이 미확인 | 사실 — 이 문서와 완성 기록에 미확인/미실시로 남김 |
| `git add -u` 가 넓게 스테이징할 수 있음 | 커밋 전에 `git status` 로 목록 확인(제공 파일 변경은 0.2.21 업데이트분만) |
| QUICKSTART(`start-alekov.ps1`)와 완성 기록(`start-standalone.ps1`)의 명령이 다름 | 의도 — 과정용 실행은 `start-alekov.ps1`, 수료 뒤 독립 실행은 `start-standalone.ps1` |
