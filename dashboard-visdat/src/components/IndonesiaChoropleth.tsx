import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import L, { Layer } from 'leaflet';

import 'leaflet/dist/leaflet.css';

type ProvinceData = {
  [key: string]: number;
};

type SelectedProvince = {
  name: string;
  value: number;
} | null;

const provinceValues: ProvinceData = {
  Jakarta: 95,
  Jawa_Barat: 80,
  Jawa_Tengah: 65,
  Jawa_Timur: 75,
  Banten: 50,
  Bali: 40,
  Papua: 20,
};

function getColor(value: number) {
  return value > 80
    ? '#800026'
    : value > 60
    ? '#BD0026'
    : value > 40
    ? '#E31A1C'
    : value > 20
    ? '#FC4E2A'
    : value > 10
    ? '#FD8D3C'
    : '#FEB24C';
}

export default function IndonesiaChoropleth() {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const [geoData, setGeoData] = useState<any>(null);

  const [selectedProvince, setSelectedProvince] =
    useState<SelectedProvince>(null);

  useEffect(() => {
    fetch('/indonesia-province.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((err) => {
        console.error('Failed to load GeoJSON:', err);
      });
  }, []);

  const style = (feature: any) => {
    const provinceName =
      feature.properties.Propinsi ||
      feature.properties.PROVINSI ||
      feature.properties.name;

    const value = provinceValues[provinceName] ?? 0;

    return {
      fillColor: getColor(value),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (
    feature: any,
    layer: Layer
  ) => {
    const provinceName =
      feature.properties.Propinsi ||
      feature.properties.PROVINSI ||
      feature.properties.name;

    const value = provinceValues[provinceName] ?? 0;

    layer.bindTooltip(`
      <div>
        <strong>${provinceName}</strong><br/>
        Value: ${value}
      </div>
    `);

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;

        target.setStyle({
          weight: 3,
          color: '#666',
          fillOpacity: 0.9,
        });

        target.bringToFront();
      },

      mouseout: (e: any) => {
        geoJsonRef.current?.resetStyle(e.target);
      },

      click: () => {
        setSelectedProvince({
          name: provinceName,
          value,
        });
      },
    });
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <MapContainer
          center={[-2.5, 118]}
          zoom={5}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          attributionControl={false}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geoData && (
            <GeoJSON
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
              ref={geoJsonRef}
            />
          )}
        </MapContainer>
      </div>

      {/* Dialog */}
      {selectedProvince && (
        <div
          onClick={() =>
            setSelectedProvince(null)
          }
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: '400px',
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow:
                '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              {selectedProvince.name}
            </h2>

            <p>
              Value:{' '}
              {selectedProvince.value}
            </p>

            <button
              onClick={() =>
                setSelectedProvince(
                  null
                )
              }
              style={{
                marginTop: '20px',
                padding:
                  '10px 18px',
                borderRadius:
                  '12px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}