interface StatCardProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export default function StatCard({ value, label, accent }: StatCardProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-medium p-5 flex flex-col gap-1.5">
      <span
        className={[
          "text-[32px] font-bold leading-10",
          accent ? "text-accent" : "text-ink",
        ].join(" ")}
      >
        {value}
      </span>
      <p className="alternative text-ink-2 uppercase font-bold tracking-wide">
        {label}
      </p>
    </div>
  );
}
