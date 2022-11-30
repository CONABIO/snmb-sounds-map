import { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { GeoJSON } from 'react-leaflet';
import anps from './assets/anps.json'

import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {

  // sets if it should reproduce day or night sounds
  const [day,setDay] = useState(true);

  // set anp display name on mouse hover
  const [anp,setANP] = useState(null);

  // set boolean var to know if audio is paying
  const [isPlaying,setIsPlaying] = useState(false);

  // sets the audio to play
  const [audio,setAudio] = useState(null);

  // sets the current anp that is playing
  const [nowPlaying,setPlay] = useState(null);

  // set current vegetation
  const [vegetation,setVegetation] = useState(null);

  // set sample hour
  const [hour,setHour] = useState(null);

  // sets the list of anp that have audio files
  const [anpAudio,setAnpWithAudio] = useState([]);

  useEffect(() => {
    if(anpAudio.length !== 27)
      getAnps();
  })

  useEffect(() => {
    if(audio && isPlaying) {
      audio.play();
    } else if (audio && !isPlaying) {
      audio.pause();
    }
  })

  const getAnps = async () => {
    let response = await fetch('https://sipecamdata.conabio.gob.mx/snmbgraphql/',{
      method: 'post',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "query": `query {
          anpWithAudio {
            edges {
              node
            }
          } 
          
        }`
      })
    })
    let data = await response.json();
    
    setAnpWithAudio(data.data.anpWithAudio.edges.map(n => n.node))
  }

  const toggleTime = () => {
    let body = document.getElementsByTagName('body');
    let title = document.getElementById("app-title")
    let dayOrNight = document.getElementById("day-night-toggle");

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

    if(audio) {
      audio.pause();
      setAudio(null);
      playSound(dayOrNight,nowPlaying)
    }
    
    setDay(!day)
  }

  const style = (feature) => {
    if(anpAudio.includes(feature.id))
      return {
          fillColor: day ? "#02e3be" : "#ff8acc",
          weight: 0.3,
          opacity: 1,
          color: day ? "#02e3be" : "#ff8acc",
          dashArray: '3',
          fillOpacity: 0.5
      };
    else 
      return {
        fillColor: "#bababa",
        weight: 0.3,
        opacity: 0.5,
        color: "#bababa",
        dashArray: '3',
        fillOpacity: 0.2
      }
  };

  const showLabel = (e) => {
    if(e.target.options.fillColor === "#02e3be" || 
    e.target.options.fillColor === "#ff8acc")
      setANP(e.target.feature.properties.NOMBRE);
    else
      setANP(e.target.feature.properties.NOMBRE + " (sin audios)");
  }

  const hideLabel = () => {
    setANP('')
  }

  const playPauseSound = () => {
    if(isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
    
  }

  const playSound = async (dayOrNight, anpName) => {
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
              equalTo: "${anpName}",
              
            },
            ${
              dayOrNight.checked ? 
              `sampleHour: {
                greaterThan: 9,
                lessThan: 20
              }` : 
              `
              or: [
                {
                  sampleHour: {
                    lessThan: 9
                  }
                },
                {
                  sampleHour: {
                    greaterThan: 20
                  }
                }
              ]
              `
            }
          }, first: 1){
            edges {
              node {
                snmbArchivoPath
                snmbVegetacionTipo
                sampleHour
              }
            }
          }
        }`
      })
    });
    let data = await response.json();
    
    if(data.data.allAnpAudioSamples.edges.length) {
      let audioWAV = data.data.allAnpAudioSamples.edges[0].node.snmbArchivoPath
        .replace('/LUSTRE/sacmod/snmb_data/','https://monitoreo.conabio.gob.mx/snmb_pics/')
      setAudio(new Audio(audioWAV));
      setIsPlaying(true);
      setPlay(anpName)
      setVegetation(data.data.allAnpAudioSamples.edges[0].node.snmbVegetacionTipo);
      setHour(data.data.allAnpAudioSamples.edges[0].node.sampleHour);
    } else {
      setIsPlaying(false);
      setPlay(null);
      setVegetation(null);
      setHour(null);
    }
  }

  const onClickAnp = async (e) => {

    let dayOrNight = document.getElementById("day-night-toggle");
    
    setIsPlaying(false);
    setPlay(null);
    setVegetation(null);
    setHour(null);

    playSound(dayOrNight,e.target.feature.properties.NOMBRE);
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
        <h1 id="app-title" className={day ?  'light' : 'dark'}>Paisajes Sonoros en Áreas Naturales Protegidas de México</h1>
      </div>
      <div className={`toggle-switch-container ${day ?  '' : 'dark'}`}>
        <div className={`daytime-name dark`}>
          {!day ? 'Noche' : ''}
        </div>
        <div className="toggle-switch">
            <label className='toggle-switch-label'>
                <input
                  id="day-night-toggle" 
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
      <div className={`anp-name  ${day ? 'light' : 'dark'}`}>
        {anp ? `ANP: ${anp}` : null}
      </div>
      <div className={`now-playing ${day ? 'light' : 'dark'}`}>
        {nowPlaying ? `Reproduciendo sonidos de ANP ${nowPlaying}` : null}
        <div>{vegetation ? `Vegetación: ${vegetation}` : null}</div>
        <div>{hour ? `Hora de grabación: ${hour}:00` : null}</div>
        {nowPlaying ? <div onClick={playPauseSound} className='play-pause'>{ isPlaying ? 'Pausar' : 'Reproducir'}</div> : null}
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
      <div className='source'>Fuente: Sistema Nacional de Monitoreo de la Biodiversidad. CONANP, FMCN, CONABIO, CONFOR. 2014-2018.</div>
    </div>
  );
}

export default App;
