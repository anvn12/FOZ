import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginRequest } from "#shared/schemas/auth";
import { useLogin, initiateSocialAuth, ApiError } from "#frontend/api/auth";
import { SocialLoginButtons } from "#frontend/components/SocialLoginButtons";
import { isMobileDevice } from "#frontend/utils/device";

interface CarouselSlideData {
  id: string;
  tag: string;
  tagBg: string;
  tagTextColor: string;
  timeAgo: string;
  headline: string;
}

const CAROUSEL_SLIDES: CarouselSlideData[] = [
  {
    id: "slide-1",
    tag: "Trending",
    tagBg: "bg-[#00C2FF]",
    tagTextColor: "text-[#002e3f]",
    timeAgo: "Just now",
    headline: "Top 10 productivity hacks for 2024 to streamline your workflow.",
  },
  {
    id: "slide-2",
    tag: "Market",
    tagBg: "bg-[#9D3BFF]",
    tagTextColor: "text-white",
    timeAgo: "2h ago",
    headline: "The rise of AI in fintech: What you need to know for the next quarter.",
  },
  {
    id: "slide-3",
    tag: "Community",
    tagBg: "bg-[#2E7DFF]",
    tagTextColor: "text-white",
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative h-32 w-full" id="trending-carousel">
        {CAROUSEL_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`carousel-item glass-panel rounded-xl p-6 ${isActive ? "active" : ""}`}
              aria-hidden={!isActive}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-label-md font-label-md rounded-full font-bold ${slide.tagBg} ${slide.tagTextColor}`}
                >
                  {slide.tag}
                </span>
                <span className="text-label-md font-label-md text-on-surface opacity-75">
                  {slide.timeAgo}
                </span>
              </div>
              <p className="text-body-md font-body-md text-on-surface">{slide.headline}</p>
            </div>
          );
        })}
      </div>

      {/* Carousel Controls */}
      <div className="flex gap-2 mt-6">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prevSlide}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7DFF]"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={nextSlide}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7DFF]"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequest) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => navigate("/"),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
    });
  });

  const handleSocialSelect = async (provider: "google") => {
    try {
      setSocialLoading(provider);
      const isMobile = isMobileDevice();
      const res = await initiateSocialAuth(provider, isMobile);
      if (res) {
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Social authentication failed or was cancelled.");
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    toast.error("Password recovery feature coming soon.");
  };

  return (
    <div className="bg-[#f9f9ff] text-[#1e2024] min-h-screen flex flex-col antialiased overflow-x-hidden relative">
      {/* Top Navigation (Brand Anchor) */}
      <nav className="w-full absolute top-0 left-0 z-50 bg-transparent flex justify-between items-center px-6 md:px-16 py-6">
        <Link to="/" className="flex items-center gap-4" aria-label="FOZ Home">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG2dtFpXOaoguUWWzA8emJhKPboHhLcxZslQ8tGT_lLFplkcqBDhOVkg32jQ8sIExp8wPgKIfaj8osR-leaC-yKpJ568k9ZF__Zm02prCaDwMlNcHQkxkar598Mu0V93Xx8-RYfiC1TGb1IvRIQsCK9IEKTbpdSuBrAfNg5-Q7GZWzqJZ33BXuuu0RGDpBHubPKbKP7mC221iIV-WHgtMPtarWBuWSMLVAKeBw4pkKj2vhv8L7gjCo0j0Jh95OB0o-8w"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/foz-logo.svg";
            }}
            alt="FOZ Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-3xl font-black text-[#2E7DFF] tracking-tighter font-montserrat">
            FOZ
          </span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row w-full min-h-screen relative z-10 items-center justify-center pt-24 md:pt-16 pb-12">
        {/* Left Half: Branding & Carousel (Desktop View) */}
        <div className="hidden md:flex w-1/2 h-full flex-col justify-center px-12 md:px-16 relative items-center">
          <div className="max-w-xl z-10">
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-[#1e2024] leading-tight font-montserrat">
              Focus on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7DFF] to-[#9D3BFF]">
                Zillions.
              </span>
            </h1>
            <p className="text-lg mb-12 text-[#424754] font-plus-jakarta max-w-md">
              Explore the things you love, connect with the community, and discover new insights in real-time.
            </p>

            {/* Interactive Carousel */}
            <TrendingCarousel />
          </div>
        </div>

        {/* Right Half: Glassmorphic Login Card */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center px-4 md:px-16 flex-col">
          <div className="glass-panel w-full max-w-md rounded-xl p-8 md:p-10 shadow-xl relative z-10">
            <h2 className="text-2xl font-semibold text-[#1e2024] mb-8 text-center font-montserrat">
              Log in to FOZ
            </h2>

            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div>
                <label className="sr-only" htmlFor="email">
                  Email address or mobile number
                </label>
                <input
                  id="email"
                  type="text"
                  autoComplete="email"
                  placeholder="Email address or mobile number"
                  aria-invalid={errors.email ? true : undefined}
                  {...field("email")}
                  className="w-full px-4 py-3 rounded-lg input-glass text-[#1e2024] text-base placeholder-[#8c90a0] font-plus-jakarta focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1.5 px-1 text-xs text-[#ba1a1a] font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    aria-invalid={errors.password ? true : undefined}
                    {...field("password")}
                    className="w-full px-4 py-3 rounded-lg input-glass text-[#1e2024] text-base placeholder-[#8c90a0] font-plus-jakarta focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8c90a0] hover:text-[#2E7DFF] transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 px-1 text-xs text-[#ba1a1a] font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || login.isPending}
                className="w-full py-3.5 rounded-lg btn-gradient text-white text-base font-bold font-montserrat mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting || login.isPending ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/forgot-password"
                onClick={handleForgotPassword}
                className="text-[#2E7DFF] hover:text-[#00C2FF] transition-colors text-sm font-medium font-plus-jakarta"
              >
                Forgotten password?
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-black/10 text-center">
              <Link
                to="/register"
                className="block w-full py-3 rounded-lg btn-glass text-center text-[#1e2024] text-sm font-bold font-montserrat hover:text-[#2E7DFF] transition-colors"
              >
                Create new account
              </Link>
            </div>

            {/* Social Login Buttons Below Create New Account */}
            <SocialLoginButtons
              onSelectProvider={handleSocialSelect}
              loadingProvider={socialLoading}
              disabled={isSubmitting || login.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}