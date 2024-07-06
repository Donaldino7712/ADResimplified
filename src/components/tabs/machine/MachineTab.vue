<script>
import FabricUpgradeButton from "./FabricUpgradeButton";

export default {
  name: "MachineTab",
  components: {
    FabricUpgradeButton
  },
  data() {
    return {
      realityFabric: new Decimal(0),
      realityFabricPerRealSecond: new Decimal(0)
    };
  },
  computed: {
    upgrades: () => FabricUpgrades.all,
    costScalingTooltip: () => `Prices start increasing faster above ${format(1e30)} RM and then even faster
      above ${format(Decimal.NUMBER_MAX_VALUE, 1)} RM`,
    possibleTooltip: () => `Checkered upgrades are impossible to unlock this Reality. Striped upgrades are
      still possible.`,
    lockTooltip: () => `This will only function if you have not already failed the condition or
      unlocked the upgrade.`,
  },
  methods: {
    update() {
      this.realityFabric.copyFrom(Currency.realityFabric);
      this.realityFabricPerRealSecond.copyFrom(FabricHandler.productionPerRealSecond);
    },
    id(row, column) {
      return (row - 1) * 4 + column - 1;
    }
  }
};
</script>

<template>
  <div class="l-machine-tab">
    <div>
      <div>
        You have
        <span class="c-machine-description__accent">{{ formatPostBreak(realityFabric, 2, 2) }}</span>
        Reality Fabric.
      </div>
      <div>
        You are getting
        {{ formatPostBreak(realityFabricPerRealSecond, 2, 2) }}
        Reality Fabric per second.
      </div>
    </div>
    <br>
    <div
      v-for="row in 4"
      :key="row"
      class="l-fabric-upgrade-grid__row"
    >
      <FabricUpgradeButton
        v-for="column in 4"
        :key="id(row, column)"
        :upgrade="upgrades[id(row, column)]"
      />
    </div>
  </div>
</template>

<style scoped>
.l-fabric-upgrade-grid__row {
  display: flex;
  flex-direction: row;
}
</style>
