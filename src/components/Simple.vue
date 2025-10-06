<script setup lang="ts">
import type { Component, Raw } from "vue";
import BaseToast from "./BaseToast.vue";

defineProps<{
    message: string;
    title?: string;
    primary?: string;
    secondary?: string;
    icon?: Raw<Component>;
}>();
</script>
<template>
    <BaseToast>
        <template #icon>
            <component :is="icon" v-if="icon" />
        </template>
        <template #actions="props">
            <button
                class="toast-action is-secondary"
                @click.prevent.stop="props?.action('secondary')"
                v-if="secondary"
            >
                {{ secondary }}
            </button>
            <button
                class="toast-action"
                @click.prevent.stop="props?.action('primary')"
                v-if="primary"
            >
                {{ primary }}
            </button>
        </template>
        <h6 v-if="title">{{ title }}</h6>
        <p>{{ message }}</p>
    </BaseToast>
</template>
