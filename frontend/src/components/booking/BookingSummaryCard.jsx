import { C, R, S } from '../../styles/tokens';

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inY, inM, inD] = String(checkIn).split('-').map(Number);
  const [outY, outM, outD] = String(checkOut).split('-').map(Number);
  if (!inY || !inM || !inD || !outY || !outM || !outD) return 0;
  const inUtc = Date.UTC(inY, inM - 1, inD);
  const outUtc = Date.UTC(outY, outM - 1, outD);
  return Math.max(0, Math.floor((outUtc - inUtc) / 86400000));
}

export default function BookingSummaryCard({ lodging, checkIn, checkOut, guests, onBook, hideSelectionSummary = false }) {
  const nights = calcNights(checkIn, checkOut);
  const totalPrice = nights * (lodging?.pricePerNight || 0);

  return (
    <div style={s.card} className="tz-summary-card">
      <style>{`
        @media (max-width: 980px) {
          .tz-summary-card {
            position: static !important;
          }
        }
        .tz-book-btn {
          transition: transform .14s ease, box-shadow .14s ease, filter .14s ease;
        }
        .tz-book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(227, 28, 95, 0.25);
          filter: saturate(1.1);
        }
      `}</style>
      {/* 가격 헤더 */}
      <div style={s.priceRow}>
        <span style={s.price}>{lodging?.pricePerNight?.toLocaleString()}원</span>
        <span style={s.perNight}> / 1박</span>
      </div>

      <div style={s.totalHint}>
        {nights > 0
          ? `선택 일정 ${nights}박 · 총 ${totalPrice.toLocaleString()}원`
          : '체크인/체크아웃 날짜를 선택하면 총액이 계산됩니다.'}
      </div>

      {!hideSelectionSummary && (
        <>
          <div style={s.dateSummary}>
            <div style={s.dateCell}>
              <div style={s.dateLabel}>체크인</div>
              <div style={s.dateValue}>{checkIn || '날짜 선택'}</div>
            </div>
            <div style={s.dateDivider} />
            <div style={s.dateCell}>
              <div style={s.dateLabel}>체크아웃</div>
              <div style={s.dateValue}>{checkOut || '날짜 선택'}</div>
            </div>
          </div>
          <div style={s.guestSummary}>
            <span style={s.dateLabel}>인원</span>
            <span style={s.dateValue}>{guests}명</span>
          </div>
        </>
      )}

      {/* 예약 버튼 */}
      <button
        onClick={onBook}
        style={s.bookBtn}
        className="tz-book-btn"
      >
        예약하기
      </button>

      {/* 요금 내역 */}
      {nights > 0 && (
        <div style={s.breakdown}>
          <div style={s.breakdownRow}>
            <span>{lodging?.pricePerNight?.toLocaleString()}원 × {nights}박</span>
            <span>{(lodging.pricePerNight * nights).toLocaleString()}원</span>
          </div>
          <div style={s.breakdownDivider} />
          <div style={{ ...s.breakdownRow, fontWeight: '700' }}>
            <span>총 합계</span>
            <span>{totalPrice.toLocaleString()}원</span>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  card: {
    border: `1px solid ${C.borderLight}`,
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    position: 'sticky',
    top: '100px',
    background: '#FFFFFF',
  },
  priceRow: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'baseline',
  },
  price: { fontSize: '22px', fontWeight: '700', color: C.text },
  perNight: { fontSize: '14px', color: C.textSub },
  totalHint: {
    marginBottom: '14px',
    fontSize: '13px',
    color: '#4B5563',
    background: '#F9FAFB',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '10px',
    padding: '9px 10px',
  },
  dateSummary: {
    display: 'flex',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '8px',
    background: '#FAFAFA',
  },
  dateCell: { flex: 1, padding: '10px 12px' },
  dateLabel: { fontSize: '10px', fontWeight: '700', color: C.text, marginBottom: '2px', letterSpacing: '0.05em' },
  dateValue: { fontSize: '13px', color: C.textSub },
  dateDivider: { width: '1px', background: C.border },
  guestSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '20px',
    background: '#FAFAFA',
  },
  bookBtn: {
    width: '100%',
    padding: '16px',
    background: `linear-gradient(135deg, ${C.primary} 0%, #E31C5F 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    fontWeight: '800',
    fontSize: '16px',
    marginBottom: '20px',
    cursor: 'pointer',
  },
  breakdown: {
    borderTop: `1px solid ${C.borderLight}`,
    paddingTop: '16px',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: C.text,
    marginBottom: '8px',
  },
  breakdownDivider: {
    height: '1px',
    background: C.borderLight,
    margin: '12px 0',
  },
};
