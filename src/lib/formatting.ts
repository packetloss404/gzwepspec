import { type Slot, type StatKey } from "../data/armory";

export const statKeys: StatKey[] = ["accuracy", "recoil", "ads", "ergonomics", "weight", "velocity"];

export function formatSigned(value: number) {
  if (value === 0) {
    return "0";
  }

  const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return value > 0 ? `+${normalized}` : normalized;
}

export function formatSlotCode(slot: Slot) {
  return slotCodes[slot];
}

export function formatTag(tag: string) {
  return tagNames[tag] ?? tag.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const slotCodes: Record<Slot, string> = {
  receiver: "RCVR",
  barrel: "BRL",
  handguard: "HND",
  muzzle: "MZL",
  stock: "STK",
  pistolGrip: "GRP",
  magazine: "MAG",
  opticMount: "MNT",
  optic: "OPT",
  foregrip: "FGR",
  tactical: "LGT",
  laser: "LSR",
  underbarrelAdapter: "BOT",
  sideRailAdapter: "RAIL",
};

const tagNames: Record<string, string> = {
  ak: "AK-pattern",
  ak74: "AK-74",
  akm: "AKM",
  ar15: "AR-15",
  bolt_action: "bolt-action",
  buffer_tube: "AR buffer tube",
  carry_handle_channel: "carry-handle optic channel",
  choke: "shotgun choke",
  cylinder_bore: "cylinder-bore shotgun barrel",
  dovetail: "AK side dovetail",
  fixed_mag: "fixed magazine",
  folding_stock: "folding stock",
  gas_carbine: "carbine-length AR gas system",
  gas_midlength: "midlength AR gas system",
  gas_rifle: "rifle-length AR gas system",
  glock: "Glock-pattern",
  lpvo: "LPVO",
  m_lok: "M-LOK",
  m_lok_3: "3 o'clock M-LOK slot",
  m_lok_6: "6 o'clock M-LOK slot",
  m_lok_9: "9 o'clock M-LOK slot",
  nato556: "5.56 NATO chambering",
  nato762: "7.62 NATO chambering",
  nine_mm: "9 mm chambering",
  offset_light_mount: "offset scout light mount",
  pistol_rail: "pistol accessory rail",
  pump12: "12 ga pump platform",
  precision_barrel: "precision barrel",
  precision_rail: "precision rail",
  rm437_plate: "micro-dot slide plate",
  rmr_plate: "RMR slide plate",
  roller9: "roller-delayed 9 mm",
  russian545: "5.45x39 chambering",
  russian762: "7.62x39 chambering",
  short_action: "short-action receiver",
  side_picatinny: "side Picatinny rail",
  sks: "SKS",
  sks_dovetail: "SKS side rail",
  smg: "SMG platform",
  twelve_gauge: "12 gauge chambering",
  threaded_choke: "threaded shotgun choke",
  thread_14x1lh: "14x1 LH muzzle thread",
  thread_1_2x28: "1/2x28 muzzle thread",
  thread_24x1_5: "24x1.5 muzzle thread",
  thread_5_8x24: "5/8x24 muzzle thread",
  thread_pistol_9mm: "threaded 9 mm pistol barrel",
  tri_lug_9mm: "9 mm tri-lug muzzle",
  upper_picatinny: "top Picatinny rail",
  vityaz: "Vityaz-pattern",
};
