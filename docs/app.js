const form = document.getElementById("specForm");
const jsonOutput = document.getElementById("jsonOutput");
const copyJsonBtn = document.getElementById("copyJsonBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const updateEmbedBtn = document.getElementById("updateEmbedBtn");

const figmaUrlInput = document.getElementById("figmaUrl");
const figmaEmbed = document.getElementById("figmaEmbed");
const embedPlaceholder = document.getElementById("embedPlaceholder");

const themePreviewSurface = document.getElementById("themePreviewSurface");
const uiCard = document.getElementById("uiCard");
const previewTitle = document.getElementById("previewTitle");
const previewBody = document.getElementById("previewBody");
const previewBadge = document.getElementById("previewBadge");
const livePreviewButton = document.getElementById("livePreviewButton");
const secondaryPreviewButton = document.getElementById("secondaryPreviewButton");

const themeMap = {
  base: {
    surfaceClass: "theme-base-surface",
    cardClass: "theme-base-card",
    actionPrimary: "#0066CC",
    actionPrimaryHover: "#004C99",
    success: "#00AA44",
    warning: "#F4A300",
    danger: "#E50914",
    textPrimary: "#111111",
    textInverse: "#FFFFFF",
    textDisabled: "#D4D4D4",
    surfaceRaised: "#F5F5F5",
    cardBackground: "#FFFFFF",
    defaultRadius: 6
  },
  entertainment: {
    surfaceClass: "theme-entertainment-surface",
    cardClass: "theme-entertainment-card",
    actionPrimary: "#E50914",
    actionPrimaryHover: "#b50710",
    success: "#00AA44",
    warning: "#F4A300",
    danger: "#E50914",
    textPrimary: "#FFFFFF",
    textInverse: "#FFFFFF",
    textDisabled: "#9CA3AF",
    surfaceRaised: "#1A1A1A",
    cardBackground: "#1A1A1A",
    defaultRadius: 0
  },
  education: {
    surfaceClass: "theme-education-surface",
    cardClass: "theme-education-card",
    actionPrimary: "#F4A300",
    actionPrimaryHover: "#d48d00",
    success: "#00AA44",
    warning: "#F4A300",
    danger: "#E50914",
    textPrimary: "#111111",
    textInverse: "#111111",
    textDisabled: "#9CA3AF",
    surfaceRaised: "#FFF7E8",
    cardBackground: "#FFF7E8",
    defaultRadius: 10
  }
};

function parseNotes(notes) {
  const lower = (notes || "").toLowerCase();

  return {
    bolder: lower.includes("bolder"),
    bold: lower.includes("bold"),
    cinematic: lower.includes("cinematic"),
    soft: lower.includes("soft"),
    friendly: lower.includes("friendly"),
    subtle: lower.includes("subtle"),
    quiet: lower.includes("quiet"),
    loud: lower.includes("loud"),
    uppercase: lower.includes("uppercase")
  };
}

function applyNoteTweaks(spec) {
  const noteFlags = parseNotes(spec.notes);

  const computed = {
    variant: spec.variant,
    state: spec.state,
    theme: spec.theme,
    label: spec.label || "Button",
    badgeState: spec.badgeState,
    title: spec.cardTitle || "Card title",
    body: spec.cardBody || "Card body",
    radius: null,
    fontSize: 14,
    paddingX: 16
  };

  if (noteFlags.subtle || noteFlags.quiet) {
    computed.variant = "ghost";
  }

  if (noteFlags.loud || noteFlags.bold) {
    computed.variant = "primary";
  }

  if (noteFlags.bolder || noteFlags.bold) {
    computed.fontSize = 16;
  }

  if (noteFlags.cinematic) {
    computed.radius = 0;
    computed.paddingX = 20;
  }

  if (noteFlags.soft || noteFlags.friendly) {
    computed.radius = 12;
  }

  if (noteFlags.uppercase) {
    computed.label = computed.label.toUpperCase();
  }

  return {
    ...spec,
    computed
  };
}

function buildSpec() {
  return {
    componentType: document.getElementById("componentType").value,
    theme: document.getElementById("theme").value,
    variant: document.getElementById("variant").value,
    state: document.getElementById("state").value,
    label: document.getElementById("label").value.trim() || "Approve",
    badgeState: document.getElementById("badgeState").value,
    cardTitle: document.getElementById("cardTitle").value.trim() || "Absence notification",
    cardBody: document.getElementById("cardBody").value.trim() || "Card body text",
    notes: document.getElementById("notes").value.trim()
  };
}

function badgeConfigForState(themeTokens, badgeState) {
  if (badgeState === "warning") {
    return {
      className: "badge-warning",
      label: "Needs review"
    };
  }

  if (badgeState === "danger") {
    return {
      className: "badge-danger",
      label: "At risk"
    };
  }

  return {
    className: "badge-success",
    label: "Recently approved"
  };
}

function applyPreview(spec) {
  const finalSpec = applyNoteTweaks(spec);
  const themeTokens = themeMap[finalSpec.computed.theme] || themeMap.base;
  const badge = badgeConfigForState(themeTokens, finalSpec.computed.badgeState);

  themePreviewSurface.className = `preview-surface ${themeTokens.surfaceClass}`;
  uiCard.className = `ui-card ${themeTokens.cardClass}`;

  previewTitle.textContent = finalSpec.computed.title;
  previewBody.textContent = finalSpec.computed.body;

  previewBadge.className = `status-badge ${badge.className}`;
  previewBadge.textContent = badge.label;

  livePreviewButton.textContent = finalSpec.computed.label;

  livePreviewButton.style.border = "none";
  livePreviewButton.style.borderWidth = "0";
  livePreviewButton.style.background = "transparent";
  livePreviewButton.style.color = themeTokens.textPrimary;
  livePreviewButton.style.borderRadius = `${finalSpec.computed.radius ?? themeTokens.defaultRadius}px`;
  livePreviewButton.style.padding = `10px ${finalSpec.computed.paddingX}px`;
  livePreviewButton.style.fontSize = `${finalSpec.computed.fontSize}px`;
  livePreviewButton.style.opacity = "1";
  livePreviewButton.style.transform = "none";
  livePreviewButton.style.boxShadow = "none";

  secondaryPreviewButton.style.borderColor = themeTokens.actionPrimary;
  secondaryPreviewButton.style.color = themeTokens.actionPrimary;
  secondaryPreviewButton.style.borderRadius = `${finalSpec.computed.radius ?? themeTokens.defaultRadius}px`;

  if (finalSpec.computed.variant === "ghost") {
    livePreviewButton.style.background = "transparent";
    livePreviewButton.style.color = themeTokens.actionPrimary;
    livePreviewButton.style.border = `1.5px solid ${themeTokens.actionPrimary}`;
  } else if (finalSpec.computed.variant === "success") {
    livePreviewButton.style.background = themeTokens.success;
    livePreviewButton.style.color = "#FFFFFF";
  } else {
    livePreviewButton.style.background = themeTokens.actionPrimary;
    livePreviewButton.style.color = themeTokens.textInverse;
  }

  if (finalSpec.computed.state === "hover") {
    if (finalSpec.computed.variant === "ghost") {
      livePreviewButton.style.background = "rgba(255,255,255,0.06)";
    } else {
      livePreviewButton.style.background = themeTokens.actionPrimaryHover;
    }
  }

  if (finalSpec.computed.state === "active") {
    livePreviewButton.style.transform = "translateY(1px)";
    livePreviewButton.style.boxShadow = "inset 0 2px 6px rgba(0,0,0,0.18)";
  }

  if (finalSpec.computed.state === "disabled") {
    livePreviewButton.style.background = "#737373";
    livePreviewButton.style.color = "#D4D4D4";
    livePreviewButton.style.border = "none";
    livePreviewButton.style.opacity = "0.8";
  }

  return finalSpec;
}

function renderSpec() {
  const spec = buildSpec();
  const finalSpec = applyPreview(spec);
  jsonOutput.textContent = JSON.stringify(finalSpec, null, 2);
  return finalSpec;
}

function toEmbedUrl(url) {
  if (!url) return "";

  let embedUrl = url.trim();

  if (embedUrl.includes("www.figma.com")) {
    embedUrl = embedUrl.replace("www.figma.com", "embed.figma.com");
  } else if (embedUrl.includes("figma.com") && !embedUrl.includes("embed.figma.com")) {
    embedUrl = embedUrl.replace("figma.com", "embed.figma.com");
  }

  if (!embedUrl.includes("embed-host=")) {
    embedUrl += (embedUrl.includes("?") ? "&" : "?") + "embed-host=prism-github-pages";
  }

  if (!embedUrl.includes("theme=")) {
    embedUrl += "&theme=light";
  }

  if (!embedUrl.includes("footer=")) {
    embedUrl += "&footer=false";
  }

  if (!embedUrl.includes("page-selector=")) {
    embedUrl += "&page-selector=true";
  }

  return embedUrl;
}

function updateEmbed() {
  const rawUrl = figmaUrlInput.value.trim();

  if (!rawUrl) {
    figmaEmbed.src = "";
    figmaEmbed.classList.add("hidden");
    embedPlaceholder.classList.remove("hidden");
    embedPlaceholder.innerHTML = 'Paste your Figma file link on the left, then click <strong>Update Figma Embed</strong>.';
    return;
  }

  const embedUrl = toEmbedUrl(rawUrl);
  figmaEmbed.src = embedUrl;
  figmaEmbed.classList.remove("hidden");
  embedPlaceholder.classList.add("hidden");
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  renderSpec();
});

copyJsonBtn.addEventListener("click", async function () {
  const text = jsonOutput.textContent || JSON.stringify(renderSpec(), null, 2);

  try {
    await navigator.clipboard.writeText(text);
    alert("JSON copied to clipboard.");
  } catch (error) {
    alert("Could not copy JSON. Please copy it manually.");
  }
});

downloadJsonBtn.addEventListener("click", function () {
  const text = jsonOutput.textContent || JSON.stringify(renderSpec(), null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "prism-component-spec.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
});

updateEmbedBtn.addEventListener("click", function () {
  updateEmbed();
});

[
  "theme",
  "variant",
  "state",
  "label",
  "badgeState",
  "cardTitle",
  "cardBody",
  "notes"
].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderSpec);
  document.getElementById(id).addEventListener("change", renderSpec);
});

renderSpec();