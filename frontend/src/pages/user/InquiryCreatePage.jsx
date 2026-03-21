import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { INQUIRY_TYPES, INQUIRY_TYPE_LABELS } from '../../constants/inquiryTypes';
import { ROLES } from '../../constants/roles';
import { createInquiry } from '../../api/inquiry';
import { MAX_WIDTH } from '../../styles/tokens';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TAB = {
  CHAT: 'chat',
  FORM: 'form',
};

const GUIDE_BY_TYPE = {
  [INQUIRY_TYPES.USER_TO_SELLER]: {
    titlePlaceholder: '예: 체크인 시간이 늦어질 것 같아요',
    contentPlaceholder: '예: 3월 18일 예약자입니다. 밤 11시쯤 체크인 예정인데 셀프 체크인이 가능한지 확인하고 싶어요.',
    prompts: [
      '체크인 시간이 늦어질 것 같아요.',
      '주차 가능 여부를 확인하고 싶어요.',
      '인원 추가 가능 여부를 알고 싶어요.',
    ],
    reply: '숙소명, 예약일, 확인이 필요한 내용을 함께 적어주시면 판매자가 더 빠르게 확인할 수 있어요.',
    helper: '체크인/주차/인원/입실 방법 같은 숙소 이용 문의에 적합합니다.',
  },
  [INQUIRY_TYPES.SELLER_TO_ADMIN]: {
    titlePlaceholder: '예: 숙소 등록 승인 상태 확인 요청',
    contentPlaceholder: '예: 강릉 스테이봄 숙소 등록 신청 후 승인 상태가 변경되지 않아 확인 요청드립니다. 신청일은 3월 12일입니다.',
    prompts: [
      '숙소 등록 승인 상태를 확인하고 싶어요.',
      '정산 내역 확인을 요청하고 싶어요.',
      '운영 정책 문의를 남기고 싶어요.',
    ],
    reply: '숙소명, 신청일, 현재 상태나 오류 문구를 적어주시면 관리자 확인이 훨씬 쉬워집니다.',
    helper: '승인/정산/운영 정책처럼 관리자 확인이 필요한 이슈에 적합합니다.',
  },
  [INQUIRY_TYPES.COMMON_TO_ADMIN]: {
    titlePlaceholder: '예: 결제 화면에서 오류가 발생했어요',
    contentPlaceholder: '예: 예약 결제 단계에서 카드 선택 후 다음으로 넘어가지 않습니다. 사용 브라우저는 크롬이고, 오류는 오늘 오후 2시경 발생했습니다.',
    prompts: [
      '결제 화면에서 다음 단계로 넘어가지 않아요.',
      '로그인 상태가 자주 풀려요.',
      '쿠폰 적용이 안 됩니다.',
    ],
    reply: '발생 화면, 시각, 사용 기기나 브라우저를 적어주시면 원인 파악에 도움이 됩니다.',
    helper: '결제/계정/서비스 오류처럼 운영 문의가 필요한 상황에 적합합니다.',
  },
};

function getChatSeed(type) {
  const guide = GUIDE_BY_TYPE[type] || GUIDE_BY_TYPE[INQUIRY_TYPES.COMMON_TO_ADMIN];
  return [
    {
      id: `${type}-seed-1`,
      speaker: 'assistant',
      text: '안녕하세요. 문의 내용을 먼저 파악해볼게요.',
    },
    {
      id: `${type}-seed-2`,
      speaker: 'assistant',
      text: guide.reply,
    },
  ];
}

function buildAssistantReply(type, text) {
  const guide = GUIDE_BY_TYPE[type] || GUIDE_BY_TYPE[INQUIRY_TYPES.COMMON_TO_ADMIN];
  if (String(text).includes('오류') || String(text).includes('안 돼') || String(text).includes('실패')) {
    return '오류 문의군요. 발생 화면, 시각, 사용 브라우저와 함께 오류 문구나 캡처를 남겨주시면 상세 문의로 넘길 때 더 정확해집니다.';
  }
  if (type === INQUIRY_TYPES.USER_TO_SELLER) {
    return '숙소 문의로 정리하고 있어요. 예약일과 숙소명, 원하는 확인 항목을 추가하면 판매자에게 바로 전달하기 좋습니다.';
  }
  if (type === INQUIRY_TYPES.SELLER_TO_ADMIN) {
    return '운영 문의로 분류할게요. 승인 상태, 신청일, 숙소명 또는 정산 기준일을 함께 남겨주세요.';
  }
  return guide.reply;
}

export default function InquiryCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const defaultType = params.get('type') || INQUIRY_TYPES.COMMON_TO_ADMIN;
  const availableTypes = user?.role === ROLES.SELLER
    ? [INQUIRY_TYPES.SELLER_TO_ADMIN, INQUIRY_TYPES.COMMON_TO_ADMIN]
    : user?.role === ROLES.ADMIN
      ? [INQUIRY_TYPES.COMMON_TO_ADMIN]
      : [INQUIRY_TYPES.USER_TO_SELLER, INQUIRY_TYPES.COMMON_TO_ADMIN];

  const [type, setType] = useState(defaultType);
  const safeType = availableTypes.includes(type) ? type : availableTypes[0];
  const roleLabel = user?.role === ROLES.SELLER
    ? '숙소 등록자 문의'
    : user?.role === ROLES.ADMIN
      ? '관리자 문의'
      : '여행객 문의';
  const guide = GUIDE_BY_TYPE[safeType] || GUIDE_BY_TYPE[INQUIRY_TYPES.COMMON_TO_ADMIN];
  const inquiryListPath = user?.role === ROLES.SELLER
    ? '/seller/inquiries'
    : user?.role === ROLES.ADMIN
      ? '/admin/inquiries'
      : '/my/inquiries';
  const inquiryListLabel = user?.role === ROLES.SELLER
    ? '판매자 문의 관리'
    : user?.role === ROLES.ADMIN
      ? '관리자 문의 목록'
      : '마이페이지 → 내 문의';
  const receiverLabel = safeType === INQUIRY_TYPES.USER_TO_SELLER
    ? '판매자'
    : '운영팀';
  const supportTone = safeType === INQUIRY_TYPES.USER_TO_SELLER
    ? '숙소 이용 전 확인이 필요한 내용을 먼저 정리해두면 답변이 빨라집니다.'
    : safeType === INQUIRY_TYPES.SELLER_TO_ADMIN
      ? '승인, 정산, 운영 정책처럼 확인 주체가 명확한 내용 위주로 남기면 처리 흐름이 깔끔합니다.'
      : '오류 화면, 발생 시각, 사용 환경을 같이 적으면 운영팀이 원인을 더 빠르게 좁힐 수 있습니다.';

  const [activeTab, setActiveTab] = useState(TAB.CHAT);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(() => getChatSeed(defaultType));

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const MAX_TITLE = 60;
  const MAX_CONTENT = 2000;

  const setInquiryType = (nextType) => {
    setType(nextType);
    setChatMessages(getChatSeed(nextType));
    setChatInput('');
    setError('');
  };

  const handleChatSend = () => {
    // TODO(back-end):
    // POST /api/v1/inquiries/assistant/chat
    // body example:
    // { inquiryType, message, history }
    // response example:
    // { reply, suggestedTitle, suggestedContent }
    // 지금은 프론트 mock 답변만 사용하고, 나중에 상담 페르소나/FAQ 추천 응답으로 교체하면 된다.
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const userMessage = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      text: trimmed,
    };
    const assistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      speaker: 'assistant',
      text: buildAssistantReply(safeType, trimmed),
    };
    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
    setChatInput('');
  };

  const handleMoveToForm = () => {
    // TODO(back-end):
    // 채팅 API가 suggestedTitle / suggestedContent를 내려주면
    // 아래 title/content 자동 채움 로직 대신 서버 추천값을 우선 적용하면 된다.
    const lastUserMessage = [...chatMessages].reverse().find((message) => message.speaker === 'user');
    if (lastUserMessage && !content) {
      setContent(lastUserMessage.text.slice(0, MAX_CONTENT));
    }
    if (!title) {
      setTitle(guide.titlePlaceholder.replace('예: ', '').slice(0, MAX_TITLE));
    }
    setActiveTab(TAB.FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO(back-end):
      // POST /api/v1/inquiries
      // body example:
      // { inquiryType, title, content, attachments, senderUserId }
      // attachments는 실제 운영 시 presigned URL 또는 업로드 파일 키 배열로 바꾸는 편이 안전하다.
      await createInquiry({
        inquiryType: safeType,
        title,
        content,
        attachments,
        inquiryStatus: 'PENDING',
        userId: user?.userId || 1,
        senderUserId: user?.userId || 1,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setError('');
      setDone(true);
    } catch {
      setError('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleAttach = async (e) => {
    const files = Array.from(e.target.files || []);
    const selected = files.slice(0, 3);
    try {
      const mapped = await Promise.all(
        selected.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: await fileToDataUrl(file),
        }))
      );
      // TODO(back-end):
      // 실제 운영에서는 dataUrl 저장 대신 업로드 API/스토리지 키 방식으로 교체한다.
      setAttachments(mapped);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-attach-${Date.now()}`,
          speaker: 'assistant',
          text: `이미지 ${mapped.length}장이 첨부됐어요. 오류 화면이나 확인이 필요한 부분이 잘 보이는지 확인해 주세요.`,
        },
      ]);
    } catch {
      setError('첨부파일을 읽는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (done) return (
    <div style={styles.doneWrap}>
      <div style={styles.doneInner}>
        <section style={styles.doneHero}>
          <div style={styles.doneHeroMain}>
            <div style={styles.doneIcon}>📩</div>
            <p style={styles.doneEyebrow}>INQUIRY COMPLETE</p>
            <h2 style={styles.doneTitle}>문의가 접수되었습니다</h2>
            <p style={styles.doneDesc}>답변은 {inquiryListLabel}에서 확인할 수 있습니다.</p>
            <div style={styles.doneActionRow}>
              <button onClick={() => navigate(inquiryListPath)} style={styles.submitBtn}>문의 내역 보기</button>
              <button type="button" onClick={() => navigate('/support')} style={styles.doneGhostBtn}>문의센터로 이동</button>
            </div>
          </div>
          <aside style={styles.doneHeroSide}>
            <div style={styles.doneSummaryCard}>
              <p style={styles.doneSummaryLabel}>접수 상태</p>
              <p style={styles.doneSummaryValue}>접수 완료</p>
              <p style={styles.doneSummaryText}>현재 문의 유형: {INQUIRY_TYPE_LABELS[safeType]}</p>
            </div>
          </aside>
        </section>

        <section style={styles.doneGrid}>
          <div style={styles.doneInfoCard}>
            <p style={styles.doneCardTitle}>다음 안내</p>
            <ul style={styles.doneList}>
              <li>답변이 등록되면 문의 내역에서 상태와 내용을 확인할 수 있습니다.</li>
              <li>필요하면 같은 카테고리로 추가 문의를 이어서 남길 수 있습니다.</li>
            </ul>
          </div>
          <div style={styles.doneInfoCard}>
            <p style={styles.doneCardTitle}>안내</p>
            <ul style={styles.doneList}>
              <li>첨부한 이미지와 작성한 내용은 문의 확인에 함께 활용됩니다.</li>
              <li>문의 유형에 따라 판매자 또는 운영팀이 순차적으로 답변합니다.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div style={styles.wrap}>
      <style>{`
        @media (max-width: 920px) {
          .tz-inquiry-layout { grid-template-columns: 1fr !important; }
          .tz-inquiry-side { position: static !important; top: auto !important; }
          .tz-inquiry-main { order: 1; }
          .tz-inquiry-side { order: 2; }
        }
      `}</style>
      <div style={styles.box} className="tz-inquiry-layout">
        <section className="tz-inquiry-main">
          <div style={styles.headerRow}>
            <div>
              <p style={styles.badge}>{roleLabel}</p>
              <h2 style={styles.title}>문의하기</h2>
              <p style={styles.formIntro}>실시간으로 문의 내용을 정리해보고, 필요하면 상세 문의로 접수할 수 있습니다.</p>
            </div>
          </div>

          <label style={styles.label}>문의 유형</label>
          <div style={styles.typeRow}>
            {availableTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setInquiryType(t)}
                style={{ ...styles.typeBtn, ...(safeType === t ? styles.typeBtnActive : null) }}
              >
                {INQUIRY_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div style={styles.tabRow}>
            <button
              type="button"
              onClick={() => setActiveTab(TAB.CHAT)}
              style={{ ...styles.tabBtn, ...(activeTab === TAB.CHAT ? styles.tabBtnActive : null) }}
            >
              실시간 채팅 문의
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(TAB.FORM)}
              style={{ ...styles.tabBtn, ...(activeTab === TAB.FORM ? styles.tabBtnActive : null) }}
            >
              상세 문의 남기기
            </button>
          </div>

          {activeTab === TAB.CHAT ? (
            <div style={styles.chatPanel}>
              {/* TODO(back-end): 상담 페르소나/FAQ 추천 API가 준비되면 아래 mock 채팅 흐름을 서버 응답으로 교체한다. */}
              <div style={styles.chatGuide}>
                <p style={styles.chatGuideTitle}>문의 내용을 먼저 정리해볼게요</p>
                <p style={styles.chatGuideText}>{guide.helper}</p>
              </div>
              <div style={styles.promptRow}>
                {guide.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    style={styles.promptChip}
                    onClick={() => setChatInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div style={styles.chatThread}>
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      ...styles.chatRow,
                      ...(message.speaker === 'user' ? styles.chatRowUser : styles.chatRowAssistant),
                    }}
                  >
                    {message.speaker === 'assistant' ? <span style={styles.chatAvatar}>AI</span> : null}
                    <div
                      style={{
                        ...styles.chatBubble,
                        ...(message.speaker === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant),
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.chatComposer}>
                <textarea
                  style={styles.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="문의 내용을 입력하면 AI 상담처럼 먼저 정리해드립니다."
                  rows={3}
                />
                <div style={styles.chatActions}>
                  <button type="button" style={styles.secondaryBtn} onClick={handleMoveToForm}>이 내용으로 상세 문의 작성</button>
                  <button type="button" style={styles.primaryBtn} onClick={handleChatSend}>보내기</button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.formPanel}>
              <p style={styles.formPanelIntro}>문의 내용을 자세히 남기면 운영팀이나 판매자가 답변하기 쉬워집니다.</p>
              <label style={styles.label}>제목</label>
              <input
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                required
                placeholder={guide.titlePlaceholder}
              />
              <p style={styles.counter}>{title.length} / {MAX_TITLE}</p>

              <label style={styles.label}>내용</label>
              <textarea
                style={{ ...styles.input, minHeight: '230px', resize: 'vertical' }}
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
                required
                placeholder={guide.contentPlaceholder}
              />
              <p style={styles.counter}>{content.length} / {MAX_CONTENT}</p>

              <label style={styles.label}>첨부파일 (선택)</label>
              <div style={styles.attachWrap}>
                <label htmlFor="inquiry-attachments" style={styles.attachBtn}>파일 선택</label>
                <input
                  id="inquiry-attachments"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAttach}
                  style={styles.attachInput}
                />
                <p style={styles.attachHint}>이미지 최대 3개까지 첨부 가능. 오류 화면이나 확인이 필요한 부분을 캡처해서 올리면 좋습니다.</p>
                {attachments.length > 0 && (
                  <ul style={styles.attachList}>
                    {attachments.map((file) => (
                      <li key={`${file.name}-${file.size}`} style={styles.attachItem}>{file.name} ({Math.round(file.size / 1024)}KB)</li>
                    ))}
                  </ul>
                )}
              </div>

              {error ? <p style={styles.error}>{error}</p> : null}
              <button type="submit" style={styles.submitBtn}>문의 접수</button>
            </form>
          )}
        </section>

        <aside style={styles.sideColumn} className="tz-inquiry-side">
          <div style={styles.sideCard}>
            <p style={styles.sideEyebrow}>INQUIRY GUIDE</p>
            <h3 style={styles.sideTitle}>{INQUIRY_TYPE_LABELS[safeType]}</h3>
            <p style={styles.sideDesc}>{supportTone}</p>
            <div style={styles.sideMetaList}>
              <div style={styles.sideMetaItem}>
                <span style={styles.sideMetaLabel}>전달 대상</span>
                <strong style={styles.sideMetaValue}>{receiverLabel}</strong>
              </div>
              <div style={styles.sideMetaItem}>
                <span style={styles.sideMetaLabel}>작성 방식</span>
                <strong style={styles.sideMetaValue}>{activeTab === TAB.CHAT ? '채팅 정리 후 접수' : '상세 문의 바로 작성'}</strong>
              </div>
              <div style={styles.sideMetaItem}>
                <span style={styles.sideMetaLabel}>첨부 상태</span>
                <strong style={styles.sideMetaValue}>{attachments.length > 0 ? `${attachments.length}개 첨부됨` : '첨부 없음'}</strong>
              </div>
            </div>
          </div>

          <div style={styles.sideSoftCard}>
            <p style={styles.sideSoftTitle}>작성 팁</p>
            <ul style={styles.sideList}>
              <li>언제 발생했는지 먼저 적으면 답변 방향이 빨라집니다.</li>
              <li>예약일, 숙소명, 오류 화면처럼 확인 기준이 되는 정보를 함께 적어주세요.</li>
              <li>채팅에서 먼저 정리한 뒤 상세 문의로 넘기면 제목과 본문을 잡기 쉽습니다.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  doneWrap: { minHeight: 'calc(100vh - 160px)', padding: '40px 24px 64px', background: 'linear-gradient(180deg, #FBF8F6 0%, #F3EFEC 100%)' },
  doneInner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'grid', gap: '18px' },
  doneHero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.72fr)', gap: '18px', alignItems: 'stretch' },
  doneHeroMain: { padding: '34px', borderRadius: '30px', background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 52%, #F7F7FF 100%)', border: '1px solid #EEE3DD', boxShadow: '0 18px 42px rgba(15,23,42,0.06)' },
  doneHeroSide: { display: 'flex' },
  doneIcon: { fontSize: '42px', marginBottom: '12px' },
  doneEyebrow: { margin: '0 0 10px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.14em', color: '#D45759' },
  doneTitle: { margin: '0 0 10px', fontSize: '38px', lineHeight: 1.08, color: '#1F1F1F', fontWeight: 800 },
  doneDesc: { margin: '0 0 22px', fontSize: '15px', lineHeight: 1.8, color: '#595959', maxWidth: '760px' },
  doneActionRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  doneGhostBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', background: '#fff', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '999px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', textDecoration: 'none' },
  doneSummaryCard: { width: '100%', padding: '28px', borderRadius: '30px', background: 'linear-gradient(145deg, #FFF2EF 0%, #F6E9E4 58%, #F4ECEA 100%)', border: '1px solid #E9DAD3', boxShadow: '0 18px 40px rgba(120,74,56,0.10)' },
  doneSummaryLabel: { margin: '0 0 10px', fontSize: '12px', color: '#C75B5D', fontWeight: 800, letterSpacing: '0.12em' },
  doneSummaryValue: { margin: '0 0 10px', fontSize: '30px', color: '#1F1F1F', fontWeight: 800 },
  doneSummaryText: { margin: 0, fontSize: '14px', color: '#9B5C37', fontWeight: 700 },
  doneGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  doneInfoCard: { padding: '22px', borderRadius: '24px', background: '#FFFCFB', border: '1px solid #EEE4DE' },
  doneCardTitle: { margin: '0 0 12px', fontSize: '16px', color: '#222', fontWeight: 800 },
  doneList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', fontSize: '14px', color: '#666', lineHeight: 1.7 },
  wrap: { display: 'flex', justifyContent: 'center', padding: '42px 24px' },
  box: {
    width: '100%',
    maxWidth: '1180px',
    background: '#fff',
    border: '1px solid #ece6e6',
    borderRadius: '18px',
    padding: '28px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    alignItems: 'start',
    gap: '24px',
    boxShadow: '0 14px 28px rgba(0,0,0,0.06)',
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '8px' },
  badge: {
    margin: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    borderRadius: '999px',
    background: '#FFEEEE',
    color: '#B93E40',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1,
    padding: '8px 12px',
  },
  title: { fontSize: '26px', fontWeight: 800, margin: '10px 0 10px', textAlign: 'left' },
  formIntro: { margin: 0, color: '#667085', fontSize: '14px', lineHeight: 1.7, textAlign: 'left' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', marginTop: '14px', textAlign: 'left' },
  typeRow: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginTop: '6px' },
  typeBtn: {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    background: '#fff',
    color: '#505050',
    padding: '11px 10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  typeBtnActive: {
    borderColor: '#E8484A',
    background: '#FFF3F3',
    color: '#C13A3D',
    boxShadow: 'inset 0 0 0 1px #E8484A',
  },
  tabRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' },
  tabBtn: {
    border: '1px solid #E5E7EB',
    borderRadius: '999px',
    background: '#fff',
    color: '#667085',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  tabBtnActive: {
    borderColor: '#E8484A',
    background: '#FFF1F1',
    color: '#C13A3D',
  },
  chatPanel: {
    marginTop: '16px',
    border: '1px solid #ECEFF4',
    borderRadius: '18px',
    background: 'linear-gradient(180deg, #FFF9F8 0%, #FFFFFF 100%)',
    padding: '18px',
    display: 'grid',
    gap: '14px',
  },
  chatGuide: { display: 'grid', gap: '6px' },
  chatGuideTitle: { margin: 0, fontSize: '16px', color: '#242424', fontWeight: 800 },
  chatGuideText: { margin: 0, fontSize: '13px', color: '#667085', lineHeight: 1.7 },
  promptRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  promptChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #FFD9DA',
    borderRadius: '999px',
    background: '#FFF4F4',
    color: '#B93E40',
    fontSize: '12px',
    fontWeight: 800,
    padding: '8px 11px',
    cursor: 'pointer',
  },
  chatThread: {
    display: 'grid',
    gap: '10px',
    minHeight: '260px',
    maxHeight: '360px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  chatRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  chatRowAssistant: { justifySelf: 'start' },
  chatRowUser: { justifySelf: 'end', flexDirection: 'row-reverse' },
  chatAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#1F2937',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 800,
    flexShrink: 0,
  },
  chatBubble: {
    borderRadius: '16px',
    padding: '12px 14px',
    fontSize: '13px',
    lineHeight: 1.7,
    wordBreak: 'keep-all',
  },
  chatBubbleAssistant: {
    background: '#FFFFFF',
    border: '1px solid #E8EBF1',
    color: '#374151',
  },
  chatBubbleUser: {
    background: '#FFF1F1',
    color: '#B93E40',
    border: '1px solid #FFD9DA',
  },
  chatComposer: { display: 'grid', gap: '10px' },
  chatInput: {
    width: '100%',
    padding: '12px 12px',
    border: '1px solid #dcdfe5',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: '#fff',
  },
  chatActions: { display: 'flex', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'none',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    background: '#fff',
    color: '#4B5563',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'none',
  },
  formPanel: { marginTop: '16px' },
  formPanelIntro: { margin: '0 0 8px', color: '#667085', fontSize: '14px', lineHeight: 1.7 },
  input: {
    width: '100%',
    padding: '12px 12px',
    border: '1px solid #dcdfe5',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  counter: {
    margin: '6px 0 0',
    fontSize: '12px',
    color: '#9097A3',
    textAlign: 'right',
    fontWeight: 600,
  },
  attachWrap: {
    marginTop: '4px',
    border: '1px dashed #D7DCE4',
    borderRadius: '10px',
    padding: '12px',
    background: '#FAFBFD',
  },
  attachBtn: {
    display: 'inline-flex',
    borderRadius: '8px',
    border: '1px solid #E3E7EE',
    background: '#fff',
    color: '#4A5363',
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  attachInput: { display: 'none' },
  attachHint: { margin: '10px 0 0', color: '#7D8796', fontSize: '12px' },
  attachList: { margin: '10px 0 0', padding: '0 0 0 16px', color: '#4F5764', fontSize: '12px', lineHeight: 1.6 },
  attachItem: { marginBottom: '2px' },
  error: { margin: '10px 0 0', fontSize: '13px', color: '#DC2626', textAlign: 'left', fontWeight: 600 },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    fontSize: '15px',
  },
  sideColumn: {
    position: 'sticky',
    top: '96px',
    display: 'grid',
    gap: '14px',
    alignSelf: 'start',
  },
  sideCard: {
    padding: '22px',
    borderRadius: '24px',
    background: 'linear-gradient(160deg, #FFF5F2 0%, #FFFDFB 54%, #F7F2EF 100%)',
    border: '1px solid #EEDFD8',
    boxShadow: '0 16px 36px rgba(104, 65, 48, 0.08)',
    display: 'grid',
    gap: '14px',
  },
  sideEyebrow: {
    margin: 0,
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.14em',
    color: '#D45759',
  },
  sideTitle: {
    margin: 0,
    fontSize: '24px',
    lineHeight: 1.2,
    color: '#1F1F1F',
    fontWeight: 800,
  },
  sideDesc: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.75,
    color: '#6B5B54',
  },
  sideMetaList: {
    display: 'grid',
    gap: '10px',
  },
  sideMetaItem: {
    display: 'grid',
    gap: '4px',
    padding: '12px 14px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #F0E3DD',
  },
  sideMetaLabel: {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: '#C46A5C',
  },
  sideMetaValue: {
    fontSize: '14px',
    color: '#272727',
    fontWeight: 700,
  },
  sideSoftCard: {
    padding: '20px',
    borderRadius: '22px',
    background: '#FFFCFB',
    border: '1px solid #EFE5DF',
    display: 'grid',
    gap: '10px',
  },
  sideSoftTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 800,
    color: '#222',
  },
  sideList: {
    margin: 0,
    paddingLeft: '18px',
    display: 'grid',
    gap: '8px',
    fontSize: '13px',
    color: '#5F5F5F',
    lineHeight: 1.7,
  },
};
