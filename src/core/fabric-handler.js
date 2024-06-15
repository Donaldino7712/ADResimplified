export const FabricHandler = {
  get productionPerSecond() {
    const p = FabricUpgrade(4).boughtAmount;
    let base = Decimal.log(Currency.realityMachines.value.clampMin(1), 10 - p);
    if (p >= 9) base = Currency.realityMachines.value.pow(p / 1000 + 0.01);
    return Decimal.mul(base, this.realityFabricMultipliers);
  },

  get productionPerRealSecond() {
    return this.productionPerSecond.times(getGameSpeedupForDisplay());
  },

  productionForDiff(diff) {
    return this.productionPerSecond.times(diff / 1000);
  },

  get realityFabricMultipliers() {
    return Effects.product(
      FabricUpgrade(8)
    );
  },

  get isUnlocked() {
    return Achievement(146).isUnlocked;
  },

  tick(diff) {
    if (!this.isUnlocked) return;
    Currency.realityFabric.add(this.productionForDiff(diff));
  }
};