import { isObject } from "@termeh-v/utils";
import { computed, inject, ref, type Ref } from "vue";
import { type ContainerOption, type Toast } from "./internal/types";

/**
 * Injects the toast core instance provided by `ToastPlugin`.
 *
 * Throws an error if the plugin has not been installed so consumers get a
 * clear failure early in development.
 *
 * @returns The core instance created by `useCore`.
 * @throws If the plugin is not installed on the current app.
 */
export function injectCore() {
    const core = inject<ReturnType<typeof useCore>>("$$toast_plugin");
    if (core) return core;
    throw new Error("ToastPlugin is not installed!");
}

/**
 * Creates the toast core that stores container options and toast definitions.
 *
 * The core is intentionally simple: it keeps a map of container options and a
 * nested map of toasts keyed by container name and toast identifier. The
 * returned API allows adding/removing toasts and reading container-specific
 * data as reactive refs.
 *
 * @returns An object with methods to manage containers and toasts.
 */
export function useCore() {
    const options = ref(new Map<string, Partial<ContainerOption>>());
    const toasts = ref(new Map<string, Map<string, Toast>>());

    /**
     * Set or remove partial options for a container.
     *
     * @param container - The container name to update.
     * @param option - Partial options to store. If omitted or not an object the
     *                 container entry will be removed.
     */
    function setOptions(
        container: string,
        option: Partial<ContainerOption> = {}
    ) {
        if (container && isObject(option)) {
            options.value.set(container, option);
        } else {
            options.value.delete(container);
        }
    }

    /**
     * Retrieve the partial options stored for a container.
     *
     * @param container - Container name to read.
     * @returns Partial container options or an empty object when none are set.
     */
    function getOptions(container: string): Partial<ContainerOption> {
        return options.value.get(container) ?? {};
    }

    /**
     * Add a toast entry to a container. Creates the container map if needed.
     *
     * @param container - Container name.
     * @param toast - Toast object to add.
     */
    function addToast(container: string, toast: Toast) {
        let containerToasts = toasts.value.get(container);
        if (!containerToasts) {
            containerToasts = new Map();
            toasts.value.set(container, containerToasts);
        }
        containerToasts.set(toast.identifier, toast);
    }

    /**
     * Remove a toast by its identifier from a named container.
     *
     * @param container - Container name.
     * @param toastId - Identifier of the toast to remove.
     */
    function removeToast(container: string, toastId: string) {
        const containerToasts = toasts.value.get(container);
        containerToasts?.delete(toastId);
    }

    /**
     * Get a reactive `Ref` array of toasts for the named container. The array
     * is derived from the inner map and will update reactively when toasts are
     * added or removed.
     *
     * @param container - Container name to observe.
     * @returns A `Ref` that resolves to the current array of toasts.
     */
    function getContainerToasts(container: string): Ref<Toast[]> {
        return computed(() => {
            const containerToasts = toasts.value.get(container);
            return containerToasts ? Array.from(containerToasts.values()) : [];
        });
    }

    return {
        setOptions,
        getOptions,
        toasts,
        addToast,
        removeToast,
        getContainerToasts,
    };
}
