import { AppShell } from './shell/AppShell';
import { BackendContext } from './live/world';

/** The app: the same shell as in Storybook, with the live backend switched on. */
export default function App() {
  return (
    <BackendContext.Provider value={true}>
      <AppShell />
    </BackendContext.Provider>
  );
}
