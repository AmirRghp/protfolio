export function boardCardLayout(count: number) {
  const rows = Math.ceil(count / 5);

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / 5);
    const rowLength = Math.min(5, count - row * 5);
    return {
      position: [(index % 5 - (rowLength - 1) / 2) * 0.84, ((rows - 1) / 2 - row) * 0.68, 0.2] as [number, number, number],
      rotation: [0, 0, ((index % 3) - 1) * 0.035] as [number, number, number],
    };
  });
}
