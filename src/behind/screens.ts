import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { MODULES, type ModuleId } from '../domain/personas';

/** A, B, C are the three explored versions; B2 is the picked one, refined. */
export type VariantKey = 'A' | 'B' | 'C' | 'B2';
type Explored = 'A' | 'B' | 'C';

/** The size each screen was designed for; previews scale this box down to fit. */
export interface Device {
  kind: 'phone' | 'desktop';
  width: number;
  height: number;
}

const PHONE: Device = { kind: 'phone', width: 390, height: 844 };
const DESKTOP: Device = { kind: 'desktop', width: 1280, height: 800 };

export const DEVICE: Record<ModuleId, Device> = {
  'trade-in': DESKTOP,
  'ops-board': DESKTOP,
  inspector: PHONE,
  'back-office': DESKTOP,
};

type Lazy = LazyExoticComponent<ComponentType>;
const named = <K extends string>(load: () => Promise<Record<K, ComponentType>>, key: K): Lazy => lazy(() => load().then((m) => ({ default: m[key] })));

interface Entry {
  name: string;
  Component: Lazy;
}

/** Every screen variant, loaded on first use. Names match the Screens stories. */
export const SCREENS: Record<ModuleId, Record<Explored, Entry> & Partial<Record<VariantKey, Entry>>> = {
  'trade-in': {
    A: { name: 'Step by step', Component: named(() => import('../modules/trade-in/VariantA'), 'TradeInVariantA') },
    B: { name: 'One page, live offer', Component: named(() => import('../modules/trade-in/VariantB'), 'TradeInVariantB') },
    C: { name: 'Quick quote first', Component: named(() => import('../modules/trade-in/VariantC'), 'TradeInVariantC') },
    B2: { name: 'One screen', Component: named(() => import('../modules/trade-in/VariantB2'), 'TradeInVariantB2') },
  },
  'ops-board': {
    A: { name: 'Week grid', Component: named(() => import('../modules/ops-board/VariantA'), 'VariantA') },
    B: { name: 'Today’s runs', Component: named(() => import('../modules/ops-board/VariantB'), 'VariantB') },
    C: { name: 'Exceptions first', Component: named(() => import('../modules/ops-board/VariantC'), 'VariantC') },
  },
  inspector: {
    A: { name: 'Run, car, checklist', Component: named(() => import('../modules/inspector/VariantA'), 'InspectorVariantA') },
    B: { name: 'One car at a time', Component: named(() => import('../modules/inspector/VariantB'), 'InspectorVariantB') },
    C: { name: 'Exceptions only', Component: named(() => import('../modules/inspector/VariantC'), 'InspectorVariantC') },
  },
  'back-office': {
    A: { name: 'Table first', Component: named(() => import('../modules/back-office/VariantA'), 'VariantA') },
    B: { name: 'Needs you inbox', Component: named(() => import('../modules/back-office/VariantB'), 'VariantB') },
    C: { name: 'Pipeline board', Component: named(() => import('../modules/back-office/VariantC'), 'VariantC') },
    B2: { name: 'Decide and track', Component: named(() => import('../modules/back-office/VariantB2'), 'VariantB2') },
  },
};

export const isModule = (s: string): s is ModuleId => s in SCREENS;
export const isVariant = (m: ModuleId, s: string): s is VariantKey => s in SCREENS[m];

export const screen = (m: ModuleId, v: VariantKey) => SCREENS[m][v]!;

/** "Trade-in · B · One page, live offer" */
export const screenCaption = (m: ModuleId, v: VariantKey) => `${MODULES[m].label} · ${v} · ${screen(m, v).name}`;
