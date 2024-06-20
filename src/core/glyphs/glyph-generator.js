/**
 * It turns out reading and writing the RNG state from player is really slow, for
 * some reason. Thus, it's very advantageous to get an RNG as a local variable, and only
 * write the state back out to player when we are done with it.
 * So, this interface is implemented by a real and fake RNG class; after creating one and
 * using it, call finalize on it to write the seed out.
 */
import { deepmerge } from "@/utility/deepmerge";

class GlyphRNG {
  static get SECOND_GAUSSIAN_DEFAULT_VALUE() {
    return 1e6;
  }

  constructor(seed, secondGaussian) {
    this.seed = seed;
    this.secondGaussian = secondGaussian;
  }

  uniform() {
    const state = xorshift32Update(this.seed);
    this.seed = state;
    return state * 2.3283064365386963e-10 + 0.5;
  }

  normal() {
    if (this.secondGaussian !== GlyphRNG.SECOND_GAUSSIAN_DEFAULT_VALUE) {
      const toReturn = this.secondGaussian;
      this.secondGaussian = GlyphRNG.SECOND_GAUSSIAN_DEFAULT_VALUE;
      return toReturn;
    }
    let u = 0, v = 0, s = 0;
    do {
      u = this.uniform() * 2 - 1;
      v = this.uniform() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    s = Math.sqrt(-2 * Math.log(s) / s);
    this.secondGaussian = v * s;
    return u * s;
  }

  /**
   * Write the seed out to where it can be restored
   * @abstract
   */
  finalize() { throw new NotImplementedError(); }

  /**
   * @abstract
   */
  get isFake() { throw new NotImplementedError(); }
}

export const GlyphGenerator = {
  // Glyph choices will have more uniformly-distributed properties up for this many groups
  // of uniform glyphs. The size of a uniformity group is 5, so this gives uniformly-distributed
  // properties up to a reality count one more than 5x this value; the modified RNG for uniform
  // glyphs excludes the first fixed glyph and only starts from the 2nd one onward
  uniformityGroups: 4,
  get isUniformityActive() {
    return player.realities <= 5 * this.uniformityGroups;
  },

  fakeSeed: Date.now() % Math.pow(2, 32),
  fakeSecondGaussian: null,
  /* eslint-disable lines-between-class-members */
  RealGlyphRNG: class extends GlyphRNG {
    constructor() { super(player.reality.seed, player.reality.secondGaussian); }
    finalize() {
      player.reality.seed = this.seed;
      player.reality.secondGaussian = this.secondGaussian;
    }
    get isFake() { return false; }
  },

  FakeGlyphRNG: class extends GlyphRNG {
    constructor() { super(GlyphGenerator.fakeSeed, GlyphGenerator.fakeSecondGaussian); }
    finalize() {
      GlyphGenerator.fakeSeed = this.seed;
      GlyphGenerator.fakeSecondGaussian = this.secondGaussian;
    }
    get isFake() { return true; }
  },

  MusicGlyphRNG: class extends GlyphRNG {
    constructor() { super(player.reality.musicSeed, player.reality.musicSecondGaussian); }
    finalize() {
      player.reality.musicSeed = this.seed;
      player.reality.musicSecondGaussian = this.secondGaussian;
    }
    get isFake() { return false; }
  },
  /* eslint-enable lines-between-class-members */

  randomGlyph(level) {
    return this.createGlyph(level, this.availableTypes.randomElement());
  },

  createGlyph(level, typeIn) {
    const strength = this.strength;
    const effectBitmask = this.getEffectsForType(typeIn);

    return {
      id: undefined,
      idx: null,
      type: typeIn,
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

  cursedGlyph() {
    const str = rarityToStrength(100);
    const effectBitmask = makeGlyphEffectBitmask(
      orderedEffectList.filter(effect => effect.match("cursed*"))
    );
    return {
      id: undefined,
      idx: null,
      type: "cursed",
      strength: str,
      level: 6666,
      rawLevel: 6666,
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
    const rng = new GlyphGenerator.MusicGlyphRNG();
    const glyph =
      this.randomGlyph({ actualLevel: Math.floor(player.records.bestReality.glyphLevel * 0.8), rawLevel: 1 });
    rng.finalize();
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

  get strength() {
    return rarityToStrength((100 + Effarig.maxRarityBoost + Effects.sum(
      Achievement(146),
      FabricUpgrade(11),
      GlyphSacrifice.effarig
    )) * this.rarityMultiplier);
  },

  // eslint-disable-next-line capitalized-comments
  // get strength() {
  //   // TODO:glyf
  //   if (Ra.unlocks.maxGlyphRarityAndShardSacrificeBoost.canBeApplied) return rarityToStrength(100);
  //   let result = GlyphGenerator.gaussianBellCurve(rng) * GlyphGenerator.strengthMultiplier;
  // eslint-disable-next-line max-len
  //   const relicShardFactor = Ra.unlocks.extraGlyphChoicesAndRelicShardRarityAlwaysMax.canBeApplied ? 1 : rng.uniform();
  //   const increasedRarity =
  //   // relicShardFactor *
  //     Effarig.maxRarityBoost +
  //     Effects.sum(Achievement(146), GlyphSacrifice.effarig);
  //   // Each rarity% is 0.025 strength.
  //   result += increasedRarity / 40;
  //   // Raise the result to the next-highest 0.1% rarity.
  //   result = Math.ceil(result * 400) / 400;
  //   return result;
  // },

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
    // TODO:glyf
    let effectValues = GlyphTypes[type].effects;
    if (!RealityUpgrade(17).isBought) effectValues = effectValues.slice(0, -1);
    return effectValues.map(i => i.bitmaskIndex).toBitmask();
  },

  getRNG(fake) {
    return fake ? new GlyphGenerator.FakeGlyphRNG() : new GlyphGenerator.RealGlyphRNG();
  },

  /**
   * More than 3 approx 0.001%
   * More than 2.5 approx 0.2%
   * More than 2 approx 6%
   * More than 1.5 approx 38.43%
   */
  gaussianBellCurve(rng) {
    // Old code used max, instead of abs -- but we rejected any samples that were
    // at the boundary anyways. Might as well use abs, and not cycle as many times.
    // The function here is an approximation of ^0.65, here is the old code:
    //     return Math.pow(Math.max(rng.normal() + 1, 1), 0.65);
    const x = Math.sqrt(Math.abs(rng.normal(), 0) + 1);
    return -0.111749606737000 + x * (0.900603878243551 + x * (0.229108274476697 + x * -0.017962545983249));
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
