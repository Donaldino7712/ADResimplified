import { DC } from "../../constants";

const rebuyable = props => {
  props.cost = () => getHybridCostScaling(
    player.machine.rebuyables[props.id],
    1e30,
    props.initialCost,
    props.costMult,
    props.costMult / 10,
    DC.E309,
    1e3,
    props.initialCost * props.costMult
  );
  if (!props.maxUpgrades) props.maxUpgrades = Infinity;
  props.isRebuyable = true;
  const { effect } = props;
  if (props.effect) props.effect = purchases => effect(purchases ?? player.machine.rebuyables[props.id]);
  if (!props.formatCost) props.formatCost = value => format(value, 2, 0);
  return props;
};

export const fabricUpgrades = [
  {
    name: "Infinite Improvement (WIP)",
    id: 1,
    cost: 15,
    description: "Reality Fabric improves the Infinity Pount formula",
    effect: () => {
      let eff = Currency.realityFabric.value.pow(0.2);
      if (eff.gt(50)) eff = DC.E1.mul(5).add(eff.sub(50).pow(0.2));
      return eff;
    },
    formatEffect: value => `-${format(value, 2, 2)}`,
    cap: 85
  },
  {
    name: "Eternal Enhancement (WIP)",
    id: 2,
    cost: 15,
    description: "Reality Fabric improves the Eternity Point formula",
    effect: () => 1 + player.galaxies / 30,
    formatEffect: value => formatX(value, 2, 2)
  },
  {
    name: "Multiplicative Machines (NIY)",
    id: 3,
    cost: 15,
    description: "Reality Fabric improves the Reality Machines formula",
    effect: () => Currency.realityFabric.value.div(Currency.realityFabric.value.ln()).sqrt(),
    formatEffect: value => formatX(value, 2, 2)
  },
  rebuyable({
    name: "Realistic Refinement",
    id: 4,
    initialCost: 10,
    costMult: 100,
    maxUpgrades: 40,
    description: "Improve the Reality Fabric formula",
    effect: purchases => Math.max(10 - purchases / 5, 1),
    formatEffect: value => `log${format(value, 1, 1)}(x)`
  }),
  {
    name: "Dilated Space (NIY)",
    id: 5,
    cost: 15,
    description: "Gain a power to Dilated Time gain based on Reality Fabric",
    effect: () => 1,
    formatEffect: value => formatPow(value, 2, 2)
  },
  {
    name: "Mechanical Reality (NIY)",
    id: 6,
    cost: 15,
    description: "Gain a multiplier to Reality Machines based on Reality Fabric",
    effect: () => Currency.realityFabric.value.ln(),
    formatEffect: value => formatX(value, 2, 2)
  },
  {
    name: "Tachyonic Time (NIY)",
    id: 7,
    cost: 50,
    description: "Decrease the Tachyon Galaxy threshold based on Reality Fabric",
    effect: () => gainedInfinities().times(0.1),
    formatEffect: value => `${format(value)} per second`
  },
  rebuyable({
    name: "Futuristic Fabric",
    id: 8,
    initialCost: 100,
    costMult: 1e3,
    description: () => `Multiply Reality Fabric gain by ${formatX(3)}`,
    effect: purchases => 3 ** purchases,
    formatEffect: value => formatX(value, 2, 0)
  }),
  {
    name: "Compounded Conversion (NIY)",
    id: 9,
    cost: 50,
    description: "Reality Fabric improves Infinity Power conversion",
    effect: () => Currency.timeTheorems.value
      .minus(DC.E3).clampMin(2)
      .pow(Math.log2(Math.min(Currency.realities.value, 1e4))).clampMin(1),
    formatEffect: value => `+${format(value, 2, 2)}`
  },
  {
    name: "Generated Glyphs",
    id: 10,
    cost: 50,
    description: "Reality Fabric boosts Glyph Level",
    effect: () => Currency.realityFabric.value.sqrt().add(3),
    formatEffect: value => `+${format(value, 0, 2)}`
  },
  {
    name: "Recreated Rarities (WIP)",
    id: 11,
    cost: 50,
    description: "Reality Fabric increases Glyph rarity",
    effect: () => {
      let v = Currency.realityFabric.value.ln() / 10;
      if (v >= 25) v = 25 + Currency.realityFabric.value.cbrt();
      return v;
    },
    formatEffect: value => `+${format(value, 2, 2)}`
  },
  rebuyable({
    name: "Speed Surge (NIY)",
    id: 12,
    initialCost: 1,
    costMult: 1e3,
    description: "Gain a multiplier to game speed",
    effect: purchases => (1 + Currency.realityFabric.value.log10() / 1000) ** purchases,
    formatEffect: value => formatX(value, 2, 2)
  })
];
