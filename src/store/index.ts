import {ref} from "vue";
type MessageTags = {
    "badge-info": {
        "subscriber": string
    },
    "badges": {
        "broadcaster": string,
        "subscriber": string,
        "glhf-pledge": string
    },
    "client-nonce": string,
    "color": "#FF4500",
    "displayName": "JanLunge",
    "emotes": null,
    "first-msg": false,
    "flags": null,
    "id": "ce96d4fa-ef2b-426a-b456-5be5b8637454",
    "mod": false,
    "room-id": "128507620",
    "subscriber": true,
    "tmi-sent-ts": "1655238458856",
    "turbo": false,
    "user-id": "128507620",
    "user-type": null,
    "emotes-raw": null,
    "badge-info-raw": "subscriber/12",
    "badges-raw": "broadcaster/1,subscriber/0,glhf-pledge/1",
    "username": "janlunge",
    "message-type": "chat"
}
type Message = MessageTags & {
    message: string,
}
export const alerts = ref<{message:string}[]>([])
export const messages = ref<Message[]>([]);
