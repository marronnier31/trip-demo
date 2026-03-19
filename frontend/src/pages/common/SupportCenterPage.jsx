import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { C, R } from '../../styles/tokens';

const FAQ_GROUPS = {
  traveler: [
    {
      q: '예약 후 문의는 어디에서 확인하나요?',
      a: '마이페이지의 내 문의 메뉴에서 답변 상태를 확인할 수 있습니다.',
    },
    {
      q: '숙소 상세 페이지에서 바로 문의할 수 있나요?',
      a: '가능합니다. 숙소 상세의 문의 버튼을 누르면 판매자에게 직접 문의가 접수됩니다.',
    },
    {
      q: '체크인/체크아웃 변경 요청은 어떻게 하나요?',
      a: '판매자에게 문의 유형을 숙소 문의로 선택해 요청해 주세요. 답변 후 예약 변경 가능 여부를 안내받을 수 있습니다.',
    },
  ],
  seller: [
    {
      q: '숙소 등록 오류는 어디로 문의하나요?',
      a: '운영 문의를 통해 관리자에게 접수하면 순차적으로 확인 후 회신합니다.',
    },
    {
      q: '정산 관련 문의도 문의센터에서 가능한가요?',
      a: '가능합니다. 문의 유형에서 운영 문의를 선택한 뒤 정산 기간과 항목을 함께 적어주세요.',
    },
    {
      q: '판매자 문의 내역은 어디서 보나요?',
      a: '판매자 대시보드 또는 판매자 문의 목록에서 문의 상태와 답변을 확인할 수 있습니다.',
    },
  ],
  common: [
    {
      q: '문의 답변은 보통 얼마나 걸리나요?',
      a: '영업일 기준 1~2일 내 답변을 목표로 처리하고 있습니다.',
    },
    {
      q: '긴급 문의는 어떻게 전달하나요?',
      a: '문의 제목 앞에 [긴급]을 붙여 접수해 주세요. 운영 시간 내 우선 확인됩니다.',
    },
    {
      q: '문의 접수 후 수정/삭제가 가능한가요?',
      a: '내 문의 화면에서 접수 상태인 문의는 수정 또는 삭제할 수 있습니다.',
    },
  ],
};

export default function SupportCenterPage() {
  const { user } = useAuth();
  const [faqTab, setFaqTab] = useState('traveler');
  const [openIndex, setOpenIndex] = useState(0);

  const isSeller = user?.role === ROLES.SELLER;
  const isTraveler = user?.role === ROLES.USER;
  const isAdmin = user?.role === ROLES.ADMIN;
  const roleBadge = isSeller
    ? '현재 로그인: 숙소 등록자'
    : isTraveler
      ? '현재 로그인: 여행객'
      : isAdmin
        ? '현재 로그인: 관리자'
        : '현재 로그인: 일반 사용자';
  const inquiryHistoryPath = isSeller ? '/seller/inquiries' : isAdmin ? '/admin/inquiries' : '/my/inquiries';
  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 820px) {
          .tz-support-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 920px) {
          .tz-support-hero-metrics {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>SUPPORT CENTER</p>
          <h1 style={s.title}>문의센터</h1>
          <p style={s.currentRole}>{roleBadge}</p>
          <p style={s.subtitle}>여행객과 숙소 등록자 모두를 위한 통합 지원 공간입니다. 유형에 맞게 문의를 접수하고 답변을 확인해보세요.</p>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.grid} className="tz-support-grid">
            <div style={s.actionCard}>
              <p style={s.badgeTraveler}>여행객 문의 채널</p>
              <p style={s.actionTitle}>여행객 문의하기</p>
              <p style={s.actionDesc}>예약/체크인/환불/숙소 이용 관련 문의를 판매자 또는 운영팀에 접수합니다.</p>
              {isTraveler ? (
                <Link to="/inquiry/create?type=USER_TO_SELLER" style={s.actionBtn}>여행객 문의 작성</Link>
              ) : (
                <p style={s.roleHint}>여행객 계정으로 로그인 시 작성할 수 있습니다.</p>
              )}
            </div>

            <div style={s.actionCard}>
              <p style={s.badgeSeller}>숙소 등록자 문의 채널</p>
              <p style={s.actionTitle}>숙소 등록자 문의하기</p>
              <p style={s.actionDesc}>숙소 등록/운영/정산 이슈를 관리자에게 접수하고 처리 상태를 확인합니다.</p>
              {isSeller ? (
                <Link to="/inquiry/create?type=SELLER_TO_ADMIN" style={s.actionBtn}>숙소 등록자 문의 작성</Link>
              ) : (
                <p style={s.roleHint}>숙소 등록자 계정으로 로그인 시 작성할 수 있습니다.</p>
              )}
            </div>

            <div style={{ ...s.actionCard, gridColumn: '1 / -1' }}>
              <p style={s.badgeCommon}>공통 지원</p>
              <p style={s.actionTitle}>시스템/계정 문의</p>
              <p style={s.actionDesc}>로그인/결제/오류 등 서비스 공통 이슈는 역할과 관계없이 접수할 수 있습니다.</p>
              <div style={s.commonActions}>
                <Link to="/inquiry/create?type=COMMON_TO_ADMIN" style={s.actionBtn}>공통 문의 작성</Link>
                <Link to={inquiryHistoryPath} style={s.actionGhostBtn}>문의 내역 보기</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...s.section, paddingTop: 0 }}>
        <div style={s.inner}>
          <div style={s.faqBox}>
            <div style={s.faqTabRow}>
              <button type="button" style={{ ...s.faqTab, ...(faqTab === 'traveler' ? s.faqTabActive : null) }} onClick={() => { setFaqTab('traveler'); setOpenIndex(0); }}>
                여행객 FAQ
              </button>
              <button type="button" style={{ ...s.faqTab, ...(faqTab === 'seller' ? s.faqTabActive : null) }} onClick={() => { setFaqTab('seller'); setOpenIndex(0); }}>
                숙소 등록자 FAQ
              </button>
              <button type="button" style={{ ...s.faqTab, ...(faqTab === 'common' ? s.faqTabActive : null) }} onClick={() => { setFaqTab('common'); setOpenIndex(0); }}>
                공통 FAQ
              </button>
            </div>

            <div style={s.faqList}>
              {FAQ_GROUPS[faqTab].map((item, idx) => (
                <div key={item.q} style={s.faqItem}>
                  <button type="button" style={s.faqQ} onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}>
                    <span>{item.q}</span>
                    <span>{openIndex === idx ? '−' : '+'}</span>
                  </button>
                  {openIndex === idx && <p style={s.faqA}>{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  page: {
    background: '#F9F7F5',
    minHeight: '100%',
    color: C.text,
    fontFamily: 'Manrope, "Noto Sans KR", sans-serif',
  },
  hero: {
    borderBottom: '1px solid #F0E8E8',
    background: 'linear-gradient(155deg, #FFF8F1 0%, #FFF 56%, #FDEEEE 100%)',
    padding: '56px 24px 42px',
  },
  inner: {
    width: 'min(1200px, calc(100vw - 40px))',
    margin: '0 auto',
  },
  eyebrow: {
    margin: 0,
    fontSize: '12px',
    letterSpacing: '0.12em',
    color: '#8B8B8B',
    fontWeight: 700,
  },
  title: {
    margin: '8px 0 10px',
    fontSize: 'clamp(30px, 4vw, 44px)',
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    maxWidth: '760px',
    color: '#5B5B5B',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  currentRole: {
    margin: '0 0 10px',
    display: 'inline-flex',
    borderRadius: R.pill,
    padding: '6px 10px',
    background: '#FFF3F3',
    color: '#B93E40',
    fontSize: '12px',
    fontWeight: 700,
  },
  section: {
    padding: '28px 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  actionCard: {
    textDecoration: 'none',
    background: '#fff',
    border: '1px solid #EFE8E8',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
  },
  badgeTraveler: {
    margin: 0,
    display: 'inline-flex',
    borderRadius: R.pill,
    background: '#EEF6FF',
    color: '#2C6ECF',
    fontSize: '12px',
    fontWeight: 700,
    padding: '6px 10px',
  },
  badgeSeller: {
    margin: 0,
    display: 'inline-flex',
    borderRadius: R.pill,
    background: '#FFF4EE',
    color: '#C75A2D',
    fontSize: '12px',
    fontWeight: 700,
    padding: '6px 10px',
  },
  badgeCommon: {
    margin: 0,
    display: 'inline-flex',
    borderRadius: R.pill,
    background: '#FFF3F3',
    color: '#B93E40',
    fontSize: '12px',
    fontWeight: 700,
    padding: '6px 10px',
  },
  actionTitle: {
    margin: '12px 0 0',
    color: C.text,
    fontSize: '18px',
    fontWeight: 800,
  },
  actionDesc: {
    margin: '8px 0 14px',
    color: '#666',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  actionBtn: {
    display: 'inline-flex',
    textDecoration: 'none',
    borderRadius: R.pill,
    border: 'none',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 800,
    padding: '10px 14px',
  },
  actionGhostBtn: {
    display: 'inline-flex',
    textDecoration: 'none',
    borderRadius: R.pill,
    border: '1px solid #E7E0E0',
    background: '#fff',
    color: '#5A5A5A',
    fontSize: '13px',
    fontWeight: 700,
    padding: '10px 14px',
  },
  roleHint: {
    margin: 0,
    color: '#8A8A8A',
    fontSize: '13px',
    fontWeight: 600,
  },
  commonActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  faqBox: {
    background: '#fff',
    border: '1px solid #EFE8E8',
    borderRadius: '18px',
    padding: '18px',
  },
  faqTabRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  faqTab: {
    border: '1px solid #E8E0E0',
    background: '#fff',
    borderRadius: R.pill,
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#666',
    cursor: 'pointer',
  },
  faqTabActive: {
    borderColor: '#E8484A',
    color: '#C13A3D',
    background: '#FFF3F3',
  },
  faqList: {
    display: 'grid',
    gap: '8px',
  },
  faqItem: {
    border: '1px solid #F0ECEC',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  faqQ: {
    width: '100%',
    border: 'none',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: 700,
    color: C.text,
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqA: {
    margin: 0,
    padding: '0 16px 14px',
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6,
  },
};
