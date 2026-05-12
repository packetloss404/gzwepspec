import { useEffect, useMemo, useState, type CSSProperties, type ImgHTMLAttributes, type ReactNode } from "react";
import {
  getAssetForArmoryId,
  getGameMediaAsset,
  getLocalAsset,
  type GameMediaAssetKey,
  type GameMediaEntry,
  type LocalAssetCategory,
  type LocalAssetEntry,
  type PartAssetKey,
  type WeaponAssetKey,
} from "../data/assetManifest";

type ManifestAssetLookup =
  | LocalAssetEntry
  | GameMediaEntry
  | { category: "weapon"; id: WeaponAssetKey }
  | { category: "part"; id: PartAssetKey }
  | { category: "game-media"; id: GameMediaAssetKey }
  | { category: LocalAssetCategory; armoryId: string };

export type AssetImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "children"> & {
  asset?: ManifestAssetLookup;
  src?: string;
  fallbackSrc?: string;
  alt: string;
  fallback?: ReactNode;
  fallbackLabel?: string;
};

const fallbackStyle: CSSProperties = {
  alignItems: "center",
  color: "currentColor",
  display: "inline-flex",
  justifyContent: "center",
};

function resolveAsset(asset: ManifestAssetLookup | undefined): LocalAssetEntry | GameMediaEntry | undefined {
  if (!asset) {
    return undefined;
  }

  if ("src" in asset) {
    return asset;
  }

  if ("armoryId" in asset) {
    return getAssetForArmoryId(asset.category, asset.armoryId);
  }

  if (asset.category === "game-media") {
    return getGameMediaAsset(asset.id);
  }

  return getLocalAsset(asset.category, asset.id);
}

function getFallbackText(label: string) {
  const words = label
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "IMG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function AssetImage({
  asset,
  src,
  fallbackSrc,
  alt,
  className,
  fallback,
  fallbackLabel,
  onError,
  onLoad,
  style,
  ...imageProps
}: AssetImageProps) {
  const manifestAsset = useMemo(() => resolveAsset(asset), [asset]);
  const primarySrc = src ?? manifestAsset?.src;
  const initialSrc = primarySrc ?? fallbackSrc;
  const [activeSrc, setActiveSrc] = useState(initialSrc);
  const [failed, setFailed] = useState(!initialSrc);
  const label = fallbackLabel ?? manifestAsset?.label ?? alt;
  const fallbackText = getFallbackText(label);
  const category = manifestAsset?.category ?? asset?.category ?? "unknown";

  useEffect(() => {
    setActiveSrc(initialSrc);
    setFailed(!initialSrc);
  }, [initialSrc]);

  if (!activeSrc || failed) {
    return (
      <span
        aria-label={alt || undefined}
        className={className ? `asset-image-fallback ${className}` : "asset-image-fallback"}
        data-asset-category={category}
        data-asset-status="fallback"
        role={alt ? "img" : undefined}
        style={{ ...fallbackStyle, ...style }}
        title={label}
      >
        {fallback === null ? null : fallback ?? <span className="asset-image-fallback__mark">{fallbackText}</span>}
      </span>
    );
  }

  return (
    <img
      {...imageProps}
      alt={alt}
      className={className ? `asset-image ${className}` : "asset-image"}
      data-asset-category={category}
      data-asset-status="loaded"
      decoding={imageProps.decoding ?? "async"}
      loading={imageProps.loading ?? "lazy"}
      onError={(event) => {
        if (fallbackSrc && activeSrc !== fallbackSrc) {
          setActiveSrc(fallbackSrc);
        } else {
          setFailed(true);
        }
        onError?.(event);
      }}
      onLoad={onLoad}
      src={activeSrc}
      style={style}
    />
  );
}

export default AssetImage;
