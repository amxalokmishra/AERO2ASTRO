import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

export default function MapComponent() {
  const [pilots, setPilots] = useState([]);
  const [adminLocation, setAdminLocation] = useState(null);
  const [range, setRange] = useState(1000); // Default range 1000 km

  useEffect(() => {
    // Get Admin's Current Location
    navigator.geolocation.getCurrentPosition((position) => {
      const adminCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setAdminLocation(adminCoords);

      // Fetch top 10 matching pilots
      axios
        .get(
          `http://localhost:1231/api/pilots/match?latitude=${adminCoords.latitude}&longitude=${adminCoords.longitude}&range=${range}`
        )
        .then((res) => setPilots(res.data))
        .catch((err) => console.error(err));
    });
  }, [range]);

  return (
    <div>
      <input
        type="number"
        value={range}
        onChange={(e) => setRange(e.target.value)}
        placeholder="Enter range in km"
      />
      <MapContainer
        center={[51.505, -0.09]}
        zoom={2}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pilots.map((pilot, index) => (
          <Marker
            key={index}
            position={[pilot.coordinates.latitude, pilot.coordinates.longitude]}
            icon={L.icon({
              iconUrl: "https://img.icons8.com/ios/50/000000/user-location.png",
              iconSize: [30, 30],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30],
            })}
          >
            <Popup>
              <strong>{pilot.name}</strong>
              <br />
              Experience: {pilot.experience} years
              <br />
              Location: {pilot.location}
            </Popup>
          </Marker>
        ))}
        {adminLocation && (
          <Marker
            position={[adminLocation.latitude, adminLocation.longitude]}
            icon={L.icon({
              iconUrl:
                "https://img.icons8.com/?size=100&id=efudZn6PRPMk&format=png&color=000000",
              iconSize: [30, 30],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30],
            })}
          >
            <Popup>
              <strong>Admin Location</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
