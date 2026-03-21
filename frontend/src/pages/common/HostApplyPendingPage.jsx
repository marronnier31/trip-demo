import { Link, useLocation } from 'react-router-dom';
import { MAX_WIDTH } from '../../styles/tokens';

export default function HostApplyPendingPage() {
  const location = useLocation();
  const representativeName = location.state?.representativeName || '신청자';
  const region = location.state?.region || '대표 운영 지역';

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <section style={s.hero}>
          <div style={s.heroMain}>
            <div style={s.badge}>3 / 3 승인 대기</div>
            <h1 style={s.title}>호스트 신청이 접수되었습니다</h1>
            <p style={s.desc}>
              <strong>{representativeName}</strong>님의 신청이 접수되었습니다.
              <br />
              현재 기준 대표 운영 지역은 <strong>{region}</strong>으로 기록된 흐름입니다.
            </p>
            <div style={s.actions}>
              <Link to="/mypage" style={s.primaryBtn}>마이페이지로 이동</Link>
              <Link to="/host/apply" style={s.secondaryBtn}>신청 안내 다시 보기</Link>
            </div>
          </div>

          <aside style={s.heroSide}>
            <div style={s.statusBox}>
              <p style={s.statusTitle}>현재 상태</p>
              <p style={s.statusText}>승인 대기</p>
              <p style={s.statusHint}>승인 결과는 확인 후 순차적으로 안내됩니다.</p>
            </div>
          </aside>
        </section>

        <section style={s.grid}>
          <div style={s.guideBox}>
            <p style={s.guideTitle}>심사 안내</p>
            <ul style={s.guideList}>
              <li>제출한 정보와 서류를 기준으로 순차적으로 검토가 진행됩니다.</li>
              <li>승인 전까지는 신청 상태를 마이페이지에서 다시 확인할 수 있습니다.</li>
              <li>추가 확인이 필요한 경우 입력한 연락처로 안내가 전달됩니다.</li>
            </ul>
          </div>
          <div style={s.guideBox}>
            <p style={s.guideTitle}>안내</p>
            <ul style={s.guideList}>
              <li>대표 운영 지역과 제출 정보는 심사 기준으로 함께 확인됩니다.</li>
              <li>승인 후에는 숙소 등록과 판매자 센터 이용이 가능해집니다.</li>
              <li>보완 요청이 오면 안내에 맞춰 서류를 다시 제출해 주세요.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 74px)', padding: '42px 24px 64px', background: 'linear-gradient(180deg, #F8F6F4 0%, #F1EEEA 100%)' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'grid', gap: '18px' },
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.72fr)', gap: '18px', alignItems: 'stretch' },
  heroMain: { padding: '34px', borderRadius: '30px', background: '#FFFFFFEE', border: '1px solid #E7DFDF', boxShadow: '0 24px 48px rgba(0,0,0,0.08)' },
  heroSide: { display: 'flex' },
  badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', borderRadius: '999px', background: '#FFF1F1', color: '#D45759', fontSize: '12px', fontWeight: 800, marginBottom: '16px' },
  title: { margin: '0 0 12px', fontSize: '40px', lineHeight: 1.08, letterSpacing: '-0.03em', color: '#1F1F1F', fontWeight: 800 },
  desc: { margin: '0 0 20px', fontSize: '15px', lineHeight: 1.8, color: '#595959' },
  statusBox: { width: '100%', borderRadius: '26px', border: '1px solid #F4CBCD', background: '#FFF7F7', padding: '26px 22px', boxShadow: '0 18px 40px rgba(212,87,89,0.08)' },
  statusTitle: { margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#9A5C5D' },
  statusText: { margin: '0 0 6px', fontSize: '28px', fontWeight: 900, color: '#D45759' },
  statusHint: { margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#6D5A5B' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  guideBox: { borderRadius: '24px', border: '1px solid #ECECEC', background: '#FAFAFA', padding: '22px' },
  guideTitle: { margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#222' },
  guideList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', fontSize: '14px', lineHeight: 1.7, color: '#666' },
  actions: { marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
  primaryBtn: { textDecoration: 'none', textAlign: 'center', padding: '14px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', fontSize: '14px', fontWeight: 800 },
  secondaryBtn: { textDecoration: 'none', textAlign: 'center', padding: '14px 16px', borderRadius: '999px', background: '#fff', color: '#444', fontSize: '14px', fontWeight: 700, border: '1px solid #DDD' },
};
