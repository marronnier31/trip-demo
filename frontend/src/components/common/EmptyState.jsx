import { C } from '../../styles/tokens';

export default function EmptyState({ icon = '🔍', title, desc, action }) {
  return (
    <div style={s.wrap}>
      <div style={s.icon}>{icon}</div>
      <p style={s.title}>{title}</p>
      {desc && <p style={s.desc}>{desc}</p>}
      {action && (
        <button onClick={action.onClick} style={s.btn}>
          {action.label}
        </button>
      )}
    </div>
  );
}

const s = {
  wrap: {
    textAlign: 'center',
    padding: '80px 24px',
    borderRadius: '20px',
    border: `1px solid ${C.borderLight}`,
    background: '#FCFCFC',
  },
  icon: { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '18px', fontWeight: '600', color: C.text, margin: '0 0 8px' },
  desc: { fontSize: '14px', color: C.textSub, margin: '0 0 24px', lineHeight: 1.7 },
  btn: {
    padding: '12px 24px',
    background: C.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
