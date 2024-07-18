import { AutobuyerState } from "./autobuyer";

export class ReplicantiGalaxyAutobuyerState extends AutobuyerState {
  get data() {
    return player.auto.replicantiGalaxies;
  }

  get name() {
    return `Replicanti Galaxy`;
  }

  get isUnlocked() {
    return EternityMilestone.autobuyerReplicantiGalaxy.isReached;
  }

  get isEnabled() {
    return !Pelle.isDoomed || !TimeStudy(131).isBought;
  }

  get hasUnlimitedBulk() {
    return Achievement(126).isUnlocked;
  }

  tick() {
    if (!this.isEnabled) return;
    replicantiGalaxy(true);
  }
}
