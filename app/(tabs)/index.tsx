import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { type MapType, type UserLocationChangeEvent } from 'react-native-maps';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlightDrawer } from '@/components/FlightDrawer';
import { GlassSurface } from '@/components/GlassSurface';
import { useColorScheme } from '@/components/useColorScheme';

// MapKit distance is meters from the surface. ~25,000 km frames the round Earth.
const GLOBE_ALTITUDE = 25_000_000;
// Flat map can pull back past the globe. MapKit clamps anything above its own ceiling.
const STANDARD_MAX_ALTITUDE = 400_000_000;
const LOCATE_ALTITUDE = 1_800;

const globe = {
  center: { latitude: 20, longitude: 0 },
  pitch: 0,
  heading: 0,
  altitude: GLOBE_ALTITUDE,
};

type Coord = { latitude: number; longitude: number };

export default function MapScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const user = useRef<Coord | null>(null);
  const [satellite, setSatellite] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    // Zoom range is applied after the first camera, so set it again once the view exists.
    map.current?.setCamera(globe);
  }, []);

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

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        mapType={mapType}
        initialCamera={globe}
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
          onPress={() => setSatellite((on) => !on)}
        />
        <CircleButton
          symbol={following ? 'location.fill' : 'location'}
          label="Center on your location"
          onPress={centerOnUser}
        />
      </View>
      <FlightDrawer />
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
