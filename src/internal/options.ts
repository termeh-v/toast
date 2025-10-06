import { mergeConfig, type DeepPartial } from "@termeh-v/utils";
import { type ContainerOption } from "./types";

/**
 * The globally shared default container options.
 *
 * Consumers may override parts of this object via `setDefaultOptions`.
 */
let defaultOptions: ContainerOption = {
    duration: 5,
    closable: true,
    direction: "ltr",
    animations: {
        enter: {
            params: { opacity: [0, 1], translateX: ["-50%", 0] },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        leave: {
            params: { opacity: [1, 0], translateX: [0, "-50%"] },
            options: { duration: 0.2, ease: "easeOut" },
        },
        stackEnter: {
            params: { opacity: [0.85, 1], translateY: ["3rem", 0] },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        stackLeave: {
            params: { opacity: [1, 0], translateY: [0, "3rem"] },
            options: { duration: 0.2, ease: "easeOut" },
        },
        activate: {
            params: { top: 0, bottom: 0, scale: 1, opacity: 1 },
            options: { duration: 0.1, ease: "easeOut" },
        },
        secondary: {
            params: { top: -4, bottom: "3rem", scale: 0.9, opacity: 0.65 },
            options: { duration: 0.1, type: "spring", stiffness: 150 },
        },
        tertiary: {
            params: { top: -8, bottom: "3rem", scale: 0.8, opacity: 0.65 },
            options: { duration: 0.1, type: "spring", stiffness: 150 },
        },
        hide: {
            params: { top: 0, bottom: "3rem", scale: 0.7, opacity: 0.65 },
            options: { duration: 0.1, ease: "easeOut" },
        },
    },
};

/**
 * Merge partial options into the global defaults. The merge is deep and
 * respects the provided replace map to ensure animation params/options are
 * replaced rather than shallow-merged.
 *
 * @param option - Partial container options to apply as defaults.
 */
export function setDefaultOptions(option: DeepPartial<ContainerOption>) {
    defaultOptions = mergeConfig(defaultOptions, option, {
        "animations.enter.params": "replace",
        "animations.enter.options": "replace",
        "animations.leave.params": "replace",
        "animations.leave.options": "replace",
        "animations.stackEnter.params": "replace",
        "animations.stackEnter.options": "replace",
        "animations.stackLeave.params": "replace",
        "animations.stackLeave.options": "replace",
        "animations.activate.params": "replace",
        "animations.activate.options": "replace",
        "animations.secondary.params": "replace",
        "animations.secondary.options": "replace",
        "animations.tertiary.params": "replace",
        "animations.tertiary.options": "replace",
        "animations.hide.params": "replace",
        "animations.hide.options": "replace",
    });
}

/**
 * Retrieve the current global default container options.
 *
 * @returns The current `ContainerOption` used as defaults.
 */
export function getDefaultOptions(): ContainerOption {
    return defaultOptions;
}
