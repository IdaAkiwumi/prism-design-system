// ============================================================
// DYNAMIC THEME LOADER – pulls from generated tokens/*.json
// ============================================================

const form = document.getElementById("specForm");
const jsonOutput = document.getElementById("jsonOutput");
const copyJsonBtn = document.getElementById("copyJsonBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");

const themePreviewSurface = document.getElementById("themePreviewSurface");
const uiCard = document.getElementById("uiCard");
const previewTitle = document.getElementById("previewTitle");
const previewBody = document.getElementById("previewBody");
const previewBadge = document.getElementById("previewBadge");
const livePreviewButton = document.getElementById("livePreviewButton");
const secondaryPreviewButton = document.getElementById("secondaryPreviewButton");
const figmaEmbed = document.getElementById("figmaEmbed");

const FIGMA_FILE_URL = "https://www.figma.com/design/UKSBj9G6nXoBrjQKKuFPWS/Prism-Design-System---Agentic-UI-Pattern-Example?node-id=0-1&t=VrDGGgsvbFo0A4LK-1";

// Helper: darken a hex colour by a percentage (e.g., 0.15 = 15%)
function darkenColor(hex, percent) {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const newR = Math.floor(r * (1 - percent));
  const newG = Math.floor(g * (1 - percent));
  const newB = Math.floor(b * (1 - percent));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

// Global store for loaded theme data
let themeMap = {};
let tokenLoaded = false;

// Load all theme JSON files and semantic.json
async function loadTokens() {
  try {
    console.log("Loading design tokens from /tokens/themes/ ... - app.js:40");

    const [base, entertainment, education, semantic] = await Promise.all([
      fetch('tokens/themes/base.json - app.js:43').then(res => { if (!res.ok) throw new Error(`base.json ${res.status}`); return res.json(); }).catch(e => { console.warn("base.json failed", e); return {}; }),
      fetch('tokens/themes/entertainment.json - app.js:44').then(res => { if (!res.ok) throw new Error(`entertainment.json ${res.status}`); return res.json(); }).catch(e => { console.warn("entertainment.json failed", e); return {}; }),
      fetch('tokens/themes/education.json - app.js:45').then(res => { if (!res.ok) throw new Error(`education.json ${res.status}`); return res.json(); }).catch(e => { console.warn("education.json failed", e); return {}; }),
      fetch('tokens/semantic.json').then(res => res.ok ? res.json() : {}).catch(() => ({}))
    ]);

    // Extract feedback colours
    const feedback = semantic.color?.feedback || {};
    const success = feedback.success?.$value || "#00AA44";
    const warning = feedback.warning?.$value || "#F4A300";
    const danger = feedback.danger?.$value || "#E50914";

    // Helper to build a theme object from loaded JSON vars
    const buildTheme = (themeName, themeVars) => {
      const primary = themeVars["color-action-primary"] || (themeName === 'base' ? "#0066CC" : (themeName === 'entertainment' ? "#E50914" : "#F4A300"));
      const primaryHover = darkenColor(primary, 0.15);
      const textPrimary = themeVars["color-text-primary"] || (themeName === 'entertainment' ? "#FFFFFF" : "#111111");
      // Read border-radius token if present, otherwise fallback by theme name
      let radius = themeVars["border-radius-default"];
      if (!radius) {
        radius = themeName === 'entertainment' ? "0px" : (themeName === 'education' ? "10px" : "6px");
      }
      const radiusInt = parseInt(radius, 10) || 6;

      return {
        surfaceClass: `theme-${themeName}-surface`,
        cardClass: `theme-${themeName}-card`,
        actionPrimary: primary,
        actionPrimaryHover: primaryHover,
        success: success,
        warning: warning,
        danger: danger,
        textPrimary: textPrimary,
        textInverse: "#FFFFFF",
        textDisabled: "#9CA3AF",
        defaultRadius: radiusInt
      };
    };

    themeMap = {
      base: buildTheme('base', base),
      entertainment: buildTheme('entertainment', entertainment),
      education: buildTheme('education', education)
    };

    tokenLoaded = true;
    console.log("✅ Design tokens loaded. Theme map: - app.js:89", themeMap);
    renderSpec(); // re-render after load
  } catch (err) {
    console.error("❌ Fatal error loading design tokens - app.js:92", err);
    tokenLoaded = false;
    if (uiCard) uiCard.style.border = "2px solid red";
    if (previewBody) previewBody.innerText = "Error loading design tokens. Check console.";
  }
}

// Note parsing and UI update
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
  if (noteFlags.subtle || noteFlags.quiet) computed.variant = "ghost";
  if (noteFlags.loud || noteFlags.bold) computed.variant = "primary";
  if (noteFlags.bolder || noteFlags.bold) computed.fontSize = 16;
  if (noteFlags.cinematic) { computed.radius = 0; computed.paddingX = 20; }
  if (noteFlags.soft || noteFlags.friendly) computed.radius = 12;
  if (noteFlags.uppercase) computed.label = computed.label.toUpperCase();
  return { ...spec, computed };
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

function badgeConfigForState(badgeState) {
  if (badgeState === "warning") return { className: "badge-warning", label: "Needs review" };
  if (badgeState === "danger") return { className: "badge-danger", label: "At risk" };
  return { className: "badge-success", label: "Recently approved" };
}

function applyPreview(spec) {
  if (!tokenLoaded) {
    console.warn("Tokens not loaded yet, skipping preview update - app.js:160");
    return spec;
  }
  const finalSpec = applyNoteTweaks(spec);
  const themeTokens = themeMap[finalSpec.computed.theme] || themeMap.base;
  const badge = badgeConfigForState(finalSpec.computed.badgeState);

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
  const buttonRadius = finalSpec.computed.radius !== null ? finalSpec.computed.radius : themeTokens.defaultRadius;
  livePreviewButton.style.borderRadius = `${buttonRadius}px`;
  livePreviewButton.style.padding = `10px ${finalSpec.computed.paddingX}px`;
  livePreviewButton.style.fontSize = `${finalSpec.computed.fontSize}px`;
  livePreviewButton.style.opacity = "1";
  livePreviewButton.style.transform = "none";
  livePreviewButton.style.boxShadow = "none";

  secondaryPreviewButton.style.borderColor = themeTokens.actionPrimary;
  secondaryPreviewButton.style.color = themeTokens.actionPrimary;
  secondaryPreviewButton.style.borderRadius = `${buttonRadius}px`;

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
  if (!url || url === "PASTE_YOUR_FIGMA_FILE_URL_HERE") return "";
  let embedUrl = url.trim();
  if (embedUrl.includes("www.figma.com")) embedUrl = embedUrl.replace("www.figma.com", "embed.figma.com");
  else if (embedUrl.includes("figma.com") && !embedUrl.includes("embed.figma.com")) embedUrl = embedUrl.replace("figma.com", "embed.figma.com");
  if (!embedUrl.includes("embed-host=")) embedUrl += (embedUrl.includes("?") ? "&" : "?") + "embed-host=prism-playground";
  if (!embedUrl.includes("theme=")) embedUrl += "&theme=light";
  if (!embedUrl.includes("footer=")) embedUrl += "&footer=false";
  if (!embedUrl.includes("page-selector=")) embedUrl += "&page-selector=true";
  return embedUrl;
}

function loadFigmaEmbed() {
  const embedUrl = toEmbedUrl(FIGMA_FILE_URL);
  if (embedUrl) figmaEmbed.src = embedUrl;
}

// Event listeners
form.addEventListener("submit", (e) => { e.preventDefault(); renderSpec(); });
copyJsonBtn.addEventListener("click", async () => {
  const text = jsonOutput.textContent || JSON.stringify(renderSpec(), null, 2);
  try {
    await navigator.clipboard.writeText(text);
    alert("JSON copied to clipboard.");
  } catch (error) { alert("Could not copy JSON. Please copy it manually."); }
});
downloadJsonBtn.addEventListener("click", () => {
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
["theme", "variant", "state", "label", "badgeState", "cardTitle", "cardBody", "notes"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", renderSpec);
    el.addEventListener("change", renderSpec);
  }
});

loadTokens().then(() => {
  renderSpec();
  loadFigmaEmbed();
});