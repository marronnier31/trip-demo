import { Link } from 'react-router-dom';

const BENEFITS = [
  { title: '운영 대시보드 제공', desc: '숙소 등록, 예약 관리, 문의 확인 흐름을 한 화면에서 운영할 수 있습니다.' },
  { title: '숙소 직접 등록', desc: '숙소 정보와 객실 소개를 직접 입력하고 노출 준비를 할 수 있습니다.' },
  { title: '승인 후 판매 시작', desc: '신청이 승인되면 판매자 대시보드와 숙소 등록 기능이 바로 활성화됩니다.' },
];

export default function HostApplyPage() {
  return (
    <div style={s.page}>
      <div style={s.bgGlowA} />
      <div style={s.bgGlowB} />

      <div style={s.shell}>
        <section style={s.heroCard}>
          <p style={s.eyebrow}>HOST APPLICATION</p>
          <h1 style={s.heroTitle}>내 숙소를
            <br />
            TripZone에 등록해보세요
          </h1>
          <p style={s.heroDesc}>게스트에게 숙소를 노출하고 예약, 문의, 운영 흐름을 한곳에서 관리할 수 있도록 호스트 등록 절차를 준비했습니다. 기본 정보와 운영 지역을 제출하면 승인 후 바로 판매를 시작할 수 있습니다.</p>

          <div style={s.benefitList}>
            {BENEFITS.map((item) => (
              <article key={item.title} style={s.benefitCard}>
                <h2 style={s.benefitTitle}>{item.title}</h2>
                <p style={s.benefitDesc}>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <aside style={s.sideCard}>
          <div style={s.stepWrap}>
            <span style={s.stepActive}>1. 호스트 등록 안내</span>
            <span style={s.step}>2. 신청서 작성</span>
            <span style={s.step}>3. 승인 후 운영 시작</span>
          </div>

          <div style={s.infoBox}>
            <p style={s.infoTitle}>등록 전 준비하면 좋은 정보</p>
            <ul style={s.infoList}>
              <li>정산 받을 대표자명</li>
              <li>사업자등록번호</li>
              <li>연락처와 소개 문구</li>
              <li>숙소 운영 지역</li>
            </ul>
          </div>

          <div style={s.actions}>
            <Link to="/host/apply/form" style={s.primaryBtn}>호스트 신청하기</Link>
            <Link to="/support" style={s.secondaryBtn}>운영 문의하기</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '42px 24px 56px',
    background: 'linear-gradient(180deg, #F8F6F4 0%, #F1EEEA 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlowA: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    right: '-120px',
    top: '-110px',
    background: 'radial-gradient(circle, rgba(232,72,74,0.16) 0%, rgba(232,72,74,0) 72%)',
  },
  bgGlowB: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    left: '-120px',
    bottom: '-120px',
    background: 'radial-gradient(circle, rgba(80,130,255,0.12) 0%, rgba(80,130,255,0) 72%)',
  },
  shell: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 0.8fr)',
    gap: '24px',
    position: 'relative',
    zIndex: 1,
  },
  heroCard: {
    background: '#FFFFFFEE',
    border: '1px solid #E7DFDF',
    borderRadius: '28px',
    boxShadow: '0 24px 48px rgba(0,0,0,0.06)',
    padding: '34px 32px',
  },
  eyebrow: { margin: '0 0 10px', fontSize: '11px', letterSpacing: '0.16em', color: '#D45759', fontWeight: 800 },
  heroTitle: { margin: '0 0 14px', fontSize: '42px', lineHeight: 1.08, letterSpacing: '-0.03em', color: '#1F1F1F' },
  heroDesc: { margin: '0 0 26px', fontSize: '15px', lineHeight: 1.8, color: '#595959', maxWidth: '760px' },
  benefitList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  benefitCard: {
    borderRadius: '20px',
    border: '1px solid #EFE4E4',
    background: 'linear-gradient(180deg, #FFFDFC 0%, #FFF7F7 100%)',
    padding: '20px 18px',
  },
  benefitTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#2B2B2B' },
  benefitDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: '#666' },
  sideCard: {
    background: '#FFFFFFEE',
    border: '1px solid #E7DFDF',
    borderRadius: '28px',
    boxShadow: '0 24px 48px rgba(0,0,0,0.06)',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  stepWrap: { display: 'grid', gap: '10px' },
  stepActive: {
    borderRadius: '14px',
    padding: '12px 14px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
  },
  step: {
    borderRadius: '14px',
    padding: '12px 14px',
    background: '#FFF7F7',
    color: '#9A5C5D',
    fontSize: '14px',
    fontWeight: 700,
    border: '1px solid #F0D8D9',
  },
  infoBox: {
    borderRadius: '18px',
    padding: '18px 18px 16px',
    background: '#FAFAFA',
    border: '1px solid #ECECEC',
  },
  infoTitle: { margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#222' },
  infoList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', color: '#666', fontSize: '13px', lineHeight: 1.6 },
  actions: { display: 'grid', gap: '10px', marginTop: 'auto' },
  primaryBtn: {
    textDecoration: 'none',
    textAlign: 'center',
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
  },
  secondaryBtn: {
    textDecoration: 'none',
    textAlign: 'center',
    padding: '14px 16px',
    borderRadius: '14px',
    background: '#fff',
    color: '#444',
    fontSize: '14px',
    fontWeight: 700,
    border: '1px solid #DDD',
  },
};
