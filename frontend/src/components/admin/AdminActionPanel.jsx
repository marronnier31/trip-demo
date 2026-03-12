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
    border: `1px solid ${C.borderLight}`,
    borderRadius: '18px',
    background: '#fff',
    padding: '20px',
    display: 'grid',
    gap: '16px',
  },
  header: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  title: { margin: 0, fontSize: '18px', color: C.text, fontWeight: 800 },
  subtitle: { margin: '6px 0 0', fontSize: '13px', color: C.textSub, lineHeight: 1.6 },
  fieldList: { display: 'grid', gap: '10px' },
  fieldRow: { display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` },
  fieldLabel: { fontSize: '12px', color: C.textSub, fontWeight: 700 },
  fieldValue: { fontSize: '14px', color: C.text, fontWeight: 700, textAlign: 'right' },
  noteWrap: { display: 'grid', gap: '8px' },
  noteLabel: { margin: 0, fontSize: '13px', color: C.text, fontWeight: 800 },
  noteInput: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '110px',
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: '#FCFCFC',
  },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
};
