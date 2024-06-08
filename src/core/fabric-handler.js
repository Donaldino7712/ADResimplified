export const FabricHandler = {
  get productionPerSecond() {
    return Decimal.mul(
      Decimal.log(Currency.realityMachines.value.clampMin(1), FabricUpgrade(4).effectValue),
      this.realityFabricMultipliers
    );
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
  }
};