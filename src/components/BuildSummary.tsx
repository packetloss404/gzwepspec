import { slotLabels, slotOrder, statDirection, statLabels, type Part, type StatKey, type WeaponPlatform } from "../data/armory";
import { getSelectedParts, totalStats, type BuildSelections } from "../lib/build";
import { formatSigned, statKeys } from "../lib/formatting";

export type PriceCatalog = Partial<Record<string, number>>;

type Props = {
  platform: WeaponPlatform;
  selections: BuildSelections;
  priceCatalog?: PriceCatalog;
  currency?: string;
  className?: string;
};

export function BuildSummary({ platform, selections, priceCatalog = {}, currency = "$", className }: Props) {
  const selectedParts = getSelectedParts(selections);
  const stats = totalStats(platform, selections);
  const vendors = summarizeVendors(platform, selectedParts, priceCatalog);
  const price = summarizePrice(selectedParts, priceCatalog, platform);
  const slots = summarizeSlots(platform, selections);
  const deltas = statKeys.map((key) => ({ key, delta: stats[key] - platform.baseStats[key] }));
  const primaryWin = [...deltas].sort((a, b) => statScore(b.key, b.delta) - statScore(a.key, a.delta))[0];
  const primaryTradeoff = [...deltas].sort((a, b) => statScore(a.key, a.delta) - statScore(b.key, b.delta))[0];

  return (
    <section className={["build-summary", className].filter(Boolean).join(" ")} aria-label="Build summary">
      <header className="build-summary__header">
        <div>
          <span>{platform.family}</span>
          <h2>{platform.name}</h2>
        </div>
        <strong>{price.knownCount ? formatCurrency(price.total, currency) : "No price data"}</strong>
      </header>

      <div className="build-summary__status" data-complete={slots.ready}>
        <span>{slots.ready ? "Workbench ready" : `${slots.missingRequired.length} required slot${slots.missingRequired.length === 1 ? "" : "s"} open`}</span>
        <strong>{slots.filled}/{slots.total} mounted</strong>
      </div>

      <dl className="build-summary__facts">
        <div>
          <dt>Caliber</dt>
          <dd>{platform.caliber}</dd>
        </div>
        <div>
          <dt>Parts</dt>
          <dd>{selectedParts.length}</dd>
        </div>
        <div>
          <dt>Priced items</dt>
          <dd>
            {price.knownCount}/{selectedParts.length + 1}
          </dd>
        </div>
      </dl>

      <div className="build-summary__scorecards" aria-label="Build highlights">
        <SummaryCard label="Best gain" statKey={primaryWin.key} delta={primaryWin.delta} />
        <SummaryCard label="Tradeoff" statKey={primaryTradeoff.key} delta={primaryTradeoff.delta} />
        <div>
          <span>Required</span>
          <strong>{slots.ready ? "Complete" : slots.missingRequired.map((slot) => slotLabels[slot]).join(", ")}</strong>
        </div>
      </div>

      <div className="build-summary__stats">
        {statKeys.map((key) => (
          <StatDelta key={key} statKey={key} base={platform.baseStats[key]} value={stats[key]} />
        ))}
      </div>

      <div className="build-summary__vendors" aria-label="Vendor summary">
        {vendors.map((vendor) => (
          <div key={vendor.name}>
            <span>{vendor.name}</span>
            <strong>{vendor.knownPriceCount ? formatCurrency(vendor.price, currency) : formatItemCount(vendor.itemCount)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ label, statKey, delta }: { label: string; statKey: StatKey; delta: number }) {
  const improved = isImproved(statKey, delta);

  return (
    <div>
      <span>{label}</span>
      <strong data-tone={improved ? "good" : "bad"}>
        {statLabels[statKey]} {formatSigned(delta)}
      </strong>
    </div>
  );
}

function StatDelta({ statKey, base, value }: { statKey: StatKey; base: number; value: number }) {
  const delta = value - base;
  const improved = isImproved(statKey, delta);
  const max = statKey === "weight" ? 8 : statKey === "ads" ? 520 : statKey === "velocity" ? 950 : 100;
  const position = Math.max(4, Math.min(100, (value / max) * 100));

  return (
    <div className="build-summary__stat">
      <span>
        {statLabels[statKey]}
        <em data-tone={improved ? "good" : "bad"}>{formatSigned(delta)}</em>
      </span>
      <strong>{formatStat(value, statKey)}</strong>
      <i aria-hidden="true">
        <b style={{ width: `${position}%` }} />
      </i>
    </div>
  );
}

function summarizeSlots(platform: WeaponPlatform, selections: BuildSelections) {
  const relevantSlots = slotOrder.filter((slot) => platform.requiredSlots.includes(slot) || platform.optionalSlots.includes(slot));
  const missingRequired = platform.requiredSlots.filter((slot) => !selections[slot]);

  return {
    filled: relevantSlots.filter((slot) => Boolean(selections[slot])).length,
    total: relevantSlots.length,
    missingRequired,
    ready: missingRequired.length === 0,
  };
}

function statScore(statKey: StatKey, delta: number) {
  const normalized = statKey === "weight" ? delta * 10 : statKey === "ads" ? delta / 5 : statKey === "velocity" ? delta / 8 : delta;
  return statDirection[statKey] === "higher" ? normalized : -normalized;
}

function isImproved(statKey: StatKey, delta: number) {
  return statDirection[statKey] === "higher" ? delta >= 0 : delta <= 0;
}

function summarizeVendors(platform: WeaponPlatform, selectedParts: Part[], priceCatalog: PriceCatalog) {
  const vendorMap = new Map<string, { name: string; itemCount: number; price: number; knownPriceCount: number }>();
  const platformVendor = formatVendorUnlock(platform.vendor, platform.unlock);
  const platformPrice = itemPrice(platform, priceCatalog);
  vendorMap.set(platformVendor, {
    name: platformVendor,
    itemCount: 1,
    price: platformPrice ?? 0,
    knownPriceCount: platformPrice === undefined ? 0 : 1,
  });

  for (const part of selectedParts) {
    const vendor = formatVendorUnlock(part.vendor, part.unlock);
    const current = vendorMap.get(vendor) ?? { name: vendor, itemCount: 0, price: 0, knownPriceCount: 0 };
    const price = itemPrice(part, priceCatalog);
    current.itemCount += 1;
    current.price += price ?? 0;
    current.knownPriceCount += price === undefined ? 0 : 1;
    vendorMap.set(vendor, current);
  }

  return Array.from(vendorMap.values()).sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name));
}

function summarizePrice(selectedParts: Part[], priceCatalog: PriceCatalog, platform?: WeaponPlatform) {
  const items = platform ? [platform, ...selectedParts] : selectedParts;

  return items.reduce(
    (summary, part) => {
      const price = itemPrice(part, priceCatalog);
      return {
        total: summary.total + (price ?? 0),
        knownCount: summary.knownCount + (price === undefined ? 0 : 1),
      };
    },
    { total: 0, knownCount: 0 },
  );
}

function itemPrice(item: Part | WeaponPlatform, priceCatalog: PriceCatalog): number | undefined {
  return item.price?.amount ?? priceCatalog[item.id];
}

function formatVendorUnlock(vendor: string, unlock?: { vendor: string; level: number }) {
  if (unlock) {
    return `${unlock.vendor} LL${unlock.level}`;
  }

  return vendor;
}

function formatItemCount(count: number) {
  return `${count} item${count === 1 ? "" : "s"}`;
}

function formatStat(value: number, statKey: StatKey) {
  return statKey === "weight" ? value.toFixed(2) : Math.round(value).toString();
}

function formatCurrency(value: number, currency: string) {
  return `${currency}${Math.round(value).toLocaleString()}`;
}
