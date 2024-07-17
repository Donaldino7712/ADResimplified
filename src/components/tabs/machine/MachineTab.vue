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
  },
  methods: {
    update() {
      this.realityFabric.copyFrom(Currency.realityFabric);
      this.realityFabricPerRealSecond.copyFrom(FabricHandler.productionPerRealSecond);
    },
    id(row, column) {
      return (row - 1) * 3 + column - 1;
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
      v-for="row in 5"
      :key="row"
      class="l-fabric-upgrade-grid__row"
    >
      <FabricUpgradeButton
        v-for="column in 3"
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
