interface StatCardProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export default function StatCard({ value, label, accent }: StatCardProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-lifted p-5 flex flex-col gap-1.5">
      <span
        className={[
          "display-4",
          accent ? "text-accent" : "text-ink",
        ].join(" ")}
      >
        {value}
      </span>
      <p className="chip text-ink-2">
        {label}
      </p>
    </div>
  );
}
