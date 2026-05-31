export default function StatsCard({ title, value }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition">
      <h3 className="text-slate-400">
        {title}
      </h3>

      <p className="text-4xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}