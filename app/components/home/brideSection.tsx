interface BrideSectionProps {
  photo: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  instagram?: string;
}

export default function BrideSection({
  photo,
  fullName,
  fatherName,
  motherName,
  instagram,
}: BrideSectionProps) {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden flex items-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={fullName}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/50" />
      <div className="relative z-10 p-8 pt-14 space-y-3 max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
          The Bride
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-white leading-snug">
          {fullName}
        </h2>
        <div className="gold-divider w-16" />
        <p className="text-sm text-stone-200 leading-relaxed font-serif-elegant">
          <span className="text-[#c9a96e]">Putri dari :</span>
          <br />
          {fatherName} & {motherName}
        </p>
        {instagram && (
          <p className="text-sm text-stone-300 flex items-center gap-1.5 pt-1">
            <svg className="w-4 h-4 text-[#c9a96e]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span>{instagram}</span>
          </p>
        )}
      </div>
    </section>
  );
}