import { useState } from 'react';
import { INQUIRY_TYPE_LABELS } from '../../constants/inquiryTypes';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import FilterChips from '../../components/common/FilterChips';
import ListPageHeader from '../../components/common/ListPageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_INQUIRIES = [
  { inquiryId: 1, senderName: '홍길동', inquiryType: 'USER_TO_SELLER', title: '주차 가능한가요?', inquiryStatus: 'PENDING', createdAt: '2026-03-01', content: '체크인 당일 차량 1대 이용 예정입니다. 주차 가능 여부를 확인하고 싶습니다.' },
  { inquiryId: 2, senderName: '김판매', inquiryType: 'SELLER_TO_ADMIN', title: '숙소 등록 오류 문의', inquiryStatus: 'ANSWERED', createdAt: '2026-03-02', content: '숙소 등록 화면에서 저장 후 목록에 반영되지 않습니다.' },
  { inquiryId: 3, senderName: '이영희', inquiryType: 'COMMON_TO_ADMIN', title: '로그인이 안 됩니다', inquiryStatus: 'PENDING', createdAt: '2026-03-04', content: '크롬 브라우저에서 로그인 후 곧바로 세션이 종료됩니다.' },
  { inquiryId: 4, senderName: '박사장', inquiryType: 'SELLER_TO_ADMIN', title: '정산 관련 문의', inquiryStatus: 'PENDING', createdAt: '2026-03-05', content: '이번 주 예약 정산 내역과 예상 지급일을 확인하고 싶습니다.' },
];

const STATUS_COLOR = { ANSWERED: '#dcfce7', PENDING: '#fef9c3' };
const STATUS_LABEL = { ANSWERED: '답변 완료', PENDING: '대기 중' };

export default function AdminInquiryListPage() {
  const [filter, setFilter] = useState('ALL');
  const [rows, setRows] = useState(MOCK_INQUIRIES);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [replyNote, setReplyNote] = useState('');
  const [loading] = useState(false);
  const [error] = useState('');

  const filtered = filter === 'ALL' ? rows : rows.filter(i => i.inquiryType === filter);
  const selectedInquiry = rows.find((row) => row.inquiryId === selectedInquiryId) || null;
  const filterItems = [
    { value: 'ALL', label: '전체' },
    { value: 'USER_TO_SELLER', label: INQUIRY_TYPE_LABELS.USER_TO_SELLER },
    { value: 'SELLER_TO_ADMIN', label: INQUIRY_TYPE_LABELS.SELLER_TO_ADMIN },
    { value: 'COMMON_TO_ADMIN', label: INQUIRY_TYPE_LABELS.COMMON_TO_ADMIN },
  ];

  const updateInquiryStatus = (inquiryId, inquiryStatus) => {
    // TODO(back-end):
    // PATCH /api/v1/admin/inquiries/{inquiryId}
    // body: { inquiryStatus, adminNote }
    // success response example:
    // { inquiryId, inquiryStatus, answeredAt, answeredBy }
    // 현재 replyNote는 관리자 답변 메모 입력값이며, 서버 저장 시 함께 전송하면 된다.
    setRows((prev) => prev.map((row) => (row.inquiryId === inquiryId ? { ...row, inquiryStatus } : row)));
  };

  const columns = [
    { key: 'senderName', label: '문의자', width: '120px' },
    { key: 'inquiryType', label: '유형', render: (row) => INQUIRY_TYPE_LABELS[row.inquiryType] },
    { key: 'title', label: '제목' },
    {
      key: 'inquiryStatus',
      label: '상태',
      width: '110px',
      render: (row) => (
        <StatusBadge
          label={STATUS_LABEL[row.inquiryStatus]}
          background={STATUS_COLOR[row.inquiryStatus]}
          color={row.inquiryStatus === 'ANSWERED' ? '#166534' : '#854D0E'}
        />
      ),
    },
    { key: 'createdAt', label: '접수일', width: '120px' },
    {
      key: 'actions',
      label: '관리',
      width: '240px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedInquiryId(row.inquiryId); setReplyNote(''); }}>상세 보기</button>
          {row.inquiryStatus === 'PENDING' ? (
            <button type="button" style={styles.primaryBtn} onClick={() => updateInquiryStatus(row.inquiryId, 'ANSWERED')}>답변 완료</button>
          ) : (
            <button type="button" style={styles.secondaryBtn} onClick={() => updateInquiryStatus(row.inquiryId, 'PENDING')}>대기 전환</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.wrap}>
      <ListPageHeader
        title="문의 관리"
        description={`현재 필터 기준 ${filtered.length}건의 문의가 보입니다.`}
        actions={<FilterChips items={filterItems} value={filter} onChange={setFilter} />}
      />
      <DataTable columns={columns} rows={filtered} loading={loading} error={error} emptyText="조건에 맞는 문의가 없습니다." emptyDescription="필터를 바꾸거나 새 문의가 들어오면 이 목록에서 바로 확인할 수 있습니다." />
      {selectedInquiry ? (
        <AdminActionPanel
          title={selectedInquiry.title}
          subtitle={selectedInquiry.content}
          fields={[
            { label: '문의자', value: selectedInquiry.senderName },
            { label: '유형', value: INQUIRY_TYPE_LABELS[selectedInquiry.inquiryType] },
            { label: '상태', value: STATUS_LABEL[selectedInquiry.inquiryStatus] },
            { label: '접수일', value: selectedInquiry.createdAt },
          ]}
          note={replyNote}
          onNoteChange={setReplyNote}
          notePlaceholder="관리자 답변 메모를 입력해 보세요. 현재는 프론트 시현용입니다."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedInquiryId(null)}>닫기</button>
              <button type="button" style={styles.secondaryBtn} onClick={() => updateInquiryStatus(selectedInquiry.inquiryId, 'PENDING')}>대기 전환</button>
              <button type="button" style={styles.primaryBtn} onClick={() => updateInquiryStatus(selectedInquiry.inquiryId, 'ANSWERED')}>답변 완료</button>
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
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
};
