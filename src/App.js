import { useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'

import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {

  const [day,setDay] = useState(true);

  const toggleTime = () => {
    let body = document.getElementsByTagName('body');
    let title = document.getElementById("app-title")

    if(!day) {
      // title
      title.classList.add('light');
      title.classList.remove('dark');

      // body
      body[0].classList.add('light');
      body[0].classList.remove('dark');
    } else {
      // title
      title.classList.add('dark');
      title.classList.remove('light');

      // body
      body[0].classList.add('dark');
      body[0].classList.remove('light');
    }
    setDay(!day)
  }

  return (
    <div className="App">
      <div>
        <h1 id="app-title">Sonidos SNMB</h1>
      </div>
      <div className='toggle-switch-container'>
        <div className="toggle-switch">
            <label className='toggle-switch-label'>
                <input 
                  checked={day}
                  onChange={() => toggleTime()}
                  className='input-switch' 
                  type="checkbox" />
                <span className="slider"></span>
            </label>
        </div>
      </div>
      <MapContainer 
        key={day}
        className="map-snmb" 
        center={[22.0458888889, -100.545444444]} 
        zoom={5} 
        scrollWheelZoom={false}>
        { day ? <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        /> : <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />}
      </MapContainer>
    </div>
  );
}

export default App;
