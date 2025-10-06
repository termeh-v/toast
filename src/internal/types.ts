import type { AnimationOptions, DOMKeyframesDefinition } from "motion";
import type { Component, Raw } from "vue";

/** Possible toast modes. */
export type ToastMode = "default" | "sticky";

/** How a toast was closed. */
export type CloseMode = "manual" | "timer" | "action";

/**
 * Named states that can be emitted by a container's emitter to instruct a
 * toast to change its visual stacking state.
 */
export type ToastState =
    | "activate"
    | "secondary"
    | "tertiary"
    | "hide"
    | "remove"
    | string;

/** Handler invoked when a toast is opened. */
export type OpenHandler = () => void;

/** Handler invoked when a toast is closed. Receives the close mode. */
export type CloseHandler = (mode: CloseMode) => void;

/** Click handler for toasts. Should resolve to `true` to indicate the toast should close. */
export type ClickHandler = () => Promise<boolean>;

/**
 * Generic action handler for named actions within a toast. Should resolve to
 * `true` to indicate the toast should be closed after the action completes.
 */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/** Animation descriptor used by the motion library. */
export interface Animation {
    params?: DOMKeyframesDefinition;
    options?: AnimationOptions;
}

/**
 * Set of animations used by a container/toast for enter/leave and stacking
 * transitions. Individual entries are optional for advanced customizations.
 */
export interface ToastAnimations {
    enter: Animation;
    leave: Animation;
    stackEnter: Animation;
    stackLeave: Animation;
    activate?: Animation;
    secondary?: Animation;
    tertiary?: Animation;
    hide?: Animation;
}

/**
 * Configuration options for a toast container.
 */
export interface ContainerOption {
    duration: number;
    closable: boolean;
    bodyClass?: string;
    direction: "ltr" | "rtl";
    animations: ToastAnimations;
}

/** Base options for creating a toast. */
export interface ToastOption {
    container: string;
    mode: ToastMode;
    duration: number;
    closable: boolean;
    onOpen?: OpenHandler;
    onClose?: CloseHandler;
    onClick?: ClickHandler;
    onAction?: ActionHandler;
}

/** Props passed to toast components (extends ToastOption with identity fields). */
export interface ToastProps extends ToastOption {
    key: string;
    identifier: string;
}

/**
 * Internal toast representation stored in the core. Contains component and
 * props in addition to the public options.
 */
export interface Toast extends ToastOption {
    key: string;
    identifier: string;
    component: Raw<Component>;
    props: Record<string, unknown>;
}

/**
 * Event types emitted by a container's emitter. Keys map to payloads which
 * are typically toast identifiers or state names.
 */
export type EmitterEvent = {
    added: string;
    removing: string;
    [key: string]: ToastState;
};

/** Keys of core emitter events. */
export type ToastCoreEvent = keyof EmitterEvent;
