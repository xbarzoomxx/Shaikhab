export default function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4" aria-busy="true" aria-label="جارِ التحميل">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-border animate-pulse-soft shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-2/3 rounded bg-border animate-pulse-soft" />
              <div className="h-3 w-1/3 rounded bg-border animate-pulse-soft" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-line space-y-2">
            <div className="h-3 w-full rounded bg-border animate-pulse-soft" />
            <div className="h-3 w-4/5 rounded bg-border animate-pulse-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}
