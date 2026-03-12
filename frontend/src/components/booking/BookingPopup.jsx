import { useEffect, useState } from 'react';
import GuestCounter from './GuestCounter';
import { C, R } from '../../styles/tokens';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inY, inM, inD] = String(checkIn).split('-').map(Number);
  const [outY, outM, outD] = String(checkOut).split('-').map(Number);
  if (!inY || !inM || !inD || !outY || !outM || !outD) return 0;
  const inUtc = Date.UTC(inY, inM - 1, inD);
  const outUtc = Date.UTC(outY, outM - 1, outD);
  return Math.max(0, Math.floor((outUtc - inUtc) / 86400000));
}

function parseISO(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthGrid(baseDate) {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }).map((_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    return day;
  });
}

function sameDate(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function betweenDate(day, start, end) {
  if (!start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

export default function BookingPopup({
  open,
  lodging,
  room,
  checkIn,
  checkOut,
  guests,
  today,
  error,
  roleMessage,
  onClose,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onConfirm,
}) {
  if (!open) return null;

  const nights = calcNights(checkIn, checkOut);
  const nightlyPrice = Number(room?.pricePerNight || lodging?.pricePerNight || 0);
  const totalPrice = nights > 0 ? nights * nightlyPrice : nightlyPrice;
  const [showCalendar, setShowCalendar] = useState(false);
  const [cursor, setCursor] = useState(() => parseISO(checkIn) || new Date());

  useEffect(() => {
    if (!open) return;
    setCursor(parseISO(checkIn) || new Date());
    setShowCalendar(false);
  }, [open, checkIn]);

  const startDate = parseISO(checkIn);
  const endDate = parseISO(checkOut);
  const leftMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const rightMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

  const pickDay = (day) => {
    if (!startDate || (startDate && endDate)) {
      onCheckInChange(toISO(day));
      onCheckOutChange('');
      return;
    }
    if (day.getTime() < startDate.getTime()) {
      onCheckInChange(toISO(day));
      onCheckOutChange(toISO(startDate));
      setShowCalendar(false);
      return;
    }
    onCheckOutChange(toISO(day));
    setShowCalendar(false);
  };

  const renderMonth = (monthDate) => {
    const days = monthGrid(monthDate);
    return (
      <div style={s.monthCard}>
        <p style={s.monthTitle}>{monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월</p>
        <div style={s.weekRow}>
          {WEEK_DAYS.map((day) => <span key={`${monthDate.getMonth()}-${day}`} style={s.weekCell}>{day}</span>)}
        </div>
        <div style={s.dayGrid}>
          {days.map((day) => {
            const inMonth = day.getMonth() === monthDate.getMonth();
            const isStart = sameDate(day, startDate);
            const isEnd = sameDate(day, endDate);
            const isMid = betweenDate(day, startDate, endDate);
            return (
              <button
                key={toISO(day)}
                type="button"
                style={{ ...s.dayBtn, opacity: inMonth ? 1 : 0.34, ...(isMid ? s.dayMid : null), ...(isStart || isEnd ? s.dayActive : null) }}
                onClick={() => pickDay(day)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={(event) => event.stopPropagation()}>
        <div style={s.header}>
          <div>
            <p style={s.eyebrow}>예약 정보 입력</p>
            <h2 style={s.title}>날짜와 인원을 선택해 주세요</h2>
            <p style={s.subtitle}>메인 검색 영역과 같은 톤으로 간단하게 예약 조건만 먼저 고릅니다.</p>
          </div>
          <button type="button" style={s.closeBtn} onClick={onClose}>닫기</button>
        </div>

        <div style={s.summaryBox}>
          <div>
            <strong style={s.summaryName}>{lodging?.name}</strong>
            {room?.name ? <p style={s.summaryRoom}>{room.name}</p> : null}
          </div>
          <div style={s.summaryPriceBox}>
            <span style={s.summaryPriceLabel}>{nights > 0 ? `${nights}박 예상 금액` : '1박 기준'}</span>
            <strong style={s.summaryPrice}>{totalPrice.toLocaleString()}원</strong>
          </div>
        </div>

        <div style={s.fieldGrid}>
          <div style={s.fieldCard}>
            <label style={s.fieldLabel}>체크인</label>
            <button type="button" style={s.dateTrigger} onClick={() => setShowCalendar((prev) => !prev)}>
              {checkIn || '날짜를 선택해 주세요'}
            </button>
            <p style={s.dateHint}>{checkIn || '날짜를 선택해 주세요'}</p>
          </div>
          <div style={s.fieldCard}>
            <label style={s.fieldLabel}>체크아웃</label>
            <button type="button" style={s.dateTrigger} onClick={() => setShowCalendar((prev) => !prev)}>
              {checkOut || '날짜를 선택해 주세요'}
            </button>
            <p style={s.dateHint}>{checkOut || '날짜를 선택해 주세요'}</p>
          </div>
        </div>

        {showCalendar ? (
          <div style={s.calendarPanel}>
            <div style={s.calendarNav}>
              <button type="button" style={s.navBtn} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
              <button type="button" style={s.navBtn} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
            </div>
            <div style={s.monthGrid}>
              {renderMonth(leftMonth)}
              {renderMonth(rightMonth)}
            </div>
            <div style={s.calendarFooter}>
              <span style={s.calendarText}>
                {checkIn && checkOut ? `${checkIn} ~ ${checkOut}` : checkIn ? `${checkIn} 체크인 선택됨` : '체크인과 체크아웃을 선택해 주세요'}
              </span>
              <button type="button" style={s.applyBtn} onClick={() => setShowCalendar(false)}>적용</button>
            </div>
          </div>
        ) : null}

        <div style={s.guestCard}>
          <div>
            <p style={s.guestTitle}>인원</p>
            <p style={s.guestSub}>성인 기준, 최대 6명까지 선택할 수 있습니다.</p>
          </div>
          <GuestCounter value={guests} onChange={onGuestsChange} min={1} max={6} />
        </div>

        {roleMessage ? <p style={s.roleNotice}>{roleMessage}</p> : null}
        {error ? <p style={s.error}>{error}</p> : null}

        <div style={s.footer}>
          <button type="button" style={s.cancelBtn} onClick={onClose}>닫기</button>
          <button type="button" style={s.confirmBtn} onClick={onConfirm}>예약 페이지로 이동</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.42)',
    zIndex: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  panel: {
    width: '100%',
    maxWidth: '860px',
    background: '#fff',
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
    padding: '28px',
    display: 'grid',
    gap: '22px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
  },
  eyebrow: {
    margin: '0 0 6px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#C13A3D',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '30px',
    lineHeight: 1.2,
    fontWeight: 800,
    color: C.text,
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#66707C',
    lineHeight: 1.65,
  },
  closeBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 700,
    padding: '10px 14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  summaryBox: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '20px',
    padding: '18px 20px',
    background: '#FCFCFC',
    flexWrap: 'wrap',
  },
  summaryName: {
    display: 'block',
    fontSize: '18px',
    color: C.text,
    fontWeight: 800,
    marginBottom: '6px',
  },
  summaryRoom: {
    margin: 0,
    fontSize: '14px',
    color: '#66707C',
  },
  summaryPriceBox: {
    display: 'grid',
    gap: '4px',
    textAlign: 'right',
  },
  summaryPriceLabel: {
    fontSize: '13px',
    color: '#66707C',
    fontWeight: 700,
  },
  summaryPrice: {
    fontSize: '26px',
    color: C.text,
    fontWeight: 800,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
  },
  fieldCard: {
    border: `1px solid ${C.border}`,
    borderRadius: '24px',
    padding: '20px 22px',
    background: '#fff',
  },
  fieldLabel: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#5B6470',
    letterSpacing: '0.04em',
  },
  dateTrigger: {
    width: '100%',
    minHeight: '44px',
    border: `1px solid ${C.borderLight}`,
    outline: 'none',
    background: '#FCFCFC',
    padding: '0 14px',
    fontSize: '18px',
    color: C.text,
    borderRadius: '14px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  dateHint: {
    margin: '10px 0 0',
    fontSize: '14px',
    color: '#66707C',
    fontWeight: 700,
  },
  guestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    border: `1px solid ${C.border}`,
    borderRadius: '20px',
    padding: '16px 18px',
    background: '#fff',
    flexWrap: 'wrap',
  },
  guestTitle: {
    margin: '0 0 6px',
    fontSize: '16px',
    color: C.text,
    fontWeight: 800,
  },
  guestSub: {
    margin: 0,
    fontSize: '14px',
    color: '#66707C',
  },
  error: {
    margin: 0,
    fontSize: '14px',
    color: '#DC2626',
    fontWeight: 700,
  },
  roleNotice: {
    margin: 0,
    fontSize: '14px',
    color: '#B45309',
    fontWeight: 700,
    background: '#FFF7ED',
    border: '1px solid #FED7AA',
    borderRadius: '14px',
    padding: '12px 14px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
  },
  cancelBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 700,
    padding: '12px 18px',
    cursor: 'pointer',
  },
  confirmBtn: {
    border: 'none',
    background: `linear-gradient(135deg, ${C.primary} 0%, #E31C5F 100%)`,
    color: '#fff',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 800,
    padding: '12px 20px',
    cursor: 'pointer',
  },
  calendarPanel: {
    borderRadius: '24px',
    border: `1px solid ${C.borderLight}`,
    background: '#fff',
    boxShadow: '0 18px 36px rgba(16, 24, 40, 0.10)',
    padding: '18px',
    display: 'grid',
    gap: '14px',
  },
  calendarNav: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: '#3C4556',
    fontSize: '24px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  monthCard: {
    border: `1px solid ${C.borderLight}`,
    borderRadius: '18px',
    background: '#fff',
    padding: '16px',
    minWidth: 0,
  },
  monthTitle: {
    margin: '0 0 12px',
    color: '#202736',
    fontSize: '20px',
    fontWeight: 800,
    textAlign: 'center',
  },
  weekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '6px',
  },
  weekCell: {
    color: '#97A0AE',
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'center',
  },
  dayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  dayBtn: {
    height: '48px',
    border: 'none',
    borderRadius: '12px',
    background: 'transparent',
    color: '#243041',
    fontSize: '16px',
    cursor: 'pointer',
  },
  dayMid: {
    background: '#FCECEC',
  },
  dayActive: {
    background: C.primary,
    color: '#fff',
    fontWeight: 800,
  },
  calendarFooter: {
    paddingTop: '14px',
    borderTop: `1px solid ${C.borderLight}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  calendarText: {
    color: '#4A5565',
    fontSize: '14px',
    fontWeight: 700,
  },
  applyBtn: {
    border: 'none',
    borderRadius: '12px',
    background: C.primary,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    padding: '10px 16px',
    cursor: 'pointer',
  },
};
