import { useEffect, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_SELLERS = [
  { sellerId: 1, name: '김판매', email: 'seller1@test.com', businessName: '제주 숙소 운영', approvalStatus: 'APPROVED', createdAt: '2026-01-05' },
  { sellerId: 2, name: '박사장', email: 'seller2@test.com', businessName: '경남 리조트', approvalStatus: 'APPROVED', createdAt: '2026-02-10' },
  { sellerId: 3, name: '최신규', email: 'seller3@test.com', businessName: '강원 펜션', approvalStatus: 'PENDING', createdAt: '2026-03-01' },
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
        </div>
      ),
    },
  ];

  return (
    <div style={styles.wrap}>
      <ListPageHeader title="판매자 목록" description={`현재 ${rows.length}명의 판매자 신청/승인 상태를 관리 중입니다.`} />
      <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyText="등록된 판매자가 없습니다." emptyDescription="판매자 신청이 들어오면 사업체명과 승인 상태를 여기서 검토할 수 있습니다." />
      {selectedSeller ? (
        <AdminActionPanel
          title={`${selectedSeller.name} 판매자 검토`}
          subtitle="승인/반려와 메모 입력은 프론트 시현용입니다. 실제 운영 반영은 백엔드 승인 API가 담당합니다."
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
              <button type="button" style={styles.secondaryBtn} onClick={() => updateSellerStatus(selectedSeller.sellerId, 'PENDING')}>보류</button>
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
  wrap: { maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  ghostBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  secondaryBtn: { border: 'none', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  warnBtn: { border: 'none', borderRadius: '999px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
};
