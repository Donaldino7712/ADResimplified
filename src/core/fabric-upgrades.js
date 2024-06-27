import { BitPurchasableMechanicState, RebuyableMechanicState } from "./game-mechanics";

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
}

class RebuyableFabricUpgradeState extends RebuyableMechanicState {
  get currency() {
    return Currency.realityFabric;
  }

  get boughtAmount() {
    return player.machine.rebuyables[this.id];
  }

  set boughtAmount(value) {
    player.machine.rebuyables[this.id] = value;
  }

  get isCapped() {
    return this.boughtAmount === this.config.maxUpgrades;
  }

  get isDisabled() {
    return Pelle.isDoomed;
  }

  get isEffectActive() {
    return this.isBought && !this.isDisabled;
  }
}

FabricUpgradeState.index = mapGameData(
  GameDatabase.reality.fabricUpgrades,
  config => (config.id % 4 === 0
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
    // I am too stupid to write an actual formula, this works though
    return player.machine.upgradeBits === 61166;
  }
};
