    interface HeroSectionProps {
    coverUrl: string;
    brideShortName: string;
    groomShortName: string;
    quote: string;
    quoteSource: string;
    displayDate: string;
    }

    export default function HeroSection({
    coverUrl,
    brideShortName,
    groomShortName,
    quote,
    quoteSource,
    displayDate,
    }: HeroSectionProps) {
    return (
        <section className="relative h-screen w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
            src={coverUrl}
            alt="Wedding Cover"
            className="w-full h-full object-cover object-center animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 text-center px-6 pb-12 space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight drop-shadow-lg">
            {brideShortName} & {groomShortName}
            </h1>
            <div className="gold-divider w-24 mx-auto" />
            <p className="text-xs sm:text-lg text-stone-300 italic leading-relaxed max-w-sm mx-auto font-serif-elegant">
            &quot;{quote}&quot;
            </p>
            <p className="text-[11px] sm:text-lg text-[#c9a96e] font-medium tracking-wide">
            {quoteSource}
            </p>
            <p className="text-sm sm:text-lg text-white tracking-widest font-light pt-2">
            {displayDate}
            </p>
        </div>
        </section>
    );
    }