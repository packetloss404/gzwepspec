import { statDirection, statLabels, type Part, type StatKey, type Stats, type WeaponPlatform } from "../data/armory";
import { getSelectedParts, totalStats, type BuildSelections } from "../lib/build";

export type PriceCatalog = Partial<Record<string, number>>;

type Props = {
  platform: WeaponPlatform;
  selections: BuildSelections;
  priceCatalog?: PriceCatalog;
  currency?: string;
  className?: string;
};

const statKeys: StatKey[] = ["accuracy", "recoil", "ads", "ergonomics", "weight", "velocity"];

export function BuildSummary({ platform, selections, priceCatalog = {}, currency = "$", className }: Props) {
  const selectedParts = getSelectedParts(selections);
  const stats = totalStats(platform, selections);
  const vendors = summarizeVendors(platform, selectedParts, priceCatalog);
  const price = summarizePrice(selectedParts, priceCatalog);

  return (
    <section className={["build-summary", className].filter(Boolean).join(" ")} aria-label="Build summary">
      <header className="build-summary__header">
        <div>
          <span>{platform.family}</span>
          <h2>{platform.name}</h2>
        </div>
        <strong>{price.knownCount ? formatCurrency(price.total, currency) : "Price pending"}</strong>
      </header>

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
          <dt>Known prices</dt>
          <dd>
            {price.knownCount}/{selectedParts.length}
          </dd>
        </div>
      </dl>

      <div className="build-summary__stats">
        {statKeys.map((key) => (
          <StatDelta key={key} statKey={key} base={platform.baseStats[key]} value={stats[key]} />
        ))}
      </div>

      <div className="build-summary__vendors" aria-label="Vendor summary">
        {vendors.map((vendor) => (
          <div key={vendor.name}>
            <span>{vendor.name}</span>
            <strong>{vendor.knownPriceCount ? formatCurrency(vendor.price, currency) : `${vendor.partCount} part${vendor.partCount === 1 ? "" : "s"}`}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatDelta({ statKey, base, value }: { statKey: StatKey; base: number; value: number }) {
  const delta = value - base;
  const improved = statDirection[statKey] === "higher" ? delta >= 0 : delta <= 0;

  return (
    <div className="build-summary__stat">
      <span>{statLabels[statKey]}</span>
      <strong>{formatStat(value, statKey)}</strong>
      <em data-tone={improved ? "good" : "bad"}>{signed(delta)}</em>
    </div>
  );
}

function summarizeVendors(platform: WeaponPlatform, selectedParts: Part[], priceCatalog: PriceCatalog) {
  const vendorMap = new Map<string, { name: string; partCount: number; price: number; knownPriceCount: number }>();
  vendorMap.set(platform.vendor, { name: platform.vendor, partCount: 0, price: 0, knownPriceCount: 0 });

  for (const part of selectedParts) {
    const current = vendorMap.get(part.vendor) ?? { name: part.vendor, partCount: 0, price: 0, knownPriceCount: 0 };
    const price = priceCatalog[part.id];
    current.partCount += 1;
    current.price += price ?? 0;
    current.knownPriceCount += price === undefined ? 0 : 1;
    vendorMap.set(part.vendor, current);
  }

  return Array.from(vendorMap.values()).sort((a, b) => b.partCount - a.partCount || a.name.localeCompare(b.name));
}

function summarizePrice(selectedParts: Part[], priceCatalog: PriceCatalog) {
  return selectedParts.reduce(
    (summary, part) => {
      const price = priceCatalog[part.id];
      return {
        total: summary.total + (price ?? 0),
        knownCount: summary.knownCount + (price === undefined ? 0 : 1),
      };
    },
    { total: 0, knownCount: 0 },
  );
}

function formatStat(value: number, statKey: StatKey) {
  return statKey === "weight" ? value.toFixed(2) : Math.round(value).toString();
}

function signed(value: number) {
  if (value === 0) {
    return "0";
  }

  const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return value > 0 ? `+${normalized}` : normalized;
}

function formatCurrency(value: number, currency: string) {
  return `${currency}${Math.round(value).toLocaleString()}`;
}
