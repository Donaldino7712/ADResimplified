import { DC } from "../../constants";

export const infinityChallenges = [
  {
    id: 1,
    description: `all Normal Challenge restrictions are active at once, with the exception of the
      Big Crunch (C8) Challenge.`,
    goal: DC.E650,
    isQuickResettable: false,
    reward: {
      description: () => `${formatX(1.3, 1, 1)} on all Infinity Dimensions for each Infinity Challenge completed`,
      effect: () => Math.pow(1.3, InfinityChallenges.completed.length),
      formatEffect: value => formatX(value, 1, 1)
    },
    unlockAM: DC.E2000,
  },
  {
    id: 2,
    description: () => `Dimensional Sacrifice happens automatically every ${formatInt(400)} milliseconds once you have
      an 8th Antimatter Dimension.`,
    goal: DC.E10500,
    isQuickResettable: false,
    reward: {
      description: () => `Dimensional Sacrifice autobuyer and stronger Dimensional Sacrifice
        ${Sacrifice.getSacrificeDescription({ "InfinityChallenge2isCompleted": false })} ➜
        ${Sacrifice.getSacrificeDescription({ "InfinityChallenge2isCompleted": true })}`,
    },
    unlockAM: DC.E11000,
  },
  {
    id: 3,
    description: () =>
      `Tickspeed upgrades are always ${formatX(1)}. For every Tickspeed upgrade you have, you instead get a static
      multiplier on all Antimatter Dimensions which increases based on Antimatter Galaxies.`,
    goal: DC.E5000,
    isQuickResettable: false,
    effect: () => Decimal.pow(1.05 + (player.galaxies * 0.005), Math.floor(Tickspeed.continuumValue)),
    formatEffect: value => formatX(value, 2, 2),
    reward: {
      description: `Antimatter Dimension multiplier based on Antimatter Galaxies and Tickspeed amount`,
      effect: () => Decimal.pow(1.05 + (player.galaxies * 0.005), Math.floor(Tickspeed.continuumValue)),
      formatEffect: value => formatX(value, 2, 2),
    },
    unlockAM: DC.E12000,
  },
  {
    id: 4,
    description: () =>
      `all Antimatter Dimensions produce less (${formatPow(0.15, 2, 2)}). To compensate, Sacrifice
      is based on the product of all your dimensions and it applies to all Antimatter Dimensions
      with reduced power (${formatPow(0.5, 1, 1)}).`,
    goal: DC.E7500,
    isQuickResettable: false,
    effect: 0.15,
    reward: {
      description: () => `All Antimatter Dimension multipliers become multiplier${formatPow(1.05, 2, 2)}`,
      effect: 1.05
    },
    unlockAM: DC.E14000,
  },
  {
    id: 5,
    description:
      `Dimension Boost prices are increased based on Antimatter Galaxy amount and vice versa.`,
    goal: DC.E14000,
    isQuickResettable: true,
    effects: {
      // We have to negate the amount because it acts as a discount
      dimBoost: () => -player.galaxies,
      galaxy: () => DimBoost.totalBoosts
    },
    reward: {
      description: () =>
        `All Galaxies are ${formatPercents(0.1)} stronger and reduce the requirements for them
        and Dimension Boosts by ${formatInt(1)}`,
      effect: 1.1
    },
    unlockAM: DC.E18000,
  },
  {
    id: 6,
    description: () =>
      `exponentially rising matter divides the multiplier on all of your Antimatter Dimensions
      once you have at least ${formatInt(1)} 2nd Antimatter Dimension.`,
    goal: DC.D2E22222,
    isQuickResettable: true,
    effect: () => Currency.matter.value.clampMin(1),
    formatEffect: value => `/${format(value, 1, 2)}`,
    reward: {
      description: "Infinity Dimension multiplier based on tickspeed",
      effect: () => Tickspeed.perSecond.pow(0.0005),
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E27000,
  },
  {
    id: 7,
    description: () => {
      // Copied from DimBoost.power; this is the base amount before any multipliers. Post-eternity this isn't
      // necessarily 3.5x by the time the player sees this challenge; it's probably most accurate to say what it
      // currently is, and this phrasing avoids 10x ➜ 10x with the old description.
      const mult = Effects.max(
        2.5,
        InfinityUpgrade.dimboostMult,
        InfinityChallenge(7).reward,
        TimeStudy(81)
      );
      return `you cannot buy Antimatter Galaxies. Base Dimension Boost multiplier is increased to a maximum
        of ${formatX(10)}. (Current base multiplier: ${formatX(mult, 2, 1)})`;
    },
    goal: DC.E10000,
    isQuickResettable: false,
    effect: 10,
    reward: {
      description: () => `Dimension Boost multiplier is increased to a minimum of ${formatX(6)}`,
      effect: 6
    },
    unlockAM: DC.E30000,
  },
  {
    id: 8,
    description: () => `AD production rapidly and continually drops over time.`,
    goal: DC.E30000,
    isQuickResettable: false,
    effect: () => DC.D0_8446303389034288.pow(Math.max(player.records.thisInfinity.time, 0)),
    reward: {
      description:
        "You get a multiplier to AD 2-7 based on 1st and 8th AD multipliers.",
      effect: () => AntimatterDimension(1).multiplier.times(AntimatterDimension(8).multiplier).pow(0.02),
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E45000,
  },
];
