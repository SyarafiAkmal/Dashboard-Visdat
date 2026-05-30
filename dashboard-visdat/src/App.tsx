import './App.css';
import IndonesiaChoropleth from './components/IndonesiaChoropleth';
import ChartCard from './components/ChartCard';
import Modal from './components/Modal';
import StatCards from './components/StatCards';
import SearchBar from './components/SearchBar';
import { Lightbulb } from "lucide-react";
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

      <main className="content-area">

        {/* BARIS 1 — KPI CARDS */}
        <section className="kpi-row">
          <StatCards />
        </section>

        {/* BARIS 2 — PETA */}
        <section className="map-row">
          <div className="card map-card">
            <IndonesiaChoropleth onShowPovertyModal={() => setShowPovertyModal(true)} />
          </div>
        </section>

        {/* BARIS 3 — SCATTER PLOTS + UMR */}
        <section className="charts-row">
          <div className="chart-grid-4">
            <ChartCard
              title="Tenaga Kerja Formal vs Persentase Kemiskinan"
              xKey="pct_formal_worker"
              description="Hubungan antara tingkat tenaga kerja formal dengan persentase kemiskinan di setiap provinsi."
              insight="(r = -0.75, p < 0.001) Semakin tinggi proporsi pekerja formal, semakin rendah kemiskinan. Pekerjaan formal membawa kepastian upah, jaminan sosial, dan stabilitas pendapatan yang melindungi dari kemiskinan."
              variables={[
                { name: "X — Tenaga Kerja Formal", explanation: "Persentase penduduk yang bekerja di sektor formal terhadap total angkatan kerja." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
            <ChartCard
              title="Rerata Lama Sekolah vs Persentase Kemiskinan"
              xKey="avg_schooling_years"
              description="Hubungan antara rata-rata lama sekolah dengan persentase kemiskinan di setiap provinsi."
              insight="(r = −0.57, p < 0.001) Korelasi negatif yang signifikan, namun lebih lemah dari APS. Lama sekolah menggambarkan kualitas modal manusia yang sudah terbentuk, bukan akses pendidikan saat ini (efeknya nyata tapi lebih lambat terasa)."
              variables={[
                { name: "X — Rerata Lama Sekolah", explanation: "Rata-rata jumlah tahun pendidikan yang diterima oleh penduduk di suatu wilayah." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
            <ChartCard
              title="Angka Partisipasi Sekolah vs Persentase Kemiskinan"
              xKey="aps_avg"
              description="Hubungan antara angka partisipasi sekolah dengan persentase kemiskinan di setiap provinsi."
              insight="(r = −0.62, p < 0.001) Provinsi dengan partisipasi sekolah lebih tinggi cenderung memiliki kemiskinan lebih rendah. APS mencerminkan akses pendidikan generasi muda — investasi jangka panjang yang menekan kemiskinan struktural."
              variables={[
                { name: "X — Angka Partisipasi Sekolah", explanation: "Persentase penduduk usia sekolah yang sedang bersekolah." },
                { name: "Y — Persentase Kemiskinan", explanation: "Persentase penduduk miskin (P0) berdasarkan Garis Kemiskinan BPS." },
              ]}
            />
          </div>
          <div className="card umr-card">
            <div className="umr-content">
              <div className="umr-info">
                <span className="umr-legend-title">
                  UMR Indicator
                </span>

                <span className="umr-legend-subtitle">
                  Upah Minimum Regional per province
                </span>
              </div>

              <div className="umr-scale">
                <span className="umr-top-label">
                  Low income
                </span>

                <div className="umr-scale-body">
                  <div className="umr-gradient-bar-vertical" />

                  <div className="umr-ticks">
                    {[
                      "Rp 1,5jt",
                      "Rp 2jt",
                      "Rp 2,5jt",
                      "Rp 3jt",
                      "Rp 3,5jt",
                      "Rp 4jt+",
                    ].map((t) => (
                      <span key={t} className="umr-tick">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="umr-bottom-label">
                  High income
                </span>
              </div>
            </div>

            <div className="umr-footer">
              <button
                className="legend-btn"
                onClick={() => setShowInsightModal(true)}
              >
                Chart Insight
                <Lightbulb
                  size={13}
                  style={{
                    marginLeft: 5,
                    marginBottom: 2,
                    verticalAlign: "middle",
                  }}
                />
              </button>
            </div>
          </div>
        </section>

      </main>

      <Modal
        open={showPovertyModal}
        onClose={() => setShowPovertyModal(false)}
        title="Cara Menghitung Persentase Kemiskinan"
        width={480}
        footer={<span className="poverty-modal-source">Sumber: Badan Pusat Statistik (BPS)</span>}
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
            Badan Pusat Statistik (BPS) menghitung Garis Kemiskinan berdasarkan pendekatan kebutuhan dasar, yaitu nilai minimum pengeluaran yang dibutuhkan seseorang untuk memenuhi kebutuhan makanan dan non-makanan dasar. Kebutuhan makanan dihitung berdasarkan standar konsumsi minimum setara 2.100 kilokalori per orang per hari, sedangkan kebutuhan non-makanan mencakup aspek seperti perumahan, pendidikan, kesehatan, pakaian, listrik, dan transportasi. Penduduk dengan rata-rata pengeluaran per kapita per bulan di bawah garis tersebut dikategorikan sebagai penduduk miskin. Secara nasional, batas Garis Kemiskinan berada di kisaran Rp600 ribu per kapita per bulan, sehingga individu dengan pengeluaran rata-rata di bawah nilai tersebut dianggap belum mampu memenuhi kebutuhan dasar minimum menurut standar BPS.
          </p>
        </div>
      </Modal>

      <Modal
        open={showInsightModal}
        onClose={() => setShowInsightModal(false)}
        title="Chart Insight"
        width={500}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="poverty-formula">
            <span className="poverty-formula-label">Temuan Utama</span>
            <div className="poverty-formula-eq" style={{ fontSize: 13 }}>
              UMP tinggi ≠ kemiskinan rendah
            </div>
          </div>
          <p className="poverty-modal-text">
            (r = +0.13, p = 0.44) Tidak signifikan secara statistik. Provinsi-provinsi Papua memiliki UMP tertinggi
            secara nasional (Rp 4,2–4,3jt), namun juga mencatat persentase kemiskinan tertinggi. Ini menunjukkan
            bahwa penetapan upah minimum saja tidak cukup tanpa disertai penyerapan tenaga kerja formal yang memadai.
          </p>
          <p className="poverty-modal-text">
            Sebaliknya, DKI Jakarta dan Kepulauan Riau menunjukkan kombinasi UMP tinggi dengan kemiskinan rendah,
            didukung oleh tingginya persentase tenaga kerja formal dan rata-rata lama sekolah yang di atas rata-rata nasional.
          </p>
          <p className="poverty-modal-text">
            Pola pada ketiga scatter plot menunjukkan korelasi negatif yang konsisten antara kemiskinan dengan
            tenaga kerja formal, rerata lama sekolah, dan angka partisipasi sekolah — mengindikasikan bahwa
            investasi di bidang pendidikan dan formalisasi tenaga kerja merupakan faktor kunci dalam pengentasan kemiskinan.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;