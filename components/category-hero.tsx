'use client';

interface CategoryHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  breadcrumb?: string;
}

export function CategoryHero({
  title,
  subtitle,
  backgroundImage,
  breadcrumb = 'Home',
}: CategoryHeroProps) {
  return (
    <div
      className="relative w-full h-[60vh] bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative h-full flex flex-col justify-end p-8 md:p-16">
        {breadcrumb && (
          <p className="text-white text-sm mb-4 opacity-90">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2">
          {title}
        </h1>
        <p className="text-white text-lg md:text-xl max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}