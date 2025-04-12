'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface Address {
  formatted: string;
  coordinates: { lat: number; lng: number };
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  country?: string;
}

const GeoifyRoutePlanner = () => {
  const API_KEY = '8656ecc3ee2b493cabcfd1d628d9a4be';
  const [origin, setOrigin] = useState<Address | null>(null);
  const [destination, setDestination] = useState<Address | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Address[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Address[]>([]);
  const [travelMode, setTravelMode] = useState<'drive' | 'walk' | 'bike' | 'transit'>('drive');
  const [optimization, setOptimization] = useState<'fastest' | 'shortest' | 'balanced'>('fastest');
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    routeType: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadLeaflet = async () => {
      try {
        const Leaflet = (await import('leaflet')).default;
        setL(Leaflet);

        if (!document.head.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Failed to load map. Please refresh the page.');
      }
    };

    loadLeaflet();
  }, [isClient]);

  useEffect(() => {
    if (!L || !isClient) return;

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer || mapRef.current) return;

    try {
      mapRef.current = L.map(mapContainer, {
        minZoom: 2,
        maxZoom: 20,
        zoomControl: false
      }).setView([12.9716, 77.5946], 12);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      const tileLayer = L.tileLayer(
        `https://api.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${API_KEY}`,
        {
          attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap contributors',
          maxZoom: 20,
          tileSize: 256,
          zoomOffset: 0,
        }
      ).addTo(mapRef.current);

      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map. Please try again.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L, isClient]);

  const handleAddressInput = async (input: string, isOrigin: boolean) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!input || input.length < 3) {
      isOrigin ? setOriginSuggestions([]) : setDestSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&apiKey=${API_KEY}&filter=countrycode:in&limit=5`
        );

        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const data = await response.json();
        const suggestions = data.features?.map((feature: any) => ({
          formatted: feature.properties.formatted || 'Unnamed location',
          coordinates: {
            lat: feature.geometry?.coordinates[1] ?? 0,
            lng: feature.geometry?.coordinates[0] ?? 0,
          },
          ...feature.properties
        })).filter((sug: Address) => sug.coordinates.lat !== 0 && sug.coordinates.lng !== 0) || [];

        isOrigin ? setOriginSuggestions(suggestions) : setDestSuggestions(suggestions);
        setError(null);
      } catch (err: any) {
        console.error('Autocomplete error:', err);
        setError(err.message);
        isOrigin ? setOriginSuggestions([]) : setDestSuggestions([]);
      }
    }, 300);
  };

  const handleSuggestionSelect = (address: Address, isOrigin: boolean) => {
    if (!address.coordinates) {
      setError('Invalid address selected');
      return;
    }

    if (isOrigin) {
      setOrigin(address);
      setOriginSuggestions([]);
      if (originInputRef.current) originInputRef.current.value = address.formatted;
    } else {
      setDestination(address);
      setDestSuggestions([]);
      if (destInputRef.current) destInputRef.current.value = address.formatted;
    }

    if (mapRef.current) {
      mapRef.current.setView([address.coordinates.lat, address.coordinates.lng], 14);
    }
  };

  const calculateRoute = async () => {
    if (!origin || !destination) {
      setError('Please select both origin and destination');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${origin.coordinates.lat},${origin.coordinates.lng}|${destination.coordinates.lat},${destination.coordinates.lng}&mode=${travelMode}&apiKey=${API_KEY}`
      );

      if (!response.ok) throw new Error(`Routing failed: ${response.statusText}`);

      const data = await response.json();
      if (!data.features?.length) throw new Error('No route found');

      const route = data.features[0];
      displayRoute(route);
      displayRouteInfo(route);
    } catch (err: any) {
      console.error('Routing error:', err);
      setError(err.message);
      if (routeLayerRef.current) routeLayerRef.current.clearLayers();
    } finally {
      setIsCalculating(false);
    }
  };

  const displayRoute = (route: any) => {
    if (!L || !mapRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    try {
      const coordinates = route.geometry.coordinates[0].map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      const polyline = L.polyline(coordinates, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.7,
        lineJoin: 'round'
      }).addTo(routeLayerRef.current);

      if (origin?.coordinates) {
        L.marker([origin.coordinates.lat, origin.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-marker origin-marker',
            html: 'A',
            iconSize: [30, 30]
          })
        }).addTo(routeLayerRef.current).bindPopup(`<b>Origin:</b> ${origin.formatted}`).openPopup();
      }

      if (destination?.coordinates) {
        L.marker([destination.coordinates.lat, destination.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-marker destination-marker',
            html: 'B',
            iconSize: [30, 30]
          })
        }).addTo(routeLayerRef.current).bindPopup(`<b>Destination:</b> ${destination.formatted}`).openPopup();
      }

      if (coordinates.length > 1) {
        const bounds = polyline.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16
          });
        }
      }
    } catch (err) {
      console.error('Route display error:', err);
      setError('Failed to display route');
    }
  };

  const displayRouteInfo = (route: any) => {
    if (!route.properties) {
      setError('Invalid route data');
      return;
    }

    try {
      const distance = route.properties.distance > 1000
        ? `${(route.properties.distance / 1000).toFixed(1)} km`
        : `${Math.round(route.properties.distance)} meters`;

      const duration = route.properties.time > 3600
        ? `${Math.floor(route.properties.time / 3600)}h ${Math.round((route.properties.time % 3600) / 60)}m`
        : `${Math.round(route.properties.time / 60)} minutes`;

      const modeDisplay = {
        drive: 'Driving',
        walk: 'Walking',
        bike: 'Bicycling',
        transit: 'Public Transit',
      }[travelMode];

      setRouteInfo({
        distance,
        duration,
        routeType: `${modeDisplay} (${optimization.charAt(0).toUpperCase() + optimization.slice(1)} Route)`,
      });
    } catch (err) {
      console.error('Route info error:', err);
      setError('Failed to process route info');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-center mb-2">Geoify Route Planner</h1>
      <p className="text-center text-gray-600 mb-6">Plan your route across India</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Origin:</label>
          <input
            ref={originInputRef}
            type="text"
            placeholder="Enter starting location"
            onChange={(e) => handleAddressInput(e.target.value, true)}
            className="w-full p-2 border rounded"
          />
          {originSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
              {originSuggestions.map((sug, idx) => (
                <li
                  key={`origin-${idx}`}
                  onClick={() => handleSuggestionSelect(sug, true)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {sug.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">Destination:</label>
          <input
            ref={destInputRef}
            type="text"
            placeholder="Enter destination"
            onChange={(e) => handleAddressInput(e.target.value, false)}
            className="w-full p-2 border rounded"
          />
          {destSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
              {destSuggestions.map((sug, idx) => (
                <li
                  key={`dest-${idx}`}
                  onClick={() => handleSuggestionSelect(sug, false)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {sug.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Travel Mode:</label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as any)}
            disabled={isCalculating}
            className="w-full p-2 border rounded"
          >
            <option value="drive">Driving</option>
            <option value="walk">Walking</option>
            <option value="bike">Bicycling</option>
            <option value="transit">Transit</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Optimization:</label>
          <select
            value={optimization}
            onChange={(e) => setOptimization(e.target.value as any)}
            disabled={isCalculating}
            className="w-full p-2 border rounded"
          >
            <option value="fastest">Fastest Route</option>
            <option value="shortest">Shortest Distance</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={calculateRoute}
            disabled={isCalculating || !origin || !destination}
            className={`px-4 py-2 rounded text-white ${isCalculating || !origin || !destination ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} flex items-center`}
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : 'Calculate Route'}
          </button>
        </div>
      </div>

      <div id="map-container" className="h-96 w-full rounded-lg border mb-4"></div>

      {routeInfo && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-2">Route Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="block text-sm text-gray-600">Distance:</span>
              <span className="font-medium">{routeInfo.distance}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-600">Duration:</span>
              <span className="font-medium">{routeInfo.duration}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-600">Route Type:</span>
              <span className="font-medium">{routeInfo.routeType}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="text-red-700">{error}</div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(GeoifyRoutePlanner), {
  ssr: false,
  loading: () => <div className="text-center p-8">Loading map...</div>
});