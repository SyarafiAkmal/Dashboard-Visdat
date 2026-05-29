import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { Layer } from 'leaflet';
import Modal from './Modal';
import { Crosshair, Plus, Minus, ExternalLink } from 'lucide-react';

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
  data: ProvinceData;
} | null;

const P0_MIN = 3.72;
const P0_MAX = 30.03;
const DEFAULT_CENTER: [number, number] = [-2.5, 118];
const DEFAULT_ZOOM = 5.2;

function getColor(value: number): string {
  const t = Math.max(0, Math.min(1, (value - P0_MIN) / (P0_MAX - P0_MIN)));
  const stops = [
    { t: 0.00, r: 250, g: 238, b: 218 },
    { t: 0.50, r: 239, g: 159, b:  39 },
    { t: 1.00, r: 226, g:  75, b:  74 },
  ];
  let s = stops[0], e = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) { s = stops[i]; e = stops[i + 1]; break; }
  }
  const seg = (t - s.t) / (e.t - s.t);
  return `rgb(${Math.round(s.r + (e.r - s.r) * seg)},${Math.round(s.g + (e.g - s.g) * seg)},${Math.round(s.b + (e.b - s.b) * seg)})`;
}

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
  return name.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const INDICATORS = [
  { key: 'ipm' as keyof ProvinceData,                label: 'Indeks Pembangunan Manusia',     unit: ''     },
  { key: 'pct_formal_worker' as keyof ProvinceData,  label: 'Tenaga Kerja Formal',            unit: '%'    },
  { key: 'avg_schooling_years' as keyof ProvinceData, label: 'Rerata Lama Sekolah',           unit: ' thn' },
  { key: 'aps_avg' as keyof ProvinceData,            label: 'Angka Partisipasi Sekolah (avg)', unit: '%'   },
];

function MapControls() {
  const map = useMap();

  return (
    <div className="map-controls">
      <button
        className="map-ctrl-btn"
        onClick={() => map.zoomIn(1)}
        title="Zoom in"
      >
        <Plus size={14} />
      </button>
      <div className="map-ctrl-divider" />
      <button
        className="map-ctrl-btn"
        onClick={() => map.zoomOut(1)}
        title="Zoom out"
      >
        <Minus size={14} />
      </button>
      <div className="map-ctrl-divider" />
      <button
        className="map-ctrl-btn"
        onClick={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true })}
        title="Reset view"
      >
        <Crosshair size={14} />
      </button>
    </div>
  );
}

type Props = {
  onShowPovertyModal?: () => void;
};

export default function IndonesiaChoropleth({ onShowPovertyModal }: Props) {
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
    const raw = feature.properties.Propinsi || feature.properties.PROVINSI || feature.properties.name;
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
    const raw = feature.properties.Propinsi || feature.properties.PROVINSI || feature.properties.name;
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
        e.target.setStyle({ weight: 3, color: '#666', fillOpacity: 1 });
        e.target.bringToFront();
      },
      mouseout: (e: any) => {
        geoJsonRef.current?.resetStyle(e.target);
      },
      click: () => {
        const data = provinceData[provinceName];
        if (data) setSelectedProvince({ name: provinceName, data });
      },
    });
  };

  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          dragging={true}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapControls />
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

        {/* Legend overlay */}
          <div className="map-legend-overlay">
            <div className="map-legend-gradient-row">
              <span className="map-legend-label">0%</span>
              <div className="map-legend-gradient" />
              <span className="map-legend-label">30%+</span>
            </div>
            {onShowPovertyModal && (
              <button className="map-poverty-btn" onClick={onShowPovertyModal}>
                How is Poverty Percentage Calculated?
                <ExternalLink size={10} style={{ marginLeft: 4, verticalAlign: "middle" }} />
              </button>
            )}
          </div>
      </div>

      <Modal
        open={!!selectedProvince}
        onClose={() => setSelectedProvince(null)}
        title={selectedProvince?.name ?? ''}
        width={400}
        footer={<span className="poverty-modal-source">Sumber: Badan Pusat Statistik (BPS)</span>}
      >
        {selectedProvince && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="poverty-formula">
              <span className="poverty-formula-label">Persentase Kemiskinan (P0)</span>
              <div className="poverty-formula-eq">{selectedProvince.data.p0_pct}%</div>
            </div>
            <p className="poverty-modal-text">
              Persentase penduduk miskin di provinsi <strong>{selectedProvince.name}</strong> adalah{' '}
              <strong>{selectedProvince.data.p0_pct}%</strong> dari total penduduk, berdasarkan data
              Garis Kemiskinan yang ditetapkan oleh Badan Pusat Statistik.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="legend-section-label">Indikator Lainnya</span>
              {INDICATORS.map(({ key, label, unit }) => (
                <div key={key} className="chart-variable-row">
                  <span className="chart-variable-name">{label}</span>
                  <span className="chart-variable-desc">{selectedProvince.data[key]}{unit}</span>
                </div>
              ))}
              <div className="chart-variable-row">
                <span className="chart-variable-name">Upah Minimum Provinsi</span>
                <span className="chart-variable-desc">
                  {selectedProvince.data.ump_rupiah
                    ? `Rp ${selectedProvince.data.ump_rupiah.toLocaleString('id-ID')}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}