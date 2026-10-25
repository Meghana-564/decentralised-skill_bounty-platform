"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "@/context/ThemeContext";
import { getJobMarket, CONTRACT_ADDRESSES, NATIVE_SYMBOL } from "@/lib/contracts";
import CountUp from "@/components/reactbits/CountUp";
import ButtonCreativeRight from "@/components/reactbits/Button";
import GlassSurface from "@/components/reactbits/GlassSurface";
import { EncryptedText } from "@/components/reactbits/Encrypted-text";
import type { BentoCardData } from "@/components/reactbits/MagicBento";
import {
  BadgeCheck,
  Gavel,
  Lock,
  ScrollText,
  Trophy,
  Vote,
  Wallet,
  ArrowRight,
  Zap,
  Shield,
  Users,
} from "lucide-react";

const Grainient = dynamic(() => import("@/components/reactbits/FaultyTerminal"), { ssr: false });
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), { ssr: false });
const Shuffle = dynamic(() => import("@/components/reactbits/Shuffle"), { ssr: false });
const PixelCard = dynamic(() => import("@/components/reactbits/Pixelcard"), { ssr: false });

interface Stats { total: number; open: number; inProgress: number; completed: number }

const FEATURES: BentoCardData[] = [
  { icon: <Lock className="w-7 h-7" />, label: "Core", title: "Zero Middlemen", description: "Smart contracts handle payments and escrow automatically. No platform fees, no delays, no gatekeepers." },
  { icon: <Wallet className="w-7 h-7" />, label: "Security", title: "Escrow Protection", description: "Funds are locked in escrow when a bid is accepted and released only on completion." },
  { icon: <Gavel className="w-7 h-7" />, label: "Disputes", title: "On-chain Disputes", description: "Community voting resolves disputes fairly with token-weighted votes and transparent outcomes." },
  { icon: <BadgeCheck className="w-7 h-7" />, label: "Trust", title: "Verified Reviews", description: "On-chain reviews tied to real completed jobs — impossible to fake, permanent on the blockchain." },
  { icon: <Trophy className="w-7 h-7" />, label: "Quick Tasks", title: "Bounty Board", description: "Post open bounties for quick tasks. Multiple submissions, approve the best one." },
  { icon: <Vote className="w-7 h-7" />, label: "DAO", title: "DAO Governance", description: "VRT holders propose and vote on platform changes. True decentralized decision-making." },
  { icon: <ScrollText className="w-7 h-7" />, label: "Delegation", title: "Sub-Contracting", description: "Freelancers can delegate parts of jobs to sub-contractors with on-chain accountability." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Post a Bounty", body: "Describe what you need, set a budget and deadline. The job goes live on-chain immediately.", icon: <Zap className="w-5 h-5" /> },
  { step: "02", title: "Match & Escrow", body: "Review freelancer bids and profiles, then accept. Payment is locked in escrow automatically.", icon: <Shield className="w-5 h-5" /> },
  { step: "03", title: "Get Paid", body: "Client approves the work, escrow releases payment directly to the freelancer. No waiting.", icon: <Users className="w-5 h-5" /> },
];

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function AnimatedSection({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.section ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger} className={className} style={style}>
      {children}
    </motion.section>
  );
}

export default function Home() {
  const { address, connect, provider } = useWallet();
  const { colors, theme } = useTheme();
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const contractsConfigured = CONTRACT_ADDRESSES.JobMarket !== "";
  const glowRgb = useMemo(() => hexToRgb(colors.primaryFg), [colors.primaryFg]);

  const heroPalette = useMemo(() => {
    switch (theme) {
      case "light":    return { color1: "#F5F6FA", color2: "#C7D2FE", color3: "#818CF8" };
      case "dark":     return { color1: "#080C18", color2: "#1A1F40", color3: "#6366F1" };
      case "midnight": return { color1: "#020617", color2: "#1E293B", color3: "#6366F1" };
      case "ocean":    return { color1: "#0A2540", color2: "#164E78", color3: "#00B4D8" };
      case "sunset":   return { color1: "#FFF1E5", color2: "#F4A261", color3: "#E76F51" };
      case "forest":   return { color1: "#F1F8F2", color2: "#A5D6A7", color3: "#2E7D32" };
      case "rose":     return { color1: "#FFF7FA", color2: "#F8BBD0", color3: "#E91E63" };
      case "pastel":   return { color1: "#FEFCFF", color2: "#DDD6FE", color3: "#A5B4FC" };
      default:         return { color1: colors.pageBg, color2: colors.primaryLight, color3: colors.primaryFg };
    }
  }, [theme, colors]);

  const grainFx = useMemo(() => {
    if (theme === "light") return { colorBalance: -0.05, blendAngle: 18, blendSoftness: 0.14, contrast: 1.25, saturation: 0.95 };
    if (theme === "dark")  return { colorBalance: 0.1, blendAngle: -16, blendSoftness: 0.18, contrast: 1.7, saturation: 0.9 };
    return { colorBalance: 0, blendAngle: 0, blendSoftness: 0.05, contrast: 1.5, saturation: 1 };
  }, [theme]);

  const loadStats = useCallback(async () => {
    if (!contractsConfigured || !provider) return;
    try {
      const jm = getJobMarket(provider);
      const count = Number(await jm.jobCounter());
      let open = 0, inProgress = 0, completed = 0;
      const batch = Math.min(count, 50);
      for (let i = count; i > count - batch && i > 0; i--) {
        try {
          const j = await jm.getJob(i);
          const s = Number(j.status);
          if (s === 0) open++;
          else if (s === 1) inProgress++;
          else if (s === 2) completed++;
        } catch {}
      }
      setStats({ total: count, open, inProgress, completed });
    } catch {}
  }, [provider, contractsConfigured]);

  useEffect(() => {
    const timer = setTimeout(() => { void loadStats(); }, 0);
    return () => clearTimeout(timer);
  }, [loadStats]);

  const dk = colors.colorScheme === "dark";

  return (
    <div className="min-h-screen -mt-24">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: colors.pageBg, borderBottom: `1px solid ${colors.cardBorder}` }}
      >
        {/* Animated mesh background */}
        <div className="absolute inset-0 z-0">
          <Grainient
            color1={heroPalette.color1}
            color2={heroPalette.color2}
            color3={heroPalette.color3}
            timeSpeed={0.2}
            colorBalance={grainFx.colorBalance}
            warpStrength={0.8}
            warpFrequency={4}
            warpSpeed={1.5}
            warpAmplitude={40}
            blendAngle={grainFx.blendAngle}
            blendSoftness={grainFx.blendSoftness}
            rotationAmount={400}
            noiseScale={2}
            grainAmount={0.06}
            grainScale={2}
            grainAnimated={false}
            contrast={grainFx.contrast}
            gamma={1}
            saturation={grainFx.saturation}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: colors.primaryFg, opacity: dk ? 0.08 : 0.06 }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "#8B5CF6", opacity: dk ? 0.06 : 0.04 }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-40 md:pt-52 pb-32 md:pb-44 text-center pointer-events-none">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8 border"
            style={{ background: colors.primaryLight, borderColor: colors.primaryFg + "33", color: colors.primaryFg }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Blockchain-Powered Skill Marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight"
            style={{ color: colors.pageFg, fontFamily: "var(--font-heading)" }}
          >
            Turn Your Skills Into
            <br />
            <span className="inline-grid align-top" style={{ color: colors.primaryFg }}>
              <span className="invisible col-start-1 row-start-1">Real Opportunities</span>
              <span className="col-start-1 row-start-1">
                <EncryptedText
                  text="Real Opportunities"
                  className="inline-block"
                  holdDelayMs={2200}
                  revealDelayMs={55}
                  flipDelayMs={55}
                  encryptedClassName="opacity-60"
                  revealedClassName=""
                />
              </span>
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: colors.mutedFg }}
          >
            Connect skills with opportunities through a transparent blockchain-powered bounty platform.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <GlassSurface
              isDark={dk}
              width="auto"
              height="auto"
              borderRadius={14}
              className="pointer-events-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ overflow: "visible" }}
            >
              <Link
                href="/jobs"
                className="font-bold px-8 py-2 text-base inline-flex items-center gap-2 min-w-[200px] justify-center"
                style={{ color: colors.pageFg }}
              >
                Browse Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </GlassSurface>

            {address ? (
              <div className="pointer-events-auto">
                <ButtonCreativeRight
                  label="Post a Job"
                  bg={colors.primary}
                  fg={colors.primaryText}
                  hoverBg={colors.primaryHover}
                  hoverFg={colors.primaryText}
                  borderColor="transparent"
                  className="min-w-[200px] rounded-xl"
                  onClick={() => window.location.href = "/jobs?tab=mine"}
                />
              </div>
            ) : (
              <div className="pointer-events-auto">
                <ButtonCreativeRight
                  label="Connect Wallet"
                  bg={colors.primary}
                  fg={colors.primaryText}
                  hoverBg={colors.primaryHover}
                  hoverFg={colors.primaryText}
                  borderColor="transparent"
                  className="min-w-[200px] rounded-xl"
                  onClick={connect}
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      {contractsConfigured && (
        <AnimatedSection style={{ background: colors.cardBg, borderBottom: `1px solid ${colors.cardBorder}` }}>
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total Jobs", value: stats.total, color: colors.pageFg, bg: colors.surfaceBg },
                { label: "Open Now", value: stats.open, color: colors.primaryFg, bg: colors.primaryLight },
                { label: "In Progress", value: stats.inProgress, color: colors.warningText, bg: colors.warningBg },
                { label: "Completed", value: stats.completed, color: colors.successText, bg: colors.successBg },
              ].map(({ label, value, color, bg }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className="rounded-2xl border p-6 text-center stat-hover"
                  style={{ background: bg, borderColor: colors.cardBorder }}
                >
                  <CountUp
                    to={value}
                    from={0}
                    duration={2}
                    separator=","
                    className="text-4xl font-extrabold"
                    style={{ color }}
                    startWhen={value > 0}
                  />
                  <p className="text-sm mt-2 font-medium" style={{ color: colors.mutedFg }}>{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── How It Works ── */}
      <AnimatedSection className="py-24" style={{ background: colors.surfaceBg }}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="sb-pill mb-4" style={{ background: colors.primaryLight, color: colors.primaryFg }}>
              Simple Process
            </span>
            <Shuffle
              text="How It Works"
              tag="h2"
              className="text-4xl sm:text-5xl font-extrabold mb-4 mt-4"
              style={{ color: colors.pageFg, fontFamily: "var(--font-heading)" }}
              shuffleDirection="up"
              duration={0.4}
              shuffleTimes={2}
              stagger={0.04}
              triggerOnce={true}
              triggerOnHover={true}
              colorFrom={colors.muted}
              colorTo={colors.pageFg}
            />
            <p className="text-lg max-w-md mx-auto" style={{ color: colors.mutedFg }}>
              Three steps from job post to payment — all on-chain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 justify-items-center">
            {HOW_IT_WORKS.map(({ step, title, body, icon }) => (
              <motion.div key={step} variants={slideLeft} className="flex justify-center w-full">
                <PixelCard
                  variant="default"
                  colors={`${colors.cardBorder},${colors.primaryLight},${colors.primaryFg}`}
                  gap={6}
                  speed={30}
                  borderColor={colors.cardBorder}
                  className="w-full h-[300px]"
                >
                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: colors.primaryLight, color: colors.primaryFg }}>
                          {icon}
                        </div>
                        <span className="text-3xl font-black" style={{ color: colors.primaryFg, opacity: 0.3 }}>{step}</span>
                      </div>
                      <h3 className="font-bold text-xl mb-3" style={{ color: colors.pageFg, fontFamily: "var(--font-heading)" }}>{title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: colors.mutedFg }}>{body}</p>
                    </div>
                  </div>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Features ── */}
      <AnimatedSection className="py-24" style={{ background: colors.cardBg }}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="sb-pill mb-4" style={{ background: colors.primaryLight, color: colors.primaryFg }}>
              Everything Included
            </span>
            <Shuffle
              text="Why SkillBounty?"
              tag="h2"
              className="text-4xl sm:text-5xl font-extrabold mb-4 mt-4"
              style={{ color: colors.pageFg, fontFamily: "var(--font-heading)" }}
              shuffleDirection="right"
              duration={0.35}
              shuffleTimes={2}
              stagger={0.03}
              triggerOnce={true}
              triggerOnHover={true}
              colorFrom={colors.muted}
              colorTo={colors.pageFg}
            />
            <p className="text-lg" style={{ color: colors.mutedFg }}>
              Everything traditional platforms offer — without the trust middleman.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <MagicBento
              items={FEATURES}
              cardBg={colors.surfaceBg}
              cardTextColor={colors.pageFg}
              cardBorderColor={colors.cardBorder}
              glowColor={glowRgb}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              spotlightRadius={300}
              particleCount={10}
              enableTilt={false}
              clickEffect={true}
              enableMagnetism={true}
            />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── Bottom CTA ── */}
      <AnimatedSection
        className="py-24"
        style={{ background: colors.surfaceBg, borderTop: `1px solid ${colors.cardBorder}` }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div variants={fadeUp}>
            <Shuffle
              text="Ready to get started?"
              tag="h2"
              className="text-4xl sm:text-5xl font-extrabold mb-4"
              style={{ color: colors.pageFg, fontFamily: "var(--font-heading)" }}
              shuffleDirection="down"
              duration={0.4}
              shuffleTimes={1}
              stagger={0.03}
              triggerOnce={true}
              triggerOnHover={true}
              colorFrom={colors.muted}
              colorTo={colors.pageFg}
            />
            <p className="mb-10 text-lg" style={{ color: colors.mutedFg }}>
              Connect your wallet and join the decentralized skill economy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <GlassSurface
                isDark={dk}
                width="auto"
                height="auto"
                borderRadius={14}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ overflow: "visible" }}
              >
                <Link
                  href="/jobs"
                  className="font-bold px-8 py-2 text-base inline-flex items-center gap-2 min-w-[200px] justify-center"
                  style={{ color: colors.pageFg }}
                >
                  Find Jobs <ArrowRight className="w-4 h-4" />
                </Link>
              </GlassSurface>

              {address ? (
                <ButtonCreativeRight
                  label="Post a Job"
                  bg={colors.primary}
                  fg={colors.primaryText}
                  hoverBg={colors.primaryHover}
                  hoverFg={colors.primaryText}
                  borderColor="transparent"
                  className="min-w-[200px] rounded-xl"
                  onClick={() => window.location.href = "/jobs?tab=mine"}
                />
              ) : (
                <ButtonCreativeRight
                  label="Connect Wallet"
                  bg={colors.primary}
                  fg={colors.primaryText}
                  hoverBg={colors.primaryHover}
                  hoverFg={colors.primaryText}
                  borderColor="transparent"
                  className="min-w-[200px] rounded-xl"
                  onClick={connect}
                />
              )}
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
}
