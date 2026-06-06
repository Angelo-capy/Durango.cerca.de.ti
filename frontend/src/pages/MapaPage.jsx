import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { useComerciosList } from '../context/ComerciosContext.jsx';
import { MapPin, AlertCircle } from 'lucide-react';

const DURANGO_CENTER = { lat: 24.0277, lng: -104.6532 };

// Fuera del componente para que la referencia no cambie entre renders
const LIBRARIES = ['places'];

const ESTILOS_MAPA = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

const TIPOS_LEGIBLES = {
  restaurant: 'Restaurante', food: 'Comida', store: 'Tienda',
  pharmacy: 'Farmacia', health: 'Salud', clothing_store: 'Ropa',
  hardware_store: 'Ferretería', supermarket: 'Supermercado',
  bakery: 'Panadería', cafe: 'Café', bar: 'Bar',
  beauty_salon: 'Estética', gym: 'Gimnasio',
  hospital: 'Hospital', bank: 'Banco', gas_station: 'Gasolinera',
};

function formatearTipos(types = []) {
  for (const t of types) {
    if (TIPOS_LEGIBLES[t]) return TIPOS_LEGIBLES[t];
  }
  return 'Comercio local';
}

function estrellas(rating) {
  const llenas = Math.round(rating);
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
}

export default function MapaPage() {
  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY,
    language: 'es',
    libraries: LIBRARIES,
  });

  const { comercios } = useComerciosList();
  const navigate = useNavigate();

  const [ubicacion, setUbicacion] = useState(null);
  const [mensajeGeo, setMensajeGeo] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [seleccionadoGoogle, setSeleccionadoGoogle] = useState(null);
  const [lugaresGoogle, setLugaresGoogle] = useState([]);

  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);

  function buscarLugaresCercanos(service, centro) {
    service.nearbySearch(
      {
        location: new window.google.maps.LatLng(centro.lat, centro.lng),
        radius: 1000,
      },
      (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          Array.isArray(results)
        ) {
          setLugaresGoogle(results.filter(r => r.geometry?.location));
        }
      }
    );
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setMensajeGeo('Tu navegador no admite geolocalización. Mostrando el centro de Durango.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const pos2 = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUbicacion(pos2);
        mapRef.current?.panTo(pos2);
        if (placesServiceRef.current) {
          buscarLugaresCercanos(placesServiceRef.current, pos2);
        }
      },
      () => {
        setMensajeGeo('No encontramos tu ubicación. El mapa muestra el centro de Durango.');
      }
    );
  }, []);

  const onMapLoad = useCallback(map => {
    mapRef.current = map;
    const service = new window.google.maps.places.PlacesService(map);
    placesServiceRef.current = service;
    buscarLugaresCercanos(service, DURANGO_CENTER);
  }, []);

  function seleccionarComercio(c) {
    setSeleccionadoGoogle(null);
    setSeleccionado(c);
  }

  function seleccionarGoogle(lugar) {
    setSeleccionado(null);
    setSeleccionadoGoogle(lugar);
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-screen">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-[18px] text-gray-700">
          No pudimos cargar el mapa. Revisa tu conexión o la clave de Google Maps.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: '100dvh' }}>
      {/* Banner de geolocalización */}
      {mensajeGeo && (
        <div className="absolute top-0 inset-x-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex gap-2 items-start shadow-sm">
          <MapPin size={18} className="text-navy-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[15px] text-gray-700">{mensajeGeo}</p>
        </div>
      )}

      {/* Leyenda de marcadores */}
      <div
        className="absolute z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-card px-3 py-2 flex flex-col gap-1.5"
        style={{ top: mensajeGeo ? 60 : 12, right: 12 }}
      >
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: '#1e3f72', boxShadow: '0 0 0 2px white, 0 0 0 3px #1e3f72' }} />
          <span className="text-[12px] text-gray-700 font-semibold">En la plataforma</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: '#9ca3af', boxShadow: '0 0 0 2px white, 0 0 0 3px #9ca3af' }} />
          <span className="text-[12px] text-gray-500">En Google Maps</span>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={ubicacion || DURANGO_CENTER}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          styles: ESTILOS_MAPA,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Marcador del usuario */}
        {ubicacion && (
          <MarkerF
            position={ubicacion}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#1e3f72',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2.5,
            }}
            title="Tu ubicación"
            zIndex={10}
          />
        )}

        {/* Marcadores de Google Places — gris, más pequeños, detrás */}
        {lugaresGoogle.map(lugar => (
          <MarkerF
            key={lugar.place_id}
            position={{
              lat: lugar.geometry.location.lat(),
              lng: lugar.geometry.location.lng(),
            }}
            onClick={() => seleccionarGoogle(lugar)}
            title={lugar.name}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#9ca3af',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            zIndex={1}
          />
        ))}

        {/* Marcadores de la plataforma — azul marino, más prominentes, encima */}
        {comercios.map(c =>
          c.lat && c.lng ? (
            <MarkerF
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              onClick={() => seleccionarComercio(c)}
              title={c.nombre}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#1e3f72',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2.5,
              }}
              zIndex={2}
            />
          ) : null
        )}

        {/* InfoWindow — comercio de la plataforma */}
        {seleccionado && (
          <InfoWindowF
            position={{ lat: seleccionado.lat, lng: seleccionado.lng }}
            onCloseClick={() => setSeleccionado(null)}
          >
            <div style={{ minWidth: 200, fontFamily: 'system-ui, sans-serif' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1e3f72', marginBottom: 2 }}>
                {seleccionado.nombre}
              </p>
              {seleccionado.categoria && (
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  {seleccionado.categoria.charAt(0).toUpperCase() + seleccionado.categoria.slice(1)}
                </p>
              )}
              {seleccionado.direccion_texto && (
                <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 8 }}>
                  {seleccionado.direccion_texto}
                </p>
              )}
              <button
                onClick={() => navigate(`/comercios/${seleccionado.id}`)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#1e3f72',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Ver más →
              </button>
            </div>
          </InfoWindowF>
        )}

        {/* InfoWindow — lugar de Google Maps */}
        {seleccionadoGoogle && (
          <InfoWindowF
            position={{
              lat: seleccionadoGoogle.geometry.location.lat(),
              lng: seleccionadoGoogle.geometry.location.lng(),
            }}
            onCloseClick={() => setSeleccionadoGoogle(null)}
          >
            <div style={{ minWidth: 200, fontFamily: 'system-ui, sans-serif' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 2 }}>
                {seleccionadoGoogle.name}
              </p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                {formatearTipos(seleccionadoGoogle.types)}
              </p>
              {seleccionadoGoogle.rating != null && (
                <p style={{ fontSize: 13, color: '#d97706', marginBottom: 4 }}>
                  {estrellas(seleccionadoGoogle.rating)}{' '}
                  <span style={{ color: '#6b7280' }}>
                    {seleccionadoGoogle.rating.toFixed(1)}
                    {seleccionadoGoogle.user_ratings_total
                      ? ` (${seleccionadoGoogle.user_ratings_total})`
                      : ''}
                  </span>
                </p>
              )}
              {seleccionadoGoogle.vicinity && (
                <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 8 }}>
                  {seleccionadoGoogle.vicinity}
                </p>
              )}
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${seleccionadoGoogle.place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#f3f4f6',
                  color: '#374151',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                Ver en Google Maps →
              </a>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
