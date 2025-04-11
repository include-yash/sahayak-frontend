"use client"

import React from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
})

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

export default function MapWrapper({ lat, lon }: { lat: number; lon: number }) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={14}
      scrollWheelZoom={true}
      style={{
        height: "80vh",
        width: "100%",
        maxWidth: "1000px",
        borderRadius: "1rem",
      }}
    >
      <TileLayer
        url="https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=8656ecc3ee2b493cabcfd1d628d9a4be"
        attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
      />
      <Marker position={[lat, lon]} icon={customIcon}>
        <Popup>You are here</Popup>
      </Marker>
    </MapContainer>
  )
}
