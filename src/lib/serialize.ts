export function toNumber(value: { toString(): string } | number): number {
  return Number(value)
}
