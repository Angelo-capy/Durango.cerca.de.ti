import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Locate, MapPin } from 'lucide-react';

const DURANGO_CENTER = { lat: 24.0277, lng: -104.6532 };

const ESTILOS_MAPA = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

/**
 * Mini-mapa con un pin arrastrable para seleccionar la ubicación
 * exacta del comercio. Llama a `onChange({ lat, lng })` cuando cambia.
 */
export default function MiniMapaUbicacion({ lat, lng, onChange }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    language: 'es',
  });

  const inicial =
    lat !== '' && lng !== '' && lat != null && lng != null
      ? { lat: parseFloat(lat), lng: parseFloat(lng) }
      : DURANGO_CENTER;

  const [pin, setPin] = useState(inicial);
  const tieneUbicacion = lat !== '' && lng !== '' && lat != null && lng != null;
  const mapRef = useRef(null);

  const onMapLoad = useCallback(map => { mapRef.current = map; }, []);

  function actualizar(nuevo) {
    setPin(nuevo);
    onChange(nuevo);
  }

  function onDragEnd(e) {
    actualizar({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  function onMapClick(e) {
    actualizar({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  function usarUbicacionActual() {
    if (!navigator.geolocation) {
      alert('Tu navegador no admite geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const nuevo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        actualizar(nuevo);
        mapRef.current?.panTo(nuevo);
      },
      () => alert('No pudimos obtener tu ubicación.')
    );
  }

  // Si el padre actualiza lat/lng externamente (ej. al cargar comercio existente)
  useEffect(() => {
    if (tieneUbicacion) {
      const nuevoPin = { lat: parseFloat(lat), lng: parseFloat(lng) };
      setPin(nuevoPin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  if (!isLoaded) {
    return (
      <div className="h-64 rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '260px' }}
          center={pin}
          zoom={tieneUbicacion ? 17 : 14}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            styles: ESTILOS_MAPA,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
          }}
        >
          <MarkerF
            position={pin}
            draggable={true}
            onDragEnd={onDragEnd}
          />
        </GoogleMap>

        <button
          type="button"
          onClick={usarUbicacionActual}
          className="
            absolute top-3 right-3 z-10
            flex items-center gap-2
            px-3 py-2 rounded-full
            bg-white shadow-card
            text-navy-700 text-[13px] font-medium
            hover:bg-navy-50 transition-colors
            min-h-[40px]
          "
        >
          <Locate size={16} aria-hidden="true" />
          Mi ubicación
        </button>
      </div>

      <p className="flex items-start gap-2 text-[14px] text-gray-500 leading-snug">
        <MapPin size={14} className="flex-shrink-0 mt-0.5 text-navy-500" aria-hidden="true" />
        Arrastra el pin o toca el mapa para colocarlo justo donde está tu negocio.
        {tieneUbicacion && (
          <span className="font-mono text-[12px] text-gray-400 ml-1">
            ({pin.lat.toFixed(5)}, {pin.lng.toFixed(5)})
          </span>
        )}
      </p>
    </div>
  );
}
