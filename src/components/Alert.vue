<template>
  <div class="flex h-full relative">
    <transition appear>

    <div class="cover" v-if="covered"></div>

    </transition>
    <template v-if="alert.event.type === 'Follow'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          Thanks for the Follow <br /><span class="font-bold">{{
            alert.data.displayName
          }}</span>
        </div>
      </div>
    </template>
    <template v-if="alert.event.type === 'Sub'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          Thanks for the Sub <br /><span class="font-bold">{{
            alert.data.displayName
          }}</span>
        </div>
      </div>
    </template>
    <template v-if="alert.event.type === 'Resub'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          Amazing, thanks for the continued support with the Resub
          <br /><span class="font-bold">{{ alert.data.displayName }}</span>
        </div>
      </div>
    </template>
    <template v-if="alert.event.type === 'GiftSub'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          thanks for the support with the Gifted Sub to
          {{ alert.data.recipientDisplayName }} <br /><span class="font-bold">{{
            alert.data.displayName
          }}</span>
        </div>
      </div>
    </template>
    <template v-if="alert.event.type === 'GiftBomb'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          thanks for the support with the
          {{ alert.data.gifts }} Gifted Subs <br /><span class="font-bold">{{
            alert.data.displayName
          }}</span>
          (total gifted subs: {{ alert.data.totalGifts }})
        </div>
      </div>
    </template>
    <template v-if="alert.event.type === 'Raid'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          OH look whos here its <br /><span class="font-bold">{{
            alert.data.displayName
          }}</span>
          with a Raid of {{ alert.data.viewerCount }}
        </div>
      </div>
    </template>
    <template v-if="alert.event.type === 'Host'">
      <div class="bg-primary w-14 flex items-center justify-center text-white">
        <mdicon name="twitch" :size="30"></mdicon>
      </div>
      <div class="pl-4 flex items-center">
        <div class="">
          Thanks for the host <br /><span class="font-bold">{{
            currentAlert.data.displayName
          }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import {alerts} from "@/store";
const covered = ref(false)
const alert = computed(()=>{
  return alerts.value[0]
})

const initNextAlert = ()=>{

  console.log("we have a new alert");
  covered.value = true
  setTimeout(()=>{
    covered.value = false
  }, 1000)
  var audio = new Audio("/nice.mp3");
  audio.play();
  setTimeout(() => {
    console.log("removed alert");
    alerts.value.shift()
  }, 5000);
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
