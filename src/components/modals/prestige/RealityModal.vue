<script>
import GlyphComponent from "@/components/GlyphComponent";
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";
import PrimaryButton from "@/components/PrimaryButton";

export default {
  name: "RealityModal",
  components: {
    PrimaryButton,
    ModalWrapperChoice,
    GlyphComponent,
  },
  data() {
    return {
      firstReality: false,
      hasSpace: true,
      hasFilter: false,
      glyphs: [],
      bestLevel: 0,
      levelDifference: 0,
      selectedGlyph: undefined,
      canRefresh: false,
      level: 0,
      simRealities: 0,
      realityMachines: new Decimal(),
      shardsGained: 0,
      effarigUnlocked: false,
      willAutoPurge: false,
      gainedRealities: 0,
    };
  },
  computed: {
    firstRealityText() {
      return `Reality will reset everything except Challenge records and anything under the General header on the
        Statistics tab. The first ${formatInt(13)} rows of Achievements are also reset,
        but you will automatically get one Achievement back every
        ${timeDisplayNoDecimals(30 * 60000)}. You will also gain Reality Machines based on your Eternity Points,
        a Perk Point to spend on quality of life upgrades, and unlock various upgrades.`;
    },
    canSacrifice() {
      return RealityUpgrade(19).isEffectActive;
    },
    warnText() {
      if (this.hasFilter && this.selectedGlyph === undefined) {
        return `If you do not choose a Glyph, one will be automatically selected using your Glyph filter.`;
      }
      return this.selectedGlyph === undefined
        ? `You must select a Glyph in order to continue.`
        : null;
    },
    gained() {
      const gainedResources = [];
      gainedResources.push(`${quantifyInt("Reality", this.gainedRealities)}`);
      gainedResources.push(`${quantifyInt("Perk Point", this.gainedRealities)}`);
      gainedResources.push(`${quantify("Reality Machine", this.realityMachines, 2)}`);
      if (this.effarigUnlocked) {
        gainedResources.push(`${quantify("Relic Shard", this.shardsGained, 2)}`);
      }
      return `You will gain ${makeEnumeration(gainedResources)}`;
    },
    levelStats() {
      // Bit annoying to read due to needing >, <, and =, with = needing a different format.
      return `You will get a level ${formatInt(this.level)} Glyph on Reality, which is
        ${this.level === this.bestLevel ? "equal to" : `
        ${quantifyInt("level", this.levelDifference)}
        ${this.level > this.bestLevel ? "higher" : "lower"} than`} your best.`;
    },
    confirmationToDisable() {
      return ConfirmationTypes.glyphSelection.isUnlocked() ? "glyphSelection" : undefined;
    },
    canConfirm() {
      return this.selectedGlyph !== undefined || this.hasFilter;
    }
  },
  created() {
    this.getGlyphs();
    GlyphSelection.realityProps = getRealityProps(false, false);
  },
  methods: {
    update() {
      this.firstReality = player.realities === 0;
      this.effarigUnlocked = TeresaUnlocks.effarig.canBeApplied;
      this.hasFilter = EffarigUnlock.glyphFilter.isUnlocked;
      this.level = gainedGlyphLevel().actualLevel;
      this.simRealities = 1 + simulatedRealityCount(false);
      this.gainedRealities = this.simRealities * realityAndPPMultiplier();
      this.hasSpace = GameCache.glyphInventorySpace.value >= this.simRealities;
      const simRMGained = MachineHandler.gainedRealityMachines.times(this.simRealities);
      this.realityMachines.copyFrom(simRMGained.clampMax(MachineHandler.distanceToRMCap));
      this.shardsGained = Effarig.shardsGained * (simulatedRealityCount(false) + 1);
      this.willAutoPurge = player.reality.autoAutoClean;
      for (let i = 0; i < this.glyphs.length; ++i) {
        const currentGlyph = this.glyphs[i];
        const newGlyph = GlyphSelection.glyphList(gainedGlyphLevel())[i];
        if (currentGlyph.level === newGlyph.level) continue;
        currentGlyph.level = newGlyph.level;
        currentGlyph.effects = newGlyph.effects;
      }
      this.bestLevel = player.records.bestReality.glyphLevel;
      this.levelDifference = Math.abs(this.bestLevel - this.level);
    },
    glyphClass(index) {
      return {
        "l-modal-glyph-selection__glyph": true,
        "l-modal-glyph-selection__glyph--selected": this.selectedGlyph === index,
      };
    },
    getGlyphs() {
      this.canRefresh = true;
      this.glyphs = GlyphSelection.upcomingGlyphs;
    },
    select(index) {
      this.selectedGlyph = index;
    },
    confirmModal(sacrifice) {
      if (!this.canConfirm) return;
      if (sacrifice) {
        // Sac isn't passed through confirm so we have to close it manually
        this.emitClose();
      }
      startManualReality(sacrifice, this.selectedGlyph);
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    :option="confirmationToDisable"
    :show-confirm="canConfirm"
    @confirm="confirmModal(false)"
  >
    <template #header>
      You are about to Reality
    </template>
    <div
      v-if="firstReality"
      class="c-modal-message__text"
    >
      {{ firstRealityText }}
    </div>

    <div class="c-modal-message__text">
      {{ gained }}
    </div>
    <div
      class="l-glyph-selection__row"
    >
      <GlyphComponent
        v-for="(glyph, index) in glyphs"
        :key="index"
        :class="glyphClass(index)"
        :glyph="glyph"
        :is-in-modal="true"
        :ignore-modified-level="true"
        :show-sacrifice="canSacrifice"
        @click.native="select(index)"
      />
    </div>
    <div v-if="!firstReality">
      {{ levelStats }}
      <br>
    </div>
    <b class="o-warning">
      {{ warnText }}
    </b>
    <div v-if="simRealities > 1">
      <br>
      After choosing this Glyph the game will simulate another {{ formatInt(simRealities - 1) }} Realities,
      <br>
      automatically choosing Glyphs based on your Glyph filter settings.
    </div>
    <div v-if="willAutoPurge">
      <br>
      Auto-purge is currently enabled; your selected Glyph
      <br>
      may not appear in your inventory after it triggers.
    </div>
    <div
      v-if="!hasSpace"
      class="o-warning"
    >
      <span v-if="simRealities > 1">
        You will be simulating more Realities than you have open inventory space for;
        this may result in some Glyphs being Sacrificed.
      </span>
      <span v-else>
        You do not have any free inventory space - your selected Glyph will be automatically
        {{ canSacrifice ? "Sacrificed" : "deleted" }}!
      </span>
    </div>
    <div v-if="confirmationToDisable">
      <br>
      You can force this modal to appear (even if disabled) by Shift-clicking the Reality button.
    </div>
    <template
      v-if="canSacrifice && canConfirm"
      #extra-buttons
    >
      <PrimaryButton
        class="o-primary-btn--width-medium c-modal-message__okay-btn"
        @click="confirmModal(true)"
      >
        Sacrifice
      </PrimaryButton>
    </template>
  </ModalWrapperChoice>
</template>

<style scoped>
.o-warning {
  color: var(--color-infinity);
}
</style>
