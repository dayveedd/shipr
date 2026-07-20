"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RankBadge } from "@/components/ui/Badge";
import { AuthModal } from "@/components/auth/AuthModal";
import { userService } from "@/services";
import { User } from "@/types";
import { Zap, Trophy, LayoutDashboard, Compass, LogOut, User as UserIcon, Github } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    userService.getCurrentUser().then((res) => {
      if (res.success) setUser(res.data);
    });
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
    { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-zinc-200 shadow-soft-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF5500] text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-orange-glow">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 font-sans">
                Ship<span className="text-[#FF5500]">R</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#FF5500] -mt-1 font-mono font-bold">
                Execution Pays
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-nav transition-all ${
                    isActive
                      ? "bg-white text-[#FF5500] border border-[#FF5500]/30 shadow-sm font-bold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Action Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200"
                >
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-[#FF5500]/40 object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#FF5500] rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-900 leading-tight font-sans">
                      {user.name}
                    </span>
                    <RankBadge rank={user.rank} showIcon={false} className="py-0 px-1.5 text-[9px]" />
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-zinc-200 shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="text-xs font-bold text-zinc-900">{user.name}</p>
                      <p className="text-[11px] font-mono text-zinc-500">@{user.githubUsername}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/profile/${user.githubUsername}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:text-[#FF5500] hover:bg-[#FFF2EC] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#FF5500]" />
                        <span>My Execution Profile</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:text-[#FF5500] hover:bg-[#FFF2EC] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#FF5500]" />
                        <span>My Dashboard</span>
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-zinc-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
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
          </div>
        </div>
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
