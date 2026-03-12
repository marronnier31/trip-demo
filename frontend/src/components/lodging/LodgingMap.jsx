import { useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

function buildSingleMarkerIcon() {
  return L.divIcon({
    className: 'tz-single-marker-shell',
    html: '<div class="tz-single-marker"><span class="tz-single-marker-dot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 11.5L12 5l8 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 10.5V19h9v-8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>숙소 위치</span></div>',
    iconSize: [104, 34],
    iconAnchor: [52, 17],
  });
}

export default function LodgingMap({ latitude, longitude, name, address, pricePerNight }) {
  const [mapInstance, setMapInstance] = useState(null);
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return <div style={s.fallback}>유효한 위치 좌표가 없습니다.</div>;
  }

  return (
    <div style={s.wrap}>
      <style>{`
        .tz-single-marker-shell { background: transparent; border: none; }
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control {
          z-index: 300 !important;
        }
        .leaflet-control-attribution {
          z-index: 250 !important;
        }
        .leaflet-pane,
        .leaflet-map-pane,
        .leaflet-tile-pane,
        .leaflet-overlay-pane,
        .leaflet-shadow-pane,
        .leaflet-marker-pane,
        .leaflet-tooltip-pane,
        .leaflet-popup-pane {
          z-index: 120 !important;
        }
        .tz-single-marker {
          min-width: 72px;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #D8D8D8;
          background: #FFFFFF;
          color: #2A2A2A;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(0,0,0,.16);
          white-space: nowrap;
          gap: 6px;
        }
        .tz-single-marker-dot {
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FF7A5A 0%, #E8484A 100%);
          color: #fff;
          border: 1px solid #E56B58;
          box-shadow: 0 2px 6px rgba(232,72,74,.28);
        }
      `}</style>

      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom
        style={s.map}
        zoomControl={false}
        whenReady={(event) => setMapInstance(event.target)}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <Marker position={[lat, lng]} icon={buildSingleMarkerIcon()}>
          <Popup>
            <strong>{name}</strong>
            <br />
            {address}
            {pricePerNight ? (
              <>
                <br />₩{Number(pricePerNight).toLocaleString()} / 1박
              </>
            ) : null}
          </Popup>
        </Marker>
      </MapContainer>

      <div style={s.controls}>
        <button style={s.ctrlBtn} onClick={() => mapInstance?.zoomIn()} aria-label="지도 확대">+</button>
        <button style={s.ctrlBtn} onClick={() => mapInstance?.zoomOut()} aria-label="지도 축소">−</button>
        <button style={s.ctrlBtn} onClick={() => mapInstance?.setView([lat, lng], 13)} aria-label="지도 재중앙">⌖</button>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    position: 'relative',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
  },
  map: {
    width: '100%',
    height: '460px',
  },
  fallback: {
    padding: '24px',
    textAlign: 'center',
    color: '#555555',
    background: '#F4F4F2',
  },
  controls: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  ctrlBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#FFFFFFEE',
    color: '#111827',
    fontSize: '19px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
  },
};
