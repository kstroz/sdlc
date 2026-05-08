import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TestRenderer = require('react-test-renderer') as {
  create: (el: React.ReactElement) => {
    toJSON: () => unknown;
    unmount: () => void;
  };
  act: (cb: () => Promise<void> | void) => Promise<void>;
};
import { AppRoot } from './AppRoot';

describe('AppRoot', () => {
  it('renders without crashing', async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;
    await TestRenderer.act(async () => {
      tree = TestRenderer.create(<AppRoot />);
    });
    expect(tree).toBeDefined();
    expect(tree!.toJSON()).not.toBeNull();
    await TestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
