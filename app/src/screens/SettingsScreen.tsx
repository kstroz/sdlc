import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import {
  SETTING_WIFI_ONLY_FOR_MEDIA,
  type Settings,
} from '@/src/platform/storage/settings';

export interface SettingsScreenProps {
  settings: Settings;
}

export function SettingsScreen(props: SettingsScreenProps): React.ReactElement {
  const { settings } = props;
  const [wifiOnly, setWifiOnly] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;
    void settings.get(SETTING_WIFI_ONLY_FOR_MEDIA).then((value) => {
      if (!cancelled) {
        setWifiOnly(value === true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [settings]);

  const onToggle = (next: boolean): void => {
    setWifiOnly(next);
    void settings.set(SETTING_WIFI_ONLY_FOR_MEDIA, next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Upload photos only on Wi-Fi</Text>
        <Switch
          accessibilityLabel="Upload photos only on Wi-Fi"
          value={wifiOnly}
          onValueChange={onToggle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 14, flexShrink: 1, paddingRight: 12 },
});
