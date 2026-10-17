const STEPS = ["Customize", "Generate & Review", "Save"];

export function JourneySteps({ active, size = "sm" }: { active: number; size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <ol className={`flex flex-wrap items-center ${big ? "gap-x-3 gap-y-2 text-lg" : "gap-2 text-sm"}`}>
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={i <= active ? `step-dot step-dot-on${big ? " step-dot-lg" : ""}` : `step-dot${big ? " step-dot-lg" : ""}`}>{i + 1}</span>
          <span className={`${big ? "font-display font-semibold" : ""} ${i <= active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
          {!big && i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
        </li>
      ))}
    </ol>
  );
}
