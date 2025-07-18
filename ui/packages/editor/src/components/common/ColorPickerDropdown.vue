<script lang="ts" setup>
import { i18n } from "@/locales";
import type { Payload } from "@ckpack/vue-color";
import { Sketch } from "@ckpack/vue-color";
import { Dropdown as VDropdown } from "floating-vue";
import tailwindcssColors from "tailwindcss/colors";
import MdiChevronRight from "~icons/mdi/chevron-right";
import MdiPalette from "~icons/mdi/palette";

interface Color {
  color: string;
  name: string;
}

withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  {
    modelValue: undefined,
  }
);

const emit = defineEmits<{
  (emit: "update:modelValue", value?: string): void;
}>();

function getColors(): Color[] {
  const result: Color[] = [];

  const colors: { [key: string]: { [key: string]: string } } = Object.keys(
    tailwindcssColors
  ).reduce((acc, key) => {
    if (
      [
        "gray",
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
      ].includes(key)
    ) {
      // @ts-ignore
      acc[key] = tailwindcssColors[key];
    }
    return acc;
  }, {});

  for (const color in colors) {
    const colorShades = colors[color];
    const colorShadesArr = Object.entries(colorShades);

    const sortedShades = colorShadesArr
      .filter(([shade]) => parseInt(shade) >= 100 && parseInt(shade) <= 900)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    const formattedShades = sortedShades.map(([shade, value]) => ({
      color: value,
      name: `${color} ${shade}`,
    }));

    result.push(...formattedShades);
  }

  return result;
}

function handleSetColor(color: string) {
  emit("update:modelValue", color);
}

function onColorChange(color: Payload) {
  handleSetColor(color.hex);
}
</script>

<template>
  <VDropdown class="inline-flex items-center">
    <slot />
    <template #popper>
      <slot name="prefix" />
      <div class="grid grid-cols-9 gap-1.5 p-2 pt-1">
        <div
          v-for="item in getColors()"
          :key="item.color"
          :style="{ backgroundColor: item.color }"
          class="h-5 w-5 cursor-pointer rounded-sm ring-gray-300 ring-offset-1 hover:ring-1"
          :title="item.name"
          @click="handleSetColor(item.color)"
        ></div>
      </div>

      <VDropdown placement="right">
        <div class="p-1">
          <div
            class="flex cursor-pointer items-center justify-between rounded p-1 hover:bg-gray-100"
          >
            <div class="inline-flex items-center gap-2">
              <MdiPalette />
              <span class="text-xs text-gray-600">
                {{ i18n.global.t("editor.components.color_picker.more_color") }}
              </span>
            </div>
            <div>
              <MdiChevronRight />
            </div>
          </div>
        </div>
        <template #popper>
          <Sketch model-value="#000" @update:model-value="onColorChange" />
        </template>
      </VDropdown>
    </template>
  </VDropdown>
</template>
