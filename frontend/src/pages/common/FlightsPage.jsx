import { Link, useSearchParams } from 'react-router-dom';
import { FLIGHT_ITEMS } from '../../mock/flightMockData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function FlightsPage() {
  const [params, setSearchParams] = useSearchParams();
  const selectedSeatClass = params.get('seatClass') || '';
  const seatClasses = Array.from(new Set(FLIGHT_ITEMS.map((item) => item.seatClass)));
  // TODO(back-end): 항공 검색/가격/수하물 API가 준비되면 이 mock 데이터를 서버 응답으로 교체한다.

  const filteredItems = FLIGHT_ITEMS.filter((item) => !selectedSeatClass || item.seatClass === selectedSeatClass);

  const updateSeatClass = (seatClass) => {
    const nextParams = new URLSearchParams(params);
    if (seatClass) nextParams.set('seatClass', seatClass);
    else nextParams.delete('seatClass');
    setSearchParams(nextParams);
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>FLIGHT BOOKING</p>
          <h1 style={s.title}>항공</h1>
          <p style={s.desc}>왕복 항공권을 중심으로 일정과 좌석 조건을 비교할 수 있는 결과형 페이지입니다.</p>
          <div style={s.actions}>
            <Link to="/flight-stays" style={s.primaryBtn}>항공+숙소 보기</Link>
            <Link to="/support" style={s.secondaryBtn}>운영 문의</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.headRow}>
            <div>
              <p style={s.resultText}>{selectedSeatClass ? `${selectedSeatClass} 결과` : '추천 항공편'}</p>
              <p style={s.resultCount}>{filteredItems.length}개 항공편</p>
            </div>
            <Link to="/packages" style={s.secondaryBtn}>패키지 여행 보기</Link>
          </div>

          <div style={s.chipWrap}>
            <button type="button" style={{ ...s.chip, ...(selectedSeatClass ? null : s.chipActive) }} onClick={() => updateSeatClass('')}>전체</button>
            {seatClasses.map((seatClass) => (
              <button key={seatClass} type="button" style={{ ...s.chip, ...(selectedSeatClass === seatClass ? s.chipActive : null) }} onClick={() => updateSeatClass(seatClass)}>
                {seatClass}
              </button>
            ))}
          </div>

          <div style={s.list}>
            {filteredItems.map((item) => (
              <article key={item.flightId} style={s.card}>
                <div>
                  <div style={s.topRow}>
                    <span style={s.airline}>{item.airline}</span>
                    <span style={s.tripType}>{item.tripType}</span>
                  </div>
                  <h2 style={s.route}>{item.route}</h2>
                  <p style={s.time}>{item.departTime} 출발 · {item.arriveTime} 도착 · {item.duration}</p>
                  <p style={s.meta}>{item.seatClass} · {item.baggage}</p>
                </div>
                <div style={s.side}>
                  <p style={s.price}>최저 {item.priceFrom.toLocaleString()}원</p>
                  <Link to="/support" style={s.cardBtn}>운임 문의</Link>
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
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '22px', borderRadius: '22px', background: '#fff', border: `1px solid ${C.borderLight}`, boxShadow: '0 12px 28px rgba(15,23,42,0.05)', flexWrap: 'wrap' },
  topRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' },
  airline: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#EEF2FF', color: '#4338CA', fontSize: '11px', fontWeight: '800' },
  tripType: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#F4F4F5', color: '#52525B', fontSize: '11px', fontWeight: '800' },
  route: { margin: '0 0 8px', fontSize: '24px', color: C.text, fontWeight: '800' },
  time: { margin: '0 0 8px', fontSize: '14px', color: C.textSub, fontWeight: '700' },
  meta: { margin: 0, fontSize: '13px', color: C.textLight },
  side: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  price: { margin: 0, fontSize: '20px', color: C.text, fontWeight: '800' },
  cardBtn: { display: 'inline-flex', padding: '10px 14px', borderRadius: '12px', background: '#FFF1F1', color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '800' },
};
