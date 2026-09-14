export function Sparkline({ values, colorClassName = "text-brand-500" }: { values: number[]; colorClassName?: string }) {
  const max = Math.max(...values, 1);
  const width = 100;
  const height = 32;
  const barWidth = width / values.length;

  if (values.every((v) => v === 0)) {
    return <div className="text-xs text-slate-400">Пока нет данных за этот период</div>;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`h-8 w-full ${colorClassName}`} preserveAspectRatio="none" aria-hidden="true">
      {values.map((v, i) => {
        const barHeight = Math.max((v / max) * height, v > 0 ? 2 : 0);
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.15}
            y={height - barHeight}
            width={barWidth * 0.7}
            height={barHeight}
            fill="currentColor"
            rx={1}
          />
        );
      })}
    </svg>
  );
}
