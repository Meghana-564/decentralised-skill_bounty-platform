"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "@/context/ThemeContext";
import { Heart, Zap } from "lucide-react";

const Grainient = dynamic(() => import("./reactbits/GradientFooter"), { ssr: false });

const NAV_GROUPS = [
  {
    title: "Marketplace",
    links: [
      { href: "/jobs", label: "Find Jobs" },
      { href: "/bounties", label: "Bounties" },
      { href: "/sub-contracts", label: "Sub-Contracts" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/disputes", label: "Disputes" },
      { href: "/governance", label: "Governance" },
      { href: "/crowdfunding", label: "Crowdfunding" },
    ],
  },
];

export default function Footer() {
  const { colors } = useTheme();
  const dk = colors.colorScheme === "dark";

  return (
    <footer className="border-t mt-auto relative overflow-hidden" style={{ borderColor: colors.navBorder }}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Grainient
          color1={colors.primaryLight}
          color2={colors.primaryFg}
          color3={colors.pageBg}
          timeSpeed={0.3}
          grainAmount={0.03}
          contrast={1.1}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: dk
                  ? `linear-gradient(145deg, ${colors.cardBg}, ${colors.surfaceBg})`
                  : `linear-gradient(145deg, #FFFFFF, ${colors.surfaceBg})`,
                borderColor: colors.cardBorder,
                boxShadow: dk
                  ? `0 4px 24px rgba(0,0,0,0.3)`
                  : `0 4px 24px rgba(99,102,241,0.06)`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}
                >
                  <span style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>S</span>
                </div>
                <span
                  className="font-extrabold text-xl leading-none tracking-tight"
                  style={{ color: colors.primaryFg, fontFamily: "var(--font-heading)" }}
                >
                  SkillBounty
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: colors.mutedFg }}>
                Decentralised skill marketplace powered by Ethereum smart contracts.
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3" style={{ color: colors.primaryFg }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.primaryFg }}>
                  Zero Platform Fees
                </span>
              </div>
            </div>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: colors.primaryFg, fontFamily: "var(--font-mono-alt)" }}
              >
                {g.title}
              </p>
              <ul className="space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors hover:underline underline-offset-2"
                      style={{ color: colors.mutedFg }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Extra column — tagline */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: colors.primaryFg, fontFamily: "var(--font-mono-alt)" }}
            >
              Built On
            </p>
            <ul className="space-y-2.5">
              {["Ethereum / Polygon", "IPFS Storage", "Smart Contracts", "DAO Governance"].map((item) => (
                <li key={item}>
                  <span className="text-sm" style={{ color: colors.mutedFg }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="sb-divider mb-6" />

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ color: colors.mutedFg }}
        >
          <p>&copy; {new Date().getFullYear()} SkillBounty. Open-source, on-chain, unstoppable.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="inline text-red-500 mx-0.5" /> on Ethereum
          </p>
        </div>
      </div>
    </footer>
  );
}
