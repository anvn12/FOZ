import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RegisterRequest, type RegisterRequest as RegisterRequestType } from "#shared/schemas/auth";
import { useRegister, initiateSocialAuth, ApiError } from "#frontend/api/auth";
import { SocialLoginButtons } from "#frontend/components/SocialLoginButtons";
import { isMobileDevice } from "#frontend/utils/device";

// Use the same carousel as LoginPage
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

const formSchema = RegisterRequest.extend({
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit((values) => {
    const payload: RegisterRequestType = {
      email: values.email,
      password: values.password,
      username: values.username,
      displayName: values.displayName,
      location: values.location,
      website: values.website,
    };
    register.mutate(payload, {
      onSuccess: () => navigate("/onboarding/avatar"),
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

  return (
    <div className="bg-[#f9f9ff] text-[#0f172a] min-h-screen flex flex-col antialiased overflow-x-hidden relative">
      <div className="shader-bg" aria-hidden="true">
        <div className="shader-orb orb-1" />
        <div className="shader-orb orb-2" />
      </div>

      <nav className="w-full absolute top-0 left-0 z-50 bg-transparent flex justify-center md:justify-between items-center px-4 md:px-16 py-4 md:py-6">
        <Link to="/" className="flex items-center gap-3" aria-label="FOZ Home">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG2dtFpXOaoguUWWzA8emJhKPboHhLcxZslQ8tGT_lLFplkcqBDhOVkg32jQ8sIExp8wPgKIfaj8osR-leaC-yKpJ568k9ZF__Zm02prCaDwMlNcHQkxkar598Mu0V93Xx8-RYfiC1TGb1IvRIQsCK9IEKTbpdSuBrAfNg5-Q7GZWzqJZ33BXuuu0RGDpBHubPKbKP7mC221iIV-WHgtMPtarWBuWSMLVAKeBw4pkKj2vhv8L7gjCo0j0Jh95OB0o-8w"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/foz-logo.svg";
            }}
            alt="FOZ Logo"
            className="h-8 w-8 md:h-10 md:w-10 object-contain"
          />
          <span className="text-2xl md:text-3xl font-black text-[#2E7DFF] tracking-tighter font-montserrat">
            FOZ
          </span>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto min-h-screen relative z-10 items-center justify-center pt-20 md:pt-16 pb-8 px-4 gap-6">
        <div className="w-full text-center mt-2 md:hidden mb-2">
          <h1 className="text-3xl font-bold font-montserrat text-[#0f172a] mb-1">
            Join{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7DFF] to-[#9D3BFF]">
              FOZ.
            </span>
          </h1>
        </div>

        <div className="hidden md:flex w-1/2 h-full flex-col justify-center px-8 lg:px-12 relative items-center">
          <div className="max-w-md z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-[#0f172a] leading-tight font-montserrat">
              Join <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7DFF] to-[#9D3BFF]">
                FOZ.
              </span>
            </h1>
            <p className="text-base mb-8 text-[#475569] font-plus-jakarta max-w-sm">
              Explore the things you love, connect with the community, and discover new insights in real-time.
            </p>
            <TrendingCarousel />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-0 md:px-6">
          <div className="glass-panel w-full max-w-md rounded-xl p-5 md:p-7 shadow-xl relative z-10 flex flex-col max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-[#0f172a] mb-4 text-center font-montserrat">
              Create an account
            </h2>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="sr-only" htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    aria-invalid={errors.username ? true : undefined}
                    {...field("username")}
                    className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none"
                  />
                  {errors.username && (
                    <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <label className="sr-only" htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    type="text"
                    placeholder="Display Name"
                    aria-invalid={errors.displayName ? true : undefined}
                    {...field("displayName")}
                    className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none"
                  />
                  {errors.displayName && (
                    <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.displayName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="sr-only" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  aria-invalid={errors.email ? true : undefined}
                  {...field("email")}
                  className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="sr-only" htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Location"
                    aria-invalid={errors.location ? true : undefined}
                    {...field("location")}
                    className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none"
                  />
                  {errors.location && (
                    <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.location.message}</p>
                  )}
                </div>
                <div>
                  <label className="sr-only" htmlFor="website">Website</label>
                  <input
                    id="website"
                    type="url"
                    placeholder="Website"
                    aria-invalid={errors.website ? true : undefined}
                    {...field("website")}
                    className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none"
                  />
                  {errors.website && (
                    <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="relative">
                  <label className="sr-only" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Password"
                    aria-invalid={errors.password ? true : undefined}
                    {...field("password")}
                    className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center min-h-[44px] text-[#727786] hover:text-[#2E7DFF] transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    aria-invalid={errors.confirmPassword ? true : undefined}
                    {...field("confirmPassword")}
                    className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none pr-12"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || register.isPending}
                className="w-full min-h-[44px] py-3 rounded-lg btn-gradient text-white text-base font-bold font-montserrat mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                <span>{isSubmitting || register.isPending ? "Creating account…" : "Sign up"}</span>
                {!isSubmitting && !register.isPending && (
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-black/10 text-center">
              <Link
                to="/login"
                className="block w-full min-h-[44px] py-3 rounded-lg btn-glass text-center text-[#0f172a] text-sm font-bold font-montserrat hover:text-[#2E7DFF] transition-colors flex items-center justify-center"
              >
                Already have an account? Log in
              </Link>
            </div>

            <SocialLoginButtons
              onSelectProvider={handleSocialSelect}
              loadingProvider={socialLoading}
              disabled={isSubmitting || register.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}