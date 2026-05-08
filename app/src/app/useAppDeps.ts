import { useContext } from 'react';
import { AppDepsContext, type AppDeps } from './AppRoot';

export function useAppDeps(): AppDeps {
  const deps = useContext(AppDepsContext);
  if (deps === null) {
    throw new Error('useAppDeps must be used inside an <AppRoot> tree');
  }
  return deps;
}
