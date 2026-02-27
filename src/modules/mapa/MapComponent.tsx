import { FC, useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { Map, View, Feature } from 'ol';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';
import { Point, LineString } from 'ol/geom';
import type { User, LocationByDate, RouteItem, Alert } from '@/types';
import { isEmpty } from 'lodash';
import { message } from 'antd';
import styles from '@/styles/MapComponent.module.css';

type MapComponentProps = {
  showAllPoints: boolean;
  showSelectTrip: boolean;
  selectedUserNow: User | null;
  showSelectAlert: boolean;
  showTripSubmit: boolean;
  users: User[];
  locations: LocationByDate[];
  searchDateTime: RouteItem[];
  selectAlert: Alert | null;
};

const MapComponent: FC<MapComponentProps> = ({
  selectedUserNow,
  users,
  showAllPoints,
  locations,
  showSelectTrip,
  searchDateTime,
  showTripSubmit,
  showSelectAlert,
  selectAlert,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vectorLayerRef = useRef<VectorLayer<any> | null>(null);
  const sosOverlaysRef = useRef<globalThis.Map<number, Overlay>>(
    new globalThis.Map(),
  );

  const showPointsOnMap = (usersToShow: User[]) => {
    if (!mapInstance.current) {
      return;
    }

    if (vectorLayerRef.current) {
      vectorLayerRef.current.getSource()?.clear();
      mapInstance.current.removeLayer(vectorLayerRef.current);
    }

    const points = usersToShow
      .map((user) => {
        const { lastlocation } = user;

        if (
          !lastlocation ||
          !lastlocation.date ||
          !lastlocation.latitude ||
          !lastlocation.longitude
        ) {
          return null;
        }

        const userDateTimeMoment = new Date(lastlocation.date);
        const nowMoment = new Date();

        const minutesDiff = Math.round(
          (nowMoment.getTime() - userDateTimeMoment.getTime()) / (1000 * 60) -
            userDateTimeMoment.getTimezoneOffset(),
        );

        const previousOverlay = sosOverlaysRef.current.get(user.id);
        if (previousOverlay) {
          mapInstance.current?.removeOverlay(previousOverlay);
          sosOverlaysRef.current.delete(user.id);
        }

        if (user.hasAlert) {
          const sosDiv = document.createElement('div');
          sosDiv.className = styles['sos-blink'];

          const sosOverlay = new Overlay({
            element: sosDiv,
            position: fromLonLat([
              lastlocation.longitude,
              lastlocation.latitude,
            ]),
            positioning: 'center-center',
          });

          mapInstance.current?.addOverlay(sosOverlay);
          sosOverlaysRef.current.set(user.id, sosOverlay);

          const point = new Feature({
            geometry: new Point(
              fromLonLat([lastlocation.longitude, lastlocation.latitude]),
            ),
          });

          point.set('user', user);
          point.setStyle(
            new Style({
              image: new Icon({
                src: '/recorrido/rojo.png',
                scale: 0.3,
              }),
            }),
          );

          return point;
        }

        let iconSrc = '/recorrido/verde.png';

        if (minutesDiff > 240) {
          iconSrc = '/recorrido/rojo.png';
        } else if (minutesDiff > 5) {
          iconSrc = '/recorrido/amarillo.png';
        }

        const point = new Feature({
          geometry: new Point(
            fromLonLat([lastlocation.longitude, lastlocation.latitude]),
          ),
        });

        point.set('user', user);
        point.setStyle(
          new Style({
            image: new Icon({
              src: iconSrc,
              scale: 0.8,
            }),
          }),
        );

        return point;
      })
      .filter((p): p is Feature<Point> => p !== null);

    const vectorSource = new VectorSource({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      features: points,
    });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    mapInstance.current.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;

    mapInstance.current.on('pointermove', (event) => {
      const feature = mapInstance.current?.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat,
      );
      if (feature) {
        const user = feature.get('user');
        if (user && overlayRef.current) {
          const overlayElement = overlayRef.current.getElement();
          if (overlayElement) {
            const { coordinate } = event;
            const content = `<strong>${user.name} ${user.lastname}</strong>`;

            overlayElement.innerHTML = content;
            overlayRef.current.setPosition(coordinate);
          }
        }
      } else if (overlayRef.current) {
        overlayRef.current.setPosition(undefined);
      }
    });

    if (!isEmpty(points)) {
      if (selectedUserNow) {
        mapInstance.current
          ?.getView()
          .setCenter(
            fromLonLat([
              selectedUserNow.lastlocation.longitude,
              selectedUserNow.lastlocation.latitude,
            ]),
          );
        mapInstance.current?.getView().setZoom(16);
      } else {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLocation = fromLonLat([
            position.coords.longitude,
            position.coords.latitude,
          ]);
          mapInstance.current?.getView().setCenter(userLocation);
          mapInstance.current?.getView().setZoom(15);
        });
      }
    }
  };

  const showPointsHistoryOnMap = (
    historyLocations: LocationByDate[],
    searchCoord?: RouteItem[],
  ) => {
    if (!mapInstance.current) {
      return;
    }

    if (vectorLayerRef.current) {
      vectorLayerRef.current.getSource()?.clear();
    }

    if (historyLocations.length > 0) {
      const allCoordinates = historyLocations.flatMap((day) =>
        day.route.map((routeItem) => routeItem.coordinates),
      );

      if (allCoordinates.length === 1) {
        const singleCoord = allCoordinates[0];
        const singlePoint = new Feature({
          geometry: new Point(fromLonLat(singleCoord)),
        });
        singlePoint.setStyle(
          new Style({
            image: new Icon({ src: '/recorrido/ini.png', scale: 0.6 }),
            zIndex: 10,
          }),
        );

        const vectorSource = new VectorSource({ features: [singlePoint] });
        const vectorLayer = new VectorLayer({ source: vectorSource });

        mapInstance.current.addLayer(vectorLayer);
        vectorLayerRef.current = vectorLayer;

        mapInstance.current.getView().setCenter(fromLonLat(singleCoord));
        mapInstance.current.getView().setZoom(20);

        message.info('Solo hay una ubicación guardada para este recorrido');
        return;
      }

      const features = historyLocations.flatMap((day) => {
        const coordinates = day.route.map((routeItem) => routeItem.coordinates);
        const times = day.route.map((routeItem) => routeItem.time);

        if (coordinates.length <= 1) {
          return [];
        }

        const lineString = new LineString(coordinates);
        const lineFeature = new Feature({
          geometry: lineString.transform('EPSG:4326', 'EPSG:3857'),
        });

        const startCoord = fromLonLat(coordinates[0]);
        const endCoord = fromLonLat(coordinates[coordinates.length - 1]);

        const startPoint = new Feature({ geometry: new Point(startCoord) });
        startPoint.setStyle(
          new Style({
            image: new Icon({ src: '/recorrido/ini.png', scale: 0.6 }),
            zIndex: 10,
          }),
        );

        const endPoint = new Feature({ geometry: new Point(endCoord) });
        endPoint.setStyle(
          new Style({
            image: new Icon({ src: '/recorrido/fin.png', scale: 0.6 }),
            zIndex: 10,
          }),
        );

        const restPoints =
          coordinates.length > 2 ? coordinates.slice(1, -1) : [];
        const intermediatePoints = restPoints.map((coord, index) => {
          const point = new Feature({ geometry: new Point(fromLonLat(coord)) });
          point.setStyle(
            new Style({
              image: new Icon({ src: '/recorrido/inicio.png', scale: 0.1 }),
            }),
          );
          point.set('coordinates', coord);
          point.set('time', times[index + 1]);
          point.set('date', day.date);
          return point;
        });

        return [lineFeature, startPoint, endPoint, ...intermediatePoints];
      });

      if (searchCoord) {
        const searchCoord0 = searchCoord[0];
        const searchPoint = new Feature({
          geometry: new Point(fromLonLat(searchCoord0.coordinates)),
        });
        searchPoint.setStyle(
          new Style({
            image: new Icon({ src: '/recorrido/aqi.png', scale: 0.8 }),
            zIndex: 20,
          }),
        );
        searchPoint.set('coordinates', searchCoord0.coordinates);
        searchPoint.set('time', searchCoord0.time);
        searchPoint.set('date', searchCoord0.date);
        features.push(searchPoint);

        mapInstance.current
          .getView()
          .setCenter(fromLonLat(searchCoord0.coordinates));
        mapInstance.current.getView().setZoom(20);
      }

      const vectorSource = new VectorSource({ features });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({ color: '#3C86DD', width: 3 }),
        }),
      });

      mapInstance.current.addLayer(vectorLayer);
      vectorLayerRef.current = vectorLayer;

      if (!searchCoord) {
        const extent = vectorSource.getExtent();
        mapInstance.current
          .getView()
          .fit(extent, { duration: 2000, padding: [50, 50, 50, 50] });
      }

      mapInstance.current.on('pointermove', (event) => {
        const feature = mapInstance.current?.forEachFeatureAtPixel(
          event.pixel,
          (feat) => feat,
        );
        if (feature) {
          const time = feature.get('time');
          const date = feature.get('date');
          if ((time || date) && overlayRef.current) {
            const overlayElement = overlayRef.current.getElement();
            if (overlayElement) {
              const { coordinate } = event;
              overlayElement.innerHTML = `<strong>${date} ${time}</strong>`;
              overlayRef.current.setPosition(coordinate);
            }
          }
        } else if (overlayRef.current) {
          overlayRef.current.setPosition(undefined);
        }
      });
    } else if (showTripSubmit) {
      message.warning(
        'El usuario no tiene recorridos en las fechas solicitadas',
      );
    }
  };

  const showAlertOnMap = (alertsToShow: Alert[]) => {
    if (!mapInstance.current) {
      return;
    }

    if (vectorLayerRef.current) {
      vectorLayerRef.current.getSource()?.clear();
      mapInstance.current.removeLayer(vectorLayerRef.current);
    }

    const points = alertsToShow
      .map((alert) => {
        if (!alert?.latitude || !alert?.longitude) {
          return null;
        }

        const latitude = Number(alert?.latitude);
        const longitude = Number(alert?.longitude);

        const point = new Feature({
          geometry: new Point(fromLonLat([longitude, latitude])),
        });

        point.set('alert', alert);
        point.set('selectable', false);
        point.setStyle(
          new Style({
            image: new Icon({
              src: '/recorrido/inicio.png',
              scale: 0.2,
            }),
          }),
        );

        return point;
      })
      .filter((point): point is Feature<Point> => point !== null);

    if (points.length === 0) {
      return;
    }

    const vectorSource = new VectorSource({ features: points });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    mapInstance.current.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;

    const firstAlert = alertsToShow.find(
      (alert) => Number(alert.latitude) && Number(alert.longitude),
    );

    if (firstAlert) {
      const firstLat = Number(firstAlert.latitude);
      const firstLon = Number(firstAlert.longitude);

      mapInstance.current.getView().setCenter(fromLonLat([firstLon, firstLat]));
      mapInstance.current.getView().setZoom(15);
    }
  };

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
            }),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 15,
        }),
      });

      const overlayElement = document.createElement('div');
      overlayElement.style.backgroundColor = 'white';
      overlayElement.style.border = '2px solid black';
      overlayElement.style.padding = '5px';
      overlayElement.style.borderRadius = '4px';
      overlayElement.style.textAlign = 'center';
      overlayElement.style.fontSize = '14px';
      overlayElement.style.fontWeight = 'bold';
      overlayRef.current = new Overlay({
        element: overlayElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10],
      });
      mapInstance.current.addOverlay(overlayRef.current);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const userLocation = fromLonLat([longitude, latitude]);
          mapInstance.current?.getView().setCenter(userLocation);
          mapInstance.current?.getView().setZoom(15);
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error('Error obteniendo la geolocalización:', error);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      if (showAllPoints && !showSelectTrip) {
        showPointsOnMap(users);
      } else if (selectedUserNow && !showSelectTrip) {
        showPointsOnMap([selectedUserNow]);
      }
    }
  }, [users.length, showAllPoints, selectedUserNow, users, showSelectTrip]);

  useEffect(() => {
    if (showSelectAlert && !showSelectTrip && !showAllPoints) {
      if (vectorLayerRef.current) {
        vectorLayerRef.current.getSource()?.clear();
        mapInstance.current?.removeLayer(vectorLayerRef.current);
      }
      if (selectAlert !== null) {
        showAlertOnMap([selectAlert]);
      }
    }
  }, [selectAlert, showSelectAlert, showAllPoints, showSelectTrip]);

  useEffect(() => {
    if (showSelectTrip) {
      if (vectorLayerRef.current) {
        vectorLayerRef.current.getSource()?.clear();
        mapInstance.current?.removeLayer(vectorLayerRef.current);
      }

      if (searchDateTime && searchDateTime.length > 0) {
        showPointsHistoryOnMap(locations, searchDateTime);
      } else {
        showPointsHistoryOnMap(locations);
      }
    }
  }, [locations, showSelectTrip, searchDateTime]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;
