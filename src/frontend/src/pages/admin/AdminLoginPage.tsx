import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginRequest } from "#shared/schemas/auth";
import { useLogin, ApiError } from "#frontend/api/auth";
import { useAuthStore } from "#frontend/stores/auth";
import { FozLogo } from "#frontend/components/FozLogo";

interface CarouselSlideData {
  id: string;
  tag: string;
  tagBg: string;
  tagTextColor: string;
  timeAgo: string;
  headline: string;
}

const ADMIN_CAROUSEL_SLIDES: CarouselSlideData[] = [
  {
    id: "admin-slide-1",
    tag: "Governance",
    tagBg: "bg-[#9D3BFF]",
    tagTextColor: "text-white",
    timeAgo: "Live",
    headline: "Real-time user management, role delegation, and access governance.",
  },
  {
    id: "admin-slide-2",
    tag: "Moderation",
    tagBg: "bg-[#00C2FF]",
    tagTextColor: "text-[#002e3f]",
    timeAgo: "Queue",
    headline: "AI-assisted report triage and escalation resolution system.",
  },
  {
    id: "admin-slide-3",
    tag: "Security",
    tagBg: "bg-[#2E7DFF]",
    tagTextColor: "text-white",
    timeAgo: "Audit",
    headline: "Tamper-evident audit logging for full operational compliance.",
  },
];

function AdminTrendingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ADMIN_CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ADMIN_CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ADMIN_CAROUSEL_SLIDES.length) % ADMIN_CAROUSEL_SLIDES.length);
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative h-32 w-full" id="trending-carousel">
        {ADMIN_CAROUSEL_SLIDES.map((slide, index) => {
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

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const currentUser = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in as admin on initial mount, redirect to dashboard
  useEffect(() => {
    if (currentUser?.role === "administrator") {
      navigate("/admin", { replace: true });
    }
  }, []);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequest) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (data) => {
        if (data.user.role === "administrator") {
          toast.success("Administrator login successful!");
          navigate("/admin", { replace: true });
        } else {
          clearSession();
          toast.error("Access Denied: Administrator privileges required to access the admin portal.");
        }
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Authentication failed");
      },
    });
  });

  return (
    <div className="bg-[#f9f9ff] text-[#0f172a] min-h-screen flex flex-col antialiased overflow-x-hidden relative">
      {/* Background Animated Floating Shader Orbs */}
      <div className="shader-bg" aria-hidden="true">
        <div className="shader-orb orb-1" />
        <div className="shader-orb orb-2" />
      </div>

      {/* Top Navigation (Brand Header with FOZ Logo) */}
      <nav className="w-full absolute top-0 left-0 z-50 bg-transparent flex justify-between items-center px-4 md:px-16 py-4 md:py-6">
        <FozLogo to="/admin/login" textSuffix="Admin" />
        <Link
          to="/"
          className="text-xs sm:text-sm font-semibold text-[#2E7DFF] hover:text-[#9D3BFF] transition-colors"
        >
          Return to Forum →
        </Link>
      </nav>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto min-h-screen relative z-10 items-center justify-center pt-20 md:pt-16 pb-8 px-4 gap-6">
        {/* Mobile Branding Header (< 768px) */}
        <div className="w-full text-center mt-2 md:hidden mb-2">
          <h1 className="text-3xl font-bold font-montserrat text-[#0f172a] mb-1">
            Focus on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7DFF] to-[#9D3BFF]">
              Control.
            </span>
          </h1>
          <p className="text-xs text-[#475569] font-medium">Administrator Governance Portal</p>
        </div>

        {/* Desktop Left Panel: Branding & Carousel (≥ 768px) */}
        <div className="hidden md:flex w-1/2 h-full flex-col justify-center px-8 lg:px-12 relative items-center">
          <div className="max-w-md z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-[#0f172a] leading-tight font-montserrat">
              Focus on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7DFF] to-[#9D3BFF]">
                Control.
              </span>
            </h1>
            <p className="text-base mb-8 text-[#475569] font-plus-jakarta max-w-sm">
              Comprehensive platform administration, moderation queues, user privileges, and system settings.
            </p>

            {/* Interactive Admin Carousel */}
            <AdminTrendingCarousel />
          </div>
        </div>

        {/* Glassmorphic Admin Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-0 md:px-6">
          <div className="glass-panel w-full max-w-md rounded-xl p-5 md:p-7 shadow-xl relative z-10 flex flex-col">
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-extrabold uppercase rounded-full mb-2 tracking-wider border border-purple-200">
                Admin Access Only
              </span>
              <h2 className="text-2xl font-semibold text-[#0f172a] font-montserrat">
                Admin Control Login
              </h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div>
                <label className="sr-only" htmlFor="admin-email">
                  Admin Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Admin Email Address (e.g. admin@foz.dev)"
                  aria-invalid={errors.email ? true : undefined}
                  {...field("email")}
                  className="w-full min-h-[44px] px-4 py-3 rounded-lg input-glass text-[#0f172a] text-base placeholder-[#727786] font-plus-jakarta focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <label className="sr-only" htmlFor="admin-password">
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                  <p className="mt-1 px-1 text-xs text-[#ba1a1a] font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || login.isPending}
                className="w-full min-h-[44px] py-3 rounded-lg bg-gradient-to-r from-[#9D3BFF] to-[#2E7DFF] hover:opacity-95 text-white text-base font-bold font-montserrat mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md transition-all active:scale-[0.99]"
              >
                <span>{isSubmitting || login.isPending ? "Authenticating Admin..." : "Log in to Admin Control"}</span>
                {!isSubmitting && !login.isPending && (
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-black/10 text-center">
              <Link
                to="/login"
                className="text-[#2E7DFF] hover:text-[#9D3BFF] transition-colors text-xs font-semibold font-plus-jakarta"
              >
                Standard User Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
