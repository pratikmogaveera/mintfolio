'use client';
import { BellIcon, XIcon } from '@phosphor-icons/react';
import { Button } from './ui/button';

interface NotificationPromptProps {
  onEnable: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
}

// Each ray: angle from center, color, and half-spread in degrees (controls taper width at tip)
const RAYS = [
  // Bundle 2 — warm (renders behind)
  { angle: 105, color: '#f97316', spread: 9  },
  { angle: 126, color: '#ec4899', spread: 6  },
  { angle: 151, color: '#eab308', spread: 11 },
  { angle: 172, color: '#f43f5e', spread: 7  },
  // Bundle 1 — cool (renders on top)
  { angle: -75, color: '#6366f1', spread: 10 },
  { angle: -54, color: '#22d3ee', spread: 7  },
  { angle: -33, color: '#4ade80', spread: 12 },
  { angle: -8,  color: '#8b5cf6', spread: 6  },
];

// SVG viewBox: 400 x 224, origin slightly below center to align with pill
const CX = 200;
const CY = 130;
const RAY_LENGTH = 600; // long enough to always bleed past edges at any rotation

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Returns a trapezoid: narrow at center (2px half-width), wide at tip (spread degrees)
function rayPath(angle: number, spread: number): string {
  const tipLeft  = angle - spread;
  const tipRight = angle + spread;

  // Tip points (far end)
  const x1 = CX + RAY_LENGTH * Math.sin(toRad(tipLeft));
  const y1 = CY - RAY_LENGTH * Math.cos(toRad(tipLeft));
  const x2 = CX + RAY_LENGTH * Math.sin(toRad(tipRight));
  const y2 = CY - RAY_LENGTH * Math.cos(toRad(tipRight));

  // Root points (near center — 2px half-width perpendicular to ray)
  const perpAngle = angle + 90;
  const rootOffset = 2;
  const rx1 = CX + rootOffset * Math.cos(toRad(perpAngle));
  const ry1 = CY + rootOffset * Math.sin(toRad(perpAngle));
  const rx2 = CX - rootOffset * Math.cos(toRad(perpAngle));
  const ry2 = CY - rootOffset * Math.sin(toRad(perpAngle));

  return `M ${rx1} ${ry1} L ${x1} ${y1} L ${x2} ${y2} L ${rx2} ${ry2} Z`;
}

const Sparkle = ({ cx, cy, size = 14, className }: { cx: number; cy: number; size?: number; className?: string }) => (
  <svg
    className={`sparkle ${className ?? ''}`}
    style={{ left: `${cx}px`, top: `${cy}px` }}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#fbbf24"
  >
    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
  </svg>
);

const NotificationPrompt = ({ onEnable, onDismiss, isLoading }: NotificationPromptProps) => {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl">
      {/* Hero area — dark bg in both modes, slightly different shade */}
      <div className="notif-prompt-hero relative flex h-56 items-center justify-center overflow-hidden">

        {/* SVG ray burst — oscillates */}
        <svg
          className="notif-prompt-rays absolute inset-0"
          width="100%"
          height="100%"
          viewBox="0 0 400 224"
          preserveAspectRatio="xMidYMid slice"
        >
          {RAYS.map((ray, i) => (
            <path
              key={i}
              d={rayPath(ray.angle, ray.spread)}
              fill={ray.color}
              opacity={0.88}
            />
          ))}
        </svg>

        {/* Vignette */}
        <div
          className="notif-prompt-vignette absolute inset-0 z-10"
        />

        {/* Glassy pill */}
        <div
          className="notif-prompt-pill relative z-20 flex items-center gap-2.5 rounded-full px-6 py-3"
          style={{
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <BellIcon weight="fill" size={22} color="white" />
          <span className="font-heading text-lg font-semibold text-white">mintfolio</span>
        </div>

        {/* Sparkles */}
        <Sparkle cx={55}  cy={38}  size={18} className="sparkle-1 z-20" />
        <Sparkle cx={285} cy={52}  size={22} className="sparkle-2 z-20" />
        <Sparkle cx={80}  cy={155} size={16} className="sparkle-3 z-20" />

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 z-30 flex size-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Separator */}
      <div className="h-px bg-white/10" />

      {/* Content */}
      <div className="bg-card flex flex-col items-center gap-4 px-6 py-6 text-center">
        <div className="space-y-1.5">
          <h3 className="font-heading text-lg font-semibold">Get your morning briefing</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Wake up to your portfolio value and P&L every morning at 6 AM.
            <br />
            <span className="text-xs">You can toggle this on or off anytime from your profile.</span>
          </p>
        </div>
        <Button onClick={onEnable} disabled={isLoading} className="w-full rounded-full">
          {isLoading ? 'Enabling...' : 'Enable Notifications'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPrompt;
