import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SectionNav from '../../components/common/SectionNav';

const MOCK_THREADS = {
  1: {
    inquiryId: 1,
    title: '주차 공간이 있나요?',
    senderName: '홍길동',
    lodgingName: '강릉 해변 펜션',
    inquiryStatus: 'PENDING',
    messages: [
      { id: 1, speaker: 'guest', text: '안녕하세요. 차량 2대로 방문 예정인데 주차가 가능할까요?', time: '09:12' },
      { id: 2, speaker: 'seller', text: '안녕하세요. 기본 1대는 무료이고, 추가 1대는 사전 요청 시 가능합니다.', time: '09:16' },
      { id: 3, speaker: 'guest', text: '추가 차량도 문제없다면 예약 진행하려고 합니다.', time: '09:19' },
    ],
  },
  2: {
    inquiryId: 2,
    title: '체크인 시간 문의',
    senderName: '김철수',
    lodgingName: '부산 광안리 게스트하우스',
    inquiryStatus: 'ANSWERED',
    messages: [
      { id: 1, speaker: 'guest', text: '오늘 체크인이 22시 이후가 될 것 같은데 가능할까요?', time: '18:02' },
      { id: 2, speaker: 'seller', text: '네, 셀프 체크인 안내를 보내드릴 수 있습니다.', time: '18:05' },
      { id: 3, speaker: 'guest', text: '감사합니다. 안내 부탁드립니다.', time: '18:06' },
    ],
  },
};

const STATUS_LABEL = { ANSWERED: '답변 완료', PENDING: '대기 중' };
const SELLER_SECTION_ITEMS = [
  { to: '/seller', label: '대시보드', match: (pathname) => pathname === '/seller' },
  { to: '/seller/lodgings', label: '숙소 관리', match: (pathname) => pathname.startsWith('/seller/lodgings') },
  { to: '/seller/reservations', label: '예약 관리', match: (pathname) => pathname.startsWith('/seller/reservations') },
  { to: '/seller/inquiries', label: '문의 관리', match: (pathname) => pathname.startsWith('/seller/inquiries') },
];

export default function SellerInquiryChatPage() {
  const { inquiryId } = useParams();
  const [draft, setDraft] = useState('');
  const [threads, setThreads] = useState(MOCK_THREADS);

  const inquiry = useMemo(() => threads[inquiryId] || null, [threads, inquiryId]);

  const handleSend = () => {
    if (!draft.trim() || !inquiry) return;
    setThreads((prev) => ({
      ...prev,
      [inquiryId]: {
        ...prev[inquiryId],
        inquiryStatus: 'ANSWERED',
        messages: [
          ...prev[inquiryId].messages,
          {
            id: prev[inquiryId].messages.length + 1,
            speaker: 'seller',
            text: draft.trim(),
            time: '방금',
          },
        ],
      },
    }));
    setDraft('');
  };

  if (!inquiry) {
    return (
      <div style={styles.wrap}>
        <div style={styles.emptyCard}>
          <h2 style={styles.emptyTitle}>문의 대화를 찾을 수 없습니다.</h2>
          <Link to="/seller/inquiries" style={styles.backBtn}>문의 목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <SectionNav items={SELLER_SECTION_ITEMS} />
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>SELLER CHAT</p>
          <h1 style={styles.title}>{inquiry.title}</h1>
          <p style={styles.subtitle}>{inquiry.lodgingName} · {inquiry.senderName} 고객과의 문의 대화입니다.</p>
        </div>
        <div style={styles.headerActions}>
          <span style={{ ...styles.statusPill, ...(inquiry.inquiryStatus === 'ANSWERED' ? styles.statusAnswered : styles.statusPending) }}>
            {STATUS_LABEL[inquiry.inquiryStatus]}
          </span>
          <Link to="/seller/inquiries" style={styles.backBtn}>문의 목록</Link>
        </div>
      </div>

      <div style={styles.layout}>
        <section style={styles.chatPanel}>
          <div style={styles.chatGuide}>
            <strong style={styles.chatGuideTitle}>문의 대화 화면</strong>
            <p style={styles.chatGuideText}>고객과 주고받은 문의 내용을 시간순으로 확인하고 바로 답변할 수 있습니다.</p>
          </div>

          <div style={styles.chatThread}>
            {inquiry.messages.map((message) => (
              <div
                key={message.id}
                style={{
                  ...styles.chatRow,
                  ...(message.speaker === 'seller' ? styles.chatRowSeller : styles.chatRowGuest),
                }}
              >
                <div
                  style={{
                    ...styles.chatBubble,
                    ...(message.speaker === 'seller' ? styles.chatBubbleSeller : styles.chatBubbleGuest),
                  }}
                >
                  <p style={styles.chatText}>{message.text}</p>
                  <span style={styles.chatTime}>{message.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.composer}>
            <textarea
              style={styles.textarea}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="문의 답변을 입력하세요."
            />
            <div style={styles.composerActions}>
              <button type="button" style={styles.secondaryBtn} onClick={() => setDraft('체크인 전에 다시 한 번 안내 메시지를 드리겠습니다.')}>빠른 답변</button>
              <button type="button" style={styles.primaryBtn} onClick={handleSend}>답변 보내기</button>
            </div>
          </div>
        </section>

        <aside style={styles.sideCard}>
          <h2 style={styles.sideTitle}>문의 요약</h2>
          <div style={styles.metaList}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>문의 번호</span>
              <span style={styles.metaValue}>#{inquiry.inquiryId}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>고객명</span>
              <span style={styles.metaValue}>{inquiry.senderName}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>숙소명</span>
              <span style={styles.metaValue}>{inquiry.lodgingName}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>현재 상태</span>
              <span style={styles.metaValue}>{STATUS_LABEL[inquiry.inquiryStatus]}</span>
            </div>
          </div>

          <div style={styles.noteBox}>
            <p style={styles.noteTitle}>처리 체크 포인트</p>
            <ul style={styles.noteList}>
              <li>고객 요청 사항이 정확히 반영됐는지 확인</li>
              <li>체크인/시설/환불 문의는 답변 내용을 구체적으로 안내</li>
              <li>답변 후 상태와 후속 안내 일정을 함께 점검</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: '1120px', margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '24px' },
  eyebrow: { margin: '0 0 8px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: '#D45759' },
  title: { margin: '0 0 8px', fontSize: '30px', fontWeight: 900, letterSpacing: '-0.03em', color: '#1F1F1F' },
  subtitle: { margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#667085' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  statusPill: { padding: '9px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 },
  statusAnswered: { background: '#DCFCE7', color: '#166534' },
  statusPending: { background: '#FEF9C3', color: '#854D0E' },
  backBtn: { textDecoration: 'none', padding: '9px 14px', borderRadius: '999px', border: '1px solid #E5E7EB', color: '#374151', background: '#fff', fontSize: '13px', fontWeight: 700 },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.7fr)', gap: '20px' },
  chatPanel: { border: '1px solid #E5E7EB', borderRadius: '22px', background: '#fff', padding: '22px', display: 'grid', gap: '16px' },
  chatGuide: { display: 'grid', gap: '6px' },
  chatGuideTitle: { fontSize: '16px', color: '#242424', fontWeight: 800 },
  chatGuideText: { margin: 0, fontSize: '13px', color: '#667085', lineHeight: 1.7 },
  chatThread: {
    minHeight: '360px',
    maxHeight: '520px',
    overflowY: 'auto',
    borderRadius: '18px',
    padding: '16px',
    background: 'linear-gradient(180deg, #FBFBFB 0%, #F7F7F7 100%)',
    display: 'grid',
    gap: '12px',
  },
  chatRow: { display: 'flex' },
  chatRowGuest: { justifyContent: 'flex-start' },
  chatRowSeller: { justifyContent: 'flex-end' },
  chatBubble: { maxWidth: '72%', borderRadius: '18px', padding: '12px 14px', display: 'grid', gap: '6px', boxShadow: '0 8px 18px rgba(17, 24, 39, 0.06)' },
  chatBubbleGuest: { background: '#fff', border: '1px solid #E5E7EB', color: '#2B2B2B' },
  chatBubbleSeller: { background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff' },
  chatText: { margin: 0, fontSize: '14px', lineHeight: 1.65 },
  chatTime: { fontSize: '11px', opacity: 0.78, justifySelf: 'end' },
  composer: { display: 'grid', gap: '10px' },
  textarea: { width: '100%', minHeight: '110px', padding: '12px 14px', border: '1px solid #D0D5DD', borderRadius: '14px', fontSize: '14px', lineHeight: 1.6, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  composerActions: { display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' },
  primaryBtn: { border: 'none', borderRadius: '12px', padding: '12px 16px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer' },
  secondaryBtn: { border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px', background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  sideCard: { border: '1px solid #E5E7EB', borderRadius: '22px', background: '#fff', padding: '22px', display: 'grid', alignSelf: 'start', gap: '16px' },
  sideTitle: { margin: 0, fontSize: '18px', fontWeight: 800, color: '#1F1F1F' },
  metaList: { display: 'grid', gap: '12px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', gap: '14px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' },
  metaLabel: { fontSize: '12px', fontWeight: 700, color: '#667085' },
  metaValue: { fontSize: '14px', fontWeight: 700, color: '#1F2937', textAlign: 'right' },
  noteBox: { borderRadius: '16px', background: '#FAFAFA', border: '1px solid #ECECEC', padding: '16px' },
  noteTitle: { margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#222' },
  noteList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', fontSize: '13px', lineHeight: 1.6, color: '#666' },
  emptyCard: { maxWidth: '520px', margin: '80px auto', border: '1px solid #E5E7EB', borderRadius: '22px', background: '#fff', padding: '28px', textAlign: 'center' },
  emptyTitle: { margin: '0 0 16px', fontSize: '24px', fontWeight: 800, color: '#1F2937' },
};
