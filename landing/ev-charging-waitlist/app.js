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
  intakeApiBaseUrl: "",
  intakeApiDryRun: false,
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

function localDateTimeToIso(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString();
}

function numberOrUndefined(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== "")
  );
}

function formValue(form, name) {
  return String(new FormData(form).get(name) || "").trim();
}

function checkedValues(form, name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
}

function buyerPayload(form) {
  const startAt = localDateTimeToIso(formValue(form, "time_window_start_at"));
  const endAt = localDateTimeToIso(formValue(form, "time_window_end_at"));
  return compactObject({
    request_category: "ev_charging",
    buyer: compactObject({
      name: formValue(form, "buyer_name"),
      phone: formValue(form, "buyer_phone"),
      email: formValue(form, "buyer_email"),
    }),
    location: compactObject({
      address: formValue(form, "location_address"),
      safe_waiting_note: formValue(form, "safe_waiting_note"),
    }),
    urgency: formValue(form, "urgency"),
    time_window: compactObject({
      start_at: startAt,
      end_at: endAt,
    }),
    vehicle: compactObject({
      make: formValue(form, "vehicle_make"),
      model: formValue(form, "vehicle_model"),
      year: numberOrUndefined(formValue(form, "vehicle_year")),
    }),
    acquisition: {
      channel: "waitlist_page",
      campaign: "ev_charging_pilot",
      source_detail: window.location.href,
    },
    battery_level_percent: numberOrUndefined(formValue(form, "battery_level_percent")),
    connector_type: formValue(form, "connector_type"),
    charge_needed_kwh: numberOrUndefined(formValue(form, "charge_needed_kwh")),
    max_budget_usd: numberOrUndefined(formValue(form, "max_budget_usd")),
    notes: formValue(form, "notes"),
  });
}

function providerPayload(form) {
  const connectors = checkedValues(form, "connector_types");
  if (connectors.length === 0) {
    throw new Error("Choose at least one connector type.");
  }

  return compactObject({
    request_category: "ev_charging",
    provider_type: formValue(form, "provider_type"),
    business_name: formValue(form, "business_name"),
    contact: compactObject({
      name: formValue(form, "contact_name"),
      phone: formValue(form, "contact_phone"),
      email: formValue(form, "contact_email"),
    }),
    service_area: compactObject({
      home_base_address: formValue(form, "home_base_address"),
      radius_miles: numberOrUndefined(formValue(form, "radius_miles")),
      states_served: ["IL"],
    }),
    connector_types: connectors,
    availability: compactObject({
      status: formValue(form, "availability_status"),
      notes: formValue(form, "availability_notes"),
    }),
    acquisition: {
      channel: "waitlist_page",
      campaign: "ev_charging_pilot",
      source_detail: window.location.href,
    },
    pricing_model: formValue(form, "pricing_model"),
    insured: formValue(form, "insured") === "yes",
    notes: formValue(form, "notes"),
  });
}

function setFormStatus(form, tone, message) {
  const status = form.querySelector("[data-form-status]");
  if (!status) {
    return;
  }

  status.dataset.tone = tone;
  status.textContent = message;
}

function setFormPending(form, pending) {
  const button = form.querySelector("[data-submit-label]");
  if (!button) {
    return;
  }

  button.disabled = pending;
  button.textContent = pending ? "Sending..." : button.dataset.defaultLabel;
}

function intakeSubmitUrl(baseUrl, kind) {
  if (baseUrl.includes("/functions/v1/intake-staging")) {
    return `${baseUrl}/${kind}`;
  }

  return `${baseUrl}/api/intake/${kind}/staging`;
}

function configureIntakeForms(config) {
  const baseUrl = String(config.intakeApiBaseUrl || "").trim().replace(/\/$/, "");

  document.querySelectorAll("[data-intake-form]").forEach((form) => {
    const kind = form.dataset.intakeForm;
    const submitButton = form.querySelector("[data-submit-label]");
    if (submitButton) {
      submitButton.dataset.defaultLabel = submitButton.textContent;
    }

    if (!baseUrl) {
      form.dataset.backendReady = "false";
      if (submitButton) {
        submitButton.disabled = true;
      }
      setFormStatus(form, "info", "Email intake is active while the backend endpoint is being connected.");
      return;
    }

    form.dataset.backendReady = "true";
    if (submitButton) {
      submitButton.disabled = false;
    }
    setFormStatus(form, "info", "Secure intake endpoint is ready.");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let payload;
      try {
        payload = kind === "provider" ? providerPayload(form) : buyerPayload(form);
      } catch (error) {
        setFormStatus(form, "error", error instanceof Error ? error.message : "Check the form and try again.");
        return;
      }
      setFormPending(form, true);
      setFormStatus(form, "info", "Sending intake details...");

      try {
        const dryRunQuery = config.intakeApiDryRun ? "?dry_run=1" : "";
        const response = await fetch(`${intakeSubmitUrl(baseUrl, kind)}${dryRunQuery}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "The intake endpoint could not save this request.");
        }
        form.reset();
        setFormStatus(form, "success", "Saved. Oasis Now will review this intake and follow up.");
      } catch (error) {
        setFormStatus(
          form,
          "error",
          error instanceof Error ? error.message : "The intake endpoint could not save this request."
        );
      } finally {
        setFormPending(form, false);
      }
    });
  });
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
  configureIntakeForms(config);
}

main();
