import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import LodgingMap from '../../components/lodging/LodgingMap';
import { getLodging } from '../../api/lodging';
import { C, MAX_WIDTH, R } from '../../styles/tokens';

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inY, inM, inD] = String(checkIn).split('-').map(Number);
  const [outY, outM, outD] = String(checkOut).split('-').map(Number);
  if (!inY || !inM || !inD || !outY || !outM || !outD) return 0;
  const inUtc = Date.UTC(inY, inM - 1, inD);
  const outUtc = Date.UTC(outY, outM - 1, outD);
  return Math.max(0, Math.floor((outUtc - inUtc) / 86400000));
}

function getTodayText() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function LodgingDetailPage() {
  const { lodgingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lodging, setLodging] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [bookingError, setBookingError] = useState('');
  const [liked, setLiked] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: 1, author: '여행자 민지', content: '위치가 좋아서 이동이 편했어요. 다음에도 재방문 의사 있습니다.' },
    { id: 2, author: 'tripzone_guest', content: '체크인 안내가 친절했고 숙소가 사진과 거의 동일했어요.' },
  ]);

  const nights = calcNights(checkIn, checkOut);
  const today = getTodayText();

  useEffect(() => {
    getLodging(lodgingId).then(res => setLodging(res.data)).catch(() => { });
  }, [lodgingId]);

  if (!lodging) return (
    <div style={{ padding: '80px', textAlign: 'center', color: C.textSub }}>
      로딩 중...
    </div>
  );

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (!checkIn || !checkOut) {
      setBookingError('체크인/체크아웃 날짜를 선택해 주세요.');
      return;
    }
    if (nights <= 0) {
      setBookingError('체크아웃은 체크인보다 이후 날짜여야 합니다.');
      return;
    }
    setBookingError('');
    navigate(`/booking/${lodgingId}`, { state: { checkIn, checkOut, guests } });
  };

  const handleInquiry = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/inquiry/create?lodgingId=${lodgingId}&type=USER_TO_SELLER`);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareDone(true);
      window.setTimeout(() => setShareDone(false), 1400);
    } catch {
      window.prompt('아래 링크를 복사해 공유하세요.', shareUrl);
    }
  };

  const handleAddComment = (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setComments((prev) => [
      { id: Date.now(), author: user?.name || '게스트', content: text },
      ...prev,
    ]);
    setCommentText('');
  };

  return (
    <div>
      <style>{`
        @media (max-width: 980px) {
          .tz-lodging-gallery {
            grid-template-columns: 1fr !important;
            max-height: none !important;
          }
          .tz-lodging-main-img {
            height: 320px !important;
          }
          .tz-lodging-gallery-subs {
            flex-direction: row !important;
          }
          .tz-lodging-sub-img {
            height: 140px !important;
          }
          .tz-lodging-content {
            flex-direction: column !important;
            gap: 28px !important;
          }
          .tz-lodging-sidebar {
            width: 100% !important;
          }
          .tz-lodging-wrap {
            padding: 28px 16px 44px !important;
          }
        }
        @media (max-width: 560px) {
          .tz-lodging-main-img {
            height: 240px !important;
          }
          .tz-lodging-sub-img {
            height: 120px !important;
          }
        }
        .tz-action-btn { transition: all 0.2s ease; }
        .tz-action-btn:hover { background: #f9f9f9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .tz-lodging-img { transition: transform 0.4s ease; }
        .tz-gallery-wrap:hover .tz-lodging-img { transform: scale(1.02); }
      `}</style>
      {/* ── 이미지 갤러리 ── */}
      <div style={s.gallery} className="tz-lodging-gallery">
        <div style={s.galleryMain}>
          <img src={lodging.thumbnailUrl} alt={lodging.name} style={s.mainImg} className="tz-lodging-main-img" />
        </div>
        <div style={s.gallerySubs} className="tz-lodging-gallery-subs">
          <img src={`https://picsum.photos/seed/${lodgingId}a/400/300`} alt="" style={s.subImg} className="tz-lodging-sub-img" />
          <img src={`https://picsum.photos/seed/${lodgingId}b/400/300`} alt="" style={s.subImg} className="tz-lodging-sub-img" />
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div style={s.wrap} className="tz-lodging-wrap">
        <div style={s.content} className="tz-lodging-content">
          {/* 좌측 메인 */}
          <div style={s.main}>
            <p style={s.region}>{lodging.region}</p>
            <h1 style={s.name}>{lodging.name}</h1>
            <div style={s.meta}>
              <span>★ {lodging.rating}</span>
              <span style={s.dot}>·</span>
              <span>{lodging.reviewCount}개 후기</span>
              <span style={s.dot}>·</span>
              <span>{lodging.address}</span>
            </div>
            <div style={s.actionRow}>
              <button type="button" className="tz-action-btn" style={{ ...s.actionBtn, ...(liked ? s.actionBtnActive : null) }} onClick={() => setLiked((prev) => !prev)}>
                {liked ? '♥ 찜 완료' : '♡ 찜하기'}
              </button>
              <button type="button" className="tz-action-btn" style={s.actionBtn} onClick={handleShare}>
                {shareDone ? '링크 복사됨' : '공유하기'}
              </button>
            </div>

            <hr style={s.hr} />

            <div style={s.section}>
              <h2 style={s.sectionTitle}>숙소 소개</h2>
              <p style={s.desc}>{lodging.description}</p>
            </div>

            <hr style={s.hr} />

            <div style={s.section}>
              <h2 style={s.sectionTitle}>댓글</h2>
              <form style={s.commentForm} onSubmit={handleAddComment}>
                <input
                  style={s.commentInput}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="숙소 이용 후기를 남겨주세요"
                />
                <button type="submit" style={s.commentSubmitBtn}>등록</button>
              </form>
              <div style={s.commentList}>
                {comments.map((comment) => (
                  <article key={comment.id} style={s.commentCard}>
                    <p style={s.commentAuthor}>{comment.author}</p>
                    <p style={s.commentContent}>{comment.content}</p>
                  </article>
                ))}
              </div>
            </div>

            <hr style={s.hr} />

            <div style={s.section}>
              <h2 style={s.sectionTitle}>위치</h2>
              <div style={s.mapBox}>
                <LodgingMap
                  latitude={lodging.latitude}
                  longitude={lodging.longitude}
                  name={lodging.name}
                  address={lodging.address}
                  pricePerNight={lodging.pricePerNight}
                />
              </div>
              <p style={s.mapCoord}>위도 {lodging.latitude} / 경도 {lodging.longitude}</p>
            </div>

            <hr style={s.hr} />

            <div style={s.section}>
              <button onClick={handleInquiry} style={s.inquiryBtn}>판매자에게 문의하기</button>
            </div>
          </div>

          {/* 우측 예약 카드 */}
          <div style={s.sidebar} className="tz-lodging-sidebar">
            <div style={s.inputCard}>
              <div style={s.dateRow}>
                <div style={s.dateField}>
                  <label style={s.fieldLabel}>체크인</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => {
                      const nextCheckIn = e.target.value;
                      setCheckIn(nextCheckIn);
                      if (checkOut && nextCheckIn && checkOut <= nextCheckIn) setCheckOut('');
                      setBookingError('');
                    }}
                    style={s.dateInput}
                  />
                </div>
                <div style={s.dateDivider} />
                <div style={s.dateField}>
                  <label style={s.fieldLabel}>체크아웃</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setBookingError('');
                    }}
                    style={s.dateInput}
                  />
                </div>
              </div>
              <div style={s.guestField}>
                <label style={s.fieldLabel}>인원</label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))} style={s.guestSelect}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}명</option>)}
                </select>
              </div>
            </div>
            <BookingSummaryCard
              lodging={lodging}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              onBook={handleBook}
              hideSelectionSummary
            />
            {bookingError && <p style={s.bookingError}>{bookingError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  gallery: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '8px',
    maxHeight: '520px',
    overflow: 'hidden',
    background: C.bgGray,
  },
  galleryMain: { overflow: 'hidden' },
  mainImg: { width: '100%', height: '480px', objectFit: 'cover', display: 'block' },
  gallerySubs: { display: 'flex', flexDirection: 'column', gap: '8px' },
  subImg: { width: '100%', height: '236px', objectFit: 'cover', display: 'block' },
  wrap: { maxWidth: MAX_WIDTH, margin: '0 auto', padding: '40px 24px 64px' },
  content: { display: 'flex', gap: '80px', alignItems: 'flex-start' },
  main: { flex: 1, minWidth: 0 },
  region: { fontSize: '13px', fontWeight: '600', color: C.textSub, margin: '0 0 8px' },
  name: { fontSize: '28px', fontWeight: '700', color: C.text, margin: '0 0 12px', lineHeight: 1.25 },
  meta: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '14px', color: C.text, flexWrap: 'wrap' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
  actionBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  actionBtnActive: {
    borderColor: '#E8484A',
    background: '#FFF1F1',
    color: '#C13A3D',
  },
  dot: { color: C.textSub },
  hr: { border: 'none', borderTop: `1px solid ${C.borderLight}`, margin: '32px 0' },
  section: { marginBottom: '8px' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: C.text, margin: '0 0 16px' },
  desc: { fontSize: '15px', lineHeight: '1.75', color: C.text, margin: 0 },
  commentForm: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: '12px' },
  commentInput: {
    border: `1px solid ${C.border}`,
    borderRadius: R.md,
    padding: '10px 12px',
    fontSize: '14px',
    outline: 'none',
  },
  commentSubmitBtn: {
    border: 'none',
    borderRadius: R.md,
    background: `linear-gradient(135deg, ${C.primary} 0%, #E31C5F 100%)`,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
  },
  commentList: { display: 'grid', gap: '12px' },
  commentCard: {
    border: `1px solid ${C.borderLight}`,
    borderRadius: '16px',
    padding: '16px 20px',
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  commentAuthor: { margin: '0 0 6px', fontSize: '12px', color: '#6B7280', fontWeight: 700 },
  commentContent: { margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 },
  mapBox: { borderRadius: '24px', overflow: 'hidden', border: `1px solid ${C.borderLight}`, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  mapCoord: { fontSize: '12px', color: C.textSub, margin: '12px 0 0' },
  inquiryBtn: {
    padding: '14px 28px',
    background: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: '700',
    color: C.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sidebar: { width: '380px', flexShrink: 0 },
  inputCard: {
    border: `1px solid ${C.border}`,
    borderRadius: R.lg,
    overflow: 'hidden',
    marginBottom: '16px',
  },
  dateRow: { display: 'flex', borderBottom: `1px solid ${C.border}` },
  dateField: { flex: 1, padding: '12px 16px' },
  dateDivider: { width: '1px', background: C.border },
  fieldLabel: { display: 'block', fontSize: '10px', fontWeight: '700', color: C.text, marginBottom: '4px', letterSpacing: '0.05em' },
  dateInput: { border: 'none', outline: 'none', fontSize: '14px', color: C.text, width: '100%', background: 'transparent', padding: 0 },
  guestField: { padding: '12px 16px' },
  guestSelect: { border: 'none', outline: 'none', fontSize: '14px', color: C.text, background: 'transparent', width: '100%', padding: 0, cursor: 'pointer' },
  bookingError: { margin: '10px 2px 0', color: '#DC2626', fontSize: '13px', fontWeight: 600 },
};
