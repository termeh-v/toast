<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import type { ContainerOption } from "../internal/types";
import { useContainer } from "../useContainer";

const props = withDefaults(
    defineProps<{
        name?: string;
        clear?: string;
        collapse?: string;
        options?: Partial<ContainerOption>;
    }>(),
    {
        name: "main",
        clear: "Clear",
        collapse: "Collapse",
    }
);

const {
    emitter,
    config,
    toasts,
    count,
    activeId,
    isEmpty,
    isCollapsed,
    clear: clearAll,
} = useContainer(props.name, () => props.options);

function toggleCollapse() {
    if (isCollapsed.value) {
        toasts.value.forEach((toast) => {
            if (toast && toast.identifier) {
                emitter.emit(toast.identifier, "activate");
            }
        });
    } else {
        if (toasts.value.length > 1) {
            const toast = toasts.value[toasts.value.length - 2];
            if (toast && toast.identifier) {
                emitter.emit(toast.identifier, "secondary");
            }
        }

        if (toasts.value.length > 2) {
            const toast = toasts.value[toasts.value.length - 3];
            if (toast && toast.identifier) {
                emitter.emit(toast.identifier, "tertiary");
            }
        }

        if (toasts.value.length > 3) {
            toasts.value
                .filter((_, idx) => idx < toasts.value.length - 3)
                .forEach((toast) => {
                    if (toast && toast.identifier) {
                        emitter.emit(toast.identifier, "hide");
                    }
                });
        }
    }
    isCollapsed.value = !isCollapsed.value;
}

function onAdd(k?: string) {
    if (!k || !isCollapsed.value) return;

    if (toasts.value.length > 1) {
        const toast = toasts.value[toasts.value.length - 2];
        if (toast && toast.identifier) {
            emitter.emit(toast.identifier, "secondary");
        }
    }

    if (toasts.value.length > 2) {
        const toast = toasts.value[toasts.value.length - 3];
        if (toast && toast.identifier) {
            emitter.emit(toast.identifier, "tertiary");
        }
    }

    if (toasts.value.length > 3) {
        const toast = toasts.value[toasts.value.length - 4];
        if (toast && toast.identifier) {
            emitter.emit(toast.identifier, "hide");
        }
    }
}

function onRemove(k?: string) {
    if (!k || !isCollapsed.value) return;

    if (toasts.value.length > 1) {
        const toast = toasts.value[toasts.value.length - 2];
        if (toast && toast.identifier) {
            emitter.emit(toast.identifier, "activate");
        }
    }

    if (toasts.value.length > 2) {
        const toast = toasts.value[toasts.value.length - 3];
        if (toast && toast.identifier) {
            emitter.emit(toast.identifier, "secondary");
        }
    }

    if (toasts.value.length > 3) {
        const toast = toasts.value[toasts.value.length - 4];
        if (toast && toast.identifier) {
            emitter.emit(toast.identifier, "tertiary");
        }
    }
}

onMounted(() => {
    emitter.on("added", onAdd);
    emitter.on("removing", onRemove);
});

onUnmounted(() => {
    emitter.off("added", onAdd);
    emitter.off("removing", onRemove);
});
</script>
<template>
    <div
        class="toast-dimmer"
        :class="{ 'is-collapsed': isCollapsed }"
        v-show="!isEmpty"
    >
        <div class="toast-action-bar">
            <button class="is-clear" @click="clearAll" v-if="clear">
                {{ clear }}
            </button>
            <button @click="toggleCollapse">
                {{ collapse || "Collapse" }}
            </button>
        </div>
        <TransitionGroup
            tag="div"
            class="toast-container"
            name="toast-container"
        >
            <div
                v-for="(toast, index) in toasts"
                :key="toast.key"
                class="toast-item"
                :class="{
                    'is-active': isCollapsed && toast.key === activeId,
                    'is-hidden': isCollapsed && toast.key !== activeId,
                }"
            >
                <component
                    :is="toast?.component"
                    v-bind="toast.props"
                    :vt-index="index"
                    :vt-count="count"
                    :vt-is-collapsed="isCollapsed"
                    :vt-emitter="emitter"
                    :vt-animations="config.animations"
                />
            </div>
        </TransitionGroup>
        <div
            class="toast-collapser"
            @click="toggleCollapse"
            v-if="isCollapsed"
        ></div>
    </div>
</template>
