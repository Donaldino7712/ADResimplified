import { BitPurchasableMechanicState, RebuyableMechanicState } from "./game-mechanics";

export const FabricHandler = {
  get productionPerSecond() {
    const p = FabricUpgrade(1).boughtAmount;
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
      FabricUpgrade(2)
    );
  },

  get isUnlocked() {
    return Perk.machineUnlock.isBought;
  },

  tick(diff) {
    if (!this.isUnlocked) return;
    Currency.realityFabric.add(this.productionForDiff(diff));
  },

  upgradeTimeEstimate(goal) {
    const RFGain = this.productionPerRealSecond;
    const currentRF = Currency.realityFabric.value;
    if (RFGain.eq(0)) return null;
    return TimeSpan.fromSeconds(Decimal.sub(goal, currentRF)
      .div(RFGain).toNumber()).toTimeEstimate();
  }
};

class FabricUpgradeState extends BitPurchasableMechanicState {
  get name() {
    return this.config.name;
  }

  get currency() {
    return Currency.realityFabric;
  }

  get bitIndex() {
    return this.id;
  }

  get bits() {
    return player.machine.upgradeBits;
  }

  set bits(value) {
    player.machine.upgradeBits = value;
  }

  get isDisabled() {
    return Pelle.isDoomed;
  }

  get isEffectActive() {
    return this.isBought && !this.isDisabled;
  }

  onPurchased() {
    const id = this.id;
    if (id === 13) {
      Glyphs.refreshActive();
    }
  }
}

class RebuyableFabricUpgradeState extends RebuyableMechanicState {
  get currency() {
    return Currency.realityFabric;
  }

  get boughtAmount() {
    return player.machine.rebuyables[this.id - 1];
  }

  set boughtAmount(value) {
    player.machine.rebuyables[this.id - 1] = value;
  }

  get isDisabled() {
    return Pelle.isDoomed;
  }

  get isEffectActive() {
    return this.boughtAmount > 0 && !this.isDisabled;
  }
}

FabricUpgradeState.index = mapGameData(
  GameDatabase.reality.fabricUpgrades,
  config => (config.id <= 3
    ? new RebuyableFabricUpgradeState(config)
    : new FabricUpgradeState(config))
);

/**
 * @param {number} id
 * @return {FabricUpgradeState|RebuyableFabricUpgradeState}
 */
export const FabricUpgrade = id => FabricUpgradeState.index[id];

export const FabricUpgrades = {
  /**
   * @type {(FabricUpgradeState|RebuyableFabricUpgradeState)[]}
   */
  all: FabricUpgradeState.index.compact(),
  get allBought() {
    return (player.machine.upgradeBits >> 4) + 1 === 1 << (GameDatabase.reality.fabricUpgrades.length - 3);
  }
};
