export interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Hero({ 
  title = "Welcome to Our Platform", 
  subtitle = "Discover amazing features and services", 
  ctaText = "Get Started", 
  ctaLink = "#", 
  backgroundColor = "from-slate-900 to-indigo-950", 
  textColor = "text-white" 
}: HeroProps) {
  return (
    <section className={`bg-gradient-to-r ${backgroundColor} ${textColor} py-24 px-6 text-center`}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-6 text-lg text-slate-300">{subtitle}</p>}
        {ctaText && (
          <a 
            href={ctaLink || "#"}
            className="mt-10 inline-block rounded-md bg-indigo-500 px-5 py-3 font-semibold shadow-sm hover:bg-indigo-400 transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
