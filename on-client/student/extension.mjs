// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
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
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
