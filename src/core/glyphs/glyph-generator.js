import { deepmerge } from "@/utility/deepmerge";

export const GlyphGenerator = {
  randomGlyph(level) {
    return this.createGlyph(level, this.availableTypes.randomElement());
  },

  createGlyph(level, type) {
    const strength = this.strength;
    const effectBitmask = this.getEffectsForType(type);

    return {
      id: undefined,
      idx: null,
      type,
      strength,
      level: level.actualLevel,
      rawLevel: level.rawLevel,
      effects: effectBitmask,
    };
  },

  realityGlyph(level, strength = rarityToStrength(100)) {
    const effects = this.generateRealityEffects(level);
    const effectBitmask = makeGlyphEffectBitmask(effects);
    return {
      id: undefined,
      idx: null,
      type: "reality",
      strength,
      level,
      rawLevel: level,
      effects: effectBitmask,
    };
  },

  cursedGlyph(level = 6666) {
    const str = rarityToStrength(100);
    const effectBitmask = makeGlyphEffectBitmask(
      orderedEffectList.filter(effect => effect.match("cursed*"))
    );
    return {
      id: undefined,
      idx: null,
      type: "cursed",
      strength: str,
      level,
      rawLevel: level,
      effects: effectBitmask,
    };
  },

  // These Glyphs are given on entering Doomed to prevent the player
  // from having none of each basic glyphs which are requied to beat pelle
  doomedGlyph(type) {
    const effectList = GlyphEffects.all.filter(e => e.id.startsWith(type));
    effectList.push(GlyphEffects.timespeed);
    let bitmask = 0;
    for (const effect of effectList) bitmask |= 1 << effect.bitmaskIndex;
    const glyphLevel = Math.max(player.records.bestReality.glyphLevel, 5000);
    return {
      id: undefined,
      idx: null,
      type,
      strength: 3.5,
      level: glyphLevel,
      rawLevel: glyphLevel,
      effects: bitmask,
    };
  },

  companionGlyph(eternityPoints) {
    // Store the pre-Reality EP value in the glyph's rarity
    const str = rarityToStrength(eternityPoints.log10() / 1e6);
    const effects = orderedEffectList.filter(effect => effect.match("companion*"));
    const effectBitmask = makeGlyphEffectBitmask(effects);
    return {
      id: undefined,
      idx: null,
      type: "companion",
      strength: str,
      level: 1,
      rawLevel: 1,
      effects: effectBitmask,
    };
  },

  musicGlyph() {
    const types = [...BASIC_GLYPH_TYPES];
    if (EffarigUnlock.reality.isUnlocked) types.push("effarig");
    const glyph = this.createGlyph(
      { actualLevel: Math.floor(player.records.bestReality.glyphLevel * 0.8), rawLevel: 1 },
      types.randomElement());
    glyph.cosmetic = "music";
    glyph.fixedCosmetic = "music";
    return glyph;
  },

  // Generates a unique ID for glyphs, used for deletion and drag-and-drop.  Non-unique IDs can cause buggy behavior.
  makeID() {
    return this.maxID + 1;
  },

  get maxID() {
    return player.reality.glyphs.active
      .concat(player.reality.glyphs.inventory)
      .reduce((max, glyph) => Math.max(max, glyph.id), 0);
  },

  get rarityMultiplier() {
    return Effects.product(
      RealityUpgrade(16)
    );
  },

  get baseStrength() {
    return rarityToStrength((100 + Effarig.maxRarityBoost +
      Effects.sum(Achievement(146), FabricUpgrade(12))) * this.rarityMultiplier);
  },

  get strengthInstabilityThreshold() {
    return rarityToStrength(130 + GlyphSacrifice.effarig.effectOrDefault(0));
  },

  get isStrengthInstabilityActive() {
    return this.baseStrength >= this.strengthInstabilityThreshold;
  },

  get strength() {
    const ins = this.strengthInstabilityThreshold;
    return this.baseStrength >= ins ? ins + (this.baseStrength - ins) / 2 : this.baseStrength;
  },

  // Populate a list of reality glyph effects based on level
  generateRealityEffects(level) {
    const numberOfEffects = realityGlyphEffectLevelThresholds.filter(lv => lv <= level).length;
    const sortedRealityEffects = GlyphEffects.all
      .filter(eff => eff.glyphTypes.includes("reality"))
      .sort((a, b) => a.bitmaskIndex - b.bitmaskIndex)
      .map(eff => eff.id);
    return sortedRealityEffects.slice(0, numberOfEffects);
  },

  getEffectsForType(type) {
    let effectValues = GlyphTypes[type].effects;
    if (!RealityUpgrade(17).isBought) effectValues = effectValues.slice(0, -1);
    return effectValues.map(i => i.bitmaskIndex).toBitmask();
  },

  copy(glyph) {
    return glyph ? deepmerge({}, glyph) : glyph;
  },

  get availableTypes() {
    const types = [...BASIC_GLYPH_TYPES];
    if (EffarigUnlock.reality.isUnlocked) types.push("effarig");
    if (FabricUpgrade(15).isBought && Ra.pets.effarig.unlocks[6].isUnlocked) types.push("reality");
    return types;
  }
};
