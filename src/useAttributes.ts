import { isBoolean, isNumber, isObject } from "@termeh-v/utils";
import type { Emitter } from "mitt";
import { computed, useAttrs } from "vue";
import {
    type EmitterEvent,
    type ToastAnimations,
    type ToastProps,
} from "./internal/types";

/**
 * Composable that normalizes and exposes toast-related attributes from Vue's
 * `$attrs` as typed computed refs.
 *
 * The composable supports both kebab-case (`vt-index`) and camelCase
 * (`vtIndex`) attribute keys and exposes safe typed accessors for common
 * toast values.
 *
 * @returns An object with computed refs: `index`, `count`, `isCollapsed`,
 *          `emitter`, `animations`, `options` and `attrs`.
 */
export function useAttributes() {
    const attributes = useAttrs();

    /**
     * Convert a value to a number if valid.
     *
     * @param v - Value to coerce.
     * @returns A number if `v` is numeric, otherwise `undefined`.
     */
    function numSafe(v: unknown): number | undefined {
        return isNumber(v) ? v : undefined;
    }

    /**
     * Convert a value to a boolean if valid.
     *
     * @param v - Value to coerce.
     * @returns A boolean if `v` is boolean, otherwise `undefined`.
     */
    function boolSafe(v: unknown): boolean | undefined {
        return isBoolean(v) ? v : undefined;
    }

    /**
     * Convert a value to an object of a specific shape if valid.
     *
     * @template T - Expected object type.
     * @param v - Value to coerce.
     * @returns The typed object or `undefined`.
     */
    function objectSafe<T extends object>(v: unknown): T | undefined {
        return isObject<T>(v) ? v : undefined;
    }

    /** Computed ref for the toast index (defaults to 0). */
    const index = computed<number>(
        () =>
            numSafe(attributes["vt-index"]) ??
            numSafe(attributes["vtIndex"]) ??
            0
    );

    /** Computed ref for the container toast count (defaults to 0). */
    const count = computed(
        () =>
            numSafe(attributes["vt-count"]) ??
            numSafe(attributes["vtCount"]) ??
            0
    );

    /** Computed ref that indicates whether this toast is in a collapsed stack. */
    const isCollapsed = computed(
        () =>
            boolSafe(attributes["vt-is-collapsed"]) ??
            boolSafe(attributes["vtIsCollapsed"]) ??
            false
    );

    /** Computed ref for the container's event emitter instance if provided. */
    const emitter = computed(
        () =>
            objectSafe<Emitter<EmitterEvent>>(attributes["vt-emitter"]) ??
            objectSafe<Emitter<EmitterEvent>>(attributes["vtEmitter"]) ??
            undefined
    );

    /** Computed ref for per-toast animation overrides. */
    const animations = computed(
        () =>
            objectSafe<ToastAnimations>(attributes["vt-animations"]) ??
            objectSafe<ToastAnimations>(attributes["vtAnimations"]) ??
            undefined
    );

    /** Computed ref for toast options passed via attributes (vt-options/vtOptions). */
    const options = computed(
        () =>
            objectSafe<ToastProps>(attributes["vt-options"]) ??
            objectSafe<ToastProps>(attributes["vtOptions"]) ??
            undefined
    );

    /**
     * Computed object containing attributes that are not reserved by the
     * toast system. Useful for forwarding arbitrary attributes to inner
     * elements.
     */
    const attrs = computed(() => {
        const reservedKeys = new Set([
            "vt-index",
            "vtIndex",
            "vt-count",
            "vtCount",
            "vt-is-collapsed",
            "vtIsCollapsed",
            "vt-emitter",
            "vtEmitter",
            "vt-animations",
            "vtAnimations",
            "vt-options",
            "vtOptions",
        ]);

        return Object.fromEntries(
            Object.entries(attributes || {}).filter(
                ([k]) => !reservedKeys.has(k)
            )
        );
    });

    return {
        index,
        count,
        isCollapsed,
        emitter,
        animations,
        options,
        attrs,
    };
}
