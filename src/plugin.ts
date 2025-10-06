import Container from "./components/Container.vue";

import type { ComponentResolverFunction } from "unplugin-vue-components";
import type { App } from "vue";
import { setDefaultOptions } from "./internal/options";
import { type ContainerOption } from "./internal/types";
import { useCore } from "./useCore";

/**
 * Create a Vue plugin that wires up the toast core and optional global
 * container component.
 *
 * This function returns an object with an `install` method compatible with
 * `app.use(...)` in Vue. It will provide the toast core via dependency
 * injection, optionally register a global `<ToastContainer>` component and
 * apply provided default options.
 *
 * @param options - Partial container options. If `options.container` is a
 *                  string it will be used as the global component name. If
 *                  set to `false` the container won't be auto-registered.
 * @returns A Vue plugin object with an `install` hook.
 */
export function ToastPlugin(
    options: Partial<ContainerOption> & { container?: string | false } = {}
) {
    return {
        /**
         * Install hook executed by Vue when the plugin is registered.
         *
         * This provides the toast core, optionally registers the container
         * component, and merges the provided defaults into the global
         * configuration.
         *
         * @param app - The Vue application instance to install into.
         */
        install(app: App) {
            // Provide the core toast management instance for injection
            app.provide("$$toast_plugin", useCore());

            // Optionally register the global container component
            if (options.container) {
                const name =
                    typeof options.container === "string"
                        ? options.container
                        : "ToastContainer";
                app.component(name, Container);
            }

            // Apply default options, adjusting animation directions for RTL if
            // a `direction` is supplied.
            const isRTL = options?.direction === "rtl";
            const { container, ...rest } = options;
            setDefaultOptions({
                animations: {
                    enter: {
                        params: {
                            opacity: [0, 1],
                            translateX: [isRTL ? "50%" : "-50%", 0],
                        },
                    },
                    leave: {
                        params: {
                            opacity: [1, 0],
                            translateX: [0, isRTL ? "-50%" : "50%"],
                        },
                    },
                },
                ...rest,
            });
        },
    };
}

/**
 * Returns a component resolver compatible with `unplugin-vue-components`.
 *
 * The resolver maps `BaseToast` and `ToastContainer` to this package so they
 * can be auto-imported by build tooling.
 *
 * @returns A function that resolves component names to import information.
 */
export function ToastResolver(): ComponentResolverFunction {
    const components = ["BaseToast", "ToastContainer"];

    return (name: string) => {
        if (components.includes(name)) {
            return {
                name,
                from: "@termeh-v/toast",
            };
        }
    };
}
