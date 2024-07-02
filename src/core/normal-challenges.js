import { DC } from "./constants";
import { GameMechanicState } from "./game-mechanics";

export function updateNormalAndInfinityChallenges(diff) {
  if (NormalChallenge(2).isRunning) {
    player.chall2Pow = player.chall2Pow.times(DC.D1_00038.pow(diff / 100)).clampMax(Decimal.NUMBER_MAX_VALUE);
  }

  if (InfinityChallenge(2).isRunning) {
    if (player.ic2Count >= 400) {
      if (AntimatterDimension(8).amount.gt(0)) {
        sacrificeReset();
      }
      player.ic2Count %= 400;
    } else {
      // Do not change to diff, as this may lead to a sacrifice softlock with high gamespeed
      player.ic2Count += Math.clamp(Date.now() - player.lastUpdate, 1, 21600000);
    }
  }

  if (InfinityChallenge(6).isRunning && AntimatterDimension(2).amount.neq(0)) {
    Currency.matter.bumpTo(1);
    // These caps are values which occur at approximately e308 IP
    const cappedBase = 1.03 + Math.clampMax(DimBoost.totalBoosts, 400) / 200 +
        Math.clampMax(player.galaxies, 100) / 100;
    Currency.matter.multiply(Decimal.pow(cappedBase, diff / 20));
  }
}

class NormalChallengeState extends GameMechanicState {
  get isQuickResettable() {
    return Boolean(this.config.isQuickResettable);
  }

  get isRunning() {
    const isPartOfIC1 = this.id !== 8;
    return player.challenge.normal.current === this.id || (isPartOfIC1 && InfinityChallenge(1).isRunning);
  }

  get isOnlyActiveChallenge() {
    return player.challenge.normal.current === this.id;
  }

  get isUnlocked() {
    if (PlayerProgress.eternityUnlocked()) return true;
    if (this.id === 0) return true;
    const ip = GameDatabase.challenges.normal[this.id - 1].lockedAt;
    return Currency.infinitiesTotal.gte(ip);
  }

  get isDisabled() {
    return Pelle.isDoomed;
  }

  get lockedAt() {
    return GameDatabase.challenges.normal[this.id].lockedAt;
  }

  requestStart() {
    if (!Tab.challenges.isUnlocked) return;
    if (GameEnd.creditsEverClosed) return;
    if (!player.options.confirmations.challenges) {
      this.start();
      return;
    }
    Modal.startNormalChallenge.show(this.id);
  }

  start() {
    if (this.id === 1 || this.isOnlyActiveChallenge) return;
    if (!Tab.challenges.isUnlocked) return;
    // Forces big crunch reset but ensures IP gain, if any.
    bigCrunchReset(true, true);
    player.challenge.normal.current = this.id;
    player.challenge.infinity.current = 0;
    if (Enslaved.isRunning && EternityChallenge(6).isRunning && this.id === 7) {
      EnslavedProgress.challengeCombo.giveProgress();
      Enslaved.quotes.ec6C10.show();
    }
    if (!Enslaved.isRunning) Tab.dimensions.antimatter.show();
  }

  get isCompleted() {
    return (player.challenge.normal.completedBits & (1 << this.id)) !== 0;
  }

  complete() {
    player.challenge.normal.completedBits |= 1 << this.id;
    // Since breaking infinity maxes even autobuyers that aren't unlocked,
    // it's possible to get r52 or r53 from completing a challenge
    // and thus unlocking an autobuyer.
    Achievement(52).tryUnlock();
    Achievement(53).tryUnlock();
  }

  get goal() {
    if (Enslaved.isRunning && Enslaved.BROKEN_CHALLENGES.includes(this.id)) {
      return DC.E1E15;
    }
    return Decimal.NUMBER_MAX_VALUE;
  }

  updateChallengeTime() {
    const bestTimes = player.challenge.normal.bestTimes;
    if (bestTimes[this.id - 2] <= player.records.thisInfinity.time) {
      return;
    }
    player.challenge.normal.bestTimes[this.id - 2] = player.records.thisInfinity.time;
    GameCache.challengeTimeSum.invalidate();
    GameCache.worstChallengeTime.invalidate();
  }

  exit() {
    player.challenge.normal.current = 0;
    bigCrunchReset(true, false);
    if (!Enslaved.isRunning) Tab.dimensions.antimatter.show();
  }

  get isEffectConditionSatisfied() {
    return this.isCompleted && !this.isDisabled;
  }
}

/**
 * @param {number} id
 * @return {NormalChallengeState}
 */
export const NormalChallenge = NormalChallengeState.createAccessor(GameDatabase.challenges.normal);

/**
 * @returns {NormalChallengeState}
 */
Object.defineProperty(NormalChallenge, "current", {
  get: () => (player.challenge.normal.current > 0
    ? NormalChallenge(player.challenge.normal.current)
    : undefined),
});

Object.defineProperty(NormalChallenge, "isRunning", {
  get: () => player.challenge.normal.current !== 0,
});

export const NormalChallenges = {
  /**
   * @type {NormalChallengeState[]}
   */
  all: NormalChallenge.index.compact(),
  completeAll() {
    for (const challenge of NormalChallenges.all) challenge.complete();
  },
  clearCompletions() {
    player.challenge.normal.completedBits = 0;
  }
};
