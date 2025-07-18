import { Toast } from "@halo-dev/components";
import { useLocalStorage } from "@vueuse/core";
import { debounce } from "lodash-es";
import { computed, type Ref } from "vue";
import { useI18n } from "vue-i18n";
export interface ContentCache {
  name: string;
  content?: string;
  version: number;
}

interface useContentCacheReturn {
  handleResetCache: () => void;
  handleSetContentCache: () => void;
  handleClearCache: (name?: string) => void;
  currentCache: Ref<ContentCache | undefined>;
}

export function useContentCache(
  key: string,
  name: Ref<string | undefined>,
  raw: Ref<string | undefined>,
  contentVersion: Ref<number>
): useContentCacheReturn {
  const content_caches = useLocalStorage<ContentCache[]>(key, []);
  const currentCache = computed<ContentCache | undefined>(() => {
    if (content_caches.value.length > 0) {
      if (name.value) {
        return content_caches.value.find(
          (c: ContentCache) => c.name === name.value
        );
      } else {
        return content_caches.value.find((c: ContentCache) => c.name === "");
      }
    }
    return undefined;
  });

  const { t } = useI18n();

  const handleResetCache = () => {
    let cache: ContentCache | undefined;
    if (name.value) {
      cache = content_caches.value.find(
        (c: ContentCache) => c.name === name.value
      );
    } else {
      cache = content_caches.value.find(
        (c: ContentCache) => c.name === "" && c.content
      );
    }
    if (!cache) {
      return;
    }
    if (cache.version != contentVersion.value) {
      // TODO save the local offline cached content as a historical version
      handleClearCache(name.value);
      return;
    }
    Toast.info(t("core.composables.content_cache.toast_recovered"));
    raw.value = cache.content;
    handleClearCache(name.value);
  };

  const handleSetContentCache = debounce(() => {
    let cache: ContentCache | undefined;
    if (name.value) {
      cache = content_caches.value.find(
        (c: ContentCache) => c.name === name.value
      );
    } else {
      cache = content_caches.value.find((c: ContentCache) => c.name === "");
    }
    if (cache) {
      cache.content = raw?.value;
    } else {
      content_caches.value.push({
        name: name.value || "",
        content: raw?.value,
        version: contentVersion.value,
      });
    }
  }, 500);

  const handleClearCache = (name?: string) => {
    let index: number;
    if (name) {
      index = content_caches.value.findIndex(
        (c: ContentCache) => c.name === name
      );
    } else {
      index = content_caches.value.findIndex(
        (c: ContentCache) => c.name === ""
      );
    }
    if (index > -1) {
      content_caches.value.splice(index, 1);
    }
  };

  return {
    handleClearCache,
    handleResetCache,
    handleSetContentCache,
    currentCache,
  };
}
