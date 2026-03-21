import { Link, useSearchParams } from 'react-router-dom';
import { CAR_ITEMS } from '../../mock/carMockData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function CarsPage() {
  const [params, setSearchParams] = useSearchParams();
  const selectedType = params.get('carType') || '';
  const carTypes = Array.from(new Set(CAR_ITEMS.map((item) => item.carType)));
  // TODO(back-end): 렌터카 목록/차종/보험/대여 기간 응답으로 교체한다.

  const filteredItems = CAR_ITEMS.filter((item) => !selectedType || item.carType === selectedType);

  const updateType = (carType) => {
    const nextParams = new URLSearchParams(params);
    if (carType) nextParams.set('carType', carType);
    else nextParams.delete('carType');
    setSearchParams(nextParams);
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>RENTAL CAR</p>
          <h1 style={s.title}>렌터카</h1>
          <p style={s.desc}>여행 일정과 함께 보기 좋은 렌터카 상품을 한눈에 비교할 수 있는 결과형 페이지입니다.</p>
          <div style={s.actions}>
            <Link to="/lodgings" style={s.primaryBtn}>숙소 일정 보기</Link>
            <Link to="/support" style={s.secondaryBtn}>상담 문의</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.headRow}>
            <div>
              <p style={s.resultText}>{selectedType ? `${selectedType} 차량` : '추천 렌터카'}</p>
              <p style={s.resultCount}>{filteredItems.length}대 차량</p>
            </div>
            <Link to="/flight-stays" style={s.secondaryBtn}>항공+숙소 보기</Link>
          </div>

          <div style={s.chipWrap}>
            <button type="button" style={{ ...s.chip, ...(selectedType ? null : s.chipActive) }} onClick={() => updateType('')}>전체</button>
            {carTypes.map((carType) => (
              <button key={carType} type="button" style={{ ...s.chip, ...(selectedType === carType ? s.chipActive : null) }} onClick={() => updateType(carType)}>
                {carType}
              </button>
            ))}
          </div>

          <div style={s.grid}>
            {filteredItems.map((item) => (
              <article key={item.carId} style={s.card}>
                <img src={item.imageUrl} alt={item.brand} style={s.image} />
                <div style={s.body}>
                  <div style={s.topRow}>
                    <span style={s.badge}>{item.carType}</span>
                    <span style={s.region}>{item.region}</span>
                  </div>
                  <h2 style={s.cardTitle}>{item.brand}</h2>
                  <p style={s.cardMeta}>{item.fuelType} · {item.insuranceType}</p>
                  <div style={s.bottomRow}>
                    <p style={s.price}>1일 {item.pricePerDay.toLocaleString()}원부터</p>
                    <Link to="/support" style={s.cardBtn}>대여 문의</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  page: { background: '#F9F7F5', minHeight: 'calc(100vh - 160px)' },
  hero: { padding: '72px 24px 44px', background: 'linear-gradient(145deg, #FFF6F1 0%, #FFFFFF 52%, #F7F7FF 100%)', borderBottom: '1px solid #F0E8E8' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(32px, 4vw, 50px)', lineHeight: 1.06, letterSpacing: '-0.03em', color: C.text },
  desc: { margin: 0, maxWidth: '760px', fontSize: '16px', lineHeight: 1.8, color: C.textSub },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '28px' },
  primaryBtn: { padding: '13px 22px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '14px' },
  secondaryBtn: { padding: '13px 22px', borderRadius: '999px', background: '#fff', color: C.text, textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: `1px solid ${C.border}` },
  section: { padding: '32px 24px 64px' },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' },
  resultText: { margin: 0, fontSize: '14px', color: C.textSub, fontWeight: '700' },
  resultCount: { margin: '6px 0 0', fontSize: '26px', color: C.text, fontWeight: '800' },
  chipWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' },
  chip: { border: `1px solid ${C.border}`, background: '#fff', color: C.text, borderRadius: '999px', padding: '9px 13px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  chipActive: { background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', borderColor: '#E8484A' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' },
  card: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  image: { width: '100%', height: '200px', objectFit: 'cover', display: 'block' },
  body: { padding: '18px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  badge: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: '800' },
  region: { fontSize: '12px', color: C.textLight, fontWeight: '700' },
  cardTitle: { margin: '0 0 8px', fontSize: '20px', color: C.text, fontWeight: '800' },
  cardMeta: { margin: '0 0 14px', fontSize: '14px', color: C.textSub, fontWeight: '700' },
  bottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  price: { margin: 0, fontSize: '16px', color: C.text, fontWeight: '800' },
  cardBtn: { display: 'inline-flex', padding: '10px 14px', borderRadius: '12px', background: '#FFF1F1', color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '800' },
};
