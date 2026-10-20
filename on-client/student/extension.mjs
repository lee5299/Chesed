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
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
