<template>
  <div class="flex h-full relative">
    <transition appear>
      <div class="cover" v-if="covered"></div>
    </transition>
    <div class="bg-primary w-14 flex items-center justify-center text-white">
      <mdicon name="twitch" :size="30"></mdicon>
    </div>
    <div class="pl-4 flex items-center">
      <div class="">
        {{ alert.message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import {alerts} from "@/store";
const covered = ref(false)
const alert = computed(()=>{
  return alerts.value[0]
})

const initNextAlert = () => {

  console.log("we have a new alert");
  covered.value = true
  setTimeout(() => {
    covered.value = false
  }, 1000)
  var audio = new Audio("/nice.mp3");
  audio.play();
  setTimeout(() => {
    console.log("removed alert");
    alerts.value.shift()
  }, 10000);
}
onMounted(()=>{

  initNextAlert()
})
watch(
     alert,
  (newValue) => {
    console.log("alert changed", newValue);
    if (alerts.value.length!==0) {

      initNextAlert()
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.cover{
  @apply w-full h-full bg-primary absolute;
}

.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from{
  transform: translateX(-100%);
}
.v-leave-to {

  transform: translateX(100%);

}

</style>
