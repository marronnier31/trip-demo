import { useEffect, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import SectionNav from '../../components/common/SectionNav';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_RESERVATIONS = [
  { bookingId: 1, lodgingName: '한라산 뷰 펜션', guestName: '홍길동', checkIn: '2026-04-10', checkOut: '2026-04-12', guests: 2, totalPrice: 240000, bookingStatus: 'PENDING' },
  { bookingId: 2, lodgingName: '남해 바다 리조트', guestName: '김철수', checkIn: '2026-04-20', checkOut: '2026-04-22', guests: 4, totalPrice: 380000, bookingStatus: 'CONFIRMED' },
  { bookingId: 3, lodgingName: '강릉 해변 호텔', guestName: '이영희', checkIn: '2026-03-15', checkOut: '2026-03-17', guests: 2, totalPrice: 300000, bookingStatus: 'CANCELLED' },
];

const STATUS_LABEL = { CONFIRMED: '예약 확정', CANCELLED: '취소', PENDING: '대기' };
const STATUS_COLOR = { CONFIRMED: '#dcfce7', CANCELLED: '#fee2e2', PENDING: '#fef9c3' };
const SELLER_SECTION_ITEMS = [
  { to: '/seller', label: '대시보드', match: (pathname) => pathname === '/seller' },
  { to: '/seller/lodgings', label: '숙소 관리', match: (pathname) => pathname.startsWith('/seller/lodgings') },
  { to: '/seller/reservations', label: '예약 관리', match: (pathname) => pathname.startsWith('/seller/reservations') },
  { to: '/seller/inquiries', label: '문의 관리', match: (pathname) => pathname.startsWith('/seller/inquiries') },
];

export default function SellerReservationListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [sellerNote, setSellerNote] = useState('');

  useEffect(() => {
    // TODO(back-end): 판매자 예약 현황 API 응답으로 교체
    setRows(MOCK_RESERVATIONS);
    setLoading(false);
  }, []);

  const selectedBooking = rows.find((row) => row.bookingId === selectedBookingId) || null;

  const updateBookingStatus = (bookingId, bookingStatus) => {
    setRows((prev) => prev.map((row) => (row.bookingId === bookingId ? { ...row, bookingStatus } : row)));
  };

  const columns = [
    {
      key: 'lodgingName',
      label: '숙소',
      width: '190px',
      render: (row) => <span style={styles.lodgingName}>{row.lodgingName}</span>,
    },
    { key: 'guestName', label: '예약자', width: '120px' },
    { key: 'checkIn', label: '체크인', width: '108px' },
    { key: 'checkOut', label: '체크아웃', width: '108px' },
    { key: 'guests', label: '인원', width: '90px', render: (row) => `${row.guests}명` },
    { key: 'totalPrice', label: '금액', width: '108px', render: (row) => `${row.totalPrice.toLocaleString()}원` },
    {
      key: 'bookingStatus',
      label: '상태',
      width: '110px',
      render: (row) => (
        <StatusBadge
          label={STATUS_LABEL[row.bookingStatus]}
          background={STATUS_COLOR[row.bookingStatus]}
          color={row.bookingStatus === 'CONFIRMED' ? '#166534' : row.bookingStatus === 'PENDING' ? '#854D0E' : '#B91C1C'}
        />
      ),
    },
    {
      key: 'actions',
      label: '관리',
      width: '210px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedBookingId(row.bookingId); setSellerNote(''); }}>상세 보기</button>
          {row.bookingStatus !== 'CONFIRMED' ? (
            <button type="button" style={styles.primaryBtn} onClick={() => updateBookingStatus(row.bookingId, 'CONFIRMED')}>예약 확인</button>
          ) : null}
          {row.bookingStatus !== 'CANCELLED' ? (
            <button type="button" style={styles.warnBtn} onClick={() => updateBookingStatus(row.bookingId, 'CANCELLED')}>예약 취소</button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.wrap}>
      <SectionNav items={SELLER_SECTION_ITEMS} />
      <ListPageHeader title="예약 현황" description={`총 ${rows.length}건의 예약 상태를 관리 중입니다.`} />
      <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyText="표시할 예약이 없습니다." emptyDescription="새 예약이 들어오면 체크인 일정과 결제 금액을 이 목록에서 바로 볼 수 있습니다." />
      {selectedBooking ? (
        <AdminActionPanel
          title={`${selectedBooking.guestName} 예약 처리`}
          subtitle="설계의 예약 확인·취소 흐름을 먼저 프론트 액션으로 구성했습니다."
          fields={[
            { label: '숙소', value: selectedBooking.lodgingName },
            { label: '예약자', value: selectedBooking.guestName },
            { label: '체크인', value: selectedBooking.checkIn },
            { label: '체크아웃', value: selectedBooking.checkOut },
            { label: '인원', value: `${selectedBooking.guests}명` },
            { label: '상태', value: STATUS_LABEL[selectedBooking.bookingStatus] },
          ]}
          note={sellerNote}
          onNoteChange={setSellerNote}
          notePlaceholder="확정/취소 사유를 메모해두세요."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedBookingId(null)}>닫기</button>
              <button type="button" style={styles.primaryBtn} onClick={() => updateBookingStatus(selectedBooking.bookingId, 'CONFIRMED')}>예약 확인</button>
              <button type="button" style={styles.warnBtn} onClick={() => updateBookingStatus(selectedBooking.bookingId, 'CANCELLED')}>예약 취소</button>
            </>
          )}
        />
      ) : null}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' },
  lodgingName: {
    display: 'inline-block',
    minWidth: '150px',
    whiteSpace: 'nowrap',
  },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  ghostBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  warnBtn: { border: 'none', borderRadius: '999px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
};
