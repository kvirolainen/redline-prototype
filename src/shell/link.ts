import type { MouseEvent } from 'react';

/** Set by the routed app shell. Storybook renders the same screens without app URLs, so links stay plain clicks there. */
let routed = false;
export const setRouted = (on: boolean) => {
  routed = on;
};

/**
 * Click handlers for anything that moves to another screen: a plain click switches in place; Cmd/Ctrl/Shift-click
 * or a middle click opens that screen's own URL in a new tab, as a link would.
 */
export function navClick(path: string, go: () => void) {
  const newTab = (e: MouseEvent) => routed && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1);
  return {
    onClick: (e: MouseEvent) => {
      if (newTab(e)) {
        e.preventDefault();
        window.open(path, '_blank', 'noopener');
        return;
      }
      go();
    },
    onAuxClick: (e: MouseEvent) => {
      if (e.button !== 1 || !newTab(e)) return;
      e.preventDefault();
      window.open(path, '_blank', 'noopener');
    },
  };
}
