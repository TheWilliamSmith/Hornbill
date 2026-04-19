"use client";

import { useState } from "react";

interface CryptoIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const ICON_SIZE_MAP = {
  sm: 20,
  md: 24,
  lg: 32,
};

/**
 * Mapping des symboles vers les noms de fichiers dans cryptocurrency-icons
 * Format: symbol -> filename (sans extension)
 */
const SYMBOL_TO_FILENAME: Record<string, string> = {
  BTC: "btc",
  ETH: "eth",
  SOL: "sol",
  POL: "pol",
  MATIC: "matic",
  LINK: "link",
  ADA: "ada",
  DOT: "dot",
  AVAX: "avax",
  UNI: "uni",
  USDT: "usdt",
  USDC: "usdc",
  BNB: "bnb",
  XRP: "xrp",
  DOGE: "doge",
  TRX: "trx",
  ATOM: "atom",
  LTC: "ltc",
  APT: "apt",
  ARB: "arb",
  OP: "op",
};

export default function CryptoIcon({
  symbol,
  size = "md",
  className = "",
}: CryptoIconProps) {
  const [imageError, setImageError] = useState(false);
  const filename = SYMBOL_TO_FILENAME[symbol.toUpperCase()];

  // Si pas d'icône disponible ou erreur de chargement, afficher les initiales
  if (!filename || imageError) {
    return (
      <div
        className={`${SIZE_MAP[size]} rounded-lg bg-black/[0.04] flex items-center justify-center text-xs font-bold text-black/70 ${className}`}
      >
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} flex items-center justify-center ${className}`}
    >
      <img
        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${filename}.svg`}
        alt={symbol}
        width={ICON_SIZE_MAP[size]}
        height={ICON_SIZE_MAP[size]}
        onError={() => setImageError(true)}
        className="object-contain"
      />
    </div>
  );
}
