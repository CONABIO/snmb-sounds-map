import { useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { GeoJSON } from 'react-leaflet';
import anps from './assets/anps.json'

import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {

  const [day,setDay] = useState(true);
  const [anp,setANP] = useState(null);

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

  const style = (feature) => {
    return {
        fillColor: day ? "#02e3be" : "#ff8acc",
        weight: 0.3,
        opacity: 1,
        color: day ? "#02e3be" : "#ff8acc",
        dashArray: '3',
        fillOpacity: 0.5
    };
  };

  const showLabel = (e) => {
    setANP(e.target.feature.properties.NOMBRE);
  }

  const hideLabel = () => {
    setANP('')
  }

  const onClickAnp = async (e) => {

    let response = await fetch('https://sipecamdata.conabio.gob.mx/snmbgraphql/',{
      method: 'post',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "query": `
        query {
          allAnpAudioSamples(filter: {
            snmbNombreAnp: {
              equalTo: "${e.target.feature.properties.NOMBRE}"
            },
          }, first: 1){
            edges {
              node {
                snmbArchivoPath
              }
            }
          }
        }`
      })
    });
    let data = await response.json();

    console.log(data.data.allAnpAudioSamples.edges[0].node.snmbArchivoPath)
  }

  const onEachFeature = (feature,layer) => {
    layer.on({
      mouseover: showLabel,
      mouseout: hideLabel,
      click: onClickAnp
    })
  }

  return (
    <div className="App">
      <div>
        <h1 id="app-title" className={day ?  'light' : 'dark'}>Sonidos SNMB</h1>
      </div>
      <div className={`toggle-switch-container ${day ?  '' : 'dark'}`}>
        <div className={`daytime-name dark`}>
          {!day ? 'Noche' : ''}
        </div>
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
        <div className={`daytime-name light`}>
          {day ? 'Día' : ''}
        </div>
      </div>
      <div className={`anp-name ${day ? 'light' : 'dark'}`}>
        {anp ? `ANP: ${anp}` : null}
      </div>
      <MapContainer 
        key={day}
        className={`map-snmb ${day ?  'light' : 'dark'}`} 
        center={[22.0458888889, -100.545444444]} 
        zoom={5} 
        scrollWheelZoom={true}>
        { day ? <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        /> : <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />}
        <GeoJSON
          key={day}
          data={anps}
          style={style}
          onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
}

export default App;
