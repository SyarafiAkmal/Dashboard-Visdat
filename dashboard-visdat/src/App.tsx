import './App.css';
import IndonesiaChoropleth from './components/IndonesiaChoropleth';
import ChartCard from './components/ChartCard';
import Modal from './components/Modal';
import StatCards from './components/StatCards';
import SearchBar from './components/SearchBar';
import { ExternalLink } from "lucide-react";
import { useState } from "react";

function App() {
  const [showPovertyModal, setShowPovertyModal] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState(false);

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-title">
          <span className="header-eyebrow">Evaluasi Faktor Ekonomi Sosial (Badan Pusat Statistik 2025)</span>
          <h1 className="header-heading">Dashboard Visualisasi Potret Kemiskinan: Mencari Akar Masalah</h1>
        </div>

        <SearchBar />
      </header>

      <main className="content-grid">
        {/* LEFT */}
        <section className="left-panel">
          <div className="card map-card">
            <IndonesiaChoropleth />
          </div>

          <div className="bottom-grid">
            <StatCards />
            <div className="card big-card">
              <div className="legend-header">
                <span className="legend-title">Map legend (P0: Poverty Percentage per Province)</span>
                <span className="legend-subtitle">Poverty Percentage</span>
              </div>

              <div className="legend-body">
                <div className="legend-col">
                  <p className="legend-section-label">Poverty level</p>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="legend-swatch" style={{ background: "#E24B4A" }} />
                      <span className="legend-label">Critical <span className="legend-range">(&gt;75%)</span></span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-swatch" style={{ background: "#EF9F27" }} />
                      <span className="legend-label">High <span className="legend-range">(50–75%)</span></span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-swatch" style={{ background: "#FAC775" }} />
                      <span className="legend-label">Moderate <span className="legend-range">(25–50%)</span></span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-swatch" style={{ background: "#FAEEDA" }} />
                      <span className="legend-label">Low <span className="legend-range">(&lt;25%)</span></span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-swatch legend-swatch--empty" />
                      <span className="legend-label">No data</span>
                    </div>
                  </div>
                </div>

                <div className="legend-col">
                  <p className="legend-section-label">Gradient scale</p>
                  <div className="legend-gradient-bar" />
                  <div className="legend-gradient-ticks">
                    {["0", "25", "50", "75", "100"].map((t) => (
                      <span key={t} className="legend-tick">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="legend-footer">
                <button className="legend-btn" onClick={() => setShowPovertyModal(true)}>
                  How is Poverty Percentage Calculated?
                  <ExternalLink size={11} style={{ marginLeft: 5, marginBottom: 2, verticalAlign: "middle" }} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="right-panel">
          <div className="chart-grid">
            <ChartCard
              title="Tenaga Kerja Formal vs Persentase Kemiskinan"
              xKey="pct_formal_worker"
              description="Hubungan antara tingkat tenaga kerja formal dengan persentase kemiskinan di setiap provinsi."
              variables={[
                { name: "X — Tenaga Kerja Formal", explanation: "Persentase penduduk yang bekerja di sektor formal terhadap total angkatan kerja." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
            <ChartCard
              title="Rerata Lama Sekolah vs Persentase Kemiskinan"
              xKey="avg_schooling_years"
              description="Hubungan antara rata-rata lama sekolah dengan persentase kemiskinan di setiap provinsi."
              variables={[
                { name: "X — Rerata Lama Sekolah", explanation: "Rata-rata jumlah tahun pendidikan yang diterima oleh penduduk di suatu wilayah." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
            <ChartCard
              title="Indeks Pembangunan Manusia vs Persentase Kemiskinan"
              xKey="ipm"
              description="Hubungan antara indeks pembangunan manusia dengan persentase kemiskinan di setiap provinsi."
              variables={[
                { name: "X — Indeks Pembangunan Manusia", explanation: "Indeks yang mengukur tingkat pembangunan manusia berdasarkan pendidikan, kesehatan, dan standar hidup." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
            <ChartCard
              title="Angka Partisipasi Sekolah vs Persentase Kemiskinan"
              xKey="aps_avg"
              description="Hubungan antara angka partisipasi sekolah dengan persentase kemiskinan di setiap provinsi."
              variables={[
                { name: "X — Angka Partisipasi Sekolah", explanation: "Persentase penduduk usia sekolah yang sedang bersekolah." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
          </div>

          <div className="card bottom-right-card">
            <div className="umr-legend">
              <div className="umr-legend-left">
                <span className="umr-legend-title">UMR Indicator</span>
                <span className="umr-legend-subtitle">Upah Minimum Regional per province</span>
              </div>
              <div className="umr-legend-right">
                <div className="umr-gradient-wrap">
                  <span className="umr-gradient-label">Low income</span>
                  <div className="umr-gradient-bar" />
                  <span className="umr-gradient-label">High income</span>
                </div>
                <div className="umr-gradient-ticks">
                  {["Rp 1,5jt", "Rp 2jt", "Rp 2,5jt", "Rp 3jt", "Rp 3,5jt", "Rp 4jt+"].map((t) => (
                    <span key={t} className="umr-tick">{t}</span>
                  ))}
                </div>
                <div className="umr-footer">
                  <button className="legend-btn" onClick={() => setShowInsightModal(true)}>
                    Chart Insight
                    <ExternalLink size={11} style={{ marginLeft: 5, marginBottom: 2, verticalAlign: "middle" }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Modal
        open={showPovertyModal}
        onClose={() => setShowPovertyModal(false)}
        title="Cara Menghitung Persentase Kemiskinan"
        width={480}
        footer={
          <span className="poverty-modal-source">Sumber: Badan Pusat Statistik (BPS)</span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="poverty-formula">
            <span className="poverty-formula-label">P0 — Head Count Index</span>
            <div className="poverty-formula-eq">
              P0 =&nbsp;
              <span className="poverty-fraction">
                <span>Jumlah Penduduk Miskin</span>
                <span>Total Penduduk</span>
              </span>
              &nbsp;× 100%
            </div>
          </div>
          <p className="poverty-modal-text">
            <strong>P0</strong> (atau Head Count Index) adalah indikator yang mengukur persentase
            penduduk yang hidup di bawah Garis Kemiskinan. Angka ini didapatkan dengan membandingkan
            jumlah penduduk miskin terhadap total jumlah penduduk di suatu wilayah.
          </p>
          <p className="poverty-modal-text">
            Badan Pusat Statistik (BPS) menghitung Garis Kemiskinan berdasarkan kemampuan seseorang
            dalam memenuhi kebutuhan dasar, baik berupa makanan maupun non-makanan. Penduduk yang
            rata-rata pengeluaran per kapita per bulannya berada di bawah garis tersebut
            dikategorikan sebagai penduduk miskin.
          </p>
        </div>
      </Modal>
      <Modal
        open={showInsightModal}
        onClose={() => setShowInsightModal(false)}
        title="Chart Insight"
        width={500}
        footer={
          <span className="poverty-modal-source">Sumber: Badan Pusat Statistik (BPS) 2025</span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="poverty-formula">
            <span className="poverty-formula-label">Temuan Utama</span>
            <div className="poverty-formula-eq" style={{ fontSize: 13 }}>
              UMP tinggi ≠ kemiskinan rendah
            </div>
          </div>
          <p className="poverty-modal-text">
            Provinsi-provinsi Papua memiliki UMP tertinggi secara nasional (Rp 4,2–4,3jt), namun juga
            mencatat persentase kemiskinan tertinggi. Ini menunjukkan bahwa penetapan upah minimum
            saja tidak cukup tanpa disertai penyerapan tenaga kerja formal yang memadai.
          </p>
          <p className="poverty-modal-text">
            Sebaliknya, DKI Jakarta dan Kepulauan Riau menunjukkan kombinasi UMP tinggi dengan
            kemiskinan rendah, didukung oleh tingginya persentase tenaga kerja formal dan rata-rata
            lama sekolah yang di atas rata-rata nasional.
          </p>
          <p className="poverty-modal-text">
            Pola pada keempat scatter plot menunjukkan korelasi negatif yang konsisten antara
            kemiskinan dengan tenaga kerja formal, rerata lama sekolah, IPM, dan angka partisipasi
            sekolah — mengindikasikan bahwa investasi di bidang pendidikan dan formalisasi tenaga
            kerja merupakan faktor kunci dalam pengentasan kemiskinan.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;