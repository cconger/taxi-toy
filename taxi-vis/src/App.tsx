import TaxiZonesMap from './components/TaxiZonesMap'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>NYC Taxi Zones</h1>
        <p>All taxi service zones overlayed on top of OpenStreetMap.</p>
      </header>
      <div className="app__map">
        <TaxiZonesMap />
      </div>
    </div>
  )
}

export default App
