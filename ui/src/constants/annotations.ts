// plugin
export enum pluginAnnotations {
  DISPLAY_NAME = "plugin.halo.run/display-name",
}

// rbac
export enum rbacAnnotations {
  MODULE = "rbac.authorization.halo.run/module",
  ROLE_NAMES = "rbac.authorization.halo.run/role-names",
  DISPLAY_NAME = "rbac.authorization.halo.run/display-name",
  DEPENDENCIES = "rbac.authorization.halo.run/dependencies",
  AVATAR_ATTACHMENT_NAME = "halo.run/avatar-attachment-name",
  LAST_AVATAR_ATTACHMENT_NAME = "halo.run/last-avatar-attachment-name",
  DISALLOW_ACCESS_CONSOLE = "rbac.authorization.halo.run/disallow-access-console",
}

// content

export enum contentAnnotations {
  PREFERRED_EDITOR = "content.halo.run/preferred-editor",
  PATCHED_CONTENT = "content.halo.run/patched-content",
  PATCHED_RAW = "content.halo.run/patched-raw",
  CONTENT_JSON = "content.halo.run/content-json",
  SCHEDULED_PUBLISH_AT = "content.halo.run/scheduled-publish-at",
}

// pat
export enum patAnnotations {
  ACCESS_TOKEN = "security.halo.run/access-token",
}

// Secret
export enum secretAnnotations {
  DESCRIPTION = "secret.halo.run/description",
}

// storage
export enum storageAnnotations {
  URI = "storage.halo.run/uri",

  // Frontend custom annotations, for retry operation
  RETRY_TIMESTAMP = "storage.halo.run/retry-timestamp",
}
