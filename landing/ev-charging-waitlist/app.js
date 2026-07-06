const defaultConfig = {
  marketLabel: "Choose a launch market",
  pageModeLabel: "Draft mode",
  buyerCtaUrl: "",
  providerCtaUrl: "",
  buyerCtaLabel: "External buyer waitlist or request form",
  providerCtaLabel: "External provider interest form",
  ctaHelper: "Add buyer and provider links in config.js before hosting this page.",
  ownerLabel: "Assign a launch owner after hosting",
  supportEmailText: "hello@example.com",
};

function getConfig() {
  const custom = window.OASIS_NOW_WAITLIST_CONFIG;
  if (!custom || typeof custom !== "object") {
    return { ...defaultConfig };
  }

  return { ...defaultConfig, ...custom };
}

function setConfigText(config) {
  document.querySelectorAll("[data-config-text]").forEach((element) => {
    const key = element.dataset.configText;
    if (key && typeof config[key] === "string" && config[key].trim()) {
      element.textContent = config[key];
    }
  });
}

function setLinkState(config, key, fallbackLabel) {
  const url = typeof config[key] === "string" ? config[key].trim() : "";
  document.querySelectorAll(`[data-config-link="${key}"]`).forEach((element) => {
    if (url) {
      element.href = url;
      element.removeAttribute("aria-disabled");
      element.removeAttribute("tabindex");
      return;
    }

    element.href = "#launch-checklist";
    element.setAttribute("aria-disabled", "true");
    element.setAttribute("tabindex", "-1");
    if (fallbackLabel) {
      element.setAttribute("aria-label", fallbackLabel);
    }
  });

  return Boolean(url);
}

function setMailto(config) {
  const email = config.supportEmailText?.trim();
  if (!email) {
    return;
  }

  document.querySelectorAll("[data-config-mailto]").forEach((element) => {
    element.href = `mailto:${email}`;
  });
}

function setLaunchStatus({ buyerReady, providerReady }) {
  const status = document.querySelector("[data-config-status]");
  if (!status) {
    return;
  }

  if (buyerReady && providerReady) {
    status.textContent =
      "Both CTA links are configured. This page is ready for a real static host, screenshot capture, and live-proof verification.";
    return;
  }

  if (buyerReady || providerReady) {
    status.textContent =
      "One CTA is configured and one is still missing. Finish both links before treating this page as launch-ready.";
    return;
  }

  status.textContent =
    "Buyer and provider links are still placeholders. Configure both in config.js before hosting.";
}

function main() {
  const config = getConfig();
  setConfigText(config);
  const buyerReady = setLinkState(config, "buyerCtaUrl", "Configure the buyer form URL before hosting.");
  const providerReady = setLinkState(
    config,
    "providerCtaUrl",
    "Configure the provider form URL before hosting."
  );
  setMailto(config);
  setLaunchStatus({ buyerReady, providerReady });
}

main();
