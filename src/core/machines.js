import { DC } from "./constants";

export const MachineHandler = {
  get baseRMCap() { return DC.E1000; },

  get hardcapRM() {
    return this.baseRMCap.times(ImaginaryUpgrade(6).effectOrDefault(1));
  },

  get distanceToRMCap() {
    return this.hardcapRM.minus(Currency.realityMachines.value);
  },

  get realityMachineMultiplier() {
    return Decimal.mul(ShopPurchase.RMPurchases.currentMult *
      Teresa.rmMultiplier *
      getAdjustedGlyphEffect("effarigrm") *
      Effects.product(
        Perk.firstPerk,
        PerkShopUpgrade.rmMult,
        Achievement(167)
      ), FabricUpgrade(8).effectOrDefault(1));
  },

  get uncappedRM() {
    const div = 4e3 - Effects.sum(FabricUpgrade(6));
    const log10FinalEP = player.records.thisReality.maxEP.plus(gainedEternityPoints()).log10();
    let rmGain = DC.E3.pow(log10FinalEP / div - 1);
    rmGain = rmGain.times(this.realityMachineMultiplier);
    return rmGain.floor();
  },

  get gainedRealityMachines() {
    return this.uncappedRM.clampMax(this.hardcapRM);
  },

  get isIMUnlocked() {
    return Currency.realityMachines.value.gte(this.hardcapRM) || Currency.imaginaryMachines.gt(0);
  },

  get baseIMCap() {
    return (Math.pow(Math.clampMin(this.uncappedRM.log10() - 1000, 0), 2)) *
      (Math.pow(Math.clampMin(this.uncappedRM.log10() - 100000, 1), 0.2));
  },

  get currentIMCap() {
    return player.reality.iMCap * ImaginaryUpgrade(13).effectOrDefault(1);
  },

  // This is iM cap based on in-game values at that instant, may be lower than the actual cap
  get projectedIMCap() {
    return this.baseIMCap * ImaginaryUpgrade(13).effectOrDefault(1);
  },

  // Use iMCap to store the base cap; applying multipliers separately avoids some design issues the 3xTP upgrade has
  updateIMCap() {
    if (this.uncappedRM.gte(this.baseRMCap)) {
      if (this.baseIMCap > player.reality.iMCap) {
        player.records.bestReality.iMCapSet = Glyphs.copyForRecords(Glyphs.active.filter(g => g !== null));
        player.reality.iMCap = this.baseIMCap;
      }
    }
  },

  // Time in seconds to reduce the missing amount by a factor of two
  get scaleTimeForIM() {
    return 60 / ImaginaryUpgrade(20).effectOrDefault(1);
  },

  gainedImaginaryMachines(diff) {
    return (this.currentIMCap - Currency.imaginaryMachines.value) *
      (1 - Math.pow(2, (-diff / 1000 / this.scaleTimeForIM)));
  },

  estimateIMTimer(cost) {
    const imCap = this.currentIMCap;
    if (imCap <= cost) return Infinity;
    const currentIM = Currency.imaginaryMachines.value;
    // This is doing log(a, 1/2) - log(b, 1/2) where a is % left to imCap of cost and b is % left to imCap of current
    // iM. log(1 - x, 1/2) should be able to estimate the time taken for iM to increase from 0 to imCap * x since every
    // fixed interval the difference between current iM to max iM should decrease by a factor of 1/2.
    return Math.max(0, Math.log2(imCap / (imCap - cost)) - Math.log2(imCap / (imCap - currentIM))) *
      this.scaleTimeForIM;
  }
};
