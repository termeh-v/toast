import Simple from "./components/Simple.vue";

import { mergeConfig } from "@termeh-v/utils";
import { customAlphabet } from "nanoid";
import { markRaw, type Component } from "vue";
import { getDefaultOptions } from "./internal/options";
import type { ToastOption } from "./internal/types";
import { injectCore } from "./useCore";

/**
 * Factory composable that exposes helpers to create toasts programmatically.
 *
 * The returned API contains `create` to register a custom component toast
 * and `simple` which provides a quick way to create a common message toast.
 *
 * @returns An object with `create` and `simple` methods.
 */
export function useToast() {
    const core = injectCore();
    const generator = customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );

    /**
     * Create a toast using a component and props.
     *
     * This function generates a unique identifier and merges container
     * defaults (from core) with the provided options before adding the toast
     * to the core store.
     *
     * @template Props - Props type for the provided component.
     * @param component - Vue component to render inside the toast.
     * @param props - Props passed to the component instance.
     * @param options - Partial toast options overriding defaults.
     */
    function create<Props extends Record<string, unknown>>(
        component: Component,
        props: Props,
        options: Partial<ToastOption> = {}
    ) {
        const container = options?.container || "main";
        const identifier = generator(10);
        const key = `${container}-${identifier}`;

        const config = mergeConfig(
            getDefaultOptions(),
            core.getOptions(container)
        );

        const params = {
            key,
            identifier,
            container,
            mode: options?.mode || "default",
            duration: options?.duration ?? config?.duration ?? 5,
            closable: options?.closable ?? config?.closable ?? true,
            onOpen: options?.onOpen,
            onClose: options?.onClose,
            onClick: options?.onClick,
            onAction: options?.onAction,
        };

        core.addToast(container, {
            ...params,
            component: markRaw(component),
            props: {
                ...props,
                vtOptions: params,
            },
        });
    }

    /**
     * Create a simple text toast using the bundled `Simple` component.
     *
     * Accepts extra properties like title and action labels which are forwarded
     * to the `Simple` component.
     *
     * @param message - The message text to display.
     * @param options - Partial toast options and additional presentation props.
     */
    function simple(
        message: string,
        options: Partial<
            ToastOption & {
                title?: string;
                primaryAction?: string;
                secondaryAction?: string;
                icon?: Component;
                [key: string]: any;
            }
        > = {}
    ) {
        const {
            title,
            primaryAction: primary,
            secondaryAction: secondary,
            icon,
            ...otherProps
        } = options;

        create(
            Simple,
            { message, title, primary, secondary, icon, ...otherProps },
            options
        );
    }

    return { create, simple };
}
