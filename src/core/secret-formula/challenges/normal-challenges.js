import { DC } from "../../constants";

// I tried to make it relatively simple to add more locks; the idea is that you give it a value here
// and then it's all handled in the backend
// If you need to lock a challenge, set lockedAt to a new Decimal variable reflective of a desired number of Infinities
// They will always be unlocked post-eternity

export const normalChallenges = [
  {
    id: 1,
    isQuickResettable: false,
    description() {
      return PlayerProgress.eternityUnlocked()
        ? "reach Infinity for the first time outside of a challenge."
        : "reach Infinity for the first time.";
    },
    name: "1st Antimatter",
    reward: "Antimatter Dimensions multiplier based on amount of normal challenges completed.",
    effect: () => 2 ** NormalChallenges.all.countWhere(x => x.isCompleted),
    formatEffect: value => formatX(value),
    lockedAt: DC.D0,
  },
  {
    id: 2,
    isQuickResettable: false,
    description:
    `the 1st Antimatter Dimension is heavily weakened, but gets an uncapped exponentially increasing multiplier.
    This multiplier resets after Dimension Boosts and Antimatter Galaxies.`,
    name: "2nd Antimatter",
    reward: "Multiplier to the 1st Antimatter Dimension equal to milliseconds spent in this infinity.",
    effect: () => Time.thisInfinity.totalMilliseconds,
    formatEffect: value => formatX(value, 2),
    lockedAt: DC.D0,
  },
  {
    id: 3,
    isQuickResettable: false,
    description:
      () => `the Tickspeed purchase multiplier starts at ${formatX(1.080, 0, 3)} instead of ${formatX(1.1245, 0, 3)}.`,
    name: "3rd Antimatter",
    get reward() { return `Galaxies are ${formatPercents(0.1)} stronger.`; },
    effect: 1.1,
    lockedAt: DC.D0,
  },
  {
    id: 4,
    isQuickResettable: false,
    description: () => `upgrading each Antimatter Dimension costs the Antimatter Dimension ${formatInt(2)} tiers ` +
      "below it instead of antimatter. Antimatter Dimension prices are modified.",
    name: "4th Antimatter",
    reward: "Gain free Tickspeed upgrades based on Antimatter amount.",
    effect: () => Currency.antimatter.value.log10() ** 0.5,
    formatEffect: value => `+${format(value, 2, 2)}`,
    cap: 20,
    lockedAt: DC.D0,
  },
  {
    id: 5,
    isQuickResettable: false,
    description: () =>
      `the multiplier from buying ${formatInt(10)} Antimatter Dimensions is reduced to ${formatX(1)}. This increases by
        ${formatX(0.2, 1, 1)} per Dimension Boost, to a maximum of ${formatX(2)}, and is unaffected by any upgrades.`,
    name: "5th Antimatter",
    reward: "Increase the multiplier for buying 10 Antimatter Dimensions based on total Dimension Boosts.",
    effect: () => Math.max(Math.log10(DimBoost.totalBoosts), 1),
    formatEffect: value => formatX(value, 2, 2),
    cap: 3,
    lockedAt: DC.D0,
  },
  {
    id: 6,
    isQuickResettable: false,
    description: `Dimension Boosts provide no multiplier and Antimatter Galaxies cannot be bought. Dimensional
      Sacrifice resets antimatter and all Antimatter Dimensions, but also gives a significantly stronger multiplier.`,
    name: "Automated Dimension Boosts",
    reward: "Dimension Boosts Autobuyer",
    lockedAt: DC.E1,
  },
  {
    id: 7,
    isQuickResettable: false,
    description: () => `there are only ${formatInt(6)} Antimatter Dimensions. Dimension Boost ` +
      "and Antimatter Galaxy costs are modified.",
    name: "Automated Antimatter Galaxies",
    reward: "Antimatter Galaxies Autobuyer",
    lockedAt: DC.E1,
  },
  {
    id: 8,
    isQuickResettable: false,
    description: () => `each Antimatter Dimension produces the Dimension ${formatInt(2)} tiers below it
      instead of ${formatInt(1)}. Both 1st and 2nd Dimensions produce antimatter.
      The 2nd, 4th, and 6th Dimensions are made stronger to compensate.`,
    name: "Automated Big Crunches",
    reward: "Big Crunches Autobuyer",
    lockedAt: DC.E1,
  }
];
