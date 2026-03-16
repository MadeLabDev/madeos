/**
 * Meta actions - Index file
 */

import type { ActionResult } from "@/lib/types";

export { getModuleTypesAction, getModuleTypeByIdAction, getEnabledModuleTypesAction, createModuleTypeAction, updateModuleTypeAction, deleteModuleTypeAction, bulkDeleteModuleTypesAction, exportModuleTypeAction, importModuleTypeAction } from "./module-type-actions";
export type { ActionResult };

export { getModuleInstancesAction, getModuleInstanceByIdAction, getInstancesByEntityAction, createModuleInstanceAction, updateModuleInstanceAction, deleteModuleInstanceAction, upsertModuleInstanceAction } from "./module-instance-actions";
