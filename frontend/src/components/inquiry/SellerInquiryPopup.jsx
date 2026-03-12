import { useMemo, useState } from 'react';
import { C, R } from '../../styles/tokens';

const TOPIC_OPTIONS = [
  { value: 'checkin', label: '체크인 문의' },
  { value: 'parking', label: '주차 문의' },
  { value: 'room', label: '객실/인원 문의' },
  { value: 'etc', label: '기타 문의' },
];

function buildInitialMessages(lodging, user) {
  return [
    {
      id: 'seller-intro',
      role: 'seller',
      text: `${lodging?.name || '숙소'} 호스트입니다. 궁금한 내용을 남겨주시면 확인 후 빠르게 안내드릴게요.`,
    },
    {
      id: 'guest-intro',
      role: 'guest',
      text: `${user?.name || '고객'} 님 문의를 준비했어요. 체크인 일정이나 확인이 필요한 내용을 남겨보세요.`,
    },
  ];
}

function getSellerReply(topic, lodging) {
  if (topic === 'checkin') {
    return `체크인은 15:00 이후부터 가능하고, ${lodging?.name || '숙소'} 입실 방법은 예약 확정 후 다시 안내드리고 있어요.`;
  }
  if (topic === 'parking') {
    return '주차 가능 여부와 대수는 예약일 기준으로 다시 확인해드릴게요. 차량 수와 도착 예정 시간을 함께 알려주세요.';
  }
  if (topic === 'room') {
    return '기준 인원과 추가 인원 가능 여부를 먼저 확인해드릴게요. 투숙 인원과 아동 동반 여부를 남겨주세요.';
  }
  return '문의 내용을 확인했어요. 숙소 이용일, 확인이 필요한 항목을 조금 더 자세히 남겨주시면 판매자가 응답하기 쉬워집니다.';
}

export default function SellerInquiryPopup({ lodging, user, onClose }) {
  const [topic, setTopic] = useState('checkin');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(() => buildInitialMessages(lodging, user));
  const [submitState, setSubmitState] = useState('');
  const [note, setNote] = useState('');

  const sellerName = useMemo(() => {
    if (!lodging?.name) return '호스트';
    return `${lodging.name} 호스트`;
  }, [lodging?.name]);

  const handleQuickTopic = (nextTopic) => {
    setTopic(nextTopic);
    setMessages((current) => [
      ...current,
      {
        id: `topic-${nextTopic}-${Date.now()}`,
        role: 'guest',
        text: TOPIC_OPTIONS.find((item) => item.value === nextTopic)?.label || '문의 주제',
      },
      {
        id: `seller-${nextTopic}-${Date.now() + 1}`,
        role: 'seller',
        text: getSellerReply(nextTopic, lodging),
      },
    ]);
    setSubmitState('');
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    // TODO(back-end):
    // 1) POST /api/v1/lodgings/{lodgingId}/seller-inquiries/rooms
    //    body: { topic, reservationContext, firstMessage }
    //    response: { roomId, sellerId, sellerName, createdAt }
    // 2) POST /api/v1/seller-inquiries/{roomId}/messages
    //    body: { senderType: "USER", message }
    //    response: { messageId, senderType, message, createdAt }
    // 3) GET /api/v1/seller-inquiries/{roomId}/messages
    //    response: [{ messageId, senderType, message, createdAt }]
    // 현재는 프론트 시현용 mock 대화만 append 한다.
    setMessages((current) => [
      ...current,
      { id: `guest-${Date.now()}`, role: 'guest', text: trimmed },
      { id: `seller-${Date.now() + 1}`, role: 'seller', text: getSellerReply(topic, lodging) },
    ]);
    setDraft('');
    setSubmitState('판매자에게 문의가 전달된 형태로 시현 중입니다.');
  };

  const handleCreateNote = () => {
    if (!note.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: `note-${Date.now()}`,
        role: 'system',
        text: `상세 문의 메모가 정리되었습니다. 판매자가 확인할 수 있도록 "${note.trim()}" 내용을 함께 전달해둘게요.`,
      },
    ]);
    setNote('');
    setSubmitState('상세 문의 메모가 대화에 정리되었습니다.');
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(event) => event.stopPropagation()}>
        <div style={s.header}>
          <div>
            <p style={s.kicker}>판매자 전용 문의</p>
            <h3 style={s.title}>{sellerName}에게 바로 문의하기</h3>
            <p style={s.desc}>사이트 운영 문의와 분리된 숙소 전용 채팅형 문의입니다.</p>
          </div>
          <button type="button" style={s.closeBtn} onClick={onClose}>닫기</button>
        </div>

        <div style={s.topicRow}>
          {TOPIC_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              style={{ ...s.topicChip, ...(topic === option.value ? s.topicChipActive : null) }}
              onClick={() => handleQuickTopic(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div style={s.chatPanel}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...s.messageRow,
                ...(message.role === 'guest' ? s.messageRowGuest : null),
                ...(message.role === 'system' ? s.messageRowSystem : null),
              }}
            >
              <div
                style={{
                  ...s.messageBubble,
                  ...(message.role === 'guest' ? s.messageBubbleGuest : null),
                  ...(message.role === 'system' ? s.messageBubbleSystem : null),
                }}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div style={s.inputWrap}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`${lodging?.name || '숙소'} 관련해서 판매자에게 바로 확인하고 싶은 내용을 입력하세요.`}
            style={s.textarea}
            rows={4}
          />
          <div style={s.inputActions}>
            <span style={s.helper}>예약일, 인원, 확인 항목을 같이 적으면 응답이 빨라집니다.</span>
            <button type="button" style={s.sendBtn} onClick={handleSend}>문의 보내기</button>
          </div>
        </div>

        <div style={s.noteBox}>
          <p style={s.noteTitle}>추가로 남길 상세 메모</p>
          <p style={s.noteDesc}>실시간 문의 외에 전달해야 할 내용을 한 줄 메모로 함께 정리할 수 있습니다.</p>
          <div style={s.noteRow}>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="예: 4월 20일 체크인 예정 / 주차 2대 필요"
              style={s.noteInput}
            />
            <button type="button" style={s.noteBtn} onClick={handleCreateNote}>메모 추가</button>
          </div>
        </div>

        {submitState ? <p style={s.submitState}>{submitState}</p> : null}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.42)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 400,
  },
  modal: {
    width: 'min(760px, 100%)',
    maxHeight: 'min(88vh, 920px)',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
    padding: '28px',
    fontFamily: 'Manrope, "Noto Sans KR", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
    marginBottom: '18px',
  },
  kicker: {
    margin: '0 0 8px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#C2410C',
    letterSpacing: '0.04em',
  },
  title: { margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: C.text, lineHeight: 1.25 },
  desc: { margin: 0, fontSize: '14px', color: C.textSub, lineHeight: 1.6 },
  closeBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  topicRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' },
  topicChip: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.textSub,
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  topicChipActive: {
    borderColor: '#E8484A',
    background: '#FFF2F2',
    color: '#C2410C',
  },
  chatPanel: {
    display: 'grid',
    gap: '10px',
    padding: '18px',
    border: `1px solid ${C.borderLight}`,
    borderRadius: R.lg,
    background: 'linear-gradient(180deg, #FCFCFC 0%, #F7F7F7 100%)',
    minHeight: '260px',
    marginBottom: '16px',
  },
  messageRow: { display: 'flex', justifyContent: 'flex-start' },
  messageRowGuest: { justifyContent: 'flex-end' },
  messageRowSystem: { justifyContent: 'center' },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: '18px',
    padding: '12px 14px',
    background: '#fff',
    border: `1px solid ${C.borderLight}`,
    color: C.text,
    fontSize: '14px',
    lineHeight: 1.6,
  },
  messageBubbleGuest: {
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    borderColor: '#E8484A',
  },
  messageBubbleSystem: {
    background: '#F3F4F6',
    color: '#4B5563',
    borderColor: '#E5E7EB',
    fontSize: '13px',
  },
  inputWrap: {
    border: `1px solid ${C.borderLight}`,
    borderRadius: R.lg,
    padding: '14px',
    background: '#fff',
  },
  textarea: {
    width: '100%',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    minHeight: '96px',
    fontSize: '14px',
    color: C.text,
    fontFamily: 'inherit',
    lineHeight: 1.7,
  },
  inputActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  helper: { fontSize: '12px', color: C.textSub, lineHeight: 1.5 },
  sendBtn: {
    border: 'none',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    borderRadius: '999px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  noteBox: {
    marginTop: '16px',
    padding: '16px 18px',
    borderRadius: R.lg,
    border: `1px solid ${C.borderLight}`,
    background: '#FCFCFC',
  },
  noteTitle: { margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: C.text },
  noteDesc: { margin: '0 0 12px', fontSize: '13px', color: C.textSub, lineHeight: 1.6 },
  noteRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  noteInput: {
    flex: 1,
    minWidth: '220px',
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '11px 12px',
    fontSize: '13px',
    color: C.text,
    outline: 'none',
  },
  noteBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '12px',
    padding: '11px 13px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  submitState: {
    margin: '14px 2px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#15803D',
  },
};
