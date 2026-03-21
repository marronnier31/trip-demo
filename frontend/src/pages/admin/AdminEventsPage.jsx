import { useMemo, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import SectionNav from '../../components/common/SectionNav';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_EVENTS = [
  { id: 1, title: '제주 봄 여행전', period: '2026-03-15 ~ 2026-04-15', exposure: '메인 배너', status: 'LIVE' },
  { id: 2, title: '신규 회원 웰컴 이벤트', period: '2026-03-01 ~ 2026-03-31', exposure: '이벤트 탭', status: 'SCHEDULED' },
  { id: 3, title: '벚꽃 시즌 특가전', period: '2026-04-01 ~ 2026-04-20', exposure: '홈 중단 카드', status: 'DRAFT' },
];
const ADMIN_SECTION_ITEMS = [
  { to: '/admin', label: '대시보드', match: (pathname) => pathname === '/admin' },
  { to: '/admin/users', label: '회원 관리', match: (pathname) => pathname.startsWith('/admin/users') },
  { to: '/admin/sellers', label: '호스트 승인', match: (pathname) => pathname.startsWith('/admin/sellers') },
  { to: '/admin/inquiries', label: '문의 처리', match: (pathname) => pathname.startsWith('/admin/inquiries') },
  { to: '/admin/rewards', label: '쿠폰·마일리지', match: (pathname) => pathname.startsWith('/admin/rewards') },
  { to: '/admin/events', label: '이벤트 관리', match: (pathname) => pathname.startsWith('/admin/events') },
];

export default function AdminEventsPage() {
  const [rows, setRows] = useState(MOCK_EVENTS);
  const [selectedId, setSelectedId] = useState(MOCK_EVENTS[0]?.id ?? null);
  const [adminNote, setAdminNote] = useState('');
  const [eventModal, setEventModal] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', period: '', exposure: '', status: 'DRAFT' });
  const liveCount = rows.filter((row) => row.status === 'LIVE').length;
  const scheduledCount = rows.filter((row) => row.status === 'SCHEDULED').length;
  const draftCount = rows.filter((row) => row.status === 'DRAFT').length;

  const selectedEvent = useMemo(
    () => rows.find((row) => row.id === selectedId) || null,
    [rows, selectedId],
  );

  const updateStatus = (id, status) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  const openEventModal = (mode) => {
    if (mode === 'edit' && selectedEvent) {
      setEventForm({
        title: selectedEvent.title,
        period: selectedEvent.period,
        exposure: selectedEvent.exposure,
        status: selectedEvent.status,
      });
      setEventModal('edit');
      return;
    }

    setEventForm({ title: '', period: '', exposure: '', status: 'DRAFT' });
    setEventModal('create');
  };

  const submitEvent = () => {
    if (!eventForm.title.trim() || !eventForm.period.trim() || !eventForm.exposure.trim()) return;

    if (eventModal === 'edit' && selectedEvent) {
      setRows((prev) => prev.map((row) => (row.id === selectedEvent.id ? { ...row, ...eventForm } : row)));
      setEventModal(null);
      return;
    }

    const nextId = rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    const nextRow = { id: nextId, ...eventForm };
    setRows((prev) => [nextRow, ...prev]);
    setSelectedId(nextId);
    setEventModal(null);
  };

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'title', label: '이벤트명' },
    { key: 'period', label: '운영 기간', width: '220px' },
    { key: 'exposure', label: '노출 위치', width: '160px' },
    {
      key: 'status',
      label: '상태',
      width: '140px',
      render: (row) => (
        <StatusBadge
          label={eventStatusLabelMap[row.status]}
          background={eventStatusToneMap[row.status].background}
          color={eventStatusToneMap[row.status].color}
        />
      ),
    },
    {
      key: 'actions',
      label: '관리',
      width: '230px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedId(row.id); setAdminNote(''); }}>상세 보기</button>
          <button type="button" style={styles.primaryBtn} onClick={() => updateStatus(row.id, nextEventStatus(row.status))}>상태 변경</button>
        </div>
      ),
    },
  ];

  const insightCards = [
    {
      title: '메인 배너 상태',
      value: rows.find((row) => row.exposure === '메인 배너')?.title || '설정 없음',
      description: '홈 첫 화면에 노출되는 대표 이벤트 문맥을 우선 확인합니다.',
    },
    {
      title: '다음 전환 대상',
      value: scheduledCount ? `${scheduledCount}건 예정` : '예정 이벤트 없음',
      description: '예정 -> 진행중 전환 전 노출 문구와 기간을 최종 점검합니다.',
    },
  ];

  return (
    <div style={styles.wrap}>
      <style>{`
        @media (max-width: 920px) {
          .tz-admin-event-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-admin-event-summary {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <SectionNav items={ADMIN_SECTION_ITEMS} />
      <section style={styles.hero} className="tz-admin-event-hero">
        <div style={styles.heroMain}>
          <p style={styles.eyebrow}>CAMPAIGN CONTROL</p>
          <h1 style={styles.heroTitle}>이벤트 운영 보드</h1>
          <p style={styles.heroDesc}>진행 중 캠페인, 예정 이벤트, 초안 상태를 먼저 요약해서 운영 일정과 노출 상태를 빠르게 판단할 수 있게 정리했습니다.</p>
        </div>
        <div style={styles.summaryGrid} className="tz-admin-event-summary">
          <article style={{ ...styles.summaryCard, ...styles.summaryLive }}>
            <span style={styles.summaryLabel}>진행 중</span>
            <strong style={styles.summaryValue}>{liveCount}건</strong>
          </article>
          <article style={{ ...styles.summaryCard, ...styles.summaryScheduled }}>
            <span style={styles.summaryLabel}>예정</span>
            <strong style={styles.summaryValue}>{scheduledCount}건</strong>
          </article>
          <article style={styles.summaryCard}>
            <span style={styles.summaryLabel}>초안</span>
            <strong style={styles.summaryValue}>{draftCount}건</strong>
          </article>
        </div>
      </section>
      <ListPageHeader
        title="이벤트 관리"
        description="진행 중 이벤트와 예정 캠페인의 상태를 한 화면에서 확인하고 관리합니다."
        actions={(
          <>
            <button type="button" style={eventModal === 'create' ? styles.primaryHeaderBtn : styles.secondaryHeaderBtn} onClick={() => openEventModal('create')}>이벤트 등록</button>
            <button type="button" style={eventModal === 'edit' ? styles.primaryHeaderBtn : styles.secondaryHeaderBtn} onClick={() => openEventModal('edit')}>이벤트 수정</button>
          </>
        )}
      />

      <section style={styles.insightGrid}>
        {insightCards.map((item) => (
          <article key={item.title} style={styles.insightCard}>
            <p style={styles.insightLabel}>{item.title}</p>
            <h3 style={styles.insightValue}>{item.value}</h3>
            <p style={styles.insightDesc}>{item.description}</p>
          </article>
        ))}
      </section>

      <DataTable
        columns={columns}
        rows={rows}
        loading={false}
        error=""
        emptyText="등록된 이벤트가 없습니다."
        emptyDescription="프로모션이나 시즌 기획전이 추가되면 이곳에서 상태를 관리할 수 있습니다."
      />
      {eventModal ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHead}>
              <div>
                <p style={styles.modalEyebrow}>{eventModal === 'create' ? 'EVENT CREATE' : 'EVENT EDIT'}</p>
                <h2 style={styles.modalTitle}>{eventModal === 'create' ? '이벤트 등록' : '이벤트 수정'}</h2>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setEventModal(null)}>닫기</button>
            </div>
            <div style={styles.formGrid}>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>이벤트명</span>
                <input style={styles.input} value={eventForm.title} onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="예: 여름 숙박 기획전" />
              </label>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>운영 기간</span>
                <input style={styles.input} value={eventForm.period} onChange={(event) => setEventForm((prev) => ({ ...prev, period: event.target.value }))} placeholder="예: 2026-06-01 ~ 2026-06-30" />
              </label>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>노출 위치</span>
                <input style={styles.input} value={eventForm.exposure} onChange={(event) => setEventForm((prev) => ({ ...prev, exposure: event.target.value }))} placeholder="예: 메인 배너" />
              </label>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>상태</span>
                <select style={styles.select} value={eventForm.status} onChange={(event) => setEventForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="DRAFT">초안</option>
                  <option value="SCHEDULED">예정</option>
                  <option value="LIVE">진행중</option>
                  <option value="ENDED">종료</option>
                </select>
              </label>
            </div>
            <div style={styles.modalActions}>
              <button type="button" style={styles.secondaryHeaderBtn} onClick={() => setEventModal(null)}>취소</button>
              <button type="button" style={styles.primaryHeaderBtn} onClick={submitEvent}>{eventModal === 'create' ? '이벤트 추가' : '수정 반영'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedEvent ? (
        <AdminActionPanel
          title={`${selectedEvent.title} 운영 설정`}
          subtitle="이벤트 기간, 노출 위치, 현재 상태를 확인하고 운영 메모를 남길 수 있습니다."
          fields={[
            { label: '이벤트명', value: selectedEvent.title },
            { label: '운영 기간', value: selectedEvent.period },
            { label: '노출 위치', value: selectedEvent.exposure },
            { label: '상태', value: eventStatusLabelMap[selectedEvent.status] },
          ]}
          note={adminNote}
          onNoteChange={setAdminNote}
          notePlaceholder="배너 노출 위치, 시작일 조정, 이벤트 복구 메모를 남겨보세요."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedId(null)}>닫기</button>
              <button type="button" style={styles.secondaryHeaderBtn} onClick={() => updateStatus(selectedEvent.id, 'DRAFT')}>초안으로</button>
              <button type="button" style={styles.primaryHeaderBtn} onClick={() => updateStatus(selectedEvent.id, nextEventStatus(selectedEvent.status))}>다음 상태로</button>
            </>
          )}
        />
      ) : null}
    </div>
  );
}

function nextEventStatus(status) {
  if (status === 'DRAFT') return 'SCHEDULED';
  if (status === 'SCHEDULED') return 'LIVE';
  return 'ENDED';
}

const eventStatusLabelMap = {
  DRAFT: '초안',
  SCHEDULED: '예정',
  LIVE: '진행중',
  ENDED: '종료',
};

const eventStatusToneMap = {
  DRAFT: { background: '#F3F4F6', color: '#4B5563' },
  SCHEDULED: { background: '#FFF7E6', color: '#B45309' },
  LIVE: { background: '#DCFCE7', color: '#166534' },
  ENDED: { background: '#EFF6FF', color: '#1D4ED8' },
};

const styles = {
  wrap: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 1fr)',
    gap: '18px',
    marginBottom: '24px',
    padding: '30px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF7F2 0%, #FFFFFF 54%, #F7FBFF 100%)',
    border: '1px solid #EEE4E0',
    boxShadow: '0 18px 40px rgba(17,17,17,0.05)',
  },
  heroMain: { display: 'flex', flexDirection: 'column', gap: '10px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', color: '#E8484A' },
  heroTitle: { margin: 0, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#111111' },
  heroDesc: { margin: 0, fontSize: '15px', lineHeight: 1.75, color: '#555555', maxWidth: '680px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' },
  summaryCard: {
    padding: '18px',
    borderRadius: '22px',
    background: '#FFFFFFD9',
    border: '1px solid #ECE8E4',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryLive: { background: '#EEFDF5', borderColor: '#BBF7D0' },
  summaryScheduled: { background: '#FFF8E1', borderColor: '#F0D792' },
  summaryLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  summaryValue: { fontSize: '26px', lineHeight: 1.1, color: '#111111' },
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  insightCard: {
    padding: '20px 22px',
    borderRadius: '22px',
    background: '#FFFFFF',
    border: '1px solid #ECE8E4',
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  insightLabel: { margin: '0 0 8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', color: '#8A7B7B' },
  insightValue: { margin: '0 0 8px', fontSize: '24px', lineHeight: 1.25, color: '#111111' },
  insightDesc: { margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#555555' },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  primaryHeaderBtn: {
    border: 'none',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 800,
    padding: '9px 14px',
    cursor: 'pointer',
  },
  secondaryHeaderBtn: {
    border: '1px solid #E5E7EB',
    borderRadius: '999px',
    background: '#fff',
    color: '#374151',
    fontSize: '12px',
    fontWeight: 800,
    padding: '9px 14px',
    cursor: 'pointer',
  },
  ghostBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#EEF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.36)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 320 },
  modalCard: { width: 'min(720px, 100%)', background: '#fff', borderRadius: '28px', border: '1px solid #EFE4E1', boxShadow: '0 24px 48px rgba(15,23,42,0.16)', padding: '28px' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' },
  modalEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', color: '#E8484A' },
  modalTitle: { margin: 0, fontSize: '28px', lineHeight: 1.1, color: '#111111' },
  closeBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '9px 14px', cursor: 'pointer' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginBottom: '20px' },
  field: { display: 'grid', gap: '8px' },
  fieldLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  input: { height: '44px', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '0 14px', fontSize: '14px', color: '#111111', background: '#fff', outline: 'none' },
  select: { height: '44px', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '0 14px', fontSize: '14px', color: '#111111', background: '#fff', outline: 'none' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
};
