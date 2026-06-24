const IdToDate: Record<number, string> = {
  0: "UNKNOWN - Test",
  1: "UNKNOWN - Test",
  2: "2025-06-10",
  3: "2026-06-24",
};

export function TalentIdToVersion(n: number): string | undefined {
  return IdToDate[n];
}