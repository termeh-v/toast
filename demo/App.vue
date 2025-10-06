<script setup lang="ts">
import { markRaw } from "vue";
import { useToast } from "../src";
import Flash from "./components/Flash.vue";
import MouseIcon from "./components/MouseIcon.vue";

const { simple } = useToast();

let counter = 0;

function newSimple() {
    simple(`Simple toast ${counter}`);
    counter++;
}

function newIconic() {
    simple(`Simple toast with icon ${counter}`, {
        icon: markRaw(Flash),
        duration: 10,
    });
    counter++;
}

function newError() {
    simple(`Simple error toast ${counter}`, {
        icon: markRaw(Flash),
        duration: 40,
        class: "is-error",
    });
    counter++;
}

function newAction() {
    simple(`Toast with action ${counter}`, {
        title: `Error Toast ${counter}`,
        primaryAction: "Proccess",
        secondaryAction: "Forget",
        icon: markRaw(MouseIcon),
        class: "is-error",
        mode: "sticky",
        onClick: () => Promise.resolve(false),
        onAction: (k) =>
            k == "secondary"
                ? Promise.resolve(true)
                : new Promise<boolean>((resolve) => {
                      setTimeout(() => {
                          resolve(true);
                      }, 2000);
                  }),
    });
    counter++;
}

function newClickAction() {
    simple(`Sticky toast with close on click ${counter}`, {
        title: `Clickable Toast ${counter}`,
        icon: markRaw(MouseIcon),
        class: "is-shade",
        mode: "sticky",
        onClick: () =>
            new Promise<boolean>((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 5000);
            }),
    });

    counter++;
}
</script>

<template>
    <div class="container">
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>

        <div class="wrapper" style="align-items: flex-start">
            <div>
                <button class="button" @click="newSimple">Simple</button>
            </div>
            <div>
                <button class="button is-primary" @click="newIconic">
                    WithIcon
                </button>
            </div>
            <div>
                <button class="button is-error" @click="newError">
                    Error With Icon
                </button>
            </div>
            <div>
                <button class="button" @click="newAction">Sticky</button>
            </div>
            <div>
                <button class="button" @click="newClickAction">
                    Sticky With Click
                </button>
            </div>
        </div>

        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint neque
            deserunt ut debitis veritatis esse, hic illum corrupti quas quaerat
            dolorem aliquid consectetur mollitia necessitatibus est culpa sequi
            aspernatur itaque.
        </p>
    </div>
    <ToastContainer />
</template>

<style lang="scss">
@use "termeh";
@use "../src/style.scss";

@import url("https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&display=swap");

@include termeh.define("font", "size", 14px);
@include termeh.define("font", "family", ("Google Sans Code", monospace));
@include termeh.define-palette("primary", #0e8185);

@include termeh.use-generic();
@include termeh.use-container();
@include termeh.use-icon();
@include termeh.use-wrapper();
@include termeh.use-button();
@include style.use-toast();

html,
body {
    min-width: 100vw;
    min-height: 100vh;
}

#app {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
