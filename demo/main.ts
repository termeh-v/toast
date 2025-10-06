import { createApp } from "vue";
import { ToastPlugin } from "../src";
import App from "./App.vue";

createApp(App)
    .use(
        ToastPlugin({
            bodyClass: "has-toast",
            container: "ToastContainer",
        })
    )
    .mount("#app");
