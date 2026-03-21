import { useMemo, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import SectionNav from '../../components/common/SectionNav';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_REWARDS = [
  { id: 1, type: 'COUPON', name: '봄 시즌 15% 쿠폰', target: '전체 회원', status: 'ISSUED', effect: '최대 30,000원 할인' },
  { id: 2, type: 'MILEAGE', name: '등급 보상 마일리지', target: '골드 회원', status: 'SCHEDULED', effect: '5,000P 적립 예정' },
  { id: 3, type: 'COUPON', name: '재방문 감사 쿠폰', target: '재구매 고객', status: 'DRAFT', effect: '최대 20,000원 할인' },
];
const ADMIN_SECTION_ITEMS = [
  { to: '/admin', label: '대시보드', match: (pathname) => pathname === '/admin' },
  { to: '/admin/users', label: '회원 관리', match: (pathname) => pathname.startsWith('/admin/users') },
  { to: '/admin/sellers', label: '호스트 승인', match: (pathname) => pathname.startsWith('/admin/sellers') },
  { to: '/admin/inquiries', label: '문의 처리', match: (pathname) => pathname.startsWith('/admin/inquiries') },
  { to: '/admin/rewards', label: '쿠폰·마일리지', match: (pathname) => pathname.startsWith('/admin/rewards') },
  { to: '/admin/events', label: '이벤트 관리', match: (pathname) => pathname.startsWith('/admin/events') },
];

export default function AdminRewardsPage() {
  const [rows, setRows] = useState(MOCK_REWARDS);
  const [selectedId, setSelectedId] = useState(MOCK_REWARDS[0]?.id ?? null);
  const [adminNote, setAdminNote] = useState('');
  const [rewardModal, setRewardModal] = useState(null);
  const [rewardForm, setRewardForm] = useState({ type: 'COUPON', name: '', target: '', effect: '', status: 'ISSUED' });
  const issuedCount = rows.filter((row) => row.status === 'ISSUED').length;
  const scheduledCount = rows.filter((row) => row.status === 'SCHEDULED').length;
  const couponCount = rows.filter((row) => row.type === 'COUPON').length;

  const selectedReward = useMemo(
    () => rows.find((row) => row.id === selectedId) || null,
    [rows, selectedId],
  );

  const updateStatus = (id, status) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  const openRewardModal = (mode) => {
    setRewardForm({
      type: mode === 'mileage' ? 'MILEAGE' : 'COUPON',
      name: '',
      target: '',
      effect: '',
      status: mode === 'mileage' ? 'SCHEDULED' : 'ISSUED',
    });
    setRewardModal(mode);
  };

  const submitReward = () => {
    if (!rewardForm.name.trim() || !rewardForm.target.trim() || !rewardForm.effect.trim()) return;
    const nextId = rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    const nextRow = { id: nextId, ...rewardForm };
    setRows((prev) => [nextRow, ...prev]);
    setSelectedId(nextId);
    setRewardModal(null);
  };

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    {
      key: 'type',
      label: '유형',
      width: '120px',
      render: (row) => (
        <StatusBadge
          label={row.type === 'COUPON' ? '쿠폰' : '마일리지'}
          background={row.type === 'COUPON' ? '#FFF1F1' : '#EEF6FF'}
          color={row.type === 'COUPON' ? '#D33A3D' : '#2563EB'}
        />
      ),
    },
    { key: 'name', label: '이름' },
    { key: 'target', label: '대상', width: '180px' },
    { key: 'effect', label: '혜택 내용', width: '180px' },
    {
      key: 'status',
      label: '상태',
      width: '140px',
      render: (row) => (
        <StatusBadge
          label={statusLabelMap[row.status]}
          background={statusToneMap[row.status].background}
          color={statusToneMap[row.status].color}
        />
      ),
    },
    {
      key: 'actions',
      label: '관리',
      width: '210px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedId(row.id); setAdminNote(''); }}>상세 보기</button>
          <button
            type="button"
            style={row.status === 'ISSUED' ? styles.warnBtn : styles.primaryBtn}
            onClick={() => updateStatus(row.id, row.status === 'ISSUED' ? 'DRAFT' : 'ISSUED')}
          >
            {row.status === 'ISSUED' ? '발급 중지' : '즉시 발급'}
          </button>
        </div>
      ),
    },
  ];

  const insightCards = [
    {
      title: '지금 바로 확인',
      value: issuedCount ? `${issuedCount}건 발급 중` : '발급 중 정책 없음',
      description: '메인/상세 유입에서 실제로 보일 혜택을 우선 점검합니다.',
    },
    {
      title: '다음 배포 준비',
      value: scheduledCount ? `${scheduledCount}건 예약 발급` : '예약 발급 없음',
      description: '노출 시점과 대상 회원 조건이 어색하지 않은지 확인합니다.',
    },
  ];

  return (
    <div style={styles.wrap}>
      <style>{`
        @media (max-width: 920px) {
          .tz-admin-reward-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-admin-reward-summary {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <SectionNav items={ADMIN_SECTION_ITEMS} />
      <section style={styles.hero} className="tz-admin-reward-hero">
        <div style={styles.heroMain}>
          <p style={styles.eyebrow}>BENEFIT OPERATIONS</p>
          <h1 style={styles.heroTitle}>쿠폰 · 마일리지 운영 보드</h1>
          <p style={styles.heroDesc}>발급 중 혜택, 예약 발급 예정 정책, 쿠폰 중심 운영량을 먼저 파악한 뒤 표 작업으로 들어가도록 정리했습니다.</p>
        </div>
        <div style={styles.summaryGrid} className="tz-admin-reward-summary">
          <article style={styles.summaryCard}>
            <span style={styles.summaryLabel}>발급 중</span>
            <strong style={styles.summaryValue}>{issuedCount}건</strong>
          </article>
          <article style={{ ...styles.summaryCard, ...styles.summaryScheduled }}>
            <span style={styles.summaryLabel}>예약 발급</span>
            <strong style={styles.summaryValue}>{scheduledCount}건</strong>
          </article>
          <article style={{ ...styles.summaryCard, ...styles.summaryAccent }}>
            <span style={styles.summaryLabel}>쿠폰 정책</span>
            <strong style={styles.summaryValueAccent}>{couponCount}건</strong>
          </article>
        </div>
      </section>
      <ListPageHeader
        title="쿠폰 · 마일리지 관리"
        description="쿠폰 발급 상태와 마일리지 정책을 한 화면에서 확인하고 관리합니다."
        actions={(
          <>
            <button type="button" style={rewardModal === 'coupon' ? styles.primaryHeaderBtn : styles.secondaryHeaderBtn} onClick={() => openRewardModal('coupon')}>쿠폰 발급</button>
            <button type="button" style={rewardModal === 'mileage' ? styles.primaryHeaderBtn : styles.secondaryHeaderBtn} onClick={() => openRewardModal('mileage')}>마일리지 조정</button>
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
        emptyText="등록된 혜택 정책이 없습니다."
        emptyDescription="쿠폰 발급이나 마일리지 정책이 추가되면 이곳에서 운영할 수 있습니다."
      />
      {rewardModal ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHead}>
              <div>
                <p style={styles.modalEyebrow}>{rewardModal === 'coupon' ? 'COUPON ISSUE' : 'MILEAGE ADJUST'}</p>
                <h2 style={styles.modalTitle}>{rewardModal === 'coupon' ? '쿠폰 발급' : '마일리지 조정'}</h2>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setRewardModal(null)}>닫기</button>
            </div>
            <div style={styles.formGrid}>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>정책 이름</span>
                <input style={styles.input} value={rewardForm.name} onChange={(event) => setRewardForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="예: 신규 회원 웰컴 쿠폰" />
              </label>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>대상</span>
                <input style={styles.input} value={rewardForm.target} onChange={(event) => setRewardForm((prev) => ({ ...prev, target: event.target.value }))} placeholder="예: 전체 회원" />
              </label>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>상태</span>
                <select style={styles.select} value={rewardForm.status} onChange={(event) => setRewardForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="DRAFT">초안</option>
                  <option value="SCHEDULED">예약 발급</option>
                  <option value="ISSUED">발급 중</option>
                </select>
              </label>
              <label style={styles.field}>
                <span style={styles.fieldLabel}>혜택 내용</span>
                <input style={styles.input} value={rewardForm.effect} onChange={(event) => setRewardForm((prev) => ({ ...prev, effect: event.target.value }))} placeholder={rewardModal === 'coupon' ? '예: 최대 20,000원 할인' : '예: 3,000P 적립'} />
              </label>
            </div>
            <div style={styles.modalActions}>
              <button type="button" style={styles.secondaryHeaderBtn} onClick={() => setRewardModal(null)}>취소</button>
              <button type="button" style={styles.primaryHeaderBtn} onClick={submitReward}>{rewardModal === 'coupon' ? '쿠폰 추가' : '조정 반영'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedReward ? (
        <AdminActionPanel
          title={`${selectedReward.name} 관리`}
          subtitle="혜택 대상, 적용 내용, 발급 상태를 확인하고 운영 메모를 남길 수 있습니다."
          fields={[
            { label: '유형', value: selectedReward.type === 'COUPON' ? '쿠폰' : '마일리지' },
            { label: '대상', value: selectedReward.target },
            { label: '혜택', value: selectedReward.effect },
            { label: '상태', value: statusLabelMap[selectedReward.status] },
          ]}
          note={adminNote}
          onNoteChange={setAdminNote}
          notePlaceholder="발급 조건, 노출 기간, 등급 정책 메모를 남겨보세요."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedId(null)}>닫기</button>
              <button type="button" style={styles.secondaryHeaderBtn} onClick={() => updateStatus(selectedReward.id, 'SCHEDULED')}>예약 발급</button>
              <button type="button" style={styles.primaryHeaderBtn} onClick={() => updateStatus(selectedReward.id, 'ISSUED')}>발급 반영</button>
            </>
          )}
        />
      ) : null}
    </div>
  );
}

const statusLabelMap = {
  DRAFT: '초안',
  SCHEDULED: '예약 발급',
  ISSUED: '발급 중',
};

const statusToneMap = {
  DRAFT: { background: '#F3F4F6', color: '#4B5563' },
  SCHEDULED: { background: '#FFF7E6', color: '#B45309' },
  ISSUED: { background: '#DCFCE7', color: '#166534' },
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
    background: 'linear-gradient(145deg, #FFF7F3 0%, #FFFFFF 54%, #F6F7FF 100%)',
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
  summaryScheduled: { background: '#FFF8E1', borderColor: '#F0D792' },
  summaryAccent: {
    background: 'linear-gradient(145deg, #FFF1EE 0%, #FFF9F7 55%, #F7F3EF 100%)',
    borderColor: '#EFD9D2',
  },
  summaryLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  summaryValue: { fontSize: '26px', lineHeight: 1.1, color: '#111111' },
  summaryValueAccent: { fontSize: '26px', lineHeight: 1.1, color: '#2F3640' },
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
  warnBtn: { border: 'none', borderRadius: '999px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
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
