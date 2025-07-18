<script lang="ts" setup>
import { i18n } from "@/locales";
import type { ProblemDetail } from "@/setup/setupApiClient";
import { createHTMLContentModal } from "@/utils/modal";
import { Toast } from "@halo-dev/components";
import type { Restrictions } from "@uppy/core";
import Uppy, { type SuccessResponse } from "@uppy/core";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import ImageEditor from "@uppy/image-editor";
import "@uppy/image-editor/dist/style.min.css";
import en_US from "@uppy/locales/lib/en_US";
import zh_CN from "@uppy/locales/lib/zh_CN";
import zh_TW from "@uppy/locales/lib/zh_TW";
import { Dashboard } from "@uppy/vue";
import XHRUpload from "@uppy/xhr-upload";
import objectHash from "object-hash";
import { computed, h, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    restrictions?: Restrictions;
    meta?: Record<string, unknown>;
    autoProceed?: boolean;
    allowedMetaFields?: string[];
    endpoint: string;
    name?: string;
    note?: string;
    method?: "GET" | "POST" | "PUT" | "HEAD" | "get" | "post" | "put" | "head";
    disabled?: boolean;
    width?: string;
    height?: string;
    doneButtonHandler?: () => void;
  }>(),
  {
    restrictions: undefined,
    meta: undefined,
    autoProceed: false,
    allowedMetaFields: undefined,
    name: "file",
    note: undefined,
    method: "post",
    disabled: false,
    width: "750px",
    height: "550px",
    doneButtonHandler: undefined,
  }
);

const emit = defineEmits<{
  (event: "uploaded", response: SuccessResponse): void;
  (event: "error", file, response): void;
}>();

const locales = {
  en: en_US,
  zh: zh_CN,
  "en-US": en_US,
  "zh-CN": zh_CN,
  "zh-TW": zh_TW,
};

const uppy = computed(() => {
  return new Uppy({
    locale: locales[i18n.global.locale.value] || locales["zh-CN"],
    meta: props.meta,
    restrictions: props.restrictions,
    autoProceed: props.autoProceed,
  })
    .use(XHRUpload, {
      endpoint: `${props.endpoint}`,
      allowedMetaFields: props.allowedMetaFields,
      withCredentials: true,
      formData: true,
      fieldName: props.name,
      method: props.method,
      limit: 5,
      timeout: 0,
      getResponseError: (responseText: string, response: unknown) => {
        try {
          const response = JSON.parse(responseText);
          if (typeof response === "object" && response && response) {
            const { title, detail } = (response || {}) as ProblemDetail;
            const message = [title, detail].filter(Boolean).join(": ");

            if (message) {
              Toast.error(message, { duration: 5000 });

              return new Error(message);
            }
          }
        } catch (_) {
          const responseBody = response as XMLHttpRequest;
          const { status, statusText } = responseBody;
          const defaultMessage = [status, statusText].join(": ");

          // Catch error requests where the response is text/html,
          // which usually comes from a reverse proxy or WAF
          // fixme: Because there is no responseType in the response, we can only judge it in this way for now.
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            responseBody.response,
            "text/html"
          );

          if (
            Array.from(doc.body.childNodes).some((node) => node.nodeType === 1)
          ) {
            createHTMLContentModal({
              uniqueId: objectHash(responseBody.response || ""),
              title: responseBody.status.toString(),
              width: 700,
              height: "calc(100vh - 20px)",
              centered: true,
              content: h("iframe", {
                srcdoc: responseBody.response,
                sandbox: "",
                referrerpolicy: "no-referrer",
                loading: "lazy",
                style: {
                  width: "100%",
                  height: "100%",
                },
              }),
            });

            return new Error(defaultMessage);
          }

          Toast.error(defaultMessage, { duration: 5000 });
          return new Error(defaultMessage);
        }
        return new Error("Internal Server Error");
      },
    })
    .use(ImageEditor, {
      locale: {
        strings: {
          revert: i18n.global.t("core.components.uppy.image_editor.revert"),
          rotate: i18n.global.t("core.components.uppy.image_editor.rotate"),
          zoomIn: i18n.global.t("core.components.uppy.image_editor.zoom_in"),
          zoomOut: i18n.global.t("core.components.uppy.image_editor.zoom_out"),
          flipHorizontal: i18n.global.t(
            "core.components.uppy.image_editor.flip_horizontal"
          ),
          aspectRatioSquare: i18n.global.t(
            "core.components.uppy.image_editor.aspect_ratio_square"
          ),
          aspectRatioLandscape: i18n.global.t(
            "core.components.uppy.image_editor.aspect_ratio_landscape"
          ),
          aspectRatioPortrait: i18n.global.t(
            "core.components.uppy.image_editor.aspect_ratio_portrait"
          ),
        },
      },
    });
});

uppy.value.on("upload-success", (_, response: SuccessResponse) => {
  emit("uploaded", response);
});

uppy.value.on("upload-error", (file, _, response) => {
  emit("error", file, response);
});

onUnmounted(() => {
  uppy.value.close({ reason: "unmount" });
});
</script>

<template>
  <dashboard
    class="w-full"
    :uppy="uppy"
    :props="{
      theme: 'light',
      disabled: disabled,
      note: note,
      width,
      height,
      doneButtonHandler: doneButtonHandler,
    }"
  />
</template>
