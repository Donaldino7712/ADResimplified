const formatCost = c => format(c, 2);
// eslint-disable-next-line max-params
const expWithIncreasedScale = (base1, base2, incScale, coeff, x) =>
  Decimal.pow(base1, x).times(Decimal.pow(base2, x - incScale).max(1)).times(coeff);

const rebuyable = config => {
  const { id, description, cost, effect, formatEffect, cap } = config;
  return {
    id,
    description,
    cost: () => expWithIncreasedScale(...cost, player.celestials.pelle.rebuyables[id]),
    formatCost,
    cap,
    effect: (x = player.celestials.pelle.rebuyables[id]) => effect(x),
    formatEffect,
    rebuyable: true
  };
};

export const pelleUpgrades = {
  antimatterDimensionMult: rebuyable({
    id: "antimatterDimensionMult",
    description: "Gain a multiplier to Antimatter Dimensions",
    cost: [10, 1e3, 41, 100],
    effect: x => Pelle.antimatterDimensionMult(x),
    formatEffect: x => formatX(x, 2, 2),
    cap: 44
  }),
  timeSpeedMult: rebuyable({
    id: "timeSpeedMult",
    description: "Gain a multiplier to game speed",
    cost: [20, 1e3, 30, 1e5],
    effect: x => Decimal.pow(1.7, x),
    formatEffect: x => formatX(x, 2, 2),
    cap: 35
  }),
  glyphLevels: rebuyable({
    id: "glyphLevels",
    description: "Increase the Glyph level allowed in Pelle",
    cost: [30, 1e3, 25, 1e15],
    effect: x => Math.floor(((3 * (x + 1)) - 2) ** 1.6),
    formatEffect: x => formatInt(x),
    cap: 26
  }),
  infConversion: rebuyable({
    id: "infConversion",
    description: "Increase Infinity Power conversion rate",
    cost: [40, 1e3, 20, 1e18],
    effect: x => (x * 4.7) ** 0.44,
    formatEffect: x => `+${format(x, 2, 2)}`,
    cap: 21
  }),
  galaxyPower: rebuyable({
    id: "galaxyPower",
    description: "Multiply Galaxy power",
    cost: [1000, 1e3, 10, 1e30],
    effect: x => 1 + x / 25,
    formatEffect: x => formatX(x, 2, 2),
    cap: 9
  }),
  dimBoostAutobuyer: {
    id: 0,
    description: "Get a permanent Autobuyer for Dimension Boosts",
    cost: 5e4,
    formatCost,
  },
  galaxyAutobuyer: {
    id: 1,
    description: "Get a permanent Autobuyer for Antimatter Galaxies",
    cost: 5e5,
    formatCost,
  },
  keepAutobuyers: {
    id: 2,
    description: "Autobuyer upgrades no longer reset on Armageddon",
    cost: 5e6,
    formatCost,
  },
  keepInfinityUpgrades: {
    id: 3,
    description: "Infinity Upgrades no longer reset on Armageddon",
    cost: 1e10,
    formatCost,
  },
  dimBoostResetsNothing: {
    id: 4,
    description: "Dimension Boosts no longer reset anything",
    cost: 1e11,
    formatCost,
  },
  keepBreakInfinityUpgrades: {
    id: 5,
    description: "Break Infinity Upgrades no longer reset on Armageddon",
    cost: 1e12,
    formatCost,
  },
  IDAutobuyers: {
    id: 6,
    description: "Get permanent Autobuyers for Infinity Dimensions",
    cost: 1e14,
    formatCost,
  },
  keepInfinityChallenges: {
    id: 7,
    description: "Infinity Challenge unlocks and completions no longer reset on Armageddon",
    cost: 1e15,
    formatCost,
  },
  galaxyNoResetDimboost: {
    id: 8,
    description: "Galaxies no longer reset Dimension Boosts",
    cost: 1e16,
    formatCost
  },
  replicantiAutobuyers: {
    id: 9,
    description: "Get permanent Autobuyers for Replicanti Upgrades",
    cost: 1e17,
    formatCost,
  },
  replicantiGalaxyNoReset: {
    id: 10,
    description: "Replicanti Galaxies no longer reset on Infinity",
    cost: 1e19,
    formatCost,
  },
  eternitiesNoReset: {
    id: 11,
    description: "Eternities no longer reset on Armageddon",
    cost: 1e20,
    formatCost,
  },
  timeStudiesNoReset: {
    id: 12,
    description: "Time Studies and Theorems no longer reset on Armageddon",
    cost: 1e21,
    formatCost,
  },
  passiveIpGain: {
    id: 13,
    description: () => `Gain ${formatPercents(0.01)} of your Infinity Points gained on crunch each second`,
    cost: 5e21,
    formatCost,
    effect: 0.01,
  },
  replicantiStayUnlocked: {
    id: 14,
    description: "Replicanti is permanently unlocked",
    cost: 1e22,
    formatCost,
  },
  keepEternityUpgrades: {
    id: 15,
    description: "Eternity Upgrades no longer reset on Armageddon",
    cost: 1e24,
    formatCost,
  },
  TDAutobuyers: {
    id: 16,
    description: "Get permanent Autobuyers for Time Dimensions",
    cost: 1e25,
    formatCost,
  },
  keepEternityChallenges: {
    id: 17,
    description: "Eternity Challenge completions no longer reset on Armageddon",
    cost: 1e26,
    formatCost,
  },
  dilationUpgradesNoReset: {
    id: 18,
    description: "Dilation Upgrades no longer reset on Armageddon",
    cost: 1e45,
    formatCost,
  },
  tachyonParticlesNoReset: {
    id: 19,
    description: "Tachyon Particles no longer reset on Armageddon",
    cost: 1e50,
    formatCost,
  },
  replicantiGalaxyEM40: {
    id: 20,
    description: "Replicanti Galaxies no longer reset anything they normally reset",
    cost: 1e30,
    formatCost,
  }
};
