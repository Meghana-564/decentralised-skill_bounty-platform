"use client";
import { JOB_STATUS, formatEth, formatDate, NATIVE_SYMBOL, timeAgo } from "@/lib/contracts";
import { useTheme } from "@/context/ThemeContext";
import { Lock, Clock, Calendar, ArrowRight } from "lucide-react";

interface Job {
  id: bigint; client: string; title: string; description: string; category: string;
  budget: bigint; deadline: bigint; status: number; selectedFreelancer: string;
  acceptedBidId: bigint; createdAt: bigint; deliveredAt: bigint;
  milestoneCount: bigint; sealedBidding: boolean; expectedDays: bigint;
}

interface Props {
  job: Job;
  currentAddress: string | null;
  onClick: () => void;
  onPlaceBid?: () => void;
}

const STATUS_COLORS: Record<number, { dot: string; bg: string; text: string }> = {
  0: { dot: "#22C55E", bg: "#F0FDF4", text: "#16A34A" },
  1: { dot: "#6366F1", bg: "#EEF0FF", text: "#4F46E5" },
  2: { dot: "#94A3B8", bg: "#F8FAFC", text: "#64748B" },
  3: { dot: "#EF4444", bg: "#FEF2F2", text: "#DC2626" },
  4: { dot: "#F59E0B", bg: "#FFFBEB", text: "#D97706" },
  5: { dot: "#8B5CF6", bg: "#F5F3FF", text: "#7C3AED" },
};

export default function JobCard({ job, currentAddress, onClick, onPlaceBid }: Props) {
  const { colors } = useTheme();
  const isOwner = currentAddress?.toLowerCase() === job.client.toLowerCase();
  const sc = STATUS_COLORS[job.status] ?? { dot: "#94A3B8", bg: colors.surfaceBg, text: colors.mutedFg };

  return (
    <div
      className="rounded-2xl border flex flex-col justify-between cursor-pointer card-hover overflow-hidden"
      style={{ background: colors.cardBg, borderColor: colors.cardBorder }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primaryFg; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.cardBorder; }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${colors.primaryFg}, #8B5CF6)` }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Category + Status row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
              style={{ background: colors.primaryLight, color: colors.primaryFg }}
            >
              {job.category}
            </span>
            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: sc.bg, color: sc.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.dot }} />
              {JOB_STATUS[job.status]}
              {job.sealedBidding && <Lock size={9} className="inline ml-0.5" />}
            </span>
          </div>
          <span
            className="text-base font-extrabold shrink-0 font-mono"
            style={{ color: colors.successText }}
          >
            {formatEth(job.budget)} {NATIVE_SYMBOL}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-lg leading-snug line-clamp-2"
          style={{ color: colors.pageFg, fontFamily: "var(--font-heading)" }}
        >
          {job.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.mutedFg }}>
          <span className="flex items-center gap-1.5">
            <Clock size={11} /> Posted {timeAgo(job.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} /> {formatDate(job.deadline)}
          </span>
        </div>
      </div>

      {/* Bottom action row */}
      <div
        className="flex items-center justify-end gap-2 px-5 py-3 border-t"
        style={{ borderColor: colors.cardBorder, background: colors.surfaceBg }}
      >
        {!isOwner && job.status === 0 && (
          <button
            onClick={e => { e.stopPropagation(); onPlaceBid?.(); }}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg btn-hover"
            style={{ background: colors.primary, color: colors.primaryText }}
          >
            Place a Bid
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg btn-outline-hover flex items-center gap-1.5 border"
          style={{ borderColor: colors.cardBorder, color: colors.pageFg, background: colors.cardBg }}
        >
          View Details <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
