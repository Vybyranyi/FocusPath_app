interface StatCardProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

export default function StatCard({ value, label, accent }: StatCardProps) {
  return (
    <div className="bg-base-white rounded-2xl shadow-medium p-5 flex flex-col gap-1.5">
      <span
        className={[
          "text-[32px] font-bold leading-10",
          accent ? "text-primary-blue" : "text-primary-black",
        ].join(" ")}
      >
        {value}
      </span>
      <p className="alternative text-primary-black-60 uppercase font-bold tracking-wide">
        {label}
      </p>
    </div>
  );
}
