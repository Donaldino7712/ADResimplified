<script>
export default {
  name: "ModernDimensionBoostRow",
  data() {
    return {
      requirement: {
        tier: 1,
        amount: 0
      },
      isBuyable: false,
      purchasedBoosts: 0,
      imaginaryBoosts: 0,
      lockText: null,
      unlockedByBoost: null,
      creditsClosed: false,
      requirementText: null,
      hasTutorial: false,
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    dimName() {
      return AntimatterDimension(this.requirement.tier).shortDisplayName;
    },
    boostCountText() {
      if (this.requirementText) return this.requirementText;
      const parts = [this.purchasedBoosts];
      if (this.imaginaryBoosts !== 0) {
        parts.push(this.imaginaryBoosts);
      }
      const sum = parts.map(formatInt).join(" + ");
      if (parts.length >= 2) {
        return `${sum} = ${formatInt(parts.sum())}`;
      }
      return sum;
    },
    classObject() {
      return {
        "o-primary-btn o-primary-btn--new o-primary-btn--dimension-reset": true,
        "tutorial--glow": this.isBuyable && this.hasTutorial,
        "o-primary-btn--disabled": !this.isBuyable,
        "o-non-clickable o-continuum": this.isContinuum,
        "o-pelle-disabled-pointer": this.creditsClosed
      };
    },
    continuumAmount() {
      // TODO: make this update properly
      return formatFloat(this.continuumBoosts, 3);
    }
  },
  methods: {
    update() {
      const requirement = DimBoost.requirement;
      this.requirement.tier = requirement.tier;
      this.requirement.amount = requirement.amount;
      this.isBuyable = requirement.isSatisfied && DimBoost.canBeBought;
      this.continuumActive = DimBoost.continuumActive;
      this.isContinuum = DimBoost.continuumActive && requirement.tier === DimBoost.maxDimensionsUnlockable;
      this.maxDimension = DimBoost.maxDimensionsUnlockable;
      this.purchasedBoosts = DimBoost.purchasedBoosts;
      this.continuumBoosts = DimBoost.continuumBoosts;
      this.imaginaryBoosts = DimBoost.imaginaryBoosts;
      this.lockText = DimBoost.lockText;
      this.unlockedByBoost = DimBoost.unlockedByBoost;
      this.creditsClosed = GameEnd.creditsEverClosed;
      if (this.isDoomed) this.requirementText = formatInt(this.purchasedBoosts);
      this.hasTutorial = Tutorial.isActive(TUTORIAL_STATE.DIMBOOST);
    },
    dimensionBoost(bulk) {
      if (!DimBoost.requirement.isSatisfied || !DimBoost.canBeBought || this.isContinuum) return;
      manualRequestDimensionBoost(bulk);
    }
  }
};
</script>

<template>
  <div class="reset-container dimboost">
    <h4>Dimension Boost ({{ boostCountText }})</h4>
    <span v-if="!isContinuum || (continuumActive && requirement.tier !== maxDimension)">
      Requires: {{ formatInt(requirement.amount) }} {{ dimName }} Antimatter D
    </span>
    <button
      :class="classObject"
      @click.exact="dimensionBoost(true)"
      @click.shift.exact="dimensionBoost(false)"
    >
      <div
        v-if="isContinuum && requirement.tier === 8"
        class="l-modern-buy-dimboost-text"
      >
        <div>{{ isBuyable || continuumBoosts >= 4 ? "Continuum:" : "Locked" }}</div>
        <div>{{ continuumAmount }}</div>
      </div>
      <span v-else>{{ unlockedByBoost }}</span>
      <div
        v-if="hasTutorial"
        class="fas fa-circle-exclamation l-notification-icon"
      />
    </button>
  </div>
</template>

<style scoped>
.l-modern-buy-dimboost-text {
  display: flex;
  flex-direction: column;
}

.o-non-clickable {
  cursor: auto;
}

.o-continuum {
  border-color: var(--color-laitela--accent);
  color: var(--color-laitela--accent);
  background: var(--color-laitela--base);
  font-size: 1.3rem;
}

.o-continuum:hover {
  border-color: var(--color-laitela--accent);
  color: var(--color-laitela--base);
  background: var(--color-laitela--accent);
}

.o-primary-btn--disabled .o-continuum {
  opacity: 0.5;
}
</style>