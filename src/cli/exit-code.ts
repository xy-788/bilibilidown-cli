export function resultExitCode(result: unknown): 0 | 1 {
  if (typeof result !== "object" || result === null || !("status" in result)) return 0;
  if (result.status === "error") return 1;
  if (result.status === "partial" && "failed" in result && typeof result.failed === "number" && result.failed > 0) return 1;
  return 0;
}
