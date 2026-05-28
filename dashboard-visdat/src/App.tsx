import './App.css';
import IndonesiaChoropleth from './components/IndonesiaChoropleth';

function App() {
  return (
    <div className="dashboard">
      <header className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search province..."
            className="search-input"
          />
        </div>
      </header>

      <main className="content-grid">
        {/* LEFT */}
        <section className="left-panel">
          <div className="card map-card">
            <IndonesiaChoropleth />
          </div>

          <div className="bottom-grid">
            <div className="card small-card" />
            <div className="card small-card" />
            <div className="card small-card" />
            <div className="card small-card" />
            <div className="card big-card" />
          </div>
        </section>

        {/* RIGHT */}
        <section className="right-panel">
          <div className="chart-grid">
            <div className="card chart-card" />
            <div className="card chart-card" />
            <div className="card chart-card" />
            <div className="card chart-card" />
          </div>

          <div className="card bottom-right-card" />
        </section>
      </main>
    </div>
  );
}

export default App;