import { useEffect, useState } from 'react';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import DataTable from '../../components/common/DataTable';
import ListPageHeader from '../../components/common/ListPageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const MOCK_USERS = [
  { userId: 1, name: '홍길동', email: 'user1@test.com', role: 'USER', status: 'ACTIVE', createdAt: '2026-01-10' },
  { userId: 2, name: '김철수', email: 'user2@test.com', role: 'USER', status: 'SUSPENDED', createdAt: '2026-01-15' },
  { userId: 3, name: '이영희', email: 'user3@test.com', role: 'USER', status: 'ACTIVE', createdAt: '2026-02-01' },
];

export default function AdminUserListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

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

  const updateUserStatus = (userId, status) => {
    // TODO(back-end):
    // PATCH /api/v1/admin/users/{userId}/status
    // body: { status, note }
    // success response example:
    // { userId, status, updatedAt }
    // 현재 adminNote는 상세 패널 메모 입력값이며, 서버 저장 시 함께 전송하면 된다.
    setRows((prev) => prev.map((row) => (row.userId === userId ? { ...row, status } : row)));
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
      width: '220px',
      render: (row) => (
        <div style={styles.actionRow}>
          <button type="button" style={styles.ghostBtn} onClick={() => { setSelectedUserId(row.userId); setAdminNote(''); }}>상세 보기</button>
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
      <ListPageHeader title="사용자 목록" description={`총 ${rows.length}명의 사용자를 확인할 수 있습니다.`} />
      <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyText="등록된 사용자가 없습니다." emptyDescription="회원 가입이 발생하면 이곳에서 역할과 가입일을 함께 확인할 수 있습니다." />
      {selectedUser ? (
        <AdminActionPanel
          title={`${selectedUser.name} 사용자 정보`}
          subtitle="시현용 관리자 패널입니다. 실제 상태 변경과 메모 저장은 백엔드 연결 시 API로 교체됩니다."
          fields={[
            { label: '이메일', value: selectedUser.email },
            { label: '역할', value: selectedUser.role },
            { label: '상태', value: selectedUser.status === 'ACTIVE' ? '활성' : '비활성' },
            { label: '가입일', value: selectedUser.createdAt },
          ]}
          note={adminNote}
          onNoteChange={setAdminNote}
          notePlaceholder="관리자 메모를 남겨보세요. 현재는 프론트 시현용입니다."
          actions={(
            <>
              <button type="button" style={styles.ghostBtn} onClick={() => setSelectedUserId(null)}>닫기</button>
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

const styles = {
  wrap: { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  ghostBtn: { border: '1px solid #E5E7EB', borderRadius: '999px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  warnBtn: { border: 'none', borderRadius: '999px', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: '#EEF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 800, padding: '7px 10px', cursor: 'pointer' },
};
