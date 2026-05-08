import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView } from 'react-native';

import { systemClock } from '@/src/platform/clock';
import { systemRandomId } from '@/src/platform/randomId';
import { inMemoryDatabase } from '@/src/platform/db/database';
import { createInMemorySessionStore } from '@/src/platform/storage/sessionStore';
import {
  createInMemorySettings,
  type Settings,
} from '@/src/platform/storage/settings';
import { createHttpAuthClient } from '@/src/platform/http/authClient';
import { createTasksClient } from '@/src/platform/http/tasksClient';
import { createDevicesClient } from '@/src/platform/http/devicesClient';
import { systemMapsOpener } from '@/src/platform/maps/openInMapsApp';
import { createPhotoStore } from '@/src/platform/files/photoStore';
import { createExpoPushClient } from '@/src/platform/push/pushClient';
import { systemNetworkType } from '@/src/platform/network/networkType';

import type { Clock } from '@/src/platform/clock';
import type { RandomId } from '@/src/platform/randomId';
import type { Database } from '@/src/platform/db/database';
import type { AuthClient, SessionStore } from '@/src/use-cases/signIn';
import type { TasksClient } from '@/src/use-cases/loadToday';
import type { DevicesClient } from '@/src/platform/http/devicesClient';
import type { MapsOpener } from '@/src/platform/maps/openInMapsApp';
import type { PhotoStore } from '@/src/platform/files/photoStore';
import type { PushClient } from '@/src/platform/push/pushClient';
import type { NetworkType } from '@/src/platform/network/networkType';

import { restoreSession } from '@/src/use-cases/restoreSession';
import { registerForPush } from '@/src/use-cases/registerForPush';

// TODO(integration): SyncClient and Connectivity factories are not yet
// available from the parallel agents (T-001..T-009). Wired as `null` and
// reconciled in the final integration pass.
type SyncClient = unknown;
type Connectivity = unknown;

import { SignInScreen } from '@/src/screens/SignInScreen';
import { TodayScreen } from '@/src/screens/TodayScreen';
import { TaskDetailScreen } from '@/src/screens/TaskDetailScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';

const API_BASE_URL = 'https://api.baj-100.local';
const APP_VERSION = '0.1.0';

export interface AppDeps {
  database: Database;
  clock: Clock;
  randomId: RandomId;
  authClient: AuthClient;
  sessionStore: SessionStore;
  tasksClient: TasksClient;
  mapsOpener: MapsOpener;
  photoStore: PhotoStore;
  syncClient: SyncClient | null;
  connectivity: Connectivity | null;
  networkType: NetworkType;
  settings: Settings;
  pushClient: PushClient;
  devicesClient: DevicesClient;
}

export const AppDepsContext = createContext<AppDeps | null>(null);

type Route =
  | { name: 'signIn' }
  | { name: 'today' }
  | { name: 'taskDetail'; taskId: string }
  | { name: 'settings' };

function buildAppDeps(): AppDeps {
  const database = inMemoryDatabase();
  const sessionStore = createInMemorySessionStore();
  const settings = createInMemorySettings();
  const authClient = createHttpAuthClient({ baseUrl: API_BASE_URL });
  const tasksClient = createTasksClient({
    baseUrl: API_BASE_URL,
    authToken: null,
  });
  const devicesClient = createDevicesClient({
    baseUrl: API_BASE_URL,
    authToken: null,
  });
  const photoStore = createPhotoStore({
    fs: {
      documentDirectory: null,
      async getInfoAsync() {
        return { exists: false };
      },
      async makeDirectoryAsync() {},
      async copyAsync() {},
      async deleteAsync() {},
    },
  });
  const pushClient = createExpoPushClient();

  return {
    database,
    clock: systemClock,
    randomId: systemRandomId,
    authClient,
    sessionStore,
    tasksClient,
    mapsOpener: systemMapsOpener,
    photoStore,
    syncClient: null,
    connectivity: null,
    networkType: systemNetworkType,
    settings,
    pushClient,
    devicesClient,
  };
}

function pickPushPlatform(): 'ios' | 'android' {
  return Platform.OS === 'android' ? 'android' : 'ios';
}

export function AppRoot(): React.ReactElement {
  const deps = useMemo(buildAppDeps, []);
  const [route, setRoute] = useState<Route>({ name: 'signIn' });
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await restoreSession({
        sessionStore: deps.sessionStore,
        clock: deps.clock,
      });
      if (cancelled) return;
      setRoute(result.success ? { name: 'today' } : { name: 'signIn' });
      setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [deps]);

  useEffect(() => {
    void registerForPush({
      pushClient: deps.pushClient,
      devicesClient: deps.devicesClient,
      platform: pickPushPlatform(),
      appVersion: APP_VERSION,
    }).catch(() => {
      // best-effort
    });
  }, [deps]);

  return (
    <AppDepsContext.Provider value={deps}>
      <SafeAreaView style={{ flex: 1 }}>
        {bootstrapped ? renderRoute(route, deps, setRoute) : null}
      </SafeAreaView>
    </AppDepsContext.Provider>
  );
}

function renderRoute(
  route: Route,
  deps: AppDeps,
  setRoute: (r: Route) => void,
): React.ReactElement {
  if (route.name === 'signIn') {
    return (
      <SignInScreen
        authClient={deps.authClient}
        sessionStore={deps.sessionStore}
        onSignedIn={() => setRoute({ name: 'today' })}
      />
    );
  }
  if (route.name === 'today') {
    // TODO(integration): construct LoadTodayDeps (TaskCache factory pending).
    return (
      <TodayScreen
        deps={{
          today: deps.clock.now().toISOString().slice(0, 10),
          cache: { async read() { return null; }, async write() {} },
          client: deps.tasksClient,
        }}
        formatDueAt={(d) => (d === null ? '' : d.toISOString())}
      />
    );
  }
  if (route.name === 'settings') {
    return <SettingsScreen settings={deps.settings} />;
  }
  // TODO(integration): TaskDetailScreen needs task+building lookup;
  // wire through database/tasksClient in integration pass.
  return (
    <TaskDetailScreen
      task={{
        id: route.taskId,
        buildingId: '',
        assignedToUserId: '',
        title: '',
        description: null,
        managerNotes: null,
        priority: 'normal',
        dueAt: null,
        status: 'pending',
        blockReason: null,
        blockNote: null,
        completedAt: null,
        completedByUserId: null,
      }}
      building={{
        id: '',
        name: '',
        streetAddress: '',
        city: '',
        latitude: null,
        longitude: null,
      }}
      mapsOpener={deps.mapsOpener}
    />
  );
}
