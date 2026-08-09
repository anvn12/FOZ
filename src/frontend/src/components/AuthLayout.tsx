import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface CarouselSlide {
  id: string;
  tag: string;
  timeAgo: string;
  headline: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "slide-1",
    tag: "Trending",
    timeAgo: "Just now",
    headline: "Top 10 productivity hacks for 2024 to streamline your workflow.",
  },
  {
    id: "slide-2",
    tag: "Market",
    timeAgo: "2h ago",
    headline: "The rise of AI in fintech: What you need to know for the next quarter.",
  },
  {
    id: "slide-3",
    tag: "Community",
    timeAgo: "5h ago",
    headline: "New discussion on global sustainability initiatives gaining traction.",
  },
];

function TrendingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);

  return (
    <div className="w-full max-w-md">
      <div className="relative h-32 w-full" id="trending-carousel">
        {CAROUSEL_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`border border-outline-variant bg-surface-container-lowest rounded-2xl p-6 transition-all duration-500 ${
                isActive
                  ? "relative opacity-100 translate-y-0"
                  : "absolute top-0 left-0 w-full opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 text-label-md font-label-md rounded-full bg-surface-container-high text-on-surface-variant">
                  {slide.tag}
                </span>
                <span className="text-label-md font-label-md text-on-surface-variant">
                  {slide.timeAgo}
                </span>
              </div>
              <p className="text-body-md font-body-md text-on-surface">{slide.headline}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-6">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prevSlide}
          className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={nextSlide}
          className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * Shared auth page chrome — monochrome split layout matching the home feed:
 * text wordmark (like NavBar), bordered card, design-system tokens only,
 * so light/dark mode follow the app theme automatically.
 */
export function AuthLayout({
  headline,
  children,
}: {
  headline: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased overflow-x-hidden relative">
      <nav className="w-full absolute top-0 left-0 z-50 flex justify-center md:justify-between items-center px-4 md:px-16 py-4 md:py-6">
        <Link to="/" className="text-3xl font-black tracking-tighter text-primary select-none">
          FOZ
        </Link>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto min-h-screen relative z-10 items-center justify-center pt-20 md:pt-16 pb-8 px-4 gap-6">
        <div className="w-full text-center mt-2 md:hidden mb-2">
          <h1 className="text-3xl font-black tracking-tighter text-primary">{headline}</h1>
        </div>

        <div className="hidden md:flex w-1/2 h-full flex-col justify-center px-8 lg:px-12 relative items-center">
          <div className="max-w-md z-10">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-primary leading-[1.05] mb-4">
              {headline}
            </h1>
            <p className="text-body-lg font-body-lg text-secondary mb-8 max-w-sm">
              Explore the things you love, connect with the community, and discover new insights
              in real-time.
            </p>
            <TrendingCarousel />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-0 md:px-6">
          <div className="w-full max-w-md rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 md:p-8 shadow-sm relative z-10 flex flex-col max-h-[85vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
