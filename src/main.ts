import { createApp } from "vue";
import App from "./App.vue";
import "./assets/base.scss";
import mdiVue from "mdi-vue/v3";
import * as mdijs from "@mdi/js";

createApp(App).use(mdiVue, { icons: mdijs }).mount("#app");
