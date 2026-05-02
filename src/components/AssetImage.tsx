import { useEffect, useMemo, useState, type CSSProperties, type ImgHTMLAttributes, type ReactNode } from "react";
import {
  getAssetForArmoryId,
  getLocalAsset,
  type LocalAssetCategory,
  type LocalAssetEntry,
  type PartAssetKey,
  type WeaponAssetKey,
} from "../data/assetManifest";

type ManifestAssetLookup =
  | LocalAssetEntry
  | { category: "weapon"; id: WeaponAssetKey }
  | { category: "part"; id: PartAssetKey }
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
  background: "rgba(255, 255, 255, 0.08)",
  color: "currentColor",
  display: "inline-flex",
  fontSize: "0.75rem",
  fontWeight: 700,
  justifyContent: "center",
  lineHeight: 1.1,
  minHeight: "2.5rem",
  minWidth: "2.5rem",
  overflow: "hidden",
  textAlign: "center",
};

function resolveAsset(asset: ManifestAssetLookup | undefined): LocalAssetEntry | undefined {
  if (!asset) {
    return undefined;
  }

  if ("src" in asset) {
    return asset;
  }

  if ("armoryId" in asset) {
    return getAssetForArmoryId(asset.category, asset.armoryId);
  }

  return getLocalAsset(asset.category, asset.id);
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
  const [activeSrc, setActiveSrc] = useState(primarySrc);
  const [failed, setFailed] = useState(!primarySrc);

  useEffect(() => {
    setActiveSrc(primarySrc);
    setFailed(!primarySrc);
  }, [primarySrc]);

  if (!activeSrc || failed) {
    return (
      <span
        aria-label={alt || undefined}
        className={className ? `asset-image-fallback ${className}` : "asset-image-fallback"}
        role={alt ? "img" : undefined}
        style={{ ...fallbackStyle, ...style }}
        title={fallbackLabel ?? manifestAsset?.label ?? alt}
      >
        {fallback ?? fallbackLabel ?? manifestAsset?.label ?? alt}
      </span>
    );
  }

  return (
    <img
      {...imageProps}
      alt={alt}
      className={className}
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
