import { mergeConfig, type DeepPartial } from "@termeh-v/utils";
import { type ContainerOption } from "./types";

/**
 * Default configuration options for the toast container.
 */
let defaultOptions: ContainerOption = {
    duration: 5,
    pauseOnHover: true,
    direction: "ltr",
    animations: {
        enter: {
            params: { opacity: [0, 1], translateX: ["25%", 0] },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        leave: {
            params: { opacity: [1, 0], translateX: [0, "25%"] },
            options: { duration: 0.1, ease: "easeOut" },
        },
        stackEnter: {
            params: { opacity: [0.85, 1], translateY: ["3rem", 0] },
            options: { duration: 0.2, type: "spring", stiffness: 150 },
        },
        stackLeave: {
            params: { opacity: [1, 0], translateY: [0, "3rem"] },
            options: { duration: 0.1, ease: "easeOut" },
        },
    },
};

/**
 * Updates the global default options.
 * Performs a deep merge with the existing options.
 *
 * @param option - Partial options to override the current defaults.
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
 * Retrieves the current default container options.
 *
 * @returns The current default options.
 */
export function getDefaultOptions(): ContainerOption {
    return defaultOptions;
}
