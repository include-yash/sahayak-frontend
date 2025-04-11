'use client';

import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import '../styles/GeoifyRoutePlanner.css';
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
  const API_KEY = '8656ecc3ee2b493cabcfd1d628d9a4be'; // Replace with your actual Geoapify API key

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

  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load Leaflet CSS safely
  useEffect(() => {
    if (document.head.querySelector('link[href*="leaflet"]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.crossOrigin = 'anonymous';
    link.onerror = () => console.error('Failed to load Leaflet CSS');
    document.head.appendChild(link);

    return () => {
      if (link.parentNode === document.head) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Initialize Leaflet map with error handling
  useEffect(() => {
    if (mapRef.current || typeof window === 'undefined') return;

    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) {
        throw new Error('Map container not found');
      }

      mapRef.current = L.map(mapContainer, { 
        minZoom: 2, 
        maxZoom: 20,
        zoomControl: false // We'll add it manually later
      }).setView([12.9716, 77.5946], 12);

      // Add zoom control with better position
      L.control.zoom({
        position: 'topright'
      }).addTo(mapRef.current);

      const tileLayer = L.tileLayer(
        `https://api.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${API_KEY}`,
        {
          attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap contributors',
          maxZoom: 20,
          tileSize: 256,
          zoomOffset: 0,
        }
      ).addTo(mapRef.current);

      tileLayer.on('tileerror', (error) => {
        console.error('Tile error:', error);
        setError('Map tiles failed to load. Please refresh the page.');
      });

      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

      // Handle map initialization errors
      mapRef.current.on('load', () => {
        console.log('Map successfully loaded');
      });

      mapRef.current.on('error', () => {
        setError('Failed to initialize map. Please check your internet connection.');
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map. Please try again later.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Debounced address input handler
  const handleAddressInput = async (input: string, isOrigin: boolean) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!input || input.length < 3) {
      if (isOrigin) setOriginSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&apiKey=${API_KEY}&filter=countrycode:in&limit=5`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.features) {
          throw new Error('Invalid response format from geocoding service');
        }

        const suggestions = data.features.map((feature: any) => ({
          formatted: feature.properties.formatted || 'Unnamed location',
          coordinates: {
            lat: feature.geometry?.coordinates[1] ?? 0,
            lng: feature.geometry?.coordinates[0] ?? 0,
          },
          street: feature.properties.street || undefined,
          housenumber: feature.properties.housenumber || undefined,
          postcode: feature.properties.postcode || undefined,
          city: feature.properties.city || undefined,
          country: feature.properties.country || undefined,
        })).filter((sug: Address) => sug.coordinates.lat !== 0 && sug.coordinates.lng !== 0);

        if (isOrigin) {
          setOriginSuggestions(suggestions);
        } else {
          setDestSuggestions(suggestions);
        }

      } catch (err: any) {
        console.error('Autocomplete error:', err);
        setError(err.message);
        if (isOrigin) {
          setOriginSuggestions([]);
        } else {
          setDestSuggestions([]);
        }
      }
    }, 300);
  };

  // Handle suggestion selection with validation
  const handleSuggestionSelect = (address: Address, isOrigin: boolean) => {
    if (!address.coordinates || !address.formatted) {
      setError('Invalid address selected');
      return;
    }

    if (isOrigin) {
      setOrigin(address);
      setOriginSuggestions([]);
      if (originInputRef.current) {
        originInputRef.current.value = address.formatted;
      }
    } else {
      setDestination(address);
      setDestSuggestions([]);
      if (destInputRef.current) {
        destInputRef.current.value = address.formatted;
      }
    }

    setError(null);
    
    // Update map view if both coordinates are valid
    if (mapRef.current && address.coordinates.lat && address.coordinates.lng) {
      mapRef.current.setView([address.coordinates.lat, address.coordinates.lng], 14);
    }
  };

  // Calculate route with enhanced error handling
  const calculateRoute = async () => {
    if (!origin || !destination) {
      setError('Please select both origin and destination addresses');
      return;
    }

    if (!origin.coordinates || !destination.coordinates) {
      setError('Invalid coordinates for selected addresses');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${origin.coordinates.lat},${origin.coordinates.lng}|${destination.coordinates.lat},${destination.coordinates.lng}&mode=${travelMode}&apiKey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Routing failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No route found between the selected locations');
      }

      const route = data.features[0];
      if (!route.geometry || !route.properties) {
        throw new Error('Invalid route data received');
      }

      displayRoute(route);
      displayRouteInfo(route);

    } catch (err: any) {
      console.error('Routing error:', err);
      setError(err.message);
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Display route with validation
  const displayRoute = (route: any) => {
    if (!mapRef.current || !routeLayerRef.current) {
      console.error('Map or route layer not initialized');
      return;
    }

    routeLayerRef.current.clearLayers();

    try {
      const coordinates = route.geometry.coordinates[0].map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );

      const polyline = L.polyline(coordinates, { 
        color: '#3b82f6', 
        weight: 5,
        opacity: 0.7,
        lineJoin: 'round'
      }).addTo(routeLayerRef.current);

      // Add markers with better styling
      if (origin && origin.coordinates) {
        const originMarker = L.marker([origin.coordinates.lat, origin.coordinates.lng], {
          icon: L.divIcon({ 
            className: 'custom-marker origin-marker',
            html: 'A',
            iconSize: [30, 30]
          })
        }).addTo(routeLayerRef.current);
        originMarker.bindPopup(`<b>Origin:</b> ${origin.formatted}`).openPopup();
      }

      if (destination && destination.coordinates) {
        const destMarker = L.marker([destination.coordinates.lat, destination.coordinates.lng], {
          icon: L.divIcon({ 
            className: 'custom-marker destination-marker',
            html: 'B',
            iconSize: [30, 30]
          })
        }).addTo(routeLayerRef.current);
        destMarker.bindPopup(`<b>Destination:</b> ${destination.formatted}`).openPopup();
      }

      // Fit bounds with padding
      if (coordinates.length > 1) {
        const bounds = polyline.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 16,
            animate: true
          });
        }
      }

    } catch (err) {
      console.error('Route display error:', err);
      setError('Failed to display the route on map');
    }
  };

  // Format route info with validation
  const displayRouteInfo = (route: any) => {
    if (!route.properties) {
      setError('Invalid route properties');
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
      }[travelMode] || 'Unknown';

      const optimizationDisplay = {
        fastest: 'Fastest Route',
        shortest: 'Shortest Distance',
        balanced: 'Balanced Route',
      }[optimization] || 'Unknown';

      setRouteInfo({
        distance,
        duration,
        routeType: `${modeDisplay} (${optimizationDisplay})`,
      });

    } catch (err) {
      console.error('Route info formatting error:', err);
      setError('Failed to process route information');
    }
  };

  return (
    <div className="container">
      <h1>Geoify Route Planner</h1>
      <p className="subtitle">Plan your route across India</p>

      <div className="input-group">
        <label htmlFor="origin-input">Origin:</label>
        <div className="input-wrapper">
          <input
            id="origin-input"
            ref={originInputRef}
            type="text"
            placeholder="Enter starting location"
            onChange={(e) => handleAddressInput(e.target.value, true)}
            onFocus={() => {
              setOriginSuggestions([]);
              setError(null);
            }}
            className="address-input"
            aria-label="Origin address"
          />
          {originSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {originSuggestions.map((sug, idx) => (
                <li
                  key={`origin-${idx}`}
                  onClick={() => handleSuggestionSelect(sug, true)}
                  className="suggestion-item"
                >
                  {sug.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="dest-input">Destination:</label>
        <div className="input-wrapper">
          <input
            id="dest-input"
            ref={destInputRef}
            type="text"
            placeholder="Enter destination"
            onChange={(e) => handleAddressInput(e.target.value, false)}
            onFocus={() => {
              setDestSuggestions([]);
              setError(null);
            }}
            className="address-input"
            aria-label="Destination address"
          />
          {destSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {destSuggestions.map((sug, idx) => (
                <li
                  key={`dest-${idx}`}
                  onClick={() => handleSuggestionSelect(sug, false)}
                  className="suggestion-item"
                >
                  {sug.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="travel-mode">Travel Mode:</label>
          <select
            id="travel-mode"
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as any)}
            disabled={isCalculating}
          >
            <option value="drive">Driving</option>
            <option value="walk">Walking</option>
            <option value="bike">Bicycling</option>
            <option value="transit">Transit</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="route-optimization">Optimization:</label>
          <select
            id="route-optimization"
            value={optimization}
            onChange={(e) => setOptimization(e.target.value as any)}
            disabled={isCalculating}
          >
            <option value="fastest">Fastest Route</option>
            <option value="shortest">Shortest Distance</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>

        <button
          id="calculate-route"
          onClick={calculateRoute}
          disabled={isCalculating || !origin || !destination}
          className={isCalculating ? 'calculating' : ''}
        >
          {isCalculating ? (
            <>
              <span className="spinner"></span>
              Calculating...
            </>
          ) : (
            'Calculate Route'
          )}
        </button>
      </div>

      <div id="map-container" aria-label="Map" tabIndex={0}></div>

      {routeInfo && (
        <div className="route-info">
          <h3>Route Information</h3>
          <div className="info-grid">
            <div>
              <span className="info-label">Distance:</span>
              <span id="route-distance" className="info-value">{routeInfo.distance}</span>
            </div>
            <div>
              <span className="info-label">Duration:</span>
              <span id="route-duration" className="info-value">{routeInfo.duration}</span>
            </div>
            <div>
              <span className="info-label">Route Type:</span>
              <span id="route-type" className="info-value">{routeInfo.routeType}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error" id="error-message" role="alert">
          {error}
          <button onClick={() => setError(null)} className="error-close">
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default GeoifyRoutePlanner;