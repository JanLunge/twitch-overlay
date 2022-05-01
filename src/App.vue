<script setup lang="ts">
import DOMPurify from "dompurify";
import { computed, onMounted, ref, watch } from "vue";

const ws = ref<any>(null);
const obs = ref<any>(null);
const messages = ref([]);
const alerts = ref([]);
const micMuted = ref(false);
const cameraVisible = ref(true);
const goal = ref({
  name: "Second Camera",
  current: "18$",
  goal: "25",
});
const currentAlert = computed(() => {
  if (alerts.value.length === 0) return null;
  return alerts.value[0];
});

watch(
  () => currentAlert,
  (newValue) => {
    console.log("alert changed", newValue);
    if (newValue.value) {
      // TODO: make sound
      console.log("we have a new alert")

      setTimeout(() => {
        console.log("removed alert");
        alerts.value.pop();
      }, 12000);

    }
  },
  { deep: true }
);

const computedMessage = ({ message, emotes, cheerEmotes, bits }) => {
  if (!emotes && !cheerEmotes) return message;
  let combinedEmotes = [...emotes, ...cheerEmotes].sort(
    (a, b) => a.startIndex - b.startIndex
  );
  console.log(combinedEmotes);
  const messageHTML = combinedEmotes.reduce((previous, current, i) => {
    return (
      previous +
      `<img src='${current.imageUrl}'/>` +
      (current.bits ? current.bits : "") +
      DOMPurify.sanitize(
        message.substring(
          current.endIndex + 1,
          combinedEmotes[i + 1] ? combinedEmotes[i + 1].startIndex : undefined
        ),
        { FORBID_TAGS: ["style", "img"] }
      )
    );
  }, DOMPurify.sanitize(message.substring(0, combinedEmotes[0] ? combinedEmotes[0].startIndex : undefined), { FORBID_TAGS: ["style", "img"] }));

  let cleanHTML = messageHTML;
  return cleanHTML;
};
onMounted(() => {
  function connectws() {
    if ("WebSocket" in window) {
      ws.value = new WebSocket("ws://localhost:4448/");
      // obs.value = new WebSocket("ws://localhost:4444/");
    }
  }
  obs.value = new OBSWebSocket();
  obs.value.connect({ address: "localhost:4444", password: "obslocal" });
  obs.value.on("SourceMuteStateChanged", (data) => {
    console.log(`mute toggle: ${data.muted}, ${data.sourceName}`);
    if (data.sourceName == "Mic/Aux") micMuted.value = data.muted;
  });

  connectws();
  console.log("connected ws", ws.value);

  ws.value.onopen = () => {
    ws.value.send(
      JSON.stringify({
        request: "GetEvents",
        id: "388838",
      })
    );
    ws.value.onclose = function () {
      // "connectws" is the function we defined previously
      setTimeout(connectws, 10000);
    };
    ws.value.send(
      JSON.stringify({
        request: "Subscribe",
        events: {
          Twitch: [
            "Follow",
            "Cheer",
            "Sub",
            "Resub",
            "GiftSub",
            "GiftBomb",
            "ChatMessage",
            "Raid",
            "Host",
          ],
          websocketCustomServer: ["Open", "Close", "Message"],
          general: ["Custom"],
          websocketClient: ["Open", "Close", "Message"],
        },
        id: "123",
      })
    );
    ws.value.onmessage = (event) => {
      // grab message and parse JSON
      const msg = event.data;
      const wsdata = JSON.parse(msg);

      console.log(wsdata);
      if (!wsdata.event) {
        console.log("no event");
        return;
      }
      // check for events to trigger
      if (wsdata.event.source === "Twitch") {
        if (["ChatMessage", "Cheer"].includes(wsdata.event.type)) {
          console.log("chat message", wsdata.data.message.message);
          messages.value.push(wsdata.data.message);
        } else if (
          [
            "Follow",
            "Sub",
            "Resub",
            "Cheer",
            "GiftSub",
            "GiftBomb",
            "Host",
            "Raid",
          ].includes(wsdata.event.type)
        ) {
          // run an alert
          alerts.value.push(wsdata);
          // TODO: timeout needs a manager so that all alerts are shown for the same time
        }
      }
    };
  };
});
</script>

<template>
  <div class="left-col flex flex-col">
    <div class="chat text-white flex-grow">
      <div class="chatbox w-full h-full flex flex-col justify-end">
        <TransitionGroup appear tag="ul" name="chat">
          <div v-for="message in messages" :key="message.msgId">
            <div class="message-outer mb-1">
              <div
                data-from="{from}"
                data-id="{messageId}"
                class="message-inner"
              >
                <div class="">
                  <div
                    class="meta message-part"
                    :style="{ color: message.color }"
                  >
                    <span class="badges"> </span>
                    <div class="name inline-block font-bold">
                      <img
                        v-if="message.subscriber"
                        class="inline h-5 mr-2 relative"
                        style="top: -2px"
                        src="https://static-cdn.jtvnw.net/badges/v1/4f5fb49c-9403-43eb-8ed6-660deabd1f87/2"
                      />
                      <span>{{ message.displayName || message.username }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="message message-part">
                    <span class="" v-html="computedMessage(message)"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
    <div class="goals bg-base-100 text-base-content">
      <div class="px-2 pt-2 flex justify-between">
        <div>{{ goal.name }}</div>
        <div>{{ goal.current }}/{{ goal.goal }}</div>
      </div>
      <div class="px-2 pb-2">
        <progress
          class="progress progress-primary w-full"
          :value="parseInt(goal.current)"
          :max="parseInt(goal.goal)"
        ></progress>
      </div>
    </div>
    <div class="camera" v-if="cameraVisible">
      <div
        :class="{ 'translate-y-full': !micMuted }"
        class="absolute bottom-0 left-0 p-2 bg-red-600 flex text-white font-bold transition-all"
      >
        <mdicon name="microphone-off" class="mr-2" /> ️
        <span>Jan is currently muted</span>
      </div>
    </div>
    <div class="slider">
      <transition name="slider">
        <div class="flex h-full" v-if="!currentAlert">
          <div
            class="bg-primary w-14 flex items-center justify-center text-white"
          >
            <mdicon name="cube-outline" :size="30"></mdicon>
          </div>
          <div class="pl-4 flex items-center">
            <div>
              <span class="font-bold">Jan Lunge</span><br />
              building keyboards
            </div>
          </div>
        </div>
        <div class="flex h-full" v-else>
          <template v-if="currentAlert.event.type === 'Follow'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
              <mdicon name="twitch" :size="30"></mdicon>
            </div>
            <div class="pl-4 flex items-center">
              <div class="">
                Thanks for the Follow <br /><span class="font-bold">{{
                  currentAlert.data.displayName
                }}</span>
              </div>
            </div>
          </template>
          <template v-if="currentAlert.event.type === 'Sub'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
              <mdicon name="twitch" :size="30"></mdicon>
            </div>
            <div class="pl-4 flex items-center">
              <div class="">
                Thanks for the Sub <br /><span class="font-bold">{{
                  currentAlert.data.displayName
                }}</span>
              </div>
            </div>
          </template>
          <template v-if="currentAlert.event.type === 'Resub'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
              <mdicon name="twitch" :size="30"></mdicon>
            </div>
            <div class="pl-4 flex items-center">
              <div class="">
                Amazing, thanks for the continued support with the Resub
                <br /><span class="font-bold">{{
                  currentAlert.data.displayName
                }}</span>
              </div>
            </div>
          </template>
          <template v-if="currentAlert.event.type === 'GiftSub'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
              <mdicon name="twitch" :size="30"></mdicon>
            </div>
            <div class="pl-4 flex items-center">
              <div class="">
                thanks for the support with the Gifted Sub to
                {{ currentAlert.data.recipientDisplayName }} <br /><span
                  class="font-bold"
                  >{{ currentAlert.data.displayName }}</span
                >
              </div>
            </div>
          </template>
          <template v-if="currentAlert.event.type === 'GiftBomb'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
              <mdicon name="twitch" :size="30"></mdicon>
            </div>
            <div class="pl-4 flex items-center">
              <div class="">
                thanks for the support with the
                {{ currentAlert.data.gifts }} Gifted Subs <br /><span
                  class="font-bold"
                  >{{ currentAlert.data.displayName }}</span
                >
                (total gifted subs: {{ currentAlert.data.totalGifts }})
              </div>
            </div>
          </template>
          <template v-if="currentAlert.event.type === 'Raid'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
              <mdicon name="twitch" :size="30"></mdicon>
            </div>
            <div class="pl-4 flex items-center">
              <div class="">
                OH look whos here its <br /><span class="font-bold">{{
                  currentAlert.data.displayName
                }}</span>
                with a Raid of {{ currentAlert.data.viewerCount }}
              </div>
            </div>
          </template>
          <template v-if="currentAlert.event.type === 'Host'">
            <div
              class="bg-primary w-14 flex items-center justify-center text-white"
            >
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
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.left-col {
  width: 528px;
  margin-left: 45px;
  height: 100%;
  padding-bottom: 50px;
}
.camera {
  @apply w-full relative border border-base-200;
  height: 295px;
  overflow: hidden;
}
.chat {
  max-height: calc(1080px - 464px);
  padding-bottom: 20px;
}
.message span img {
  height: 28px;
  display: inline;
}
.slider {
  @apply w-full bg-base-100 text-base-content drop-shadow-hard relative;
  height: 55px;
  overflow: hidden;
}
.goals {
  @apply drop-shadow-hard-reverse;
}
.message-part {
  @apply inline-block bg-base-100 p-2 text-base-content drop-shadow-hard;
  // bg-opacity-50
}

.chat-enter-active,
.chat-leave-active,
.chat-move {
  transition: all 0.3s ease;
}
.chat-leave-active {
  position: absolute;
}
.chat-enter-from,
.chat-leave-to {
  opacity: 0;
  transform: translateX(-130px);
}
.chat-enter {
  opacity: 0;
  transform: translateY(130px) scale(0.5);
}

.drop-shadow-hard {
  box-shadow: rgba(0, 0, 0, 0.5) 0 10px 10px;
}
.drop-shadow-hard-reverse {
  box-shadow: rgba(0, 0, 0, 0.5) 0 -5px 12px;
}

.slider-enter-active,
.slider-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  width: 100%;
}

.slider-enter-from {
  transform: translateX(-100%);
}
.slider-leave-to {
  transform: translateX(100%);
}
</style>
