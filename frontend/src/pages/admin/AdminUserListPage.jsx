import { useEffect, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import SectionNav from '../../components/common/SectionNav';
import StatusBadge from '../../components/common/StatusBadge';
import { gradeGuide } from '../../mock/benefitsData';

const ADMIN_SECTION_ITEMS = [
  { to: '/admin', label: '대시보드', match: (pathname) => pathname === '/admin' },
  { to: '/admin/users', label: '회원 관리', match: (pathname) => pathname.startsWith('/admin/users') },
  { to: '/admin/sellers', label: '호스트 승인', match: (pathname) => pathname.startsWith('/admin/sellers') },
  { to: '/admin/inquiries', label: '문의 처리', match: (pathname) => pathname.startsWith('/admin/inquiries') },
  { to: '/admin/rewards', label: '쿠폰·마일리지', match: (pathname) => pathname.startsWith('/admin/rewards') },
  { to: '/admin/events', label: '이벤트 관리', match: (pathname) => pathname.startsWith('/admin/events') },
];

const MOCK_USERS = [
  { userId: 1, name: '홍길동', email: 'user1@test.com', role: 'USER', grade: 'SILVER', status: 'ACTIVE', createdAt: '2026-01-10' },
  { userId: 2, name: '김철수', email: 'user2@test.com', role: 'USER', grade: 'GOLD', status: 'SUSPENDED', createdAt: '2026-01-15' },
  { userId: 3, name: '이영희', email: 'user3@test.com', role: 'USER', grade: 'BLACK', status: 'ACTIVE', createdAt: '2026-02-01' },
];

export default function AdminUserListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    // TODO(back-end):
    // GET /api/v1/admin/users
    // response item example:
    // { userId, name, email, role, status, createdAt }
    // status는 ACTIVE | SUSPENDED 기준으로 내려주면 현재 UI를 그대로 사용할 수 있다.
    setRows(MOCK_USERS);
    setLoading(false);
  }, []);

  const selectedUser = rows.find((row) => row.userId === selectedUserId) || null;
  const activeCount = rows.filter((row) => row.status === 'ACTIVE').length;
  const suspendedCount = rows.filter((row) => row.status === 'SUSPENDED').length;
  const blackGradeCount = rows.filter((row) => row.grade === 'BLACK').length;

  const updateUserStatus = (userId, status) => {
    // TODO(back-end):
    // PATCH /api/v1/admin/users/{userId}/status
    // body: { status, note }
    // success response example:
    // { userId, status, updatedAt }
    // 현재 adminNote는 상세 패널 메모 입력값이며, 서버 저장 시 함께 전송하면 된다.
    setRows((prev) => prev.map((row) => (row.userId === userId ? { ...row, status } : row)));
  };

  const updateUserGrade = (userId) => {
    setRows((prev) => prev.map((row) => {
      if (row.userId !== userId) return row;
      return { ...row, grade: getNextGrade(row.grade) };
    }));
  };

  const columns = [
    { key: 'userId', label: 'ID', width: '90px' },
    { key: 'name', label: '이름' },
    { key: 'email', label: '이메일' },
    {
      key: 'role',
      label: '역할',
      width: '120px',
      render: (row) => <StatusBadge label={row.role} background="#EFF6FF" color="#2563EB" />,
    },
    {
      key: 'grade',
      label: '회원 등급',
      width: '130px',
      render: (row) => {
        const gradeMeta = gradeGuide.find((item) => item.code === row.grade) || gradeGuide[0];
        return <StatusBadge label={gradeMeta.name} background="#FFF7E6" color="#B45309" />;
      },
    },
    {
      key: 'status',
      label: '상태',
      width: '120px',
      render: (row) => (
        <StatusBadge
          label={row.status === 'ACTIVE' ? '활성' : '비활성'}
          background={row.status === 'ACTIVE' ? '#DCFCE7' : '#F3F4F6'}
          color={row.status === 'ACTIVE' ? '#166534' : '#4B5563'}
        />
      ),
    },
    { key: 'createdAt', label: '가입일', width: '120px' },
    {
      key: 'actions',
      label: '관리',
      width: '300px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedUserId(row.userId); setAdminNote(''); }}>상세 보기</button>
          <button type="button" style={styles.primaryBtn} onClick={() => updateUserGrade(row.userId)}>등급 변경</button>
          {row.status === 'ACTIVE' ? (
            <button type="button" style={styles.warnBtn} onClick={() => updateUserStatus(row.userId, 'SUSPENDED')}>비활성화</button>
          ) : (
            <button type="button" style={styles.primaryBtn} onClick={() => updateUserStatus(row.userId, 'ACTIVE')}>복구</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.wrap}>
      <style>{`
        @media (max-width: 920px) {
          .tz-admin-user-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-admin-user-summary {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <SectionNav items={ADMIN_SECTION_ITEMS} />
      <section style={styles.hero} className="tz-admin-user-hero">
        <div style={styles.heroMain}>
          <p style={styles.eyebrow}>USER OPERATIONS</p>
          <h1 style={styles.heroTitle}>회원 관리 보드</h1>
          <p style={styles.heroDesc}>회원 상태, 등급 변경, 운영 메모 흐름을 표 진입 전에 먼저 파악할 수 있도록 요약했습니다.</p>
        </div>
        <div style={styles.summaryGrid} className="tz-admin-user-summary">
          <article style={styles.summaryCard}>
            <span style={styles.summaryLabel}>활성 회원</span>
            <strong style={styles.summaryValue}>{activeCount}명</strong>
          </article>
          <article style={styles.summaryCard}>
            <span style={styles.summaryLabel}>비활성 회원</span>
            <strong style={styles.summaryValue}>{suspendedCount}명</strong>
          </article>
          <article style={{ ...styles.summaryCard, ...styles.summaryAccent }}>
            <span style={styles.summaryLabel}>BLACK 등급</span>
            <strong style={styles.summaryValueAccent}>{blackGradeCount}명</strong>
          </article>
        </div>
      </section>
      <ListPageHeader
        title="사용자 목록"
        description={`총 ${rows.length}명의 사용자를 확인할 수 있습니다.`}
        actions={
          <button
            type="button"
            style={policyOpen ? styles.primaryHeaderBtn : styles.secondaryHeaderBtn}
            onClick={() => setPolicyOpen(true)}
          >
            등급 정책 관리
          </button>
        }
      />
      <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyText="등록된 사용자가 없습니다." emptyDescription="회원 가입이 발생하면 이곳에서 역할과 가입일을 함께 확인할 수 있습니다." />
      {policyOpen ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHead}>
              <div>
                <p style={styles.modalEyebrow}>GRADE POLICY</p>
                <h2 style={styles.modalTitle}>회원 등급 정책 관리</h2>
                <p style={styles.modalDesc}>현재 노출 중인 등급 기준과 혜택 문맥을 프론트 기준으로 바로 확인할 수 있습니다.</p>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setPolicyOpen(false)}>닫기</button>
            </div>
            <div style={styles.policyGrid}>
              {gradeGuide.map((grade) => (
                <article key={grade.code} style={styles.policyCard}>
                  <div style={styles.policyTop}>
                    <strong style={styles.policyName}>{grade.name}</strong>
                    <span style={styles.policyCode}>{grade.code}</span>
                  </div>
                  <p style={styles.policyRule}>
                    누적 결제 {grade.minTotalAmount.toLocaleString()}원 이상 · 누적 숙박 {grade.minStayCount}회 이상
                  </p>
                  <ul style={styles.policyBenefits}>
                    <li>기본 적립률 {grade.mileageRate}%</li>
                    <li>{grade.benefit}</li>
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {selectedUser ? (
        <AdminActionPanel
          title={`${selectedUser.name} 사용자 정보`}
          subtitle="회원 상태, 등급, 가입 정보를 확인하고 운영 메모를 남길 수 있습니다."
          fields={[
            { label: '이메일', value: selectedUser.email },
            { label: '역할', value: selectedUser.role },
            { label: '회원 등급', value: (gradeGuide.find((item) => item.code === selectedUser.grade) || gradeGuide[0]).name },
            { label: '상태', value: selectedUser.status === 'ACTIVE' ? '활성' : '비활성' },
            { label: '가입일', value: selectedUser.createdAt },
          ]}
          note={adminNote}
          onNoteChange={setAdminNote}
          notePlaceholder="관리자 메모나 등급 조정 사유를 남겨보세요."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedUserId(null)}>닫기</button>
              <button type="button" style={styles.primaryBtn} onClick={() => updateUserGrade(selectedUser.userId)}>등급 변경</button>
              {selectedUser.status === 'ACTIVE' ? (
                <button type="button" style={styles.warnBtn} onClick={() => updateUserStatus(selectedUser.userId, 'SUSPENDED')}>비활성화</button>
              ) : (
                <button type="button" style={styles.primaryBtn} onClick={() => updateUserStatus(selectedUser.userId, 'ACTIVE')}>복구</button>
              )}
            </>
          )}
        />
      ) : null}
    </div>
  );
}

function getNextGrade(currentGrade) {
  const currentIndex = gradeGuide.findIndex((item) => item.code === currentGrade);
  if (currentIndex === -1) return gradeGuide[0].code;
  return gradeGuide[(currentIndex + 1) % gradeGuide.length].code;
}

const styles = {
  wrap: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 1fr)',
    gap: '18px',
    marginBottom: '24px',
    padding: '30px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF6F2 0%, #FFFFFF 54%, #F5F8FF 100%)',
    border: '1px solid #EEE4E0',
    boxShadow: '0 18px 40px rgba(17,17,17,0.05)',
  },
  heroMain: { display: 'flex', flexDirection: 'column', gap: '10px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', color: '#E8484A' },
  heroTitle: { margin: 0, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#111111' },
  heroDesc: { margin: 0, fontSize: '15px', lineHeight: 1.75, color: '#555555', maxWidth: '680px' },
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
  },
  summaryLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  summaryValue: { fontSize: '26px', lineHeight: 1.1, color: '#111111' },
  summaryValueAccent: { fontSize: '26px', lineHeight: 1.1, color: '#2F3640' },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' },
  primaryHeaderBtn: {
    border: 'none',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 800,
    padding: '9px 14px',
    cursor: 'pointer',
  },
  secondaryHeaderBtn: {
    border: '1px solid #E5E7EB',
    borderRadius: '999px',
    background: '#fff',
    color: '#374151',
    fontSize: '12px',
    fontWeight: 800,
    padding: '9px 14px',
    cursor: 'pointer',
  },
  ghostBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  warnBtn: { border: 'none', borderRadius: '999px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#EEF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.36)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 320 },
  modalCard: { width: 'min(920px, 100%)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', background: '#fff', borderRadius: '28px', border: '1px solid #EFE4E1', boxShadow: '0 24px 48px rgba(15,23,42,0.16)', padding: '28px' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '20px' },
  modalEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', color: '#E8484A' },
  modalTitle: { margin: '0 0 8px', fontSize: '28px', lineHeight: 1.1, color: '#111111' },
  modalDesc: { margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#555555' },
  closeBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '9px 14px', cursor: 'pointer', whiteSpace: 'nowrap' },
  policyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  policyCard: { border: '1px solid #ECE8E4', borderRadius: '22px', background: 'linear-gradient(145deg, #FFF7F3 0%, #FFFFFF 100%)', padding: '18px', display: 'grid', gap: '12px' },
  policyTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  policyName: { fontSize: '18px', color: '#111111' },
  policyCode: { fontSize: '11px', fontWeight: 800, color: '#C4634E', background: '#FFF1EE', border: '1px solid #F0D6CF', borderRadius: '999px', padding: '5px 9px' },
  policyRule: { margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#555555' },
  policyBenefits: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '6px', fontSize: '13px', lineHeight: 1.6, color: '#2F3640' },
};
