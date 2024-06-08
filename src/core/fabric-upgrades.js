import { BitPurchasableMechanicState, RebuyableMechanicState } from "./game-mechanics";

class FabricUpgradeState extends BitPurchasableMechanicState {
  get name() {
    return this.config.name;
  }

  get shortDescription() {
    return this.config.shortDescription ? this.config.shortDescription() : "";
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

  get isAvailableForPurchase() {
    return true;
  }
}

class RebuyableFabricUpgradeState extends RebuyableMechanicState {
  constructor(config) {
    delete config.isRebuyable;
    super(config);
  }

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
}

FabricUpgradeState.index = mapGameData(
  GameDatabase.reality.fabricUpgrades,
  config => (config.isRebuyable
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
    return (player.machine.upgradeBits >> 6) + 1 === 1 << (GameDatabase.reality.fabricUpgrades.length - 5);
  }
};
