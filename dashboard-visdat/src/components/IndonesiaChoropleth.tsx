import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import L, { Layer } from 'leaflet';
import Modal from './Modal';

import 'leaflet/dist/leaflet.css';

type ProvinceData = {
  ipm: number;
  pct_formal_worker: number;
  avg_schooling_years: number;
  ump_rupiah: number;
  p0_pct: number;
  aps_avg: number;
};

type SelectedProvince = {
  name: string;
  value: number;
} | null;

const P0_MIN = 3.72;
const P0_MAX = 30.03;

function getColor(value: number): string {
  const t = Math.max(0, Math.min(1, (value - P0_MIN) / (P0_MAX - P0_MIN)));

  const stops = [
    { t: 0.00, r: 250, g: 238, b: 218 }, // #FAEEDA — low
    { t: 0.50, r: 239, g: 159, b:  39 }, // #EF9F27 — mid
    { t: 1.00, r: 226, g:  75, b:  74 }, // #E24B4A — high
  ];

  let s = stops[0], e = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      s = stops[i];
      e = stops[i + 1];
      break;
    }
  }

  const seg = (t - s.t) / (e.t - s.t);
  const r = Math.round(s.r + (e.r - s.r) * seg);
  const g = Math.round(s.g + (e.g - s.g) * seg);
  const b = Math.round(s.b + (e.b - s.b) * seg);
  return `rgb(${r},${g},${b})`;
}

// Normalize GeoJSON province names to match JSON keys
function normalizeProvinceName(raw: string): string {
  if (!raw) return '';
  const name = raw.trim();
  const map: Record<string, string> = {
    'DI YOGYAKARTA': 'DI Yogyakarta',
    'DKI JAKARTA': 'DKI Jakarta',
    'KEPULAUAN BANGKA BELITUNG': 'Kepulauan Bangka Belitung',
    'KEP. BANGKA BELITUNG': 'Kepulauan Bangka Belitung',
    'KEPULAUAN RIAU': 'Kepulauan Riau',
    'KEP. RIAU': 'Kepulauan Riau',
  };
  const upper = name.toUpperCase();
  if (map[upper]) return map[upper];
  return name
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function IndonesiaChoropleth() {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [provinceData, setProvinceData] = useState<Record<string, ProvinceData>>({});
  const [selectedProvince, setSelectedProvince] = useState<SelectedProvince>(null);

  useEffect(() => {
    fetch('/indonesia-province.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));

    fetch('/indonesia_province_data_2025.json')
      .then((res) => res.json())
      .then((data) => setProvinceData(data))
      .catch((err) => console.error('Failed to load province data:', err));
  }, []);

  const style = (feature: any) => {
    const raw =
      feature.properties.Propinsi ||
      feature.properties.PROVINSI ||
      feature.properties.name;

    const provinceName = normalizeProvinceName(raw);
    const value = provinceData[provinceName]?.p0_pct ?? 0;

    return {
      fillColor: value > 0 ? getColor(value) : '#e8e8e2',
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    const raw =
      feature.properties.Propinsi ||
      feature.properties.PROVINSI ||
      feature.properties.name;

    const provinceName = normalizeProvinceName(raw);
    const value = provinceData[provinceName]?.p0_pct ?? 0;

    layer.bindTooltip(`
      <div>
        <strong>${provinceName}</strong><br/>
        P0: ${value > 0 ? value + '%' : 'No data'}
      </div>
    `);

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({ weight: 3, color: '#666', fillOpacity: 1 });
        target.bringToFront();
      },
      mouseout: (e: any) => {
        geoJsonRef.current?.resetStyle(e.target);
      },
      click: () => {
        setSelectedProvince({ name: provinceName, value });
      },
    });
  };

  return (
    <>
      <div style={{ width: '100%', height: '100%' }}>
        <MapContainer
          center={[-2.5, 118]}
          zoom={5}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <GeoJSON
              key={JSON.stringify(provinceData)}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
              ref={geoJsonRef}
            />
          )}
        </MapContainer>
      </div>

      <Modal
        open={!!selectedProvince}
        onClose={() => setSelectedProvince(null)}
        title={selectedProvince?.name ?? ''}
        width={400}
        footer={
          <span className="poverty-modal-source">Sumber: Badan Pusat Statistik (BPS)</span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="poverty-formula">
            <span className="poverty-formula-label">Persentase Kemiskinan (P0)</span>
            <div className="poverty-formula-eq">
              {selectedProvince?.value}%
            </div>
          </div>
          <p className="poverty-modal-text">
            Persentase penduduk miskin di provinsi <strong>{selectedProvince?.name}</strong> adalah{' '}
            <strong>{selectedProvince?.value}%</strong> dari total penduduk, berdasarkan data Garis
            Kemiskinan yang ditetapkan oleh Badan Pusat Statistik.
          </p>
        </div>
      </Modal>
    </>
  );
}