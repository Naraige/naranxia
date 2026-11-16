/* spike traps: tile -> hp, and tile -> index of the player who placed it (leaf module, so the co-op hash can read them without an import cycle) */
export const SPK = new Map();
/* tile -> index of the player who placed the trap (co-op: only he or the host removes it). A trap with no entry (old save) has no owner: anyone. */
export const SPO = new Map();
