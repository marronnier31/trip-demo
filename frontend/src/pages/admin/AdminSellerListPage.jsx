import { useEffect, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import SectionNav from '../../components/common/SectionNav';
import StatusBadge from '../../components/common/StatusBadge';

const ADMIN_SECTION_ITEMS = [
  { to: '/admin', label: '대시보드', match: (pathname) => pathname === '/admin' },
  { to: '/admin/users', label: '회원 관리', match: (pathname) => pathname.startsWith('/admin/users') },
  { to: '/admin/sellers', label: '호스트 승인', match: (pathname) => pathname.startsWith('/admin/sellers') },
  { to: '/admin/inquiries', label: '문의 처리', match: (pathname) => pathname.startsWith('/admin/inquiries') },
  { to: '/admin/rewards', label: '쿠폰·마일리지', match: (pathname) => pathname.startsWith('/admin/rewards') },
  { to: '/admin/events', label: '이벤트 관리', match: (pathname) => pathname.startsWith('/admin/events') },
];

const MOCK_SELLERS = [
  { sellerId: 1, name: '김판매', email: 'seller1@test.com', businessName: '제주 숙소 운영', approvalStatus: 'APPROVED', createdAt: '2026-01-05' },
  { sellerId: 2, name: '박사장', email: 'seller2@test.com', businessName: '경남 리조트', approvalStatus: 'APPROVED', createdAt: '2026-02-10' },
  { sellerId: 3, name: '최신규', email: 'seller3@test.com', businessName: '강원 펜션', approvalStatus: 'PENDING', createdAt: '2026-03-01' },
  { sellerId: 4, name: '문반려', email: 'seller4@test.com', businessName: '서울 시티 스테이', approvalStatus: 'REJECTED', createdAt: '2026-03-03' },
];

const STATUS_COLOR = { APPROVED: '#dcfce7', PENDING: '#fef9c3', REJECTED: '#fee2e2' };
const STATUS_LABEL = { APPROVED: '승인', PENDING: '대기', REJECTED: '거절' };

export default function AdminSellerListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    // TODO(back-end):
    // GET /api/v1/admin/sellers
    // response item example:
    // { sellerId, name, email, businessName, approvalStatus, createdAt }
    // approvalStatus는 APPROVED | PENDING | REJECTED 기준으로 내려주면 현재 badge와 액션을 그대로 재사용할 수 있다.
    setRows(MOCK_SELLERS);
    setLoading(false);
  }, []);

  const selectedSeller = rows.find((row) => row.sellerId === selectedSellerId) || null;
  const approvedCount = rows.filter((row) => row.approvalStatus === 'APPROVED').length;
  const pendingCount = rows.filter((row) => row.approvalStatus === 'PENDING').length;
  const rejectedCount = rows.filter((row) => row.approvalStatus === 'REJECTED').length;

  const updateSellerStatus = (sellerId, approvalStatus) => {
    // TODO(back-end):
    // PATCH /api/v1/admin/sellers/{sellerId}/approval
    // body: { approvalStatus, note }
    // success response example:
    // { sellerId, approvalStatus, reviewedAt, reviewedBy }
    // 현재 reviewNote는 승인/반려 사유 메모이며, 서버 저장 시 함께 넘기면 된다.
    setRows((prev) => prev.map((row) => (row.sellerId === sellerId ? { ...row, approvalStatus } : row)));
  };

  const columns = [
    { key: 'sellerId', label: 'ID', width: '90px' },
    { key: 'name', label: '이름' },
    { key: 'email', label: '이메일' },
    { key: 'businessName', label: '사업체명' },
    {
      key: 'approvalStatus',
      label: '상태',
      width: '110px',
      render: (row) => (
        <StatusBadge
          label={STATUS_LABEL[row.approvalStatus]}
          background={STATUS_COLOR[row.approvalStatus]}
          color={row.approvalStatus === 'APPROVED' ? '#166534' : row.approvalStatus === 'PENDING' ? '#854D0E' : '#B91C1C'}
        />
      ),
    },
    { key: 'createdAt', label: '가입일', width: '120px' },
    {
      key: 'actions',
      label: '관리',
      width: '240px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedSellerId(row.sellerId); setReviewNote(''); }}>상세 보기</button>
          {row.approvalStatus !== 'APPROVED' ? (
            <button type="button" style={styles.primaryBtn} onClick={() => updateSellerStatus(row.sellerId, 'APPROVED')}>승인</button>
          ) : null}
          {row.approvalStatus !== 'REJECTED' ? (
            <button type="button" style={styles.warnBtn} onClick={() => updateSellerStatus(row.sellerId, 'REJECTED')}>반려</button>
          ) : null}
          {row.approvalStatus === 'REJECTED' ? (
            <button type="button" style={styles.secondaryBtn} onClick={() => updateSellerStatus(row.sellerId, 'PENDING')}>승인 복구</button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.wrap}>
      <style>{`
        @media (max-width: 920px) {
          .tz-admin-seller-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-admin-seller-summary {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <SectionNav items={ADMIN_SECTION_ITEMS} />
      <section style={styles.hero} className="tz-admin-seller-hero">
        <div style={styles.heroMain}>
          <p style={styles.eyebrow}>HOST REVIEW FLOW</p>
          <h1 style={styles.heroTitle}>호스트 승인 보드</h1>
          <p style={styles.heroDesc}>승인 대기, 반려 복구, 사업체 검토 흐름을 먼저 요약해서 보여주도록 정리했습니다.</p>
        </div>
        <div style={styles.summaryGrid} className="tz-admin-seller-summary">
          <article style={styles.summaryCard}>
            <span style={styles.summaryLabel}>승인 완료</span>
            <strong style={styles.summaryValue}>{approvedCount}명</strong>
          </article>
          <article style={{ ...styles.summaryCard, ...styles.summaryPending }}>
            <span style={styles.summaryLabel}>검토 대기</span>
            <strong style={styles.summaryValue}>{pendingCount}명</strong>
          </article>
          <article style={{ ...styles.summaryCard, ...styles.summaryRejected }}>
            <span style={styles.summaryLabel}>반려 상태</span>
            <strong style={styles.summaryValue}>{rejectedCount}명</strong>
          </article>
        </div>
      </section>
      <ListPageHeader title="판매자 목록" description={`현재 ${rows.length}명의 판매자 신청/승인 상태를 관리 중입니다.`} />
      <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyText="등록된 판매자가 없습니다." emptyDescription="판매자 신청이 들어오면 사업체명과 승인 상태를 여기서 검토할 수 있습니다." />
      {selectedSeller ? (
        <AdminActionPanel
          title={`${selectedSeller.name} 판매자 검토`}
          subtitle="판매자 정보와 승인 상태를 확인하고 검토 메모를 남길 수 있습니다."
          fields={[
            { label: '이메일', value: selectedSeller.email },
            { label: '사업체명', value: selectedSeller.businessName },
            { label: '승인 상태', value: STATUS_LABEL[selectedSeller.approvalStatus] },
            { label: '가입일', value: selectedSeller.createdAt },
          ]}
          note={reviewNote}
          onNoteChange={setReviewNote}
          notePlaceholder="승인/반려 사유를 메모로 남겨보세요."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedSellerId(null)}>닫기</button>
              <button type="button" style={styles.secondaryBtn} onClick={() => updateSellerStatus(selectedSeller.sellerId, 'PENDING')}>{selectedSeller.approvalStatus === 'REJECTED' ? '승인 복구' : '보류'}</button>
              <button type="button" style={styles.primaryBtn} onClick={() => updateSellerStatus(selectedSeller.sellerId, 'APPROVED')}>승인</button>
              <button type="button" style={styles.warnBtn} onClick={() => updateSellerStatus(selectedSeller.sellerId, 'REJECTED')}>반려</button>
            </>
          )}
        />
      ) : null}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 1fr)',
    gap: '18px',
    marginBottom: '24px',
    padding: '30px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF7F3 0%, #FFFFFF 54%, #FFFBEF 100%)',
    border: '1px solid #EFE4DE',
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
  summaryPending: { background: '#FFF8E1', borderColor: '#F0D792' },
  summaryRejected: { background: '#FFF1F2', borderColor: '#F7C8D0' },
  summaryLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  summaryValue: { fontSize: '26px', lineHeight: 1.1, color: '#111111' },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  ghostBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  secondaryBtn: { border: 'none', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  warnBtn: { border: 'none', borderRadius: '999px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
};
