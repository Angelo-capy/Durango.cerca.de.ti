import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { useComerciosList } from '../context/ComerciosContext.jsx';
import { MapPin, AlertCircle } from 'lucide-react';

const DURANGO_CENTER = { lat: 24.0277, lng: -104.6532 };

const ESTILOS_MAPA = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

export default function MapaPage() {
  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY,
    language: 'es',
  });

  const { comercios } = useComerciosList();
  const navigate = useNavigate();

  const [ubicacion, setUbicacion] = useState(null);
  const [mensajeGeo, setMensajeGeo] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const mapRef = useRef(null);

  // Geolocalización solo al montar — useRef no causa re-renders extra
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
      },
      () => {
        setMensajeGeo('No encontramos tu ubicación. El mapa muestra el centro de Durango.');
      }
    );
  }, []);

  const onMapLoad = useCallback(map => { mapRef.current = map; }, []);

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
          />
        )}

        {/* Marcadores de comercios */}
        {comercios.map(c =>
          c.lat && c.lng ? (
            <MarkerF
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              onClick={() => setSeleccionado(c)}
              title={c.nombre}
            />
          ) : null
        )}

        {/* InfoWindow al seleccionar */}
        {seleccionado && (
          <InfoWindowF
            position={{ lat: seleccionado.lat, lng: seleccionado.lng }}
            onCloseClick={() => setSeleccionado(null)}
          >
            <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
              <p style={{ fontWeight: 600, fontSize: 15, color: '#162d54', marginBottom: 2 }}>
                {seleccionado.nombre}
              </p>
              {seleccionado.categoria && (
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  {seleccionado.categoria}
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
      </GoogleMap>
    </div>
  );
}
