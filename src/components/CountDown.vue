<template>
  <div class="countdown-box"><div>{{ formattedTime }}</div></div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from "vue";

const timer = ref(60*5)

const interval = ref<any>(null)
onMounted(() => {
  console.log("mounted")
  interval.value = setInterval(() => {
  if (timer.value === 0) {
    clearInterval(interval.value)
  } else {
    timer.value = timer.value - 1
  }
}, 1000)
})
onUnmounted(() => {
  console.log("unmounted")
  // clearInterval(interval.value)
})
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = '';

  if (hours > 0) {
    formattedTime += hours + ':';
  }

  formattedTime += `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  return formattedTime;
}

const formattedTime = computed(()=>formatTime(timer.value))
</script>

<style lang="scss" scoped>
.countdown-box{
  @apply absolute flex items-center justify-center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: 80px;
  transform: translate(0, 200px);
  overflow: visible;
  font-weight: bold;
  font-family:'SF Mono', SFMono-Regular, ui-monospace,
    'DejaVu Sans Mono', Menlo, Consolas, monospace;
  & > div{
    @apply bg-white rounded-full;
    padding: 0 20px;
  }
}
</style>