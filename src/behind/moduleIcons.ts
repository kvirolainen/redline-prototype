import type { ModuleId } from '../domain/personas';
import type { IconName } from './icons';

export const MODULE_ICON: Record<ModuleId, IconName> = {
  'trade-in': 'swap',
  inspector: 'clipboard',
  'back-office': 'table',
  'ops-board': 'board',
};
