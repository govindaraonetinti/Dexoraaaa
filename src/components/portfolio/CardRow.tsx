export const CardRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-white/70 text-[16px] py-1">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
