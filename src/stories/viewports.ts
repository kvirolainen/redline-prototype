// iPad sizes used to check that the Behind-the-build diagrams fit without sideways scrolling.
export const IPAD_VIEWPORTS = {
  ipadLandscape: { name: 'iPad landscape (1024)', styles: { width: '1024px', height: '768px' }, type: 'tablet' },
  ipadPortrait: { name: 'iPad portrait (768)', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
} as const;
