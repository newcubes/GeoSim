/**
 * Combined Material Definitions
 * 
 * Combines CORE_MATERIALS, EXTENDED_MATERIALS, and ALL_SANDBOXELS_MATERIALS
 * without creating circular dependencies
 */

import { CORE_MATERIALS, EXTENDED_MATERIALS } from './sandboxels-material-definitions';
import { ALL_SANDBOXELS_MATERIALS } from './sandboxels-all-materials';
import type { MaterialDefinition } from './sandboxels-material-definitions';

// Combine all materials - prioritize our core materials, then add all Sandboxels materials
export const ALL_MATERIALS: Record<string, MaterialDefinition> = {
  ...CORE_MATERIALS,
  ...EXTENDED_MATERIALS,
  ...ALL_SANDBOXELS_MATERIALS,
};

