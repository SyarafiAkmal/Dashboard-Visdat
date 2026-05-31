// SearchBar.tsx
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Modal from './Modal';

type ProvinceData = {
  ipm: number;
  pct_formal_worker: number;
  avg_schooling_years: number;
  ump_rupiah: number;
  p0_pct: number;
  aps_avg: number;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [allProvinces, setAllProvinces] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [provinceData, setProvinceData] = useState<Record<string, ProvinceData>>({});
  const [selectedProvince, setSelectedProvince] = useState<{ name: string; data: ProvinceData } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/indonesia_province_data_2025.json')
      .then((res) => res.json())
      .then((json: Record<string, ProvinceData>) => {
        setProvinceData(json);
        setAllProvinces(Object.keys(json).sort());
      });
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    setSuggestions(allProvinces.filter((p) => p.toLowerCase().includes(q)).slice(0, 6));
  }, [query, allProvinces]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (province: string) => {
    setQuery(province);
    setShowDropdown(false);
    setSelectedProvince({ name: province, data: provinceData[province] });
  };

  return (
    <>
      <div className="search-container" ref={containerRef}>
        <input
          type="text"
          placeholder="Cari provinsi..."
          className="search-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => query.trim().length > 0 && setShowDropdown(true)}
        />
        <Search size={16} className="search-icon" />

        {showDropdown && suggestions.length > 0 && (
          <div className="search-dropdown">
            {suggestions.map((province) => (
              <div
                key={province}
                className="search-suggestion"
                onMouseDown={() => handleSelect(province)}
              >
                <Search size={12} className="suggestion-icon" />
                <span>{province}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!selectedProvince}
        onClose={() => { setSelectedProvince(null); setQuery(''); }}
        title={selectedProvince?.name ?? ''}
        width={400}
        footer={
          <span className="poverty-modal-source">Sumber: Badan Pusat Statistik (BPS)</span>
        }
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
              {[
                { label: 'Indeks Pembangunan Manusia', value: selectedProvince.data.ipm, unit: '' },
                { label: 'Tenaga Kerja Formal', value: selectedProvince.data.pct_formal_worker, unit: '%' },
                { label: 'Rerata Lama Sekolah', value: selectedProvince.data.avg_schooling_years, unit: ' thn' },
                { label: 'Upah Minimum Provinsi', value: selectedProvince.data.ump_rupiah ? `Rp ${selectedProvince.data.ump_rupiah.toLocaleString('id-ID')}` : 'N/A', unit: '' },
                { label: 'Angka Partisipasi Sekolah (avg)', value: selectedProvince.data.aps_avg, unit: '%' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="chart-variable-row">
                  <span className="chart-variable-name">{label}</span>
                  <span className="chart-variable-desc">{value}{unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}