import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ColorBends from "./ColorBends";
import { FozLogo } from "./FozLogo";

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
  const [direction, setDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection("next");
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setDirection("next");
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setDirection("prev");
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <div className="relative w-full max-w-md group overflow-hidden rounded-2xl">
      <div className="relative h-32 w-full" id="trending-carousel">
        {CAROUSEL_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`border border-outline-variant bg-surface-container-lowest rounded-2xl p-6 pl-11 pr-11 transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? "relative opacity-100 translate-x-0 scale-100 z-10"
                  : `absolute top-0 left-0 w-full opacity-0 pointer-events-none scale-95 z-0 ${
                      direction === "next" ? "translate-x-12" : "-translate-x-12"
                    }`
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

        {/* Left & Right backgroundless arrows hidden until box hover */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-on-surface-variant/70 hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-85 focus:outline-none cursor-pointer p-1 hover:-translate-x-1"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-on-surface-variant/70 hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-85 focus:outline-none cursor-pointer p-1 hover:translate-x-1"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_right</span>
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
export function AuthLayout({ headline, children }: { headline: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-background text-on-background min-h-screen grid md:grid-cols-2 grid-cols-1 antialiased overflow-x-hidden relative">
      <main className=" flex col-span-1 bg-background p-6 ">
        <div className="w-full rounded-2xl overflow-hidden relative bg-zinc-900">
          <div className="absolute inset-0">
            <ColorBends colors={["#7C9CFF", "#B497CF", "#8A5CFF"]} speed={0.15} intensity={1.2} noise={0.1} />
          </div>

          <nav className="w-full absolute top-10 lg:left-10 z-50 flex justify-center md:justify-between items-center">
            <FozLogo showText={true} textClassName="text-2xl md:text-3xl font-black tracking-tighter text-white" />
          </nav>
          <div className="w-full absolute top-20 text-center mt-2 md:hidden mb-2">
            <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_4px_16px_rgba(40,145,221,0.5)]">{headline}</h1>
          </div>

          <div className="hidden md:flex w-full h-full flex-col justify-center items-start px-8 lg:px-12 relative pt-20 pb-8">
            <div className="z-10 w-full flex flex-col gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white leading-[1.05] mb-4 drop-shadow-[0_4px_20px_rgba(40,145,221,0.5)]">
                  {headline}
                </h1>
                <p className="text-body-lg font-body-lg text-white max-w-sm">
                  Explore the things you love, connect with the community, and discover new insights
                  in real-time.
                </p>
              </div>
              <TrendingCarousel />
            </div>
          </div>
        </div>
      </main>
      <div className="w-[80%] mx-auto pt-10 md:pt-0 flex md:items-center md:justify-center px-0 md:px-6">
        <div className="w-full md:p-8  relative z-10 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
