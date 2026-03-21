import { Link, useSearchParams } from 'react-router-dom';
import { FLIGHT_STAY_ITEMS } from '../../mock/flightStayMockData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function FlightStaysPage() {
  const [params, setSearchParams] = useSearchParams();
  const selectedStayType = params.get('stayType') || '';
  const stayTypes = Array.from(new Set(FLIGHT_STAY_ITEMS.map((item) => item.stayType)));
  // TODO(back-end): 번들 목록/절감가/숙소 조합 응답으로 교체한다.

  const filteredItems = FLIGHT_STAY_ITEMS.filter((item) => !selectedStayType || item.stayType === selectedStayType);

  const updateStayType = (stayType) => {
    const nextParams = new URLSearchParams(params);
    if (stayType) nextParams.set('stayType', stayType);
    else nextParams.delete('stayType');
    setSearchParams(nextParams);
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>BUNDLE TRAVEL</p>
          <h1 style={s.title}>항공+숙소</h1>
          <p style={s.desc}>항공과 숙소를 한 번에 묶어 비교할 수 있는 번들형 결과 페이지입니다.</p>
          <div style={s.actions}>
            <Link to="/flights" style={s.secondaryBtn}>항공 보기</Link>
            <Link to="/overseas" style={s.primaryBtn}>해외숙소 보기</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.headRow}>
            <div>
              <p style={s.resultText}>{selectedStayType ? `${selectedStayType} 번들` : '추천 번들 상품'}</p>
              <p style={s.resultCount}>{filteredItems.length}개 번들</p>
            </div>
            <Link to="/packages" style={s.secondaryBtn}>패키지 여행 보기</Link>
          </div>

          <div style={s.chipWrap}>
            <button type="button" style={{ ...s.chip, ...(selectedStayType ? null : s.chipActive) }} onClick={() => updateStayType('')}>전체</button>
            {stayTypes.map((stayType) => (
              <button key={stayType} type="button" style={{ ...s.chip, ...(selectedStayType === stayType ? s.chipActive : null) }} onClick={() => updateStayType(stayType)}>
                {stayType}
              </button>
            ))}
          </div>

          <div style={s.grid}>
            {filteredItems.map((item) => {
              const saving = item.separatePrice - item.bundlePrice;
              return (
                <article key={item.bundleId} style={s.card}>
                  <img src={item.imageUrl} alt={item.title} style={s.image} />
                  <div style={s.body}>
                    <div style={s.topRow}>
                      <span style={s.badge}>{item.stayType}</span>
                      <span style={s.saving}>개별 예약 대비 {saving.toLocaleString()}원 절감</span>
                    </div>
                    <h2 style={s.cardTitle}>{item.title}</h2>
                    <p style={s.cardMeta}>{item.destination} · {item.durationLabel}</p>
                    <p style={s.infoLine}>{item.flightSummary}</p>
                    <p style={s.infoLine}>{item.lodgingSummary}</p>
                    <div style={s.bottomRow}>
                      <p style={s.price}>1인 {item.bundlePrice.toLocaleString()}원부터</p>
                      <Link to="/support" style={s.cardBtn}>번들 문의</Link>
                    </div>
                  </div>
                </article>
              );
            })}
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' },
  card: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  image: { width: '100%', height: '210px', objectFit: 'cover', display: 'block' },
  body: { padding: '20px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  badge: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: '800' },
  saving: { fontSize: '12px', color: C.primary, fontWeight: '800' },
  cardTitle: { margin: '0 0 8px', fontSize: '22px', color: C.text, fontWeight: '800' },
  cardMeta: { margin: '0 0 10px', fontSize: '14px', color: C.textSub, fontWeight: '700' },
  infoLine: { margin: '0 0 6px', fontSize: '13px', color: C.textSub, lineHeight: 1.6 },
  bottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '14px' },
  price: { margin: 0, fontSize: '16px', color: C.text, fontWeight: '800' },
  cardBtn: { display: 'inline-flex', padding: '10px 14px', borderRadius: '12px', background: '#FFF1F1', color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '800' },
};
