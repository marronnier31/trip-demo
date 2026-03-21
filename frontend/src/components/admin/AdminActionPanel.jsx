import { C } from '../../styles/tokens';

export default function AdminActionPanel({
  title,
  subtitle,
  fields = [],
  note,
  onNoteChange,
  notePlaceholder = '처리 메모를 입력하세요.',
  actions,
}) {
  return (
    <aside style={s.panel}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>{title}</h3>
          {subtitle ? <p style={s.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
      <div style={s.fieldList}>
        {fields.map((field) => (
          <div key={field.label} style={s.fieldRow}>
            <span style={s.fieldLabel}>{field.label}</span>
            <span style={s.fieldValue}>{field.value}</span>
          </div>
        ))}
      </div>
      {typeof note === 'string' && onNoteChange ? (
        <div style={s.noteWrap}>
          <p style={s.noteLabel}>처리 메모</p>
          <textarea
            style={s.noteInput}
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={notePlaceholder}
            rows={4}
          />
        </div>
      ) : null}
      {actions ? <div style={s.actions}>{actions}</div> : null}
    </aside>
  );
}

const s = {
  panel: {
    marginTop: '18px',
    border: `1px solid #ECE8E4`,
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCFB 100%)',
    boxShadow: '0 16px 32px rgba(15, 23, 42, 0.06)',
    padding: '24px',
    display: 'grid',
    gap: '16px',
  },
  header: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  title: { margin: 0, fontSize: '22px', lineHeight: 1.2, color: C.text, fontWeight: 800, letterSpacing: '-0.02em' },
  subtitle: { margin: '8px 0 0', fontSize: '13px', color: C.textSub, lineHeight: 1.7, maxWidth: '760px' },
  fieldList: { display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
  fieldRow: { display: 'grid', gap: '6px', padding: '14px 16px', border: `1px solid ${C.borderLight}`, borderRadius: '16px', background: '#fff' },
  fieldLabel: { fontSize: '12px', color: C.textSub, fontWeight: 800 },
  fieldValue: { fontSize: '15px', color: C.text, fontWeight: 800 },
  noteWrap: { display: 'grid', gap: '8px' },
  noteLabel: { margin: 0, fontSize: '13px', color: C.text, fontWeight: 800 },
  noteInput: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '110px',
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: '#FFFDFC',
  },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
};
