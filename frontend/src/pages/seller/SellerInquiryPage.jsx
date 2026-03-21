import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import SectionNav from '../../components/common/SectionNav';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_RECEIVED = [
  { inquiryId: 1, title: '주차 공간이 있나요?', senderName: '홍길동', inquiryStatus: 'PENDING', createdAt: '2026-03-02' },
  { inquiryId: 2, title: '체크인 시간 문의', senderName: '김철수', inquiryStatus: 'ANSWERED', createdAt: '2026-03-04' },
];

const STATUS_LABEL = { ANSWERED: '답변 완료', PENDING: '대기 중' };
const STATUS_COLOR = { ANSWERED: '#dcfce7', PENDING: '#fef9c3' };
const SELLER_SECTION_ITEMS = [
  { to: '/seller', label: '대시보드', match: (pathname) => pathname === '/seller' },
  { to: '/seller/lodgings', label: '숙소 관리', match: (pathname) => pathname.startsWith('/seller/lodgings') },
  { to: '/seller/reservations', label: '예약 관리', match: (pathname) => pathname.startsWith('/seller/reservations') },
  { to: '/seller/inquiries', label: '문의 관리', match: (pathname) => pathname.startsWith('/seller/inquiries') },
];

export default function SellerInquiryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  useEffect(() => {
    // TODO(back-end): 판매자 문의 목록 API 응답으로 교체
    setRows(MOCK_RECEIVED);
    setLoading(false);
  }, []);

  const columns = [
    { key: 'title', label: '제목' },
    { key: 'senderName', label: '문의자', width: '120px' },
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
      label: '상세',
      width: '160px',
      render: (row) => (
        <Link to={`/seller/inquiries/${row.inquiryId}`} style={styles.chatBtn}>
          채팅 보기
        </Link>
      ),
    },
  ];

  return (
    <div style={styles.wrap}>
      <SectionNav items={SELLER_SECTION_ITEMS} />
      <ListPageHeader
        title="문의 관리"
        description={`사용자에게서 받은 문의 ${rows.length}건을 확인할 수 있습니다.`}
        actions={<Link to="/inquiry/create" style={styles.addBtn}>관리자 문의하기</Link>}
      />
      <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyText="받은 문의가 없습니다." emptyDescription="새 문의가 들어오면 제목과 답변 상태를 이곳에서 바로 확인할 수 있습니다." />
    </div>
  );
}

const styles = {
  wrap: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' },
  addBtn: { padding: '10px 16px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' },
  chatBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: '999px',
    background: '#FFF6F6',
    color: '#C13A3D',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid #F1B3B3',
  },
};
