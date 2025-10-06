import { animate } from "motion";
import {
    computed,
    onMounted,
    onUnmounted,
    ref,
    toValue,
    type MaybeRefOrGetter,
    type TemplateRef,
} from "vue";
import {
    type CloseMode,
    type ToastAnimations,
    type ToastState,
} from "./internal/types";
import { useAttributes } from "./useAttributes";
import { injectCore } from "./useCore";

/**
 * Composable used by a toast component instance to handle lifecycle,
 * animations, and interactions.
 *
 * The function wires up enter/leave animations, progress for auto-close,
 * click/action handlers and exposes a compact API used by template bindings.
 *
 * @param rootEl - A template ref pointing to the toast root DOM element.
 * @returns An object with reactive state and methods for toast behavior.
 */
export function useCreate(rootEl: TemplateRef) {
    const loaded = ref(false);
    const paused = ref(false);
    const closing = ref(false);
    const loading = ref(false);
    const progress = ref(0);
    const interval = ref(0);
    const core = injectCore();
    const { index, count, isCollapsed, emitter, animations, options, attrs } =
        useAttributes();
    const animator = useAnimator(
        rootEl,
        closing,
        isCollapsed,
        computed(() => isCollapsed.value && index.value < count.value - 3),
        animations
    );

    const isActive = computed(
        () => !isCollapsed.value || index.value === count.value - 1
    );
    const isSecondary = computed(
        () => isCollapsed.value && index.value === count.value - 2
    );
    const isTertiary = computed(
        () => isCollapsed.value && index.value === count.value - 3
    );
    const isHidden = computed(
        () => isCollapsed.value && index.value < count.value - 3
    );
    const isClosable = computed(
        () =>
            options.value?.mode !== "sticky" &&
            options.value?.duration &&
            options.value?.duration > 0
    );

    // Internal close handler. Emits a removing event and runs leave animation
    // before invoking the `onClose` callback and removing the toast from core.
    function _close(mode: CloseMode) {
        if (emitter.value && options.value?.key) {
            emitter.value.emit("removing", options.value.key);
        }

        animator
            .leave(() => (closing.value = true))
            ?.then(() => {
                options.value?.onClose?.(mode);
                core?.removeToast(
                    options.value?.container || "",
                    options.value?.identifier || ""
                );
            });
    }

    /**
     * Click handler bound to the root element. If an `onClick` handler is
     * provided it will be awaited; otherwise a simple close is performed when
     * the toast is closable.
     */
    function _onClick() {
        if (loading.value || closing.value) return;

        if (typeof options.value?.onClick === "function") {
            loading.value = true;
            options.value
                .onClick()
                .then((res) => {
                    loading.value = false;
                    if (res) _close("manual");
                })
                .catch(() => (loading.value = false));
        } else if (options.value?.closable === true) {
            _close("manual");
        }
    }

    /**
     * Respond to external state changes emitted by the container emitter.
     * The states map to animator helpers which run corresponding animations.
     *
     * @param state - The state name delivered by the emitter.
     */
    function _onStateChange(state: ToastState) {
        if (state === "activate") {
            animator.activate();
        } else if (state === "secondary") {
            animator.secondary();
        } else if (state === "tertiary") {
            animator.tertiary();
        } else if (state === "hide") {
            animator.hide();
        } else if (state === "remove") {
            _close("manual");
        }
    }

    // Public helpers exposed to templates/components
    function close() {
        if (loading.value || closing.value) return;
        _close("manual");
    }

    function pause() {
        paused.value = true;
    }

    function resume() {
        paused.value = false;
    }

    /**
     * Trigger a named action on the toast (e.g. primary/secondary button).
     * The action handler can optionally close the toast by resolving `true`.
     *
     * @param key - Action key.
     * @param data - Optional payload passed to the action handler.
     */
    function action(key: string, data?: unknown) {
        if (
            loading.value ||
            closing.value ||
            typeof options.value?.onAction !== "function"
        ) {
            return;
        }

        loading.value = true;
        options.value
            .onAction(key, data)
            .then((res) => {
                loading.value = false;
                if (res) _close("action");
            })
            .catch(() => (loading.value = false));
    }

    onMounted(() => {
        if (emitter.value && options.value?.key) {
            emitter.value.emit("added", options.value.key);
        }

        // Run enter animation and execute onOpen callback
        animator.enter()?.then((k) => {
            if (k === "error") return;
            loaded.value = true;
            options.value?.onOpen?.();
        });

        // register global mouse listener
        const el = toValue(rootEl) as HTMLElement;
        el?.addEventListener("click", _onClick);
        el?.addEventListener("mouseenter", () => pause());
        el?.addEventListener("mouseleave", () => resume());

        // Initialize auto-close progress bar if toast is closable
        if (isClosable.value) {
            interval.value = window.setInterval(() => {
                if (progress.value >= 100) {
                    window.clearInterval(interval.value);
                    _close("timer");
                } else if (
                    loaded.value &&
                    !closing.value &&
                    !loading.value &&
                    !paused.value
                ) {
                    progress.value = Math.min(
                        100,
                        progress.value + 100 / (options.value!.duration * 100)
                    );
                }
            }, 10);
        }

        // Setup global listeners for per-toast state changes
        if (options.value?.identifier) {
            emitter.value?.on(options.value?.identifier, _onStateChange);
        }
    });

    onUnmounted(() => {
        // Clean up the auto-close interval when the component is unmounted
        if (interval.value) {
            window.clearInterval(interval.value);
        }

        // Cleanup global listeners
        if (options.value?.identifier) {
            emitter.value?.off(options.value?.identifier, _onStateChange);
        }
    });

    return {
        attrs,
        options,
        loaded,
        paused,
        loading,
        progress,
        close,
        pause,
        resume,
        action,
        isActive,
        isSecondary,
        isTertiary,
        isHidden,
        isClosable,
        index,
        count,
    };
}

/**
 * Animator helper that runs motion animations for enter/leave and stacking
 * transitions. The helper uses the `motion` package and resolves with a
 * status string indicating success, error or ignored.
 *
 * @param element - Template ref to the toast DOM element.
 * @param isClosing - Ref/Getter indicating whether the toast is closing.
 * @param isHidden - Ref/Getter indicating the toast should be hidden (stacked away).
 * @param isCollapsed - Ref/Getter indicating parent is collapsed.
 * @param animations - Optional animation overrides to use instead of defaults.
 * @returns An object with methods: `enter`, `leave`, `activate`,
 *          `secondary`, `tertiary`, `hide`.
 */
function useAnimator(
    element: TemplateRef,
    isClosing: MaybeRefOrGetter<boolean>,
    isCollapsed: MaybeRefOrGetter<boolean>,
    isHidden: MaybeRefOrGetter<boolean>,
    animations: MaybeRefOrGetter<ToastAnimations | undefined>
) {
    const unrefEl = () => toValue(element) as HTMLElement;
    const unrefAnim = () => toValue(animations);
    const unrefParent = () => unrefEl()?.parentElement;

    /**
     * Run the configured enter animation for the element unless closing or
     * hidden. Resolves with "done"/"ignored"/"error".
     */
    function enter() {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (toValue(isCollapsed)
            ? anim?.stackEnter?.params
            : anim?.enter?.params) || { opacity: [0, 1] };
        const options = (toValue(isCollapsed)
            ? anim?.stackEnter?.options
            : anim?.enter?.options) || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el || toValue(isHidden)) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /**
     * Run the configured leave animation. Calls `before` callback right
     * before starting animation to allow the caller to change local state.
     */
    function leave(before?: () => void) {
        if (toValue(isClosing)) return;

        const el = unrefEl();
        const anim = unrefAnim();
        const params = (toValue(isCollapsed)
            ? anim?.stackLeave?.params
            : anim?.leave?.params) || { opacity: 0 };
        const options = (toValue(isCollapsed)
            ? anim?.stackLeave?.options
            : anim?.leave?.options) || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el || toValue(isHidden)) {
                before?.();
                resolve("ignored");
            } else {
                before?.();
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /**
     * Animate the element's parent to the active (top) position.
     */
    function activate() {
        if (toValue(isClosing)) return;

        const el = unrefParent();
        const anim = unrefAnim();
        const params = anim?.activate?.params || { scale: 1, opacity: [0, 1] };
        const options = anim?.activate?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /**
     * Animate the parent into the secondary state (one layer back).
     */
    function secondary() {
        if (toValue(isClosing)) return;

        const el = unrefParent();
        const anim = unrefAnim();
        const params = anim?.secondary?.params || { scale: 0.9 };
        const options = anim?.secondary?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /**
     * Animate the parent into the tertiary state (two layers back).
     */
    function tertiary() {
        if (toValue(isClosing)) return;

        const el = unrefParent();
        const anim = unrefAnim();
        const params = anim?.tertiary?.params || { scale: 0.8 };
        const options = anim?.tertiary?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    /**
     * Animate the parent into the hidden state (pushed far back or hidden).
     */
    function hide() {
        if (toValue(isClosing)) return;

        const el = unrefParent();
        const anim = unrefAnim();
        const params = anim?.hide?.params || { opacity: 0 };
        const options = anim?.hide?.options || { duration: 0.2 };

        return new Promise<"ignored" | "done" | "error">((resolve) => {
            if (!el) {
                resolve("ignored");
            } else {
                animate(el, params, options)
                    .then(() => resolve("done"))
                    .catch(() => resolve("error"));
            }
        });
    }

    return {
        enter,
        leave,
        activate,
        secondary,
        tertiary,
        hide,
    };
}
