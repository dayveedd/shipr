"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RankBadge } from "@/components/ui/Badge";
import { AuthModal } from "@/components/auth/AuthModal";
import { userService } from "@/services";
import { User } from "@/types";
import { Zap, Trophy, LayoutDashboard, Compass, LogOut, User as UserIcon, Github, Plus, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (res.success) setUser(res.data);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await userService.logout();
    setUser(null);
    setShowUserMenu(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/sprints", label: "Sprints", icon: Compass },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-2xl border-b border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-white/70 backdrop-blur-xl border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group relative">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF5500]/20 rounded-xl blur-lg scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#E04B00] text-white flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-[0_2px_8px_rgba(255,85,0,0.35)]">
                <Zap className="w-5 h-5 fill-white drop-shadow-sm" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-tight text-zinc-900 font-sans leading-none">
                Ship<span className="text-[#FF5500]">R</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-400 font-semibold font-sans leading-none mt-0.5">
                Execution Pays
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5 bg-zinc-50/80 p-1 rounded-2xl border border-zinc-200/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#FF5500] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,85,0,0.12)]"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-[15px] h-[15px] ${isActive ? "text-[#FF5500]" : ""}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-zinc-50 transition-all duration-200 border border-transparent hover:border-zinc-200/80"
                >
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(255,85,0,0.2)] object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[12px] font-bold text-zinc-800 leading-tight font-sans">
                      {user.name}
                    </span>
                    <RankBadge rank={user.rank} showIcon={false} className="py-0 px-1.5 text-[9px]" />
                  </div>
                  <svg className="hidden sm:block w-3.5 h-3.5 text-zinc-400" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_16px_70px_-12px_rgba(0,0,0,0.15)] p-1.5 z-50">
                      <div className="px-3 py-2.5 mb-1">
                        <p className="text-[13px] font-bold text-zinc-900">{user.name}</p>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">@{user.githubUsername || "connected"}</p>
                      </div>
                      <div className="border-t border-zinc-100 pt-1">
                        <Link
                          href={`/profile/${user.githubUsername}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-zinc-600 hover:text-[#FF5500] hover:bg-[#FF5500]/[0.04] transition-all duration-150"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-zinc-600 hover:text-[#FF5500] hover:bg-[#FF5500]/[0.04] transition-all duration-150"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/creator/create"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-zinc-600 hover:text-[#FF5500] hover:bg-[#FF5500]/[0.04] transition-all duration-150"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Challenge</span>
                        </Link>
                      </div>
                      <div className="border-t border-zinc-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Github className="w-4 h-4" />}
                onClick={() => setIsAuthOpen(true)}
              >
                Connect GitHub
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-zinc-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-zinc-700" /> : <Menu className="w-5 h-5 text-zinc-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white/95 backdrop-blur-xl">
            <nav className="flex flex-col p-3 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                      isActive
                        ? "bg-[#FF5500]/[0.06] text-[#FF5500] border border-[#FF5500]/15"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />
    </>
  );
};
