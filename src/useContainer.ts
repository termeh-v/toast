import { useConfig, useMediaQueries, useStorage } from "@termeh-v/composables";
import type { Emitter } from "mitt";
import mitt from "mitt";
import {
    computed,
    ref,
    toValue,
    watch,
    type MaybeRefOrGetter,
    type Ref,
} from "vue";
import { getDefaultOptions } from "./internal/options";
import {
    type ContainerOption,
    type EmitterEvent,
    type Toast,
} from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Composable for managing a named toast container instance.
 *
 * Provides reactive state and helper methods for a container, including the
 * list of toasts, counts, collapsed state and an emitter for per-toast
 * events.
 *
 * @param name - Unique name of the container (e.g. "main").
 * @param options - Optional reactive or getter that returns partial container options.
 * @returns Reactive container API used by container components.
 */
export function useContainer(
    name: string,
    options: MaybeRefOrGetter<Partial<ContainerOption> | undefined>
): {
    config: ContainerOption;
    emitter: Emitter<EmitterEvent>;
    toasts: Ref<Toast[]>;
    count: Ref<number>;
    stickyCount: Ref<number>;
    activeId: Ref<string | undefined>;
    isRTL: Ref<boolean>;
    isEmpty: Ref<boolean>;
    isCollapsed: Ref<boolean>;
    clear: () => void;
} {
    const core = injectCore();
    const emitter = mitt<EmitterEvent>();
    const storage = useStorage(localStorage, `toast-${name}`);
    const { isMobile } = useMediaQueries();
    const { config, set: setConfig } = useConfig<ContainerOption>(
        getDefaultOptions()
    );

    // Collapsed state persisted in storage for non-mobile devices
    const collapsed = ref<boolean>(
        isMobile.value || storage.boolean(name) || false
    );

    // Reactive references to toasts managed by the core
    const toasts = core.getContainerToasts(name);
    const count = computed(() => toasts.value.length);
    const stickyCount = computed(
        () => toasts.value.filter((t) => t.mode === "sticky").length
    );
    const activeId = computed(() =>
        toasts.value.length
            ? toasts.value[toasts.value.length - 1]?.key
            : undefined
    );
    const isRTL = computed(() => config.direction === "rtl");
    const isEmpty = computed(() => toasts.value.length === 0);

    /**
     * Two-way computed ref for collapsed state. Writing updates storage for
     * non-mobile devices and clears persisted state on mobile.
     */
    const isCollapsed = computed({
        get: () => collapsed.value,
        set: (value: boolean) => {
            collapsed.value = value;
            if (!isMobile.value) {
                storage.set(name, value ? "true" : "false");
            } else {
                storage.remove(name);
            }
        },
    });

    /**
     * Clear non-sticky toasts from the container with a slight stagger.
     * Sticky toasts are left intact. On mobile devices the container will be
     * collapsed after clearing.
     */
    function clear() {
        toasts.value
            .filter((toast) => toast.mode !== "sticky")
            .forEach((toast, index) => {
                setTimeout(() => {
                    emitter.emit(toast.identifier, "remove");
                }, 75 * index);
            });

        if (isMobile.value) {
            isCollapsed.value = true;
        }
    }

    // Keep core options and local config in sync when `options` changes
    watch(
        () => toValue(options),
        (v) => {
            core.setOptions(name, v);
            setConfig(v || {});
        },
        { immediate: true }
    );

    // Toggle body class based on whether the container has toasts
    watch(count, (v) => {
        if (!config.bodyClass) return;
        if (v > 0) {
            document.body.classList.add(config.bodyClass);
        } else {
            document.body.classList.remove(config.bodyClass);
        }
    });

    return {
        config,
        emitter,
        toasts,
        count,
        stickyCount,
        activeId,
        isRTL,
        isEmpty,
        isCollapsed,
        clear,
    };
}
