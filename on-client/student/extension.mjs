// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView({ api } = {}) {
  const view = {
    renderIdentity({ me, devices, sessions }) {
      const root = document.createElement('section');
      const deviceStatuses = {
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족',
        unknown: '확인 불가',
      };
      const sessionStatuses = {
        active: '활성',
        expired: '만료',
        revoked: '철회됨',
        unknown: '확인 불가',
      };
      const modes = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      const appendText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const showDevice = (parent, device) => {
        appendText(parent, 'p', `기기: ${device.label} · ID: ${device.id}`);
        appendText(parent, 'p', `기기 상태: ${deviceStatuses[device.status] ?? '확인 불가'} (${device.status})`);
      };
      const showSession = (parent, session) => {
        appendText(parent, 'p', `세션 ID: ${session.id}`);
        appendText(parent, 'p', `세션 상태: ${sessionStatuses[session.status] ?? '확인 불가'} (${session.status})`);
      };

      appendText(root, 'h2', '로그인 사용자·기기·세션');
      for (const [kind, title, result] of [
        ['me', '현재 사용자·기기·세션', me],
        ['devices', '기기 목록', devices],
        ['sessions', '세션 목록', sessions],
      ]) {
        const section = document.createElement('section');
        root.appendChild(section);
        appendText(section, 'h3', title);
        if (modes[result.mode]) appendText(section, 'p', modes[result.mode]);

        if (result.status === 'loading') {
          appendText(section, 'p', '불러오는 중');
        } else if (result.status === 'error') {
          appendText(section, 'p', `연결 실패 또는 확인 불가: ${result.error?.message ?? '오류 내용을 확인할 수 없습니다.'}`);
        } else if (result.status === 'ok') {
          if (kind === 'me') {
            appendText(section, 'p', `사용자: ${result.data.user.label} · ID: ${result.data.user.id}`);
            showDevice(section, result.data.device);
            showSession(section, result.data.session);
          } else {
            if (result.data.length === 0) {
              appendText(section, 'p', kind === 'devices' ? '기기 목록이 비어 있습니다.' : '세션 목록이 비어 있습니다.');
            }
            for (const item of result.data) {
              const entry = document.createElement('section');
              section.appendChild(entry);
              if (kind === 'devices') showDevice(entry, item);
              else showSession(entry, item);
            }
          }
        } else {
          appendText(section, 'p', '확인 불가: 불러오기 상태를 확인할 수 없습니다.');
        }
      }
      // 호출마다 새 요소를 반환하고, 제공 화면이 이전 요소를 교체합니다.
      return root;
    },
    renderDecision({ status, mode, data, error, appId }) {
      const root = document.createElement('section');
      const appendText = (tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        root.appendChild(element);
      };
      const modes = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      appendText('h2', '업무 앱 접근 요청 결과');
      if (Object.hasOwn(modes, mode)) appendText('p', modes[mode]);
      if (appId != null) appendText('p', `요청한 업무 앱 ID: ${appId}`);

      if (status === 'idle') {
        appendText('p', '업무 앱을 골라 접속을 요청하세요.');
      } else if (status === 'loading') {
        appendText('p', '판정 확인 중');
      } else if (status === 'error') {
        appendText('p', `요청 실패: ${error?.message ?? '오류 내용을 확인할 수 없습니다.'}`);
        appendText('p', '요청 실패는 접근 허용 또는 접근 거부 판정이 아닙니다.');
      } else if (status === 'ok') {
        const decisions = {
          allow: '접근 허용',
          deny: '접근 거부',
          challenge: '추가 인증 또는 확인 필요',
          unknown: '판정 확인 불가',
        };
        const decision = Object.hasOwn(decisions, data?.decision) ? data.decision : 'unknown';
        appendText('p', `업무 앱 ID: ${data?.appId ?? appId ?? '확인 불가'}`);
        appendText('p', `${decisions[decision]} (${decision})`);
        appendText('p', `판정 이유: ${data?.reason ?? '판정 이유를 확인할 수 없습니다.'}`);
        appendText('p', `판정 시각: ${data?.checkedAt ?? '판정 시각을 확인할 수 없습니다.'}`);
        if (decision === 'allow') {
          appendText('p', '정책상 접근 허용이며, 실제 업무 앱 접속 성공을 보장하지 않습니다.');
        } else if (decision === 'challenge') {
          appendText('p', '이 앱은 추가 인증 또는 확인 절차를 대신 수행하지 않습니다.');
        } else if (decision === 'unknown') {
          appendText('p', '접근 판정을 확인할 수 없습니다. 접근 허용으로 처리하지 않습니다.');
        }
      } else {
        appendText('p', '확인 불가: 요청 상태를 확인할 수 없습니다.');
      }
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const unavailable = (message) => {
        addText(root, 'p', `기록 확인 불가${message ? `: ${message}` : ''}`);
        return root;
      };
      if (status === 'CONTRACT_MISMATCH' || status === 'ENGINE_RESULT_UNVERIFIED'
          || error?.code === 'CONTRACT_MISMATCH' || error?.code === 'ENGINE_RESULT_UNVERIFIED') {
        return unavailable(error?.message);
      }
      if (status === 'loading') {
        addText(root, 'p', '기록을 불러오는 중입니다');
        return root;
      }
      if (status === 'error') {
        addText(root, 'p', `기록을 불러오지 못했습니다: ${error?.message ?? '오류 내용을 확인할 수 없습니다'}`);
        return root;
      }
      if (status !== 'ok') return unavailable('조회 상태를 확인할 수 없습니다');

      const isTextItem = (item) => item && typeof item.id === 'string' && typeof item.text === 'string';
      const isEvent = (event) => event && typeof event.id === 'string'
        && typeof event.kind === 'string' && typeof event.at === 'string'
        && Number.isFinite(Date.parse(event.at)) && typeof event.summary === 'string'
        && (event.appId == null || typeof event.appId === 'string')
        && Array.isArray(event.evidence) && event.evidence.every(isTextItem)
        && Array.isArray(event.rules) && event.rules.every(isTextItem)
        && event.state && ['access', 'session', 'device'].every((key) => typeof event.state[key] === 'string');
      if (!Array.isArray(data) || !data.every(isEvent)) {
        return unavailable('받은 기록의 형식이 올바르지 않습니다');
      }

      // 배열만 복사하고, 기록과 그 안의 근거·규칙·상태는 읽기만 합니다.
      const events = [...data].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      const kindText = (kind) => ({ access: '접속 기록', xdr: 'XDR 경보' }[kind] ?? kind);
      const stateLabels = {
        access: { allowed: '허용됨', denied: '거부됨', unknown: '확인 불가' },
        session: { active: '활성', expired: '만료', revoked: '회수됨', unknown: '확인 불가' },
        device: { compliant: '기준 충족', noncompliant: '기준 미충족', unknown: '확인 불가' },
      };
      const stateText = (key, value) => `${stateLabels[key][value] ?? '확인 불가'}(${value})`;
      const appText = (event) => event.appId || '앱 확인 불가';
      const filters = document.createElement('div');
      root.appendChild(filters);
      const makeFilter = (name, values, describe) => {
        const label = document.createElement('label');
        addText(label, 'span', name);
        const select = document.createElement('select');
        select.setAttribute('aria-label', name);
        const addOption = (value, text) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = text;
          select.appendChild(option);
        };
        addOption('all', '전체');
        [...new Set(values)].forEach((value) => addOption(value, describe(value)));
        select.value = 'all';
        label.appendChild(select);
        filters.appendChild(label);
        return select;
      };
      const kindFilter = makeFilter('기록 종류', events.map((event) => event.kind), kindText);
      // 앱이 없는 기록은 전체에서 표시하며, 존재하지 않는 앱 필터값은 만들지 않습니다.
      const appFilter = makeFilter('업무 앱', events.map((event) => event.appId).filter((value) => value != null && value !== ''), (value) => value);
      const accessFilter = makeFilter('접속 상태', events.map((event) => event.state.access), (value) => stateText('access', value));
      const count = addText(root, 'p', '');
      const list = document.createElement('div');
      const detail = document.createElement('div');
      root.appendChild(list);
      root.appendChild(detail);

      const showDetail = (event) => {
        detail.replaceChildren();
        const panel = document.createElement('section');
        panel.setAttribute('data-student-event-detail', event.id);
        addText(panel, 'h3', `${event.id} 상세`);
        addText(panel, 'p', `사건 ID: ${event.id}`);
        addText(panel, 'p', `업무 앱: ${appText(event)}`);
        const showItems = (title, items) => {
          addText(panel, 'h4', title);
          if (items.length === 0) addText(panel, 'p', `${title} 없음`);
          items.forEach((item) => addText(panel, 'p', `${item.id}: ${item.text}`));
        };
        showItems('근거', event.evidence);
        showItems('규칙', event.rules);
        addText(panel, 'h4', '상태');
        addText(panel, 'p', `접속 상태 (access): ${stateText('access', event.state.access)}`);
        addText(panel, 'p', `세션 상태 (session): ${stateText('session', event.state.session)}`);
        addText(panel, 'p', `기기 상태 (device): ${stateText('device', event.state.device)}`);
        const unsupportedActions = Array.isArray(event.supportedActions)
          ? event.supportedActions.filter((action) => typeof action === 'string') : [];
        if (unsupportedActions.length > 0) {
          unsupportedActions.forEach((action) => {
            const button = addText(panel, 'button', `${action} 미지원`);
            button.type = 'button';
            button.disabled = true;
          });
          addText(panel, 'p', '조치 실행 연결은 준비 중입니다. 아직 지원하지 않는 조치입니다.');
        }
        detail.appendChild(panel);
      };
      const renderList = () => {
        list.replaceChildren();
        detail.replaceChildren();
        const visible = events.filter((event) =>
          (kindFilter.value === 'all' || event.kind === kindFilter.value)
          && (appFilter.value === 'all' || event.appId === appFilter.value)
          && (accessFilter.value === 'all' || event.state.access === accessFilter.value));
        count.textContent = `표시 기록: ${visible.length}건`;
        if (visible.length === 0) addText(list, 'p', '표시할 기록이 없습니다');
        visible.forEach((event) => {
          const row = document.createElement('article');
          row.setAttribute('data-student-event-id', event.id);
          addText(row, 'p', `사건 ID: ${event.id}`);
          addText(row, 'p', `시각: ${event.at}`);
          addText(row, 'p', `종류: ${kindText(event.kind)} (${event.kind})`);
          addText(row, 'p', `업무 앱: ${appText(event)}`);
          addText(row, 'p', `요약: ${event.summary}`);
          const button = addText(row, 'button', `${event.id} 상세`);
          button.type = 'button';
          button.addEventListener('click', () => showDetail(event));
          list.appendChild(row);
        });
      };
      [kindFilter, appFilter, accessFilter].forEach((select) => select.addEventListener('change', renderList));
      renderList();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const text = (value, fallback = '확인 불가') => typeof value === 'string' ? value : fallback;
      const modes = {
        connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가',
      };
      const deviceStatuses = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const sessionStatuses = { active: '활성', expired: '만료', revoked: '회수됨', unknown: '확인 불가' };
      const retry = (parent) => addText(parent, 'p', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.');
      const failure = (parent, title, result) => {
        const code = text(result?.error?.code, '');
        const mismatch = result?.status === 'CONTRACT_MISMATCH' || code === 'CONTRACT_MISMATCH';
        const timeout = /TIMEOUT|TIMED_OUT/i.test(code);
        addText(parent, 'p', `${title} ${mismatch ? '확인 불가 (CONTRACT_MISMATCH)' : '불러오기 실패'}${timeout ? ' · 시간 초과' : ''}: ${text(result?.error?.message, '오류 내용을 확인할 수 없습니다.')}`);
        retry(parent);
      };
      addText(root, 'h2', '기기·세션·알림·도움정보');
      if (Object.hasOwn(modes, mode)) addText(root, 'p', modes[mode]);

      for (const [title, result, kind] of [
        ['기기', devices, 'devices'], ['세션', sessions, 'sessions'],
      ]) {
        const section = document.createElement('section');
        root.appendChild(section);
        addText(section, 'h3', title);
        if (kind === 'sessions') addText(section, 'p', '세션 조회 범위는 현재 검증된 연결 한 개입니다. 과거 세션 전체 목록이 아닙니다.');
        if (result?.status === 'error' || result?.status === 'CONTRACT_MISMATCH'
            || result?.error?.code === 'CONTRACT_MISMATCH') {
          failure(section, title, result);
        } else if (result?.status === 'loading') {
          addText(section, 'p', `${title} 정보를 불러오는 중입니다.`);
        } else if (result?.status === 'ok') {
          const fields = kind === 'devices' ? ['label', 'status'] : ['id', 'status'];
          if (!Array.isArray(result.data) || !result.data.every((item) =>
            item && fields.every((key) => typeof item[key] === 'string'))) {
            failure(section, title, { status: 'CONTRACT_MISMATCH', error: { message: '받은 목록의 형식이 올바르지 않습니다.' } });
          } else if (result.data.length === 0) {
            addText(section, 'p', kind === 'devices' ? '등록된 기기가 없습니다.' : '현재 연결이 없습니다.');
          } else {
            result.data.forEach((item) => {
              const labels = kind === 'devices' ? deviceStatuses : sessionStatuses;
              const statusLabel = Object.hasOwn(labels, item.status) ? labels[item.status] : '확인 불가';
              addText(section, 'p', kind === 'devices'
                ? `기기: ${item.label} · 상태: ${statusLabel} (${item.status})`
                : `세션 ID: ${item.id} · 상태: ${statusLabel} (${item.status})`);
            });
          }
        } else {
          addText(section, 'p', `${title} 조회 상태를 확인할 수 없습니다.`);
        }
      }

      const alerts = document.createElement('section');
      root.appendChild(alerts);
      addText(alerts, 'h3', '알림');
      if (!Array.isArray(notifications)) {
        addText(alerts, 'p', '알림 정보를 확인할 수 없습니다.');
      } else if (notifications.length === 0) {
        addText(alerts, 'p', '주의할 알림이 없습니다.');
      } else {
        notifications.forEach((notification) => {
          const item = document.createElement('article');
          alerts.appendChild(item);
          addText(item, 'p', `자료 (resource): ${text(notification?.resource)}`);
          addText(item, 'p', `코드 (code): ${text(notification?.code)}`);
          addText(item, 'p', `내용 (message): ${text(notification?.message)}`);
        });
      }

      const help = document.createElement('section');
      root.appendChild(help);
      addText(help, 'h3', '도움정보');
      addText(help, 'p', '제공된 진단 정보의 안전한 항목만 도움 요청에 사용할 수 있도록 복사합니다.');
      const copy = addText(help, 'button', '도움정보 복사');
      copy.type = 'button';
      copy.disabled = true;
      const copyStatus = addText(help, 'p', '');
      copyStatus.setAttribute('role', 'status');

      if (diagnostics?.status === 'error' || diagnostics?.status === 'CONTRACT_MISMATCH'
          || diagnostics?.error?.code === 'CONTRACT_MISMATCH') {
        failure(help, '도움정보', diagnostics);
      } else if (diagnostics?.status === 'loading') {
        addText(help, 'p', '도움정보를 불러오는 중입니다.');
      } else if (diagnostics?.status === 'idle') {
        addText(help, 'p', '아직 도움정보를 조회하지 않았습니다. 아래쪽 도움정보 불러오기 버튼을 직접 누르세요.');
      } else if (diagnostics?.status === 'ok') {
        const data = diagnostics.data;
        if (data == null || (Array.isArray(data) && data.length === 0)) {
          addText(help, 'p', '제공된 도움정보가 없습니다.');
        } else {
          // 추가 객체나 설정을 직렬화하지 않고 여섯 항목만 별도로 읽습니다.
          const fields = [
            ['requestId', data.requestId], ['component', data.component],
            ['version', data.version], ['checkedAt', data.checkedAt],
            ['engine.mode', data.engine?.mode], ['engine.code', data.engine?.code],
          ];
          const secret = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
          const valid = fields.every(([, value]) => typeof value === 'string' && value.trim().length > 0
            && value.length <= 2000 && !secret.test(value) && !/[\u0000-\u001f\u007f]/.test(value));
          if (!valid) {
            failure(help, '도움정보', { status: 'CONTRACT_MISMATCH', error: { message: '안전한 도움정보의 형식을 확인할 수 없습니다.' } });
          } else {
            const safeText = fields.map(([name, value]) => `${name}: ${value}`).join('\n');
            fields.forEach(([name, value]) => addText(help, 'p', `${name}: ${value}`));
            copy.disabled = false;
            copy.addEventListener('click', async () => {
              copyStatus.textContent = '';
              if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') {
                copyStatus.textContent = '클립보드 복사를 사용할 수 없습니다. 표시된 도움정보를 직접 복사하세요.';
                return;
              }
              try {
                await navigator.clipboard.writeText(safeText);
                copyStatus.textContent = '도움정보를 클립보드에 복사했습니다.';
              } catch {
                copyStatus.textContent = '도움정보 복사에 실패했습니다. 표시된 도움정보를 직접 복사하세요.';
              }
            });
          }
        }
      } else {
        addText(help, 'p', '도움정보 조회 상태를 확인할 수 없습니다.');
      }
      return root;
    },
    renderVulnerabilities({ status, mode, data, error } = {}) {
      // 호출마다 새 요소를 만들므로 조회 중·오류·취소·다시 조회 때 이전 표가 현재 결과처럼 남지 않습니다.
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const secret = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
      const safeText = (value, max = 500) => typeof value === 'string' && value.trim().length > 0 && value.length <= max
        && !secret.test(value) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
      const safeCode = (value) => typeof value === 'string' && /^[A-Z0-9_]{1,64}$/.test(value) ? value : null;
      // ^1.2.0·~1.2.0·latest 같은 범위·태그가 아닌 정확한 semver 만 설치 버전으로 인정합니다.
      const exactVersion = (value) => typeof value === 'string' && value.length <= 100
        && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
      const modes = { connected: '연결됨(connected)', demo: '예제 자료(demo)', disconnected: '연결 없음(disconnected)', unknown: '확인 불가(unknown)' };
      const notClean = '조회하지 못했거나 조회하지 않은 상태는 「취약점 없음」이 아닙니다.';
      const osvNotice = 'OSV는 알려진 취약점 데이터베이스입니다. 조회 결과가 없다는 사실만으로 해당 패키지나 앱 전체가 안전하다고 보장할 수 없습니다.';

      addText(root, 'h2', '설치 패키지와 알려진 취약점 조회 결과');
      if (Object.hasOwn(modes, mode)) addText(root, 'p', `응답 모드: ${modes[mode]}`);

      // 1) 요청 상태: idle / loading / error / ok 를 구분합니다. 진행 중·오류 때는 표를 그리지 않습니다.
      if (status === 'idle') {
        addText(root, 'p', '조회 전(idle)').setAttribute('role', 'status');
        addText(root, 'p', '아직 설치 패키지를 조회하지 않았습니다. 위쪽 「설치 패키지 조회」 버튼을 직접 누르세요.');
        return root;
      }
      if (status === 'loading') {
        addText(root, 'p', '조회 중(loading)').setAttribute('role', 'status');
        addText(root, 'p', '이전 조회 결과는 현재 결과가 아니므로 표시하지 않습니다. 멈추려면 「패키지 조회 취소」를 누르세요.');
        return root;
      }
      if (status === 'error') {
        const code = safeCode(error?.code) ?? 'UNKNOWN_ERROR';
        const message = safeText(error?.message) ? error.message : '오류 내용을 안전하게 표시할 수 없습니다.';
        const cancelled = ['CANCELLED', 'REQUEST_CANCELLED'].includes(code);
        addText(root, 'p', `조회 실패: ${message}`).setAttribute('role', 'status');
        addText(root, 'p', `오류 코드: ${code}${cancelled ? ' (조회 취소)' : ''}`);
        addText(root, 'p', `${notClean} 이전 조회 결과도 현재 결과로 보지 않습니다.`);
        addText(root, 'p', '자동으로 다시 조회하지 않습니다. 필요하면 「설치 패키지 조회」를 직접 다시 누르세요.');
        return root;
      }
      if (status !== 'ok' || !data || typeof data !== 'object') {
        addText(root, 'p', '확인 불가: 조회 상태를 확인할 수 없습니다.').setAttribute('role', 'status');
        addText(root, 'p', notClean);
        return root;
      }

      // 2) 전체 조회 상태 data.status 를 원래 값과 한국어 설명으로 표시합니다.
      const scanText = {
        complete: ['모두 조회(complete)', '조회 대상 공개 패키지를 OSV에서 끝까지 조회했습니다.'],
        partial: ['일부 조회 실패(partial)', '일부 패키지는 조회를 끝까지 확인하지 못했습니다. 이미 받은 취약점 ID는 지우지 않고 표시합니다.'],
        not_checked: ['아직 조회 안 함(not_checked)', `승인된 공개 조회 대상 패키지가 없어 OSV를 조회하지 않았습니다. ${notClean}`],
        not_configured: ['조회 준비 미완료(not_configured)', `조회 대상 프로젝트 설정이 필요합니다. 대상 경로와 허용 패키지는 운영자가 준비하며 학생이 임의로 바꾸지 않습니다. ${notClean}`],
        unverifiable: ['lock 파일 확인 불가(unverifiable)', `package-lock.json과 설치 목록을 확인할 수 없어 조회하지 못했습니다. ${notClean}`],
      };
      if (!Object.hasOwn(scanText, data.status)) {
        addText(root, 'p', '확인 불가: 전체 조회 상태를 확인할 수 없습니다.').setAttribute('role', 'status');
        addText(root, 'p', notClean);
        return root;
      }
      const [scanLabel, scanGuide] = scanText[data.status];
      addText(root, 'p', `전체 조회 상태: ${scanLabel}`).setAttribute('role', 'status');
      addText(root, 'p', scanGuide);
      if (safeCode(data.code)) addText(root, 'p', `상태 코드: ${data.code}`);

      // 3) 전달된 경우에만 lock 파일 정보와 조회 시각을 표시합니다.
      const summary = [];
      if (data.lockfileVersion != null) summary.push(`lockfileVersion: ${data.lockfileVersion}`);
      if (safeText(data.lockfileHash, 128)) summary.push(`lockfileHash: ${data.lockfileHash}`);
      if (safeText(data.checkedAt, 64)) summary.push(`checkedAt(전체 조회 시각): ${data.checkedAt}`);
      if (Number.isSafeInteger(data.excluded?.count)) summary.push(`조회 제외: ${data.excluded.count}건 (승인되지 않았거나 공개 조회 대상이 아닌 패키지)`);
      if (summary.length > 0) {
        if (data.lockfileVersion != null) {
          addText(root, 'p', '전체 결과는 package-lock.json과 설치된 node_modules의 메타데이터를 대조해 얻은 정확한 설치 버전 기준입니다.');
        }
        const list = document.createElement('ul');
        summary.forEach((line) => addText(list, 'li', line));
        root.appendChild(list);
      }

      const packages = Array.isArray(data.packages) ? data.packages : [];
      if (packages.length > 0) {
        const pkgText = (pkg, findings) => {
          if (pkg.status === 'known_vulnerabilities') return '알려진 항목 있음(known_vulnerabilities)';
          if (pkg.status === 'none_found') return '알려진 항목 없음(none_found) · 이 조회 범위(OSV)에서 알려진 항목이 없다는 뜻이며 안전 보장이 아님';
          if (pkg.status === 'unverifiable' && findings.length > 0) return '일부 확인·전체 조회 확인 불가(unverifiable) · 받은 ID는 유지';
          if (pkg.status === 'unverifiable') return '조회 확인 불가(unverifiable) · 취약점 없음이 아님';
          return '조회 상태 확인 불가';
        };
        const counts = { known_vulnerabilities: 0, none_found: 0, unverifiable: 0 };
        packages.forEach((pkg) => { if (Object.hasOwn(counts, pkg?.status)) counts[pkg.status] += 1; });
        addText(root, 'p', `패키지 ${packages.length}개: 알려진 항목 있음 ${counts.known_vulnerabilities}개 · 알려진 항목 없음 ${counts.none_found}개 · 조회 확인 불가 ${counts.unverifiable}개`);

        const table = document.createElement('table');
        const head = document.createElement('tr');
        ['패키지(name)', '설치 버전(version)', '조회 상태(status)', '취약점 ID · 수정 시각(modified)', '출처(source)', '패키지 조회 시각(checkedAt)']
          .forEach((label) => addText(head, 'th', label));
        const thead = document.createElement('thead');
        thead.appendChild(head);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        packages.forEach((pkg) => {
          const name = safeText(pkg?.name, 214) ? pkg.name : null;
          const version = exactVersion(pkg?.version) ? pkg.version : null;
          // 4) 이미 받은 취약점 ID는 상태와 관계없이 모두 표시합니다(부분 실패 포함).
          const findings = Array.isArray(pkg?.vulnerabilities)
            ? pkg.vulnerabilities.filter((item) => safeText(item?.id, 160)) : [];
          const row = document.createElement('tr');
          if (name) row.setAttribute('data-student-package-name', name);
          if (version) row.setAttribute('data-student-package-version', version);
          addText(row, 'td', name ?? '패키지 이름 확인 불가');
          addText(row, 'td', version ?? '정확한 설치 버전 확인 불가');
          addText(row, 'td', version ? pkgText(pkg, findings) : '조회 상태 확인 불가 · 정확한 설치 버전이 아님');
          const cell = document.createElement('td');
          if (findings.length === 0) {
            addText(cell, 'span', pkg?.status === 'none_found' ? '없음(조회 범위 기준)' : '받은 ID 없음');
          } else {
            const list = document.createElement('ul');
            findings.forEach((item) => addText(list, 'li',
              `${item.id} · 수정 시각 ${safeText(item.modified, 64) ? item.modified : '확인 불가'}`));
            cell.appendChild(list);
          }
          row.appendChild(cell);
          addText(row, 'td', safeText(pkg?.source, 200) ? pkg.source : '출처 확인 불가');
          addText(row, 'td', safeText(pkg?.checkedAt, 64) ? pkg.checkedAt : '확인 불가');
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        root.appendChild(table);
      } else if (data.status === 'complete' || data.status === 'partial') {
        addText(root, 'p', '표시할 패키지 조회 결과가 없습니다.');
      }
      addText(root, 'p', osvNotice);
      return root;
    },
    renderAiConnection({ status, mode, data, error, checkedAt } = {}) {
      // 호출마다 새 요소를 만들므로 이전 점검 결과·오류 안내가 남지 않습니다.
      const root = document.createElement('section');
      const addText = (tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        root.appendChild(element);
        return element;
      };
      const modes = {
        connected: '연결됨(connected)',
        demo: '예제 응답(demo) · 실제 게이트 수용 아님',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      const manualRetry = '자동으로 다시 점검하지 않습니다. 다시 점검하려면 「현재 API 연결 점검」 또는 「AI 연결 점검」 버튼을 직접 누르세요.';
      addText('h2', 'AI 연결 점검 결과');
      if (Object.hasOwn(modes, mode)) addText('p', `응답 모드: ${modes[mode]}`);

      if (status === 'idle') {
        addText('p', 'AI 연결 점검 전').setAttribute('role', 'status');
        addText('p', '아직 이번 연결로 점검하지 않았습니다. 점검은 버튼을 직접 누를 때만 실행합니다.');
      } else if (status === 'loading') {
        addText('p', 'AI 연결 점검 중').setAttribute('role', 'status');
        addText('p', '점검을 멈추려면 「AI 연결 점검 취소」 버튼을 누르세요. 취소 뒤 늦게 도착한 응답은 표시하지 않습니다.');
      } else if (status === 'ok') {
        const audiences = {
          test: '시험 연결 점검(test)',
          verified: '앱 권한 확인 후 점검(verified)',
        };
        const valid = data && data.transportChecked === true && Object.hasOwn(audiences, data.audienceAuthorization)
          && Number.isInteger(data.modelCount) && data.modelCount >= 0;
        if (!valid) {
          addText('p', '점검 결과 확인 불가').setAttribute('role', 'status');
          addText('p', '받은 점검 결과의 형식이 올바르지 않아 연결 성공으로 표시하지 않습니다.');
          addText('p', manualRetry);
          return root;
        }
        addText('p', `점검 결과: ${audiences[data.audienceAuthorization]}`).setAttribute('role', 'status');
        if (data.audienceAuthorization === 'test') {
          addText('p', '시험 연결의 모델 응답만 확인했습니다. 실제 앱 권한 확인이나 게이트 수용이 아닙니다.');
        } else {
          addText('p', '점검 시각 기준으로 앱 권한과 모델 응답을 확인했습니다.');
        }
        addText('p', `응답 모델 수: ${data.modelCount}개`);
        addText('p', `점검 시각: ${typeof checkedAt === 'string' && checkedAt ? checkedAt : '확인 불가'}`);
        addText('p', '연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다.');
        addText('p', '모델 목록 응답만으로는 사건 설명이 이루어지지 않습니다. 사건 설명은 보안 기록에서 사건을 골라 따로 요청하고 결과를 확인하세요.');
      } else if (status === 'error') {
        const groups = [
          [['ON_AI_PROVISIONING_PENDING', 'ON_AI_AUTHORIZATION_CHANGED', 'SUBJECT_SCOPE_UNVERIFIED', 'AI_REQUEST_UNVERIFIED'],
            '권한 준비 중·확인 불가', '학생 잘못으로 판단하지 마세요. 담당자에게 계정 연결과 앱 권한 확인을 요청하세요.'],
          [['WB_CLCO_AUTH_REQUIRED'], '인증 실패', '계정 연결을 다시 확인하고, 계속 실패하면 담당자에게 확인하세요.'],
          [['WB_CLCO_ACCESS_BLOCKED'], '접근 제한', '계정 연결을 다시 확인하고, 계속 실패하면 담당자에게 확인하세요.'],
          [['WB_CLCO_COHORT_BUDGET_EXHAUSTED', 'WB_CLCO_LIMIT_REACHED'], '반 사용량·이용 한도 초과', '담당자에게 확인하세요.'],
          [['WB_CLCO_SESSION_CLOSED'], '이용 시간 아님', 'AI 이용 시간을 확인하세요.'],
          [['WB_CLCO_RATE_LIMITED'], '요청 제한', '잠시 뒤 직접 다시 점검하세요.'],
          [['WB_CLCO_TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT', 'TIMEOUT'], '시간 초과', '잠시 뒤 직접 다시 점검하세요.'],
          [['NETWORK_ERROR'], '네트워크 오류', '잠시 뒤 직접 다시 점검하세요.'],
          [['WB_CLCO_CANCELLED', 'CANCELLED', 'REQUEST_CANCELLED'], '취소됨', '점검을 취소했습니다. 이전 점검 결과는 현재 결과가 아닙니다.'],
          [['ON_AI_MODEL_LIST_EMPTY', 'MODEL_NOT_CONFIGURED'], '쓸 수 있는 모델 없음', '담당자에게 모델 허용 설정 확인을 요청하세요.'],
        ];
        // 코드와 메시지는 안전한 형식일 때만 글자로 표시하고, 열쇠처럼 보이는 값은 쓰지 않습니다.
        const secret = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
        const code = typeof error?.code === 'string' && /^[A-Z0-9_]{1,64}$/.test(error.code) ? error.code : 'UNKNOWN_ERROR';
        const message = typeof error?.message === 'string' && error.message.length > 0 && error.message.length <= 500
          && !secret.test(error.message) && !/[\u0000-\u001f\u007f]/.test(error.message)
          ? error.message : '오류 내용을 안전하게 표시할 수 없습니다.';
        const [, cause, guide] = groups.find(([codes]) => codes.includes(code))
          ?? [[], '확인 불가', '담당자에게 계정 연결과 앱 권한 확인을 요청하세요.'];
        addText('p', `점검 실패: ${cause}`).setAttribute('role', 'status');
        addText('p', `오류 코드: ${code}`);
        addText('p', `오류 내용: ${message}`);
        addText('p', `안내: ${guide}`);
        addText('p', '이 결과는 연결 성공이 아니며, 이전 점검의 모델 수는 현재 결과가 아닙니다.');
        addText('p', manualRetry);
      } else {
        addText('p', '확인 불가: 점검 상태를 확인할 수 없습니다.').setAttribute('role', 'status');
      }
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      // 호출마다 새 요소를 만들므로 다른 기록 선택·다시 불러오기·실패 때 이전 설명과 성공 표식이 남지 않습니다.
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const addList = (title, lines) => {
        addText(root, 'h3', title);
        if (lines.length === 0) {
          addText(root, 'p', '없음');
          return;
        }
        const list = document.createElement('ul');
        lines.forEach((line) => addText(list, 'li', line));
        root.appendChild(list);
      };
      const secret = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
      const safeText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max
        && !secret.test(value) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
      const safeCode = (value) => typeof value === 'string' && /^[A-Z0-9_]{1,64}$/.test(value) ? value : null;
      const modes = {
        connected: '연결됨(connected)',
        demo: '예제 응답(demo)',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      const referenceNotice = 'AI 설명은 참고 정보입니다. 설명·제안만으로 보안 조치가 실행되지는 않습니다.';
      const recordKept = '기록은 그대로입니다. AI 설명 실패는 과제 실패가 아니며, 업무 앱 판정과 보안 기록은 계속 사용할 수 있습니다.';
      const status = explanation?.status;
      const eventId = typeof event?.id === 'string' && event.id ? event.id : null;

      addText(root, 'h2', 'AI 사건 설명');
      if (Object.hasOwn(modes, explanation?.mode)) addText(root, 'p', `응답 모드: ${modes[explanation.mode]}`);

      // 실패 화면: 성공 표식(data-student-explanation-event)을 붙이지 않습니다.
      const showFailure = (code, message, reason) => {
        addText(root, 'p', `AI 설명 실패: ${message}`).setAttribute('role', 'status');
        if (eventId) addText(root, 'p', `요청한 사건 ID: ${eventId}`);
        addText(root, 'p', `오류 코드: ${code}`);
        addText(root, 'p', `실패 이유: ${reason}`);
        addText(root, 'p', recordKept);
        return root;
      };

      // 1) error 는 event 가 null 이어도 먼저 표시합니다(근거 부족 기록은 event 없이 실패로 전달됩니다).
      if (status === 'error') {
        const code = safeCode(explanation.error?.code) ?? 'UNKNOWN_ERROR';
        const message = safeText(explanation.error?.message, 500)
          ? explanation.error.message : '오류 내용을 안전하게 표시할 수 없습니다.';
        const reasons = {
          ON_AI_INVALID_INPUT: '근거 부족·입력 오류 — 이 기록에는 설명에 쓸 근거·규칙이 없거나 형식을 확인할 수 없어 설명할 수 없습니다.',
          ON_AI_INVALID_OUTPUT: '근거 불일치·응답 형식 오류 — 틀린 근거·빠진 근거·비밀값을 포함하거나 AI가 이미 실행했다고 답한 설명은 쓸 수 없습니다.',
          CANCELLED: '요청 취소 — 이전 설명은 현재 결과가 아닙니다.',
          REQUEST_CANCELLED: '요청 취소 — 이전 설명은 현재 결과가 아닙니다.',
          WB_CLCO_CANCELLED: '요청 취소 — 이전 설명은 현재 결과가 아닙니다.',
        };
        return showFailure(code, message, reasons[code] ?? 'AI 연결 또는 응답 문제 — 설명을 받지 못했습니다.');
      }
      // 오류 없이 기록만 없는 경우에는 기록 선택을 먼저 안내합니다.
      if (!eventId) {
        addText(root, 'p', '보안 기록에서 기록을 먼저 고르세요.').setAttribute('role', 'status');
        addText(root, 'p', '기록을 고른 뒤 「AI 설명 요청」 버튼을 직접 누르면 설명을 요청합니다.');
        return root;
      }
      if (status === 'loading') {
        addText(root, 'p', '설명 요청 중').setAttribute('role', 'status');
        addText(root, 'p', `요청한 사건 ID: ${eventId}`);
        return root;
      }
      if (status === 'idle') {
        addText(root, 'p', '설명 요청 전').setAttribute('role', 'status');
        addText(root, 'p', `선택한 사건 ID: ${eventId} · 「AI 설명 요청」 버튼을 직접 누르세요.`);
        return root;
      }
      if (status !== 'ok') {
        addText(root, 'p', '확인 불가: 사건 설명 상태를 확인할 수 없습니다.').setAttribute('role', 'status');
        return root;
      }

      // 2)·3) 성공 응답도 현재 기록과 다시 대조하고, 없는 근거 ID를 만들어 맞추지 않습니다.
      const data = explanation.data;
      const evidence = Array.isArray(event.evidence) ? event.evidence : [];
      const evidenceText = new Map(evidence
        .filter((item) => item && typeof item.id === 'string' && typeof item.text === 'string')
        .map((item) => [item.id, item.text]));
      const refsMatch = (list) => Array.isArray(list) && list.length > 0 && new Set(list).size === list.length
        && list.every((ref) => typeof ref === 'string' && evidenceText.has(ref));
      if (data?.executed !== false || data?.requiresHumanConfirmation !== true) {
        return showFailure('ON_AI_INVALID_OUTPUT', 'AI가 이미 실행했다고 답했거나 사람 확인 조건이 없는 설명은 쓸 수 없습니다.',
          '실행 주장 — 설명·제안만으로 조치가 실행된 것으로 처리하지 않습니다.');
      }
      const proposals = Array.isArray(data.proposals) ? data.proposals : null;
      if (!safeText(data.summary, 1500) || !refsMatch(data.evidenceIds) || data.evidenceIds.length !== evidenceText.size
          || evidenceText.size !== evidence.length || !proposals
          || !proposals.every((p) => p && safeText(p.action, 200) && safeText(p.reason, 500) && refsMatch(p.evidenceIds))) {
        return showFailure('ON_AI_INVALID_OUTPUT', '이 설명은 쓸 수 없습니다.',
          `근거가 맞지 않음 — 설명의 근거 ID가 선택한 사건 ${eventId}의 근거와 일치하지 않거나 형식을 확인할 수 없습니다.`);
      }

      // 검증을 통과한 성공 설명에만 사건 ID 표식을 붙입니다.
      root.setAttribute('data-student-explanation-event', eventId);
      addText(root, 'p', '설명 수신').setAttribute('role', 'status');
      addText(root, 'p', `사건 ID: ${eventId}`);
      if (typeof checkedAt === 'string' && checkedAt) addText(root, 'p', `설명 시각: ${checkedAt}`);
      addText(root, 'h3', 'AI 설명(참고용)');
      addText(root, 'p', data.summary);
      addText(root, 'p', '사실 판단은 아래 근거 글과 연동 시스템이 알려 준 상태를 기준으로 하세요.');
      addList('인용한 근거', data.evidenceIds.map((ref) => `${ref} — ${evidenceText.get(ref)}`));
      const rules = Array.isArray(event.rules) ? event.rules : [];
      addList('규칙', rules.map((rule) => `${rule?.id ?? '규칙 ID 확인 불가'} — ${rule?.text ?? '규칙 글 확인 불가'}`));

      // 4) unknown 은 확인 불가로만 적고 정상·안전으로 바꾸지 않습니다.
      const stateNames = { access: '접속', session: '세션', device: '기기' };
      addList('확인 불가 상태', Object.keys(stateNames)
        .filter((key) => event.state?.[key] === 'unknown')
        .map((key) => `${stateNames[key]}: 확인 불가(unknown)`));

      // 제안은 표시만 하고 실행 버튼은 만들지 않습니다.
      addText(root, 'h3', '조치 제안');
      if (proposals.length === 0) {
        const supported = Array.isArray(event.supportedActions) ? event.supportedActions : [];
        addText(root, 'p', supported.length === 0
          ? '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).'
          : 'AI가 제안한 조치가 없습니다.');
      } else {
        const list = document.createElement('ul');
        proposals.forEach((p) => {
          const item = document.createElement('li');
          addText(item, 'p', `조치: ${p.action}`);
          addText(item, 'p', `이유: ${p.reason}`);
          addText(item, 'p', `근거 ID: ${p.evidenceIds.join(', ')}`);
          addText(item, 'p', '상태: 사람 확인이 필요하며 실행되지 않았습니다(미실행).');
          list.appendChild(item);
        });
        root.appendChild(list);
      }
      addText(root, 'p', referenceNotice);
      return root;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      // 호출마다 새 요소를 만들므로 다시 불러오기·다른 기록 선택·취소 뒤 이전 대상·요청·결과가 남지 않습니다.
      // 이 함수는 버튼·요청·확인 티켓을 만들지 않고, 제공 화면이 넘긴 상태만 글자로 보여 줍니다.
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.appendChild(element);
        return element;
      };
      const secret = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
      const safeText = (value, max = 500) => typeof value === 'string' && value.trim().length > 0 && value.length <= max
        && !secret.test(value) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
      const safeCode = (value) => typeof value === 'string' && /^[A-Z0-9_]{1,64}$/.test(value) ? value : null;
      const positiveInt = (value) => Number.isSafeInteger(value) && value > 0;
      const resultReload = '「원천 결과만 재조회」';
      const cancelNotice = '「조치 화면 취소」는 화면의 준비 상태만 지웁니다. 이미 서버에 전달된 조치의 효과를 되돌리지 않습니다.';

      // 1) 상태값마다 다른 문장을 원래 값과 함께 정합니다.
      const statusText = {
        idle: ['아직 미실행(idle)', '조치 제안만으로는 아무것도 실행되지 않습니다. 지금 기록은 연동 시스템이 지원하는 조치가 없어 「조치 준비」 버튼이 나오지 않는 것이 정상입니다.'],
        loading: ['조치 준비 또는 결과 조회 중(loading)', '서버 응답을 기다리고 있습니다. 결과가 아직 확인되지 않았으며 완료 아님입니다.'],
        prepared: ['준비됨·미실행(prepared)', '아직 서버에 전달하지 않았습니다. 아래 실제 대상과 확인 기한을 사람이 읽고 「대상과 조치를 확인했으며 집행합니다」를 직접 눌러야 전달됩니다.'],
        executing: ['서버에 전달 중(executing)', '결과가 아직 없습니다. 완료 아님입니다. 버튼을 다시 누르지 말고 전달이 끝날 때까지 기다리세요.'],
        pending: ['서버 접수·처리 중(pending)', `서버가 요청을 받았다는 응답(ACK)은 효과 확인이 아닙니다. 완료 아님입니다. 다시 집행하지 말고 ${resultReload}로 결과만 조회하세요.`],
        denied: ['거절(denied)', '연동 시스템이 이 조치를 거절했습니다.'],
        failed: ['실패(failed)', '연동 시스템이 이 조치의 처리 실패를 응답했습니다.'],
        unknown: ['결과 불명(unknown)', `성공으로도, 효과 없음으로도 판단하지 마세요. 다시 집행하지 말고 ${resultReload}로 결과만 다시 조회하세요.`],
        expired: ['확인 기한 지남(expired)', '이번 준비로는 집행할 수 없습니다. AI 설명의 제안에서 「조치 준비」를 다시 눌러 대상과 확인 기한을 새로 받으세요.'],
        error: ['요청 처리 안 됨(error)', '요청이 처리되지 않았습니다. 아래 오류 코드와 내용을 확인하세요.'],
      };

      const eventId = typeof event?.id === 'string' && event.id ? event.id : null;
      const requestId = safeText(receipt?.requestId, 100) ? receipt.requestId : null;
      // 4) 영수증이 현재 사건·조치와 다르면 이 화면의 사건과 묶지 않습니다.
      const receiptMismatch = receipt != null && (
        (receipt.eventId != null && receipt.eventId !== eventId)
        || (receipt.actionId != null && receipt.actionId !== actionId));

      // 3) succeeded 는 effectApplied===true 관측과 receiptId 가 있을 때만 효과 확인입니다.
      const observed = observation && observation.effectApplied === true && safeText(observation.observedAt, 64);
      const confirmed = status === 'succeeded' && observed && safeText(receipt?.receiptId, 100) && !receiptMismatch;
      // succeeded 문장은 관측 조건을 확인한 뒤 따로 그리므로 statusText 에 두지 않습니다.
      let shown = Object.hasOwn(statusText, status) || status === 'succeeded' ? status : null;
      let downgradeReason = null;
      if (receiptMismatch && shown && shown !== 'idle') {
        shown = 'unknown';
        downgradeReason = '영수증의 사건 ID 또는 조치 ID가 현재 표시한 사건·조치와 다릅니다. 이 결과를 현재 사건의 결과로 쓰지 않습니다.';
      } else if (status === 'succeeded' && !confirmed) {
        shown = 'unknown';
        downgradeReason = 'succeeded 응답이지만 효과 관측(effectApplied: true)·관측 시각·receiptId를 함께 확인할 수 없어 결과 불명으로 표시합니다.';
      }

      addText(root, 'h2', '조치 요청 상태');
      if (!shown) {
        addText(root, 'p', `확인 불가: 조치 상태를 확인할 수 없습니다${typeof status === 'string' ? `(${status})` : ''}.`).setAttribute('role', 'status');
        addText(root, 'p', '성공이나 효과 없음으로 판단하지 마세요.');
        return root;
      }

      // 2) 상태 문장: 접수(ACK)·전달 중은 완료로 읽히지 않게 씁니다.
      if (confirmed) {
        addText(root, 'p', '효과 확인(succeeded)').setAttribute('role', 'status');
        addText(root, 'p', '연동 시스템에서 결과를 다시 조회해 실제 효과를 관측한 결과입니다.');
        addText(root, 'p', `관측 시각: ${observation.observedAt}`);
        addText(root, 'p', 'effectApplied: true');
        addText(root, 'p', `receiptId: ${receipt.receiptId}`);
      } else {
        const [label, guide] = statusText[shown];
        addText(root, 'p', label).setAttribute('role', 'status');
        addText(root, 'p', guide);
        if (downgradeReason) addText(root, 'p', `결과 불명 처리 이유: ${downgradeReason}`);
      }
      if (shown === 'prepared') {
        addText(root, 'p', `사람 확인 기한: ${safeText(confirmationExpiresAt, 64) ? confirmationExpiresAt : '확인 불가'}`);
      }
      if (shown === 'unknown' && receipt?.superseded === true) {
        addText(root, 'p', '이전 조회는 최신 결과를 대신하지 않습니다(superseded).');
      }
      if (['denied', 'failed', 'error', 'unknown', 'expired'].includes(shown) || shown === 'idle') {
        const code = safeCode(error?.code);
        if (code) addText(root, 'p', `오류 코드: ${code}`);
        const detail = safeText(error?.message) ? error.message : safeText(message) ? message : null;
        if (detail) addText(root, 'p', `${shown === 'idle' ? '안내' : '내용'}: ${detail}`);
        else if (['denied', 'failed', 'error'].includes(shown)) addText(root, 'p', '내용: 연동 시스템이 알려 준 내용이 없습니다.');
      }
      if (!confirmed && !receiptMismatch && observation && typeof observation.effectApplied === 'boolean' && safeText(observation.observedAt, 64)) {
        addText(root, 'p', `관측 기록: ${observation.observedAt} · effectApplied: ${observation.effectApplied} (효과 확인 표시는 succeeded 일 때만 합니다)`);
      }

      // 4) 현재 사건·근거·조치·대상·요청 ID를 받은 범위에서만 표시합니다.
      if (shown !== 'idle') {
        const ids = [];
        if (eventId) ids.push(`사건 ID: ${eventId}`);
        const evidenceIds = Array.isArray(event?.evidence)
          ? event.evidence.map((item) => item?.id).filter((id) => typeof id === 'string' && id) : [];
        if (evidenceIds.length > 0) ids.push(`근거 ID: ${evidenceIds.join(', ')}`);
        if (safeText(actionId, 100)) ids.push(`조치 ID(actionId): ${actionId}`);
        if (safeText(target?.id, 100)) ids.push(`실제 대상(target.id): ${target.id}`);
        if (positiveInt(target?.generation)) ids.push(`대상 세대(target.generation): ${target.generation}`);
        // 현재 사건과 맞지 않는 영수증의 값은 현재 요청 정보로 보여 주지 않습니다.
        if (!receiptMismatch) {
          if (requestId) ids.push(`요청 ID(requestId): ${requestId}`);
          if (safeText(receipt?.receiptId, 100)) ids.push(`영수증 ID(receiptId): ${receipt.receiptId}`);
          if (positiveInt(receipt?.version)) ids.push(`버전(version): ${receipt.version}`);
        }
        if (ids.length > 0) {
          addText(root, 'h3', '현재 요청 정보');
          const list = document.createElement('ul');
          ids.forEach((line) => addText(list, 'li', line));
          root.appendChild(list);
        }
        // 같은 요청의 재전송은 새로 집행하지 않고 기존 결과를 돌려받습니다.
        if (!receiptMismatch && receipt?.replayed === true) {
          addText(root, 'p', '같은 요청의 기존 결과입니다(replayed: true). 새로 집행하지 않았습니다.');
        }
        addText(root, 'p', cancelNotice);
      }

      // 현재 사건·요청과 묶인 화면에만 표식을 붙입니다.
      if (eventId && shown !== 'idle' && !receiptMismatch) {
        root.setAttribute('data-student-action-event', eventId);
        if (requestId) root.setAttribute('data-student-action-request', requestId);
      }
      return root;
    },
  };

  // 총공세: 상태·알림 칸 맨 위에 내 PC 관제 대시보드를 붙입니다. 기존 16단계 표시는 그대로 아래에 둡니다.
  const pcDashboard = createPcDashboard({ api });
  const renderStatusBase = view.renderStatus;
  view.renderStatus = (input = {}) => pcDashboard.compose(renderStatusBase(input), input.mode);
  return view;
}

// ---------- 총공세: 내 PC 관제 대시보드 (학생 구현) ----------
// 제공 부분: 값 조회 GET /api/pc/status (src/pc-status.mjs 가 이 PC에서 실측), 보호 현황의 「내 PC 상태」 카드.
// 학생 부분: 관제 대시보드 배치(상태 카드 4개 → 연결·기록 → 추이 → 주의 관찰 → 조회 기록),
//           직전 대비 변화와 이 화면 안의 추이, 주의 관찰 근거, 「다시 조회」·대기 표시·오류 화면, SDP 연결 상태 분리.
// 설정을 바꾸거나 관리자 권한을 요청하지 않으며, 값은 이 화면 메모리에만 두고 저장·외부 전송·AI 전송을 하지 않습니다.
const PC_PATH = '/api/pc/status';
const PC_SCHEMA = 'aleph.on.pc-status.v1';
const PC_STALE_MS = 60000;
const PC_HISTORY_MAX = 20;
const PC_LOG_MAX = 10;
const PC_REASONS = {
  permission_denied: '읽기 권한이 없습니다',
  unsupported: '이 운영체제에서는 조회하지 않습니다',
  timeout: '조회 시간이 초과됐습니다',
  cancelled: '조회가 취소됐습니다',
  query_failed: '조회에 실패했습니다',
  invalid_response: '응답 값이나 단위를 확인할 수 없습니다',
  invalid_sample: 'CPU 표본을 확인할 수 없습니다',
};
const PC_NEXT_STEPS = {
  permission_denied: '관리자 권한으로 바꾸거나 보안 설정을 고치지 마세요. 그대로 두고 필요하면 담당자에게 확인합니다.',
  unsupported: 'Windows PC에서 실행하면 조회합니다. 지금은 확인 불가로 남깁니다.',
  timeout: '잠시 뒤 「다시 조회」를 직접 누릅니다.',
  cancelled: '「다시 조회」를 직접 누릅니다.',
  query_failed: '잠시 뒤 「다시 조회」를 직접 누르고, 계속되면 도움정보를 불러와 담당자에게 보여 줍니다.',
  invalid_response: '시작 틀 버전을 확인하고 「다시 조회」를 직접 누릅니다.',
  invalid_sample: '「다시 조회」를 직접 누릅니다.',
};
const PC_LABELS = { cpu: 'CPU 사용률', memory: '메모리 사용량', disk: '디스크 남은 공간', firewall: 'Windows 방화벽', network: '네트워크 구성', events: 'Windows 기록' };
const PC_KEYS = ['cpu', 'memory', 'disk', 'firewall', 'network', 'events'];
const SDP_MODES = {
  connected: ['SDP 연결됨', '앱 서버가 SDP 서버(기존 엔진) 연결을 알렸습니다. PC 조회 결과와는 별개입니다.'],
  disconnected: ['SDP 미연결', '기존 엔진(SDP 서버)에 연결하지 않은 기본 실행입니다. 정상 표시이며 PC 조회 성공과 섞지 않습니다.'],
  demo: ['예제 자료 · SDP 실제 연결 아님', '예제 실행입니다. 기기·세션·기록은 설명용 예제이며, 위 PC 값만 이 PC 실측입니다.'],
  unknown: ['확인 불가', 'SDP 서버 연결 여부를 확인하지 못했습니다. 미연결로 단정하지 않습니다.'],
};

const pcNum = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const pcCount = (n) => Number.isSafeInteger(n) && n >= 0;
const pcGb = (n) => (n / 1024 ** 3).toFixed(1);
const pcTime = (ms) => new Date(ms).toLocaleTimeString('ko-KR', { hour12: false });
const pcDateTime = (ms) => new Date(ms).toLocaleString('ko-KR', { hour12: false });

// 응답 한 건을 항목별 표시값으로 바꿉니다. 형식이 맞지 않으면 확인 불가로 둡니다(0이나 정상으로 바꾸지 않음).
export function readPcMetrics(metrics = {}) {
  const out = {};
  for (const key of PC_KEYS) {
    const m = metrics?.[key];
    const fail = (reason) => ({ state: 'unavailable', reason: Object.hasOwn(PC_REASONS, reason) ? reason : 'invalid_response' });
    if (m?.state !== 'ok') { out[key] = fail(m?.reason); continue; }
    if (key === 'cpu' && pcNum(m.usagePercent) && m.usagePercent <= 100) {
      out.cpu = { state: 'measured', percent: m.usagePercent, text: `${m.usagePercent.toFixed(1)}%`, unit: pcCount(m.sampleMs) ? `% · ${m.sampleMs}ms 표본` : '% · 표본 시간 확인 불가', sampleMs: pcCount(m.sampleMs) ? m.sampleMs : null };
    } else if (key === 'memory' && pcNum(m.usedBytes) && pcNum(m.totalBytes) && m.totalBytes > 0 && m.usedBytes <= m.totalBytes) {
      const percent = Math.round((m.usedBytes / m.totalBytes) * 1000) / 10;
      out.memory = { state: 'measured', percent, text: `${percent.toFixed(1)}%`, unit: `사용 ${pcGb(m.usedBytes)} GB / 전체 ${pcGb(m.totalBytes)} GB` };
    } else if (key === 'disk' && pcNum(m.freeBytes) && pcNum(m.totalBytes) && m.totalBytes > 0 && m.freeBytes <= m.totalBytes) {
      const percent = Math.round((m.freeBytes / m.totalBytes) * 1000) / 10;
      out.disk = { state: 'measured', percent, text: `${percent.toFixed(1)}% 남음`, unit: `여유 ${pcGb(m.freeBytes)} GB / 전체 ${pcGb(m.totalBytes)} GB · 앱이 있는 디스크` };
    } else if (key === 'firewall' && Array.isArray(m.profiles) && m.profiles.length === 3
      && ['Domain', 'Private', 'Public'].every((name) => m.profiles.some((p) => p?.name === name && typeof p.enabled === 'boolean'))) {
      const profiles = ['Domain', 'Private', 'Public'].map((name) => m.profiles.find((p) => p.name === name));
      const off = profiles.filter((p) => !p.enabled).map((p) => p.name);
      out.firewall = { state: 'measured', off, text: off.length ? `꺼진 프로필 ${off.length}개` : '세 프로필 켜짐', unit: profiles.map((p) => `${p.name} ${p.enabled ? '켜짐' : '꺼짐'}`).join(' · ') };
    } else if (key === 'network' && pcCount(m.interfaceCount) && pcCount(m.ipv4Count)) {
      out.network = { state: 'measured', text: `인터페이스 ${m.interfaceCount}개 · IPv4 구성 ${m.ipv4Count}개`, unit: '로컬 구성 요약 · 인터넷 접속이나 ZTNA 허용을 확인한 결과가 아님' };
    } else if (key === 'events' && pcCount(m.warningCount) && pcCount(m.errorCount) && m.warningCount + m.errorCount <= 5000 && typeof m.truncated === 'boolean') {
      out.events = { state: 'measured', warning: m.warningCount, error: m.errorCount, truncated: m.truncated, text: `경고 ${m.warningCount}건 · 오류 ${m.errorCount}건${m.truncated ? ' (일부 집계)' : ''}`, unit: '최근 24시간 System·Application · 최대 5,000건 · 침해·공격 탐지 결과가 아님' };
    } else {
      out[key] = fail('invalid_response');
    }
  }
  return out;
}

// 이번 조회에서 기준을 넘은 관찰만 모읍니다. 판정이 아니라 근거이며, 말할 수 없는 것을 함께 적습니다.
export function pcObservations(values, history = []) {
  const list = [];
  const add = (level, seen, limit) => list.push({ level, seen, limit });
  if (values.cpu?.state === 'measured' && values.cpu.percent >= 90) add('주의', `CPU 사용률 ${values.cpu.text}`, `${values.cpu.sampleMs ? `${values.cpu.sampleMs}ms ` : ''}짧은 표본 한 번이라 잠깐 높았을 수 있습니다. 악성코드 여부는 알 수 없습니다.`);
  const recentCpu = history.slice(-3).map((h) => h.cpu);
  if (recentCpu.length === 3 && recentCpu.every((v) => pcNum(v) && v >= 80)) add('주의', '최근 3회 연속 CPU 80% 이상', '이 화면에서 잰 3회뿐입니다. 어떤 프로그램 때문인지는 작업 관리자에서 확인합니다.');
  if (values.memory?.state === 'measured' && values.memory.percent >= 85) add('주의', `메모리 사용량 ${values.memory.text}`, '사용량이 높다는 것만으로 악성코드라고 볼 수 없습니다.');
  if (values.disk?.state === 'measured' && values.disk.percent < 10) add('주의', `디스크 남은 공간 ${values.disk.text}`, '앱이 있는 디스크 하나만 본 값입니다. 지우기 전에 파일을 확인하고 백업합니다.');
  if (values.firewall?.state === 'measured' && values.firewall.off.length) add('주의', `Windows 방화벽 꺼진 프로필: ${values.firewall.off.join(', ')}`, '설정을 읽기만 했습니다. 앱은 방화벽을 켜거나 끄지 않으며, 회사 정책으로 다른 보호 수단을 쓸 수 있습니다.');
  if (values.events?.state === 'measured' && values.events.error > 0) add('참고', `Windows 기록 오류 ${values.events.error}건(최근 24시간)`, '오류 건수는 침해나 공격 탐지 결과가 아닙니다. 일반 프로그램 오류도 포함됩니다.');
  if (values.events?.state === 'measured' && values.events.truncated) add('참고', 'Windows 기록 일부 집계(5,000건 초과)', '5,000건까지만 세었습니다. 실제 건수는 더 많을 수 있습니다.');
  for (const key of PC_KEYS) {
    if (values[key]?.state === 'unavailable') add('확인 불가', `${PC_LABELS[key]}: ${PC_REASONS[values[key].reason]}`, '읽지 못한 항목은 정상이나 안전으로 보지 않습니다.');
  }
  return list;
}

function createPcDashboard({ api } = {}) {
  const make = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const grid = (node, min) => {
    node.style.display = 'grid';
    node.style.gridTemplateColumns = `repeat(auto-fit, minmax(${min}px, 1fr))`;
    node.style.gap = '12px';
    return node;
  };
  const box = (node) => {
    node.style.padding = '12px';
    node.style.border = '1px solid var(--border, #d7dbe0)';
    node.style.borderRadius = 'var(--radius, 8px)';
    node.style.background = 'var(--bg, #f5f6f8)';
    return node;
  };

  const wrapper = make('div');
  const root = make('section');
  root.setAttribute('data-student-pc-dashboard', 'v1');
  root.setAttribute('aria-labelledby', 'student-pc-dashboard-title');
  const legacyHost = make('div');
  wrapper.append(root, legacyHost);

  const title = make('h2', '헤세드 내 PC 관제');
  title.id = 'student-pc-dashboard-title';
  const source = make('p', '값은 제공 조회 기능(GET /api/pc/status · src/pc-status.mjs)이 이 PC에서 잰 실측입니다. 화면 배치·직전 대비·추이·주의 관찰·조회 기록은 학생 구현입니다. 이 대시보드는 예시 값을 쓰지 않으며, 읽지 못한 값은 「확인 불가」로 보입니다. 값은 이 화면에만 두고 저장하거나 외부·AI로 보내지 않습니다.', 'muted');

  const controls = make('div', null, 'row');
  const refresh = make('button', '다시 조회', 'btn');
  refresh.type = 'button';
  refresh.setAttribute('data-student-pc-refresh', '');
  refresh.setAttribute('aria-describedby', 'student-pc-progress');
  refresh.setAttribute('aria-disabled', 'false');
  const progress = make('p', '아직 조회하지 않았습니다. 「다시 조회」를 누르면 이 PC의 값을 읽습니다(자동 조회 없음).', 'muted');
  progress.id = 'student-pc-progress';
  progress.setAttribute('role', 'status');
  controls.append(refresh, progress);

  const problem = make('div', null, 'state state-error');
  problem.setAttribute('role', 'alert');
  problem.setAttribute('data-student-pc-problem', '');
  problem.hidden = true;

  // ① 상태 카드 4개
  const cards = grid(make('div'), 170);
  const cardRows = new Map();
  for (const key of ['cpu', 'memory', 'disk', 'firewall']) {
    const article = box(make('article'));
    article.setAttribute('data-student-pc-card', key);
    const badge = make('p', '미조회', 'state state-empty');
    badge.style.display = 'inline-block';
    badge.style.padding = '2px 8px';
    const value = make('p', '—');
    value.style.fontSize = '1.6rem';
    value.style.fontWeight = '700';
    value.style.margin = '6px 0';
    const unit = make('p', '아직 조회하지 않음', 'muted');
    const change = make('p', '', 'muted');
    article.append(make('h3', PC_LABELS[key]), badge, value, unit, change);
    cards.append(article);
    cardRows.set(key, { article, badge, value, unit, change });
  }

  // ② 연결·방화벽·Windows 기록(읽기 전용)과 SDP 연결 상태
  const linkSection = make('section');
  linkSection.append(make('h3', '연결·방화벽·Windows 기록 (읽기만 함)'));
  const linkNote = make('p', '앱은 방화벽·보안 설정을 바꾸지 않고, 관리자 권한을 요청하지 않으며, 공격이나 침투를 흉내 내는 시험을 하지 않습니다.', 'muted');
  const linkList = make('dl', null, 'identity');
  const linkRows = new Map();
  for (const [key, label] of [['network', '네트워크 구성'], ['firewall', 'Windows 방화벽 프로필'], ['events', 'Windows 경고·오류'], ['sdp', 'SDP 서버']]) {
    const dd = make('dd', '아직 조회하지 않음');
    dd.setAttribute('data-student-pc-link', key);
    linkList.append(make('dt', label), dd);
    linkRows.set(key, { dd });
  }
  linkSection.append(linkNote, linkList);

  // ③ 추이(이 화면에서 잰 최근 20회)
  const trendSection = make('section');
  trendSection.append(make('h3', `추이 (이 화면에서 잰 최근 ${PC_HISTORY_MAX}회)`),
    make('p', '앱 화면을 새로 고치면 추이는 처음부터 다시 쌓입니다. 저장하지 않습니다. 조회에 실패한 회차는 점으로 잇지 않고 빈칸으로 둡니다.', 'muted'));
  const trendGrid = grid(make('div'), 220);
  const trendRows = new Map();
  for (const [key, label] of [['cpu', 'CPU 사용률(%)'], ['memory', '메모리 사용량(%)'], ['disk', '디스크 남은 공간(%)']]) {
    const article = box(make('article'));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 48');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '48');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const summary = make('p', '아직 값이 없습니다.', 'muted');
    article.append(make('h4', label), svg, summary);
    trendGrid.append(article);
    trendRows.set(key, { svg, summary });
  }
  trendSection.append(trendGrid);

  // ④ 주의 관찰(판정 아님)
  const watchSection = make('section');
  watchSection.append(make('h3', '주의 관찰 (판정이 아닌 근거)'));
  const watchList = make('ul', null, 'plain-list');
  watchList.setAttribute('data-student-pc-observations', '');
  watchList.append(make('li', '아직 조회하지 않았습니다.'));
  watchSection.append(watchList);

  // ⑤ 조회 기록
  const logSection = make('section');
  logSection.append(make('h3', `조회 기록 (최근 ${PC_LOG_MAX}회, 새 기록이 위)`));
  const logList = make('ol', null, 'plain-list');
  logList.setAttribute('data-student-pc-log', '');
  logList.append(make('li', '아직 조회 기록이 없습니다.'));
  logSection.append(logList);

  for (const part of [linkSection, trendSection, watchSection, logSection, legacyHost]) part.style.marginTop = '24px';
  problem.style.margin = '12px 0';
  root.append(title, source, controls, problem, cards, linkSection, trendSection, watchSection, logSection);

  const history = [];
  const logs = [];
  let pending = null;
  let last = null; // { at, values } 마지막 성공 조회

  function setBadge(row, kind, text) {
    row.badge.className = `state ${kind === 'measured' ? 'state-ok' : kind === 'loading' ? 'state-loading' : 'state-empty'}`;
    row.badge.textContent = text;
  }

  function drawTrend(key) {
    const { svg, summary } = trendRows.get(key);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const points = history.map((h, i) => ({ i, v: h[key] }));
    const values = points.filter((p) => pcNum(p.v)).map((p) => p.v);
    const ns = 'http://www.w3.org/2000/svg';
    const base = document.createElementNS(ns, 'line');
    for (const [k, v] of [['x1', 0], ['y1', 46], ['x2', 200], ['y2', 46], ['stroke', 'currentColor'], ['stroke-opacity', '0.25']]) base.setAttribute(k, String(v));
    svg.appendChild(base);
    if (!values.length) { summary.textContent = '아직 실측 값이 없습니다.'; return; }
    const step = 200 / Math.max(PC_HISTORY_MAX - 1, 1);
    let segment = [];
    const flush = () => {
      if (segment.length === 1) {
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', String(segment[0][0])); dot.setAttribute('cy', String(segment[0][1])); dot.setAttribute('r', '2.5'); dot.setAttribute('fill', 'currentColor');
        svg.appendChild(dot);
      } else if (segment.length > 1) {
        const line = document.createElementNS(ns, 'polyline');
        line.setAttribute('points', segment.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '));
        line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'currentColor'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
      }
      segment = [];
    };
    points.forEach((p, n) => {
      if (!pcNum(p.v)) { flush(); return; }
      segment.push([n * step, 46 - (Math.min(p.v, 100) / 100) * 44]);
    });
    flush();
    const min = Math.min(...values), max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const lastAt = history.filter((h) => pcNum(h[key])).at(-1)?.at;
    summary.textContent = `실측 ${values.length}회 · 최저 ${min.toFixed(1)}% · 평균 ${avg.toFixed(1)}% · 최고 ${max.toFixed(1)}%${lastAt ? ` · 마지막 ${pcTime(lastAt)}` : ''}`;
  }

  function renderLog() {
    logList.replaceChildren(...(logs.length ? logs.map((l) => make('li', l)) : [make('li', '아직 조회 기록이 없습니다.')]));
  }

  function showProblem(lines) {
    if (!lines) { problem.hidden = true; problem.replaceChildren(); return; }
    problem.hidden = false;
    problem.replaceChildren(...lines.map((line, i) => make(i === 0 ? 'strong' : 'p', line)));
    problem.firstChild.style.display = 'block';
  }

  function applyFailure(at, code, message) {
    for (const [key, row] of cardRows) {
      setBadge(row, 'unavailable', '이번 조회 확인 불가');
      row.value.textContent = '확인 불가';
      row.unit.textContent = last ? `이전 값(${pcTime(last.at)})을 현재 상태로 표시하지 않습니다.` : '값을 읽지 못했습니다.';
      row.change.textContent = '';
      row.article.dataset.state = 'unavailable';
      if (key === 'firewall') linkRows.get('firewall').dd.textContent = '이번 조회 확인 불가';
    }
    linkRows.get('network').dd.textContent = '이번 조회 확인 불가';
    linkRows.get('events').dd.textContent = '이번 조회 확인 불가';
    watchList.replaceChildren(make('li', `이번 조회에 실패해 관찰을 만들지 않았습니다(${code}). 실패를 정상이나 안전으로 보지 않습니다.`));
    showProblem([
      `이 PC 값을 읽지 못했습니다: ${message} (${code})`,
      '다음에 할 일 1. 앱을 켠 PowerShell 창이 아직 열려 있는지 확인합니다(닫혔다면 tools\\start-alekov.ps1 로 다시 켭니다).',
      '다음에 할 일 2. 「다시 조회」를 직접 누릅니다. 앱은 자동으로 다시 시도하지 않습니다.',
      '다음에 할 일 3. 계속 실패하면 아래 「도움정보 불러오기」로 점검 결과를 확인해 담당자에게 보여 줍니다.',
    ]);
    history.push({ at, cpu: null, memory: null, disk: null });
    if (history.length > PC_HISTORY_MAX) history.shift();
    for (const key of trendRows.keys()) drawTrend(key);
  }

  function applySuccess(at, measured, values, stale) {
    const prev = last;
    for (const [key, row] of cardRows) {
      const v = values[key];
      row.article.dataset.state = v.state;
      if (v.state === 'measured') {
        setBadge(row, stale ? 'stale' : 'measured', stale ? '오래됨 · 현재 값 아님' : '이 PC 실측');
        row.value.textContent = v.text;
        row.unit.textContent = `${v.unit} · 잰 시각 ${pcTime(measured)}`;
        const before = stale ? null : prev?.values?.[key];
        if (key !== 'firewall' && before?.state === 'measured') {
          const diff = Math.round((v.percent - before.percent) * 10) / 10;
          row.change.textContent = `직전(${pcTime(prev.at)}) 대비 ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%p`;
        } else if (key === 'firewall' && before?.state === 'measured') {
          row.change.textContent = before.unit === v.unit ? `직전(${pcTime(prev.at)})과 같음` : `직전(${pcTime(prev.at)}): ${before.unit}`;
        } else {
          row.change.textContent = stale ? '오래된 값이라 직전과 비교하지 않습니다' : '직전 실측 없음';
        }
      } else {
        setBadge(row, 'unavailable', '확인 불가');
        row.value.textContent = '확인 불가';
        row.unit.textContent = `${PC_REASONS[v.reason]} · 시도 시각 ${pcTime(measured)}`;
        row.change.textContent = PC_NEXT_STEPS[v.reason];
      }
    }
    for (const key of ['network', 'firewall', 'events']) {
      const v = values[key];
      const { dd } = linkRows.get(key);
      dd.textContent = v.state === 'measured' ? `${v.text} — ${v.unit} · ${pcTime(measured)} 실측` : `확인 불가 — ${PC_REASONS[v.reason]}. ${PC_NEXT_STEPS[v.reason]}`;
    }
    if (!stale) {
      history.push({ at: measured, cpu: values.cpu.percent ?? null, memory: values.memory.percent ?? null, disk: values.disk.percent ?? null });
      if (history.length > PC_HISTORY_MAX) history.shift();
      for (const key of trendRows.keys()) drawTrend(key);
    }
    const obs = stale ? [{ level: '확인 불가', seen: '받은 값이 1분보다 오래됨', limit: '오래된 값으로는 지금 상태를 말할 수 없어 관찰을 만들지 않았습니다.' }] : pcObservations(values, history);
    watchList.replaceChildren(...(obs.length ? obs.map((o) => {
      const li = make('li');
      li.setAttribute('data-level', o.level);
      li.append(make('strong', `[${o.level}] ${o.seen}`), make('span', ` — 이것만으로 말할 수 없는 것: ${o.limit} (출처: 이 PC 실측 · ${pcTime(measured)})`, 'muted'));
      return li;
    }) : [make('li', `이번 조회(${pcTime(measured)})에서 기준을 넘은 관찰이 없습니다. 이것은 PC가 안전하다는 판정이 아닙니다.`)]));
    const unavailable = PC_KEYS.filter((k) => values[k].state !== 'measured');
    if (stale) {
      showProblem([`받은 값의 잰 시각(${pcDateTime(measured)})이 1분보다 오래됐습니다.`, '현재 상태로 보지 말고 「다시 조회」를 직접 누릅니다.']);
      problem.className = 'state state-empty';
    } else if (unavailable.length) {
      showProblem([`일부 항목을 읽지 못했습니다(${unavailable.length}/${PC_KEYS.length}).`,
        ...unavailable.map((k) => `${PC_LABELS[k]}: ${PC_REASONS[values[k].reason]} → ${PC_NEXT_STEPS[values[k].reason]}`)]);
      problem.className = 'state state-empty';
    } else {
      showProblem(null);
    }
    if (!stale) last = { at: measured, values };
  }

  async function read() {
    if (pending) return pending;
    pending = (async () => {
      const startedAt = Date.now();
      // 버튼을 disabled 로 바꾸면 키보드 포커스가 사라지므로 aria-disabled 와 중복 요청 차단으로 대기를 표시합니다.
      refresh.setAttribute('aria-disabled', 'true');
      refresh.textContent = '읽는 중…';
      root.setAttribute('aria-busy', 'true');
      progress.textContent = '새로 읽는 중… 이 PC의 CPU·메모리·디스크·방화벽·Windows 기록을 읽고 있습니다.';
      for (const row of cardRows.values()) setBadge(row, 'loading', '읽는 중…');
      let result;
      try {
        result = api && typeof api.get === 'function'
          ? await api.get(PC_PATH)
          : { ok: false, error: { code: 'STUDENT_API_MISSING', message: '학생 API를 받지 못했습니다' } };
      } catch {
        result = { ok: false, error: { code: 'REQUEST_FAILED', message: '요청 중 오류가 발생했습니다' } };
      }
      try {
      const at = Date.now();
      const data = result?.ok === true ? result.data : null;
      const measured = typeof data?.measuredAt === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(data.measuredAt) ? Date.parse(data.measuredAt) : NaN;
      if (!data || data.schema !== PC_SCHEMA || data.source !== 'local-pc' || !Number.isFinite(measured)) {
        problem.className = 'state state-error';
        const code = result?.ok === false ? String(result?.error?.code ?? 'UNKNOWN_ERROR') : 'INVALID_RESPONSE';
        const message = result?.ok === false ? String(result?.error?.message ?? '오류 내용을 확인할 수 없습니다') : '응답 형식이 계약과 다릅니다';
        applyFailure(at, code, message);
        logs.unshift(`${pcTime(at)} · 조회 실패 · ${code}`);
        progress.textContent = `조회 실패 · ${pcTime(at)} · 아래 오류 안내를 확인하세요.`;
      } else {
        const stale = Math.abs(at - measured) > PC_STALE_MS;
        const values = readPcMetrics(data.metrics);
        applySuccess(at, measured, values, stale);
        const ok = PC_KEYS.filter((k) => values[k].state === 'measured').length;
        const miss = PC_KEYS.filter((k) => values[k].state !== 'measured').map((k) => `${PC_LABELS[k]}(${PC_REASONS[values[k].reason]})`);
        logs.unshift(`${pcTime(stale ? at : measured)} · ${stale ? `오래된 값 받음(잰 시각 ${pcTime(measured)})` : '조회 성공'} · 실측 ${ok}/${PC_KEYS.length}${miss.length ? ` · 확인 불가: ${miss.join(', ')}` : ''}`);
        progress.textContent = `마지막 조회 ${pcDateTime(measured)} · ${Math.max(0, at - startedAt)}ms 걸림 · 이 PC 실측 ${ok}/${PC_KEYS.length}항목 · SDP 연결 상태와 별개`;
      }
      if (logs.length > PC_LOG_MAX) logs.length = PC_LOG_MAX;
      renderLog();
      } catch {
        // 화면 갱신 중 예상하지 못한 오류: 이전 값을 현재처럼 남기지 않고 오류 안내만 보여 줍니다.
        problem.className = 'state state-error';
        showProblem(['화면을 갱신하는 중 오류가 발생했습니다(STUDENT_RENDER_FAILED).', '「다시 조회」를 직접 누릅니다. 계속되면 도움정보를 담당자에게 보여 줍니다.']);
        progress.textContent = '화면 갱신 실패 · 아래 오류 안내를 확인하세요.';
      } finally {
      root.removeAttribute('aria-busy');
      refresh.setAttribute('aria-disabled', 'false');
      refresh.textContent = '다시 조회';
      }
    })().finally(() => { pending = null; });
    return pending;
  }
  refresh.addEventListener('click', () => { if (!pending) void read(); });

  function setSdp(mode) {
    const [text, note] = SDP_MODES[Object.hasOwn(SDP_MODES, mode) ? mode : 'unknown'];
    const { dd } = linkRows.get('sdp');
    dd.textContent = `${text} — ${note}`;
    dd.setAttribute('data-sdp-mode', Object.hasOwn(SDP_MODES, mode) ? mode : 'unknown');
  }
  setSdp('unknown');

  return {
    read,
    // 기존 16단계 상태·알림 표시(legacy)를 대시보드 아래에 붙여 돌려줍니다. 다시 그릴 때 포커스를 지킵니다.
    compose(legacy, mode) {
      const active = document.activeElement;
      const keep = active && root.contains(active) ? active : null;
      if (legacy instanceof Element) legacyHost.replaceChildren(legacy);
      else legacyHost.replaceChildren(make('p', typeof legacy === 'string' ? legacy : ''));
      setSdp(mode);
      if (keep) queueMicrotask(() => { if (keep.isConnected) keep.focus({ preventScroll: true }); });
      return wrapper;
    },
  };
}
