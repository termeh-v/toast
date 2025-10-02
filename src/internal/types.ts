import type { AnimationOptions, DOMKeyframesDefinition } from "motion";
import type { Component, Raw } from "vue";

/**
 * Available modes for a toast.
 * - `"default"`: Standard toast that auto-closes after its duration.
 * - `"sticky"`: Toast that remains until manually dismissed.
 */
export type ToastMode = "default" | "sticky";

/**
 * Describes how a toast was closed.
 * - `"manual"`: Closed by user interaction.
 * - `"timer"`: Closed automatically after timeout.
 * - `"action"`: Closed due to an action trigger.
 */
export type CloseMode = "manual" | "timer" | "action";

/** Callback executed when a toast is opened. */
export type OpenHandler = () => void;

/**
 * Callback executed when a toast is closed.
 *
 * @param mode - The method by which the toast was closed.
 */
export type CloseHandler = (mode: CloseMode) => void;

/**
 * Callback executed when the toast body is clicked.
 *
 * @returns A promise resolving to:
 * - `true` to close the toast.
 * - `false` to keep it open.
 */
export type ClickHandler = () => Promise<boolean>;

/**
 * Callback executed when a toast action is triggered.
 *
 * @template T - Type of optional action data.
 * @param key - Action key identifier.
 * @param data - Optional action data payload.
 * @returns A promise resolving to:
 * - `true` to close the toast.
 * - `false` to keep it open.
 */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/**
 * Defines a single animation configuration for a toast.
 */
export interface Animation {
    /** Keyframes or CSS property definitions for the animation. */
    params?: DOMKeyframesDefinition;
    /** Timing options controlling playback (e.g., duration, easing). */
    options?: AnimationOptions;
}

/**
 * Set of animations applied to a toast during its lifecycle.
 */
export interface ToastAnimations {
    /** Animation used when the toast enters. */
    enter: Animation;
    /** Animation used when the toast leaves. */
    leave: Animation;
    /** Animation for entering the stacked state. */
    stackEnter: Animation;
    /** Animation for leaving the stacked state. */
    stackLeave: Animation;
    /** Optional animation for activating the toast. */
    activate?: Animation;
    /** Optional animation for a secondary view layer. */
    secondary?: Animation;
    /** Optional animation for a tertiary view layer. */
    tertiary?: Animation;
    /** Optional animation for hiding (pushing to stack). */
    hide?: Animation;
}

/**
 * Global configuration options for the toast container.
 */
export interface ContainerOption {
    /** Default display duration (in ms) for toasts. */
    duration: number;
    /** Whether to pause the timer when hovered. */
    pauseOnHover: boolean;
    /** Direction of layout: `"ltr"` or `"rtl"`. */
    direction: "ltr" | "rtl";
    /** Optional CSS class applied to `<body>` while a toast is open. */
    bodyClass?: string;
    /** Animation set applied to all toasts in this container. */
    animations: ToastAnimations;
}

/**
 * Configuration for an individual toast instance.
 */
export interface ToastOption {
    /** Display mode of the toast. */
    mode: ToastMode;
    /** Identifier of the container this toast belongs to. */
    container: string;
    /** Duration of the toast in ms. */
    duration: number;
    /** Whether to pause on hover. */
    pauseOnHover: boolean;
    /** Callback when the toast opens. */
    onOpen?: OpenHandler;
    /** Callback when the toast closes. */
    onClose?: CloseHandler;
    /** Callback when the toast body is clicked. */
    onClick?: ClickHandler;
    /** Callback when a toast action is triggered. */
    onAction?: ActionHandler;
}

/**
 * Props passed to a toast component.
 * Extends {@link ToastOption} with identifiers.
 */
export interface ToastProps extends ToastOption {
    /** Unique toast key. */
    key: string;
    /** Internal identifier for this instance. */
    identifier: string;
}

/**
 * Full runtime instance of a toast.
 * Includes configuration, identifiers, state, and component data.
 */
export interface Toast extends ToastOption {
    /** Unique key for the toast component type. */
    key: string;
    /** Unique identifier for this specific instance. */
    identifier: string;
    /** Vue component to render as the toast body. */
    component: Raw<Component>;
    /** Props passed to the toast component. */
    props: Record<string, unknown>;
}

/**
 * Internal events emitted by the toast system.
 * Each property value corresponds to a toast identifier.
 */
export type EmitterEvent = {
    /** Triggered when a toast is added. */
    added?: string;
    /** Triggered before a toast is removed. */
    beforeRemove?: string;
    /** Triggered when activating secondary state. */
    activate?: string;
    /** Triggered when returning to the main view. */
    hide?: string;
    /** Triggered when moving from primary to secondary view. */
    goSecondary?: string;
    /** Triggered when moving from secondary to tertiary view. */
    goTertiary?: string;
};

/**
 * Union of all valid core toast event names.
 */
export type toastCoreEvent = keyof EmitterEvent;
