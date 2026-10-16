const STEPS = ["Customize", "Generate", "Edit", "Export"];

export function JourneySteps({ active }: { active: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={i <= active ? "step-dot step-dot-on" : "step-dot"}>{i + 1}</span>
          <span className={i <= active ? "font-semibold text-foreground" : "text-muted-foreground"}>{s}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
        </li>
      ))}
    </ol>
  );
}
