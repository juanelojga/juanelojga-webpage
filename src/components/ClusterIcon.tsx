export default function ClusterIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {name}
    </span>
  );
}
