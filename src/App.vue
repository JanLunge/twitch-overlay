<script setup lang="ts">
import Alert from "./components/Alert.vue";
import DOMPurify from "dompurify";
import {alerts, messages} from "@/store";
import {computed, onMounted, ref, watch} from "vue";
import {io} from "socket.io-client"
import OBSWebSocket from "obs-websocket-js"
const ws = ref<any>(null);
const obs = ref<any>(null);
const wichBotWebsocket = ref<any>(null)
const errors = ref<string[]>([])
const micMuted = ref(false);
const cameraVisible = ref(true);
import CountDown from "./components/CountDown.vue";

const goal = ref({
  name: "OBSBot Camera",
  current: "0$",
  goal: "250$",
});
const countdownEnabled = ref(false);

const currentAlert = computed(() => {
  if (alerts.value.length === 0) return null;
  return alerts.value[0];
});

const testalert = () =>{
   alerts.value.push({
        message: `Interface Restarted`,
      });
}
testalert()

const computedMessage = ({message, emotes, cheerEmotes, bits}: {message: string, emotes: any, cheerEmotes:any, bits:any}) => {
  // Replace Emotes
  let emoteList : {key: string, start: number, end: number}[] = []
  if(emotes){
    Object.keys(emotes).forEach((key)=>{
      emotes[key].forEach((index: string)=>{
        emoteList.push({
          key,
          start:parseInt(index.split('-')[0]),
          end: parseInt(index.split('-')[1])
        })
      })
    })
    emoteList = emoteList.sort((a, b)=>{
      if(a.start < b.end) return 1
      if(a.start > b.end) return -1
      return 0
    })
    console.log("emote list", emoteList)

    emoteList.forEach(emote=>{
      message =
        message.substring(0, emote.start) +
        `<img class="inline" src="https://static-cdn.jtvnw.net/emoticons/v1/${emote.key}/1.0"/>` +
        message.substring(emote.end + 1);
    })
  }
  // Replace URLs
  const urls = /https?:\/\/(www\.)?(?!static-cdn)([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  message = message.replaceAll(urls, '<span class="badge badge-accent">\$2</span>')
  const usernames = /(@\w*)/g
  message = message.replaceAll(usernames, '<span class="badge badge-primary">\$1</span>')
  return message;
};
onMounted(async () => {
  // // OBS websocket connection
  obs.value = new OBSWebSocket();

  try {
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obs.value.connect("ws://localhost:4444", "obslocal");
    console.log(`Connected to OBS server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
  } catch (error:any) {
    console.error('Failed to connect to OBS', error.code, error.message);
    errors.value.push(error.message)
  }
  // mic toggle
  obs.value.on("InputMuteStateChanged", (data:{inputMuted:boolean, inputName: string}) => {
    console.log(`mute toggle: ${data.inputMuted}, ${data.inputName}`);
    if (data.inputName == "Mic/Aux") micMuted.value = data.inputMuted;
  });
  // on scene switch
  obs.value.on('CurrentProgramSceneChanged', (data:{sceneName: string})=>{
    console.log('scene switch', data)
    // do something
    if(data.sceneName=== '[ S ] FaceCam'){
      // hide camera
      cameraVisible.value = false;
    }else{
      // show camera
      cameraVisible.value = true;
    }
    if(data.sceneName === '[ S ] Starting Soon'){
      countdownEnabled.value = true;
    }else{
      countdownEnabled.value = false;
    }
  })

  // using obs webplugin through browsersource
  // triggering facecam on scene switching
  // window.addEventListener('obsSceneChanged', function(event) {
  //  if(event.detail.name === '[ S ] FaceCam'){
  //    // hide camera
  //    cameraVisible.value = false;
  //  }else{
  //    // show camera
  //    cameraVisible.value = true;
  //  }
  // })
  // // mic mute
  // window.addEventListener('obsSourceVisibleChanged', function (e){
  //   micMuted.value = !micMuted.value;
  // })

  // Twitch bot connection
  wichBotWebsocket.value = io("ws://localhost:6060", {transports: ['websocket']})
  wichBotWebsocket.value.on('connect', ()=>{
    console.log("connected to wichBot")
  })
  wichBotWebsocket.value.on("connect_error", (e:any)=>{
    errors.value.push(e)
  })

  wichBotWebsocket.value.on("message", ( message: any ) => {
    console.log("recieved a message", message)
    messages.value.push(message)
  })

  wichBotWebsocket.value.on("event", ({event, params}: {event:any,params: any}) => {
    console.log("recieved an event", event )
    if(event === 'clearchat'){
      console.log("event to clear chat")
      messages.value = []
      return
    }
    if(event === 'emoteonly'){
      return
    }
    if(event === 'follewersonly'){
      return
    }
    if(event === 'messagedeleted'){
      // TODO: remove the message from the list
      return
    }
    if(event === 'subscription'){
      alerts.value.push({
        message: `Hey thanks for the sub ${params.username}`,
      });
      return
    }
    if(event === 'anongiftpaidupgrade'){
      alerts.value.push({
        message: `Hey thanks for the sub ${params.username}`,
      });
      return
    }
    if(event === 'cheer'){
      alerts.value.push({
        message: `Hey ${params.username} thanks for the cheer of ${params.userstate.bits}bits`,
      });
      return
    }
    if(event === 'giftpaidupgrade'){
      alerts.value.push({
        message: `Hey thanks for the sub ${params.username}`,
      });
      return
    }
    if(event === 'hosted'){
      alerts.value.push({
        message: `Hey ${params.username} thanks for the host with ${params.viewers} viewers`,
      });
      return
    }
    if(event === 'raided'){
      alerts.value.push({
        message: `Hey ${params.username} thanks for the raid with ${params.viewers} viewers`,
      });
      return
    }
    if(event === 'resub'){
      alerts.value.push({
        message: `Hey ${params.username} thanks for the sub for ${params.months}`,
      });
      return
    }
    if(event === 'slowmode'){
      return
    }
    if(event === 'subgift'){
      alerts.value.push({
        message: `Hey ${params.username} thanks for the gifted sub to ${params.recipient}`,
      });
      return
    }
    if(event === 'submysterygift'){
      alerts.value.push({
        message: `Hey ${params.username} thanks for the ${params.numbOfSubs} gifted subs`,
      });
      return
    }
  })
});

const removeAlert = () => {
  console.log("removed alert")
  alerts.value.pop()
}
</script>

<template>
  <div class="left-col flex flex-col justify-end">
    <div class="chat text-white flex-grow">
      <div class="chatbox w-full h-full flex flex-col justify-end">
        <TransitionGroup appear tag="ul" name="chat">
          <div v-for="message in messages" :key="message.id">
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
    <div class="goals bg-base-100 text-base-content" v-if="false">
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
    <div class="camera" :style="{height: cameraVisible ? '295px' : '0px'}">

    </div>
    <div v-if="countdownEnabled">
      <CountDown></CountDown>
    </div>
    <div
        :class="{ 'translate-y-full': !micMuted }"
        class="absolute bottom-0 right-0 p-2 bg-red-600 flex text-white font-bold transition-all"
    >
      <mdicon name="microphone-off" class="mr-2"/>
      ️
      <span>Jan is currently muted</span>
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

              <div v-if="errors.length !== 0">{{ errors }}</div>
            </div>
          </div>
        </div>
        <Alert :alert="currentAlert" @remove-alert="removeAlert" v-else/>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.left-col {
  width: 528px;
  margin-left: 25px;
  height: 100%;
  padding-bottom: 50px;
}

.camera {
  @apply w-full relative ;
  height: 295px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chat {
  max-height: calc(1080px - 464px);
  padding-bottom: 20px;
}
.chatbox {
  max-height: 530px;
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
