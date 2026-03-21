import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import EmptyState from '../../components/common/EmptyState';
import SectionNav from '../../components/common/SectionNav';
import { getLodgings, deleteLodging } from '../../api/lodging';
import { C, MAX_WIDTH, R } from '../../styles/tokens';

const SELLER_SECTION_ITEMS = [
  { to: '/seller', label: '대시보드', match: (pathname) => pathname === '/seller' },
  { to: '/seller/lodgings', label: '숙소 관리', match: (pathname) => pathname.startsWith('/seller/lodgings') },
  { to: '/seller/reservations', label: '예약 관리', match: (pathname) => pathname.startsWith('/seller/reservations') },
  { to: '/seller/inquiries', label: '문의 관리', match: (pathname) => pathname.startsWith('/seller/inquiries') },
];

export default function SellerLodgingListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lodgings, setLodgings] = useState([]);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    getLodgings({ sellerId: user?.userId || 1 }).then(res => setLodgings(res.data)).catch(() => {});
  }, [user]);

  const handleDelete = async (lodgingId) => {
    await deleteLodging(lodgingId).catch(() => {});
    setLodgings(prev => prev.filter(l => l.lodgingId !== lodgingId));
    setDeleteTargetId(null);
  };

  const averagePrice = lodgings.length
    ? Math.round(lodgings.reduce((sum, lodging) => sum + Number(lodging.pricePerNight || 0), 0) / lodgings.length)
    : 0;

  return (
    <div style={s.wrap}>
      <style>{`
        @media (max-width: 920px) {
          .tz-seller-lodging-header {
            flex-direction: column;
            align-items: stretch !important;
          }
          .tz-seller-lodging-summary {
            grid-template-columns: 1fr !important;
          }
          .tz-seller-lodging-card {
            flex-direction: column;
          }
          .tz-seller-lodging-card img {
            width: 100% !important;
            height: 220px !important;
          }
          .tz-seller-lodging-card-top {
            flex-direction: column;
            gap: 14px;
          }
          .tz-seller-lodging-actions {
            flex-wrap: wrap;
          }
          .tz-seller-lodging-actions > * {
            flex: 1 1 140px;
            justify-content: center;
          }
        }
      `}</style>
      <SectionNav items={SELLER_SECTION_ITEMS} />
      <div style={s.inner}>
        <section style={s.hero}>
          <div style={s.heroCopy}>
            <p style={s.eyebrow}>PROPERTY LIBRARY</p>
            <h1 style={s.title}>내 숙소 관리</h1>
            <p style={s.desc}>노출 중인 숙소 카드 품질, 가격 문맥, 수정 진입을 한 화면에서 빠르게 관리할 수 있도록 정리했습니다.</p>
          </div>
          <div style={s.summaryGrid} className="tz-seller-lodging-summary">
            <article style={s.summaryCard}>
              <span style={s.summaryLabel}>등록 숙소</span>
              <strong style={s.summaryValue}>{lodgings.length}개</strong>
            </article>
            <article style={s.summaryCard}>
              <span style={s.summaryLabel}>평균 1박가</span>
              <strong style={s.summaryValue}>{averagePrice.toLocaleString()}원</strong>
            </article>
            <article style={{ ...s.summaryCard, ...s.summaryAccent }}>
              <span style={s.summaryLabel}>다음 권장 작업</span>
              <strong style={s.summaryValueSmall}>대표 숙소 카드와 문구 점검</strong>
            </article>
          </div>
        </section>

        <div style={s.header} className="tz-seller-lodging-header">
          <div>
            <h2 style={s.sectionTitle}>등록된 숙소</h2>
            <p style={s.sub}>{lodgings.length}개 숙소 등록됨</p>
          </div>
          <Link to="/seller/lodgings/create" style={s.addBtn}>+ 숙소 등록</Link>
        </div>

        {lodgings.length === 0 ? (
          <EmptyState
            icon="🏠"
            title="등록된 숙소가 없습니다"
            desc="첫 번째 숙소를 등록하고 예약을 받아보세요."
            action={{ label: '+ 숙소 등록하기', onClick: () => navigate('/seller/lodgings/create') }}
          />
        ) : (
          <div style={s.list}>
            {lodgings.map(l => (
              <div key={l.lodgingId} style={s.card} className="tz-seller-lodging-card">
                <img src={l.thumbnailUrl} alt={l.name} style={s.img} />
                <div style={s.cardBody}>
                  <div style={s.cardTop} className="tz-seller-lodging-card-top">
                    <div>
                      <div style={s.badgeRow}>
                        <span style={s.regionBadge}>{l.region}</span>
                        <span style={s.liveBadge}>노출 중</span>
                      </div>
                      <p style={s.lodgingName}>{l.name}</p>
                      <p style={s.lodgingMeta}>{l.address}</p>
                    </div>
                    <div style={s.cardRight}>
                      <p style={s.price}>{l.pricePerNight.toLocaleString()}원<span style={s.perNight}> / 1박</span></p>
                      <p style={s.rating}>★ {l.rating}</p>
                    </div>
                  </div>
                  <div style={s.cardActions} className="tz-seller-lodging-actions">
                    <Link to={`/lodgings/${l.lodgingId}`} style={s.previewBtn}>미리보기</Link>
                    <Link to={`/seller/lodgings/${l.lodgingId}/edit`} style={s.editBtn}>수정</Link>
                    <button onClick={() => setDeleteTargetId(l.lodgingId)} style={s.deleteBtn}>삭제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {deleteTargetId && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h3 style={s.modalTitle}>숙소를 삭제하시겠습니까?</h3>
              <p style={s.modalDesc}>삭제 후에는 복구할 수 없습니다.</p>
              <div style={s.modalBtns}>
                <button onClick={() => handleDelete(deleteTargetId)} style={s.modalDelete}>삭제</button>
                <button onClick={() => setDeleteTargetId(null)} style={s.modalCancel}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: { maxWidth: '1280px', margin: '0 auto', minHeight: 'calc(100vh - 160px)', padding: '32px 24px 48px' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 1fr)',
    gap: '18px',
    marginBottom: '24px',
    padding: '30px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF6F2 0%, #FFFFFF 54%, #F6F7FF 100%)',
    border: '1px solid #EFE4E1',
    boxShadow: '0 18px 40px rgba(17,17,17,0.05)',
  },
  heroCopy: { display: 'flex', flexDirection: 'column', gap: '10px' },
  eyebrow: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: C.primary,
  },
  title: { fontSize: '36px', lineHeight: 1.05, fontWeight: '800', color: C.text, margin: 0, letterSpacing: '-0.03em' },
  desc: { margin: 0, fontSize: '15px', lineHeight: 1.75, color: C.textSub, maxWidth: '680px' },
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
  summaryAccent: {
    background: 'linear-gradient(145deg, #FFF1EE 0%, #FFF9F7 55%, #F7F3EF 100%)',
    borderColor: '#EFD9D2',
    color: '#2F3640',
  },
  summaryLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  summaryValue: { fontSize: '26px', lineHeight: 1.1, color: C.text },
  summaryValueSmall: { fontSize: '17px', lineHeight: 1.45, color: '#2F3640' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '12px' },
  sectionTitle: { fontSize: '24px', fontWeight: '800', color: C.text, margin: '0 0 4px' },
  sub: { fontSize: '14px', color: C.textSub, margin: 0 },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    background: C.bg,
    borderRadius: '24px',
    border: '1px solid #ECE8E4',
    boxShadow: '0 14px 28px rgba(15,23,42,0.05)',
    display: 'flex',
    gap: '0',
    overflow: 'hidden',
  },
  img: { width: '240px', height: '180px', objectFit: 'cover', flexShrink: 0 },
  cardBody: { flex: 1, padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  badgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  regionBadge: { fontSize: '11px', fontWeight: '800', color: '#7F4B00', background: '#FFF4DD', border: '1px solid #F4D7A7', borderRadius: '999px', padding: '5px 10px', display: 'inline-flex' },
  liveBadge: { fontSize: '11px', fontWeight: '800', color: '#0F766E', background: '#ECFEF7', border: '1px solid #A7F3D0', borderRadius: '999px', padding: '5px 10px', display: 'inline-flex' },
  lodgingName: { fontSize: '24px', fontWeight: '800', color: C.text, margin: '0 0 6px', letterSpacing: '-0.02em' },
  lodgingMeta: { fontSize: '14px', color: C.textSub, margin: 0, lineHeight: 1.6 },
  cardRight: { textAlign: 'right' },
  price: { fontSize: '24px', fontWeight: '800', color: C.text, margin: '0 0 6px', letterSpacing: '-0.02em' },
  perNight: { fontSize: '13px', fontWeight: '400', color: C.textSub },
  rating: { fontSize: '13px', color: C.textSub, margin: 0, fontWeight: '700' },
  cardActions: { display: 'flex', gap: '10px' },
  previewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    background: '#FFF1F1',
    color: C.primary,
    borderRadius: '999px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '800',
    border: '1px solid #F3C9CA',
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    background: C.bgGray,
    color: C.text,
    borderRadius: '999px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '700',
    border: `1px solid ${C.border}`,
  },
  deleteBtn: {
    padding: '10px 16px',
    background: '#fff',
    color: '#EF4444',
    border: `1px solid #FECACA`,
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
  },
  modal: {
    background: C.bg, borderRadius: '16px', padding: '32px',
    maxWidth: '400px', width: '90%', textAlign: 'center',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 8px' },
  modalDesc: { fontSize: '14px', color: C.textSub, margin: '0 0 24px' },
  modalBtns: { display: 'flex', gap: '10px' },
  modalDelete: {
    flex: 1, padding: '12px', background: '#EF4444', color: '#fff',
    border: 'none', borderRadius: R.md, fontWeight: '700', cursor: 'pointer',
  },
  modalCancel: {
    flex: 1, padding: '12px', background: C.bgGray, color: C.text,
    border: 'none', borderRadius: R.md, fontWeight: '600', cursor: 'pointer',
  },
};
