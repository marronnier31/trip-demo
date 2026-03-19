import { useCallback, useEffect, useState } from 'react';
import { deleteBooking, getMyBookings, updateBooking } from '../../api/booking';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const STATUS_LABEL = { CONFIRMED: '예약 확정', CANCELLED: '취소됨', PENDING: '대기 중' };
const STATUS_COLOR = { CONFIRMED: '#dcfce7', CANCELLED: '#fee2e2', PENDING: '#fef9c3' };

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editGuests, setEditGuests] = useState(2);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const resolveBookingId = (booking) => booking?.id ?? booking?.bookingId;

  const calcNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const [inY, inM, inD] = String(checkIn).split('-').map(Number);
    const [outY, outM, outD] = String(checkOut).split('-').map(Number);
    if (!inY || !inM || !inD || !outY || !outM || !outD) return 0;
    const inUtc = Date.UTC(inY, inM - 1, inD);
    const outUtc = Date.UTC(outY, outM - 1, outD);
    return Math.max(0, Math.floor((outUtc - inUtc) / 86400000));
  };

  const loadBookings = useCallback(() => {
    getMyBookings(user?.userId || 1)
      .then((res) => {
        setBookings(Array.isArray(res.data) ? res.data : []);
        setLoadError('');
      })
      .catch(() => {
        setLoadError('예약 목록을 새로고침하지 못했습니다. 잠시 후 다시 시도해주세요.');
      });
  }, [user?.userId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const startEdit = (booking) => {
    setEditingId(resolveBookingId(booking));
    setEditCheckIn(booking.checkIn || '');
    setEditCheckOut(booking.checkOut || '');
    setEditGuests(Number(booking.guests || 2));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCheckIn('');
    setEditCheckOut('');
    setEditGuests(2);
  };

  const handleSave = async (booking) => {
    const id = resolveBookingId(booking);
    if (!id) return;
    const nights = calcNights(editCheckIn, editCheckOut);
    if (nights <= 0) {
      setActionError('체크아웃은 체크인보다 이후 날짜여야 합니다.');
      setActionMessage('');
      return;
    }
    const unitPrice = Number(booking.totalPrice || 0) / Math.max(1, calcNights(booking.checkIn, booking.checkOut));
    const payload = {
      ...booking,
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      guests: editGuests,
      totalPrice: Math.round(unitPrice * nights),
    };
    try {
      const res = await updateBooking(id, payload);
      const updated = res?.data || payload;
      setBookings((prev) => prev.map((item) => (resolveBookingId(item) === id ? { ...item, ...updated } : item)));
      setActionMessage('예약 내역이 수정되었습니다.');
      setActionError('');
      cancelEdit();
    } catch {
      setActionError('예약 수정에 실패했습니다. 다시 시도해주세요.');
      setActionMessage('');
    }
  };

  const handleDelete = async (booking) => {
    const id = resolveBookingId(booking);
    if (!id) return;
    if (!window.confirm('이 예약 내역을 삭제할까요?')) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((item) => resolveBookingId(item) !== id));
      setActionMessage('예약 내역이 삭제되었습니다.');
      setActionError('');
      if (editingId === id) cancelEdit();
    } catch {
      setActionError('예약 삭제에 실패했습니다. 다시 시도해주세요.');
      setActionMessage('');
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>내 예약 내역</h2>
      {loadError && <p style={styles.loadError}>{loadError}</p>}
      {actionMessage && <p style={styles.successText}>{actionMessage}</p>}
      {actionError && <p style={styles.loadError}>{actionError}</p>}
      {bookings.length === 0 ? (
        <p style={styles.empty}>예약 내역이 없습니다.</p>
      ) : (
        <div style={styles.list}>
          {bookings.map((b) => {
            const id = resolveBookingId(b);
            const isEditing = editingId === id;
            return (
            <div key={id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.lodgingName}>{b.lodgingName}</span>
                <span style={{ ...styles.status, background: STATUS_COLOR[b.bookingStatus] || '#F3F4F6' }}>
                  {STATUS_LABEL[b.bookingStatus] || b.bookingStatus || '예약됨'}
                </span>
              </div>
              {isEditing ? (
                <div style={styles.editGrid}>
                  <label style={styles.editLabel}>체크인</label>
                  <input type="date" value={editCheckIn} onChange={(event) => setEditCheckIn(event.target.value)} style={styles.editInput} />
                  <label style={styles.editLabel}>체크아웃</label>
                  <input type="date" value={editCheckOut} min={editCheckIn || undefined} onChange={(event) => setEditCheckOut(event.target.value)} style={styles.editInput} />
                  <label style={styles.editLabel}>인원</label>
                  <select value={editGuests} onChange={(event) => setEditGuests(Number(event.target.value))} style={styles.editSelect}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}명</option>)}
                  </select>
                  <div style={styles.actionRow}>
                    <button type="button" style={{ ...styles.actionBtn, ...styles.primaryBtn }} onClick={() => handleSave(b)}>저장</button>
                    <button type="button" style={styles.actionBtn} onClick={cancelEdit}>취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.details}>
                    <span>체크인: {b.checkIn}</span>
                    <span>체크아웃: {b.checkOut}</span>
                    <span>인원: {b.guests}명</span>
                    <span style={{ fontWeight: 'bold' }}>{Number(b.totalPrice || 0).toLocaleString()}원</span>
                  </div>
                  <div style={styles.actionRow}>
                    <button
                      type="button"
                      style={styles.actionBtn}
                      onClick={() => navigate(`/lodgings/${b.lodgingId}`)}
                    >
                      숙소 상세 이동
                    </button>
                    <button type="button" style={{ ...styles.actionBtn, ...styles.primaryGhostBtn }} onClick={() => startEdit(b)}>수정</button>
                    <button type="button" style={{ ...styles.actionBtn, ...styles.dangerBtn }} onClick={() => handleDelete(b)}>삭제</button>
                  </div>
                </>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  lodgingName: { fontSize: '16px', fontWeight: 'bold' },
  status: { fontSize: '12px', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' },
  details: { display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6b7280' },
  editGrid: { display: 'grid', gap: '6px' },
  editLabel: { fontSize: '12px', color: '#6b7280', fontWeight: 700, marginTop: '4px' },
  editInput: { width: '100%', minHeight: '42px', padding: '9px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  editSelect: {
    width: '100%',
    minHeight: '42px',
    padding: '9px 34px 9px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    backgroundImage: 'linear-gradient(45deg, transparent 50%, #8A6B64 50%), linear-gradient(135deg, #8A6B64 50%, transparent 50%)',
    backgroundPosition: 'calc(100% - 16px) calc(50% - 2px), calc(100% - 10px) calc(50% - 2px)',
    backgroundSize: '6px 6px, 6px 6px',
    backgroundRepeat: 'no-repeat',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  actionRow: { marginTop: '12px', display: 'flex', gap: '8px' },
  actionBtn: { border: '1px solid #D1D5DB', background: '#fff', color: '#374151', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
  primaryBtn: { borderColor: '#E8484A', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff' },
  primaryGhostBtn: { borderColor: '#F1B3B3', color: '#C13A3D', background: '#FFF6F6' },
  dangerBtn: { borderColor: '#FECACA', color: '#B91C1C', background: '#FEF2F2' },
  loadError: { margin: '0 0 10px', color: '#B91C1C', fontSize: '13px', fontWeight: 600 },
  successText: { margin: '0 0 10px', color: '#15803D', fontSize: '13px', fontWeight: 600 },
  empty: { textAlign: 'center', color: '#6b7280', padding: '60px 0' },
};
