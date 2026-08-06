import { baseActions } from "../data/demo.js";

const actions = new Map(baseActions.map((action) => [action.id, structuredClone(action)]));

export function listActions() {
  return [...actions.values()];
}

export function updateActionStatus(id, status) {
  const action = actions.get(id);
  if (!action) return null;
  const allowed = new Set(["pending", "approved", "dismissed"]);
  if (!allowed.has(status)) throw new Error("Invalid action status");
  action.status = status;
  action.updatedAt = new Date().toISOString();
  return action;
}
