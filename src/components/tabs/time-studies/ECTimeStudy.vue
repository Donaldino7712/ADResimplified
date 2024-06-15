<script>
import HintText from "@/components/HintText";
import TimeStudyButton from "./TimeStudyButton";

export default {
  name: "ECTimeStudy",
  components: {
    TimeStudyButton,
    HintText
  },
  props: {
    setup: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      requirement: {
        current: new Decimal(),
        total: new Decimal()
      },
      completions: 0,
      showTotalCompletions: false,
      isRunning: false,
      isUnlocked: false,
    };
  },
  computed: {
    study() {
      return this.setup.study;
    },
    id() {
      return this.study.id;
    },
    config() {
      return this.study.config;
    },
    formatValue() {
      return this.config.secondary.formatValue;
    },
    // Linebreaks added to avoid twitching in scientific notation
    needsFirstLinebreak() {
      return this.study.id === 7;
    },
    needsSecondLinebreak() {
      return [3, 4, 7].includes(this.study.id);
    }
  },
  methods: {
    update() {
      const id = this.id;
      const ec = EternityChallenge(id);
      this.completions = ec.completions;
      this.showTotalCompletions = !Enslaved.isRunning || id !== 1;
      this.isRunning = EternityChallenge.current?.id === id;
      this.isUnlocked = ec.isUnlocked;
    }
  }
};
</script>

<template>
  <TimeStudyButton :setup="setup">
    <HintText
      type="studies"
      class="l-hint-text--time-study"
    >
      EC{{ id }}
    </HintText>
    Eternity Challenge {{ id }}
    ({{ formatInt(completions) }}<span v-if="showTotalCompletions">/{{ formatInt(5) }}</span>)
    <span v-if="isUnlocked && !isRunning"><br>Double click to start</span>
    <span v-else-if="isRunning"><br>Currently Running</span>
  </TimeStudyButton>
</template>

<style scoped>

</style>
