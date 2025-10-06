<script setup lang="ts">
import { useEmptySlot } from "@termeh-v/composables";
import { useTemplateRef } from "vue";
import { useCreate } from "../useCreate";

defineOptions({
    inheritAttrs: false,
});

const rootEl = useTemplateRef("toast");

const { hasErrorOrEmpty: emptyIcon } = useEmptySlot("icon");
const { hasErrorOrEmpty: emptyActions } = useEmptySlot("actions");
const {
    attrs,
    options,
    loaded,
    paused,
    loading,
    progress,
    close,
    pause,
    resume,
    action,
    isActive,
    isClosable,
    index,
    count,
} = useCreate(rootEl);
</script>

<template>
    <div
        ref="toast"
        class="toast"
        :class="{
            'is-paused': paused,
            'is-loading': loading,
            'is-closable': isClosable,
        }"
        v-bind="attrs"
    >
        <div class="toast-wrapper">
            <div class="toast-icon" v-if="!emptyIcon">
                <slot name="icon"></slot>
            </div>
            <div class="toast-content">
                <slot
                    v-bind="{
                        index,
                        count,
                        isActive,
                        options,
                        loaded,
                        paused,
                        loading,
                        progress,
                        close,
                        pause,
                        resume,
                        action,
                    }"
                >
                    Put Content here
                </slot>
            </div>
        </div>

        <div class="toast-actions" v-if="!emptyActions">
            <slot
                name="actions"
                v-bind="{
                    index,
                    count,
                    isActive,
                    options,
                    loaded,
                    paused,
                    loading,
                    progress,
                    close,
                    pause,
                    resume,
                    action,
                }"
            ></slot>
        </div>
        <div class="toast-progress" :style="{ width: `${progress}%` }"></div>
    </div>
</template>
