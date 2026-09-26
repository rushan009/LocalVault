export default {
  manifest_version: 3,
  name: "LocalVault",
  version: "1.0.0",
  description: "Encrypted local document vault",
  action: {
    default_popup: "index.html"
  },
  permissions: ["storage", "contextMenus"],
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content.js"]
    }
  ],
  background: {
    service_worker: "src/background.js"
  },
  contextMenus: [
    {
      id: "use-from-local-vault",
      title: "Use from Local Vault",
      contexts: ["link", "image", "video", "audio"]
    }
  ]
}