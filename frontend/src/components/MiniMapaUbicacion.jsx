import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Locate, MapPin, Loader2 } from 'lucide-react';

const DURANGO_CENTER = { lat: 24.0277, lng: -104.6532 };

// Debe coincidir con el LIBRARIES de MapaPage para que el singleton no conflictúe
const LIBRARIES = ['places'];

const ESTILOS_MAPA = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

/**
 * Mini-mapa con un pin arrastrable para seleccionar la ubicación
 * exacta del comercio. Reporta al padre vía `onChange({ lat, lng, direccion_texto? })`.
 *
 * Reverse-geocoding: intenta primero `google.maps.Geocoder`. Si la Geocoding API
 * no está habilitada (REQUEST_DENIED), cae automáticamente al PlacesService
 * (`nearbySearch` rankeado por distancia) y usa `vicinity` como aproximación.
 */
export default function MiniMapaUbicacion({ lat, lng, direccionPadre = '', onChange }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    language: 'es',
    libraries: LIBRARIES,
  });

  const inicial =
    lat !== '' && lng !== '' && lat != null && lng != null
      ? { lat: parseFloat(lat), lng: parseFloat(lng) }
      : DURANGO_CENTER;

  const [pin, setPin] = useState(inicial);
  const [direccionDetectada, setDireccionDetectada] = useState('');
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const tieneUbicacion = lat !== '' && lng !== '' && lat != null && lng != null;

  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesRef = useRef(null);
  // Cada nueva solicitud incrementa el id; las respuestas viejas se descartan
  const geocodeIdRef = useRef(0);

  const onMapLoad = useCallback(map => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    placesRef.current = new google.maps.places.PlacesService(map);
  }, []);

  function pedirDireccion(pos) {
    const id = ++geocodeIdRef.current;
    setBuscandoDireccion(true);

    const reportar = direccion => {
      if (id !== geocodeIdRef.current) return;
      setBuscandoDireccion(false);
      if (direccion) {
        setDireccionDetectada(direccion);
        onChange({ lat: pos.lat, lng: pos.lng, direccion_texto: direccion });
      }
    };

    const intentarPlaces = () => {
      if (!placesRef.current) return reportar('');
      placesRef.current.nearbySearch(
        {
          location: pos,
          rankBy: google.maps.places.RankBy.DISTANCE,
          type: 'establishment',
        },
        (results, status) => {
          if (id !== geocodeIdRef.current) return;
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results?.[0]?.vicinity
          ) {
            reportar(results[0].vicinity);
          } else {
            console.warn('Places fallback también falló:', status);
            reportar('');
          }
        }
      );
    };

    if (!geocoderRef.current) return intentarPlaces();

    geocoderRef.current.geocode({ location: pos }, (results, status) => {
      if (id !== geocodeIdRef.current) return;
      if (status === 'OK' && results?.[0]?.formatted_address) {
        reportar(results[0].formatted_address);
      } else {
        // Típicamente REQUEST_DENIED si la Geocoding API no está habilitada
        console.warn(
          `Geocoder no disponible (${status}). Habilita la Geocoding API en Google Cloud. ` +
          'Usando Places como respaldo.'
        );
        intentarPlaces();
      }
    });
  }

  function moverPin(pos) {
    setPin(pos);
    setDireccionDetectada('');
    // Coords ya, dirección llega después; no pisamos direccion_texto hasta tenerla
    onChange({ lat: pos.lat, lng: pos.lng });
    pedirDireccion(pos);
  }

  function onDragEnd(e) {
    moverPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  function onMapClick(e) {
    moverPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }

  function usarUbicacionActual() {
    if (!navigator.geolocation) {
      alert('Tu navegador no admite geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const nuevo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.panTo(nuevo);
        moverPin(nuevo);
      },
      () => alert('No pudimos obtener tu ubicación.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Sincroniza el pin cuando lat/lng cambian externamente (ej. cargar comercio existente).
  // No disparamos onChange ni geocoder aquí para evitar loops.
  useEffect(() => {
    if (tieneUbicacion) {
      setPin({ lat: parseFloat(lat), lng: parseFloat(lng) });
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

  // Lo que mostramos como dirección legible:
  // 1) la recién detectada por geocoder/places, 2) la que ya tenía el padre, 3) nada
  const direccionVisible = direccionDetectada || direccionPadre;

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

      <p className="flex items-start gap-2 text-[14px] text-gray-600 leading-snug">
        {buscandoDireccion ? (
          <>
            <Loader2 size={14} className="animate-spin text-navy-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>Detectando dirección…</span>
          </>
        ) : (
          <>
            <MapPin size={14} className="flex-shrink-0 mt-0.5 text-navy-500" aria-hidden="true" />
            <span>
              {direccionVisible
                ? direccionVisible
                : tieneUbicacion
                  ? 'Pin colocado. Arrastra o toca el mapa para ajustar.'
                  : 'Arrastra el pin o toca el mapa para colocar tu negocio.'}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
