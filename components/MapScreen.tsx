import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { type Camera, type MapType, type UserLocationChangeEvent } from 'react-native-maps';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DrawerMode } from '@/components/DrawerMode';
import { FlightDrawer } from '@/components/FlightDrawer';
import { GlassSurface } from '@/components/GlassSurface';
import { useColorScheme } from '@/components/useColorScheme';

// MapKit distance is meters from the surface. ~25,000 km frames the round Earth.
const GLOBE_ALTITUDE = 25_000_000;
// Flat map can pull back past the globe. MapKit clamps anything above its own ceiling.
const STANDARD_MAX_ALTITUDE = 400_000_000;
const LOCATE_ALTITUDE = 1_800;

const globe: Camera = {
  center: { latitude: 20, longitude: 0 },
  pitch: 0,
  heading: 0,
  altitude: GLOBE_ALTITUDE,
};

type Coord = { latitude: number; longitude: number };

// ponytail: each tab that shows the map owns its own MapView; this module-level view state keeps them
// looking like one map when switching tabs. Move into context if more screens start reading it.
const shared: { camera: Camera; satellite: boolean } = { camera: globe, satellite: true };

export function MapScreen({ drawer }: { drawer: DrawerMode }) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const user = useRef<Coord | null>(null);
  const [satellite, setSatellite] = useState(shared.satellite);
  const [following, setFollowing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Zoom range is applied after the first camera, so set it again once the view exists.
      setSatellite(shared.satellite);
      map.current?.setCamera(shared.camera);
    }, []),
  );

  const mapType: MapType = satellite ? 'hybridFlyover' : 'standard';

  const focusUser = (coord: Coord) => {
    map.current?.animateCamera({
      center: coord,
      altitude: LOCATE_ALTITUDE,
      pitch: 0,
      heading: 0,
    });
  };

  const onUserLocationChange = (event: UserLocationChangeEvent) => {
    const coord = event.nativeEvent.coordinate;
    if (!coord) return;
    const first = user.current == null;
    user.current = { latitude: coord.latitude, longitude: coord.longitude };
    if (following && first) focusUser(user.current);
  };

  const centerOnUser = () => {
    setFollowing(true);
    if (user.current) focusUser(user.current);
  };

  const toggleSatellite = () => {
    shared.satellite = !satellite;
    setSatellite(shared.satellite);
  };

  const saveCamera = () => {
    map.current
      ?.getCamera()
      .then((camera) => {
        shared.camera = camera;
      })
      .catch(() => {});
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        mapType={mapType}
        initialCamera={shared.camera}
        rotateEnabled
        pitchEnabled
        scrollEnabled
        zoomEnabled
        zoomTapEnabled
        toolbarEnabled={false}
        showsBuildings
        showsUserLocation
        followsUserLocation={following}
        onUserLocationChange={onUserLocationChange}
        onRegionChangeComplete={saveCamera}
        onPanDrag={() => setFollowing(false)}
        cameraZoomRange={{
          minCenterCoordinateDistance: 120,
          maxCenterCoordinateDistance: satellite ? GLOBE_ALTITUDE : STANDARD_MAX_ALTITUDE,
          animated: false,
        }}
        userInterfaceStyle={scheme === 'dark' ? 'dark' : 'light'}
      />
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: insets.top + 8, right: 12, gap: 10 }}>
        <CircleButton
          symbol={satellite ? 'map.fill' : 'globe.americas.fill'}
          label={satellite ? 'Map' : 'Satellite'}
          onPress={toggleSatellite}
        />
        <CircleButton
          symbol={following ? 'location.fill' : 'location'}
          label="Center on your location"
          onPress={centerOnUser}
        />
      </View>
      <FlightDrawer mode={drawer} />
    </View>
  );
}

function CircleButton({
  symbol,
  label,
  onPress,
}: {
  symbol: SFSymbol;
  label: string;
  onPress: () => void;
}) {
  return (
    <GlassSurface
      isInteractive
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <SymbolView name={symbol} size={20} tintColor="#FFFFFF" weight="semibold" />
      </Pressable>
    </GlassSurface>
  );
}
