import { Link, useLocation } from 'react-router-dom';

export default function SectionNav({ items }) {
  const location = useLocation();

  return (
    <nav style={s.wrap} aria-label="섹션 이동">
      {items.map((item) => {
        const active = item.match
          ? item.match(location.pathname)
          : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              ...s.link,
              ...(active ? s.linkActive : null),
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const s = {
  wrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  link: {
    padding: '9px 14px',
    borderRadius: '999px',
    border: '1px solid #E5E7EB',
    background: '#fff',
    color: '#4B5563',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  linkActive: {
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    borderColor: '#E8484A',
    color: '#fff',
  },
};
