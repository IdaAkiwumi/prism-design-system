figma.showUI(__html__, { width: 420, height: 380 });

const primitives = {
  color: {
    blue: {
      "500": { $value: "#0066CC", $type: "color" },
      "700": { $value: "#004C99", $type: "color" }
    },
    red: {
      "500": { $value: "#E50914", $type: "color" }
    },
    amber: {
      "500": { $value: "#F4A300", $type: "color" }
    },
    gray: {
      "100": { $value: "#F5F5F5", $type: "color" },
      "500": { $value: "#737373", $type: "color" },
      "900": { $value: "#111111", $type: "color" }
    },
    white: { $value: "#FFFFFF", $type: "color" },
    black: { $value: "#0A0A0A", $type: "color" }
  }
};

const semantic = {
  color: {
    action: {
      primary: { $value: "{color.blue.500}", $type: "color" },
      "primary-hover": { $value: "{color.blue.700}", $type: "color" }
    },
    feedback: {
      success: { $value: "#00AA44", $type: "color" },
      warning: { $value: "{color.amber.500}", $type: "color" },
      danger: { $value: "{color.red.500}", $type: "color" }
    },
    text: {
      primary: { $value: "{color.gray.900}", $type: "color" },
      inverse: { $value: "{color.white}", $type: "color" }
    }
  }
};

const themes = {
  base: {},
  entertainment: {
    color: {
      action: {
        primary: { $value: "{color.red.500}", $type: "color" }
      },
      text: {
        primary: { $value: "{color.white}", $type: "color" }
      }
    }
  },
  education: {
    color: {
      action: {
        primary: { $value: "{color.amber.500}", $type: "color" }
      }
    }
  }
};

const recipe = {
  sizes: {
    md: {
      height: 40,
      paddingX: 16,
      paddingY: 10,
      fontSize: 14
    }
  },
  variants: {
    primary: {
      fillToken: "color.action.primary",
      textToken: "color.text.inverse",
      strokeToken: null
    },
    ghost: {
      fillToken: null,
      textToken: "color.action.primary",
      strokeToken: "color.action.primary"
    },
    success: {
      fillToken: "color.feedback.success",
      textToken: "color.text.inverse",
      strokeToken: null
    }
  },
  themeOverrides: {
    base: { radius: 6 },
    entertainment: { radius: 0 },
    education: { radius: 10 }
  }
};

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255
  };
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : null), obj);
}

function resolvePrimitiveReference(refPath) {
  const node = getPath(primitives, refPath);
  return node ? node.$value : null;
}

function getThemeOrSemanticNode(tokenPath, themeName) {
  return getPath(themes[themeName] || {}, tokenPath) || getPath(semantic, tokenPath);
}

function resolveTokenValue(tokenPath, themeName) {
  const tokenNode = getThemeOrSemanticNode(tokenPath, themeName);
  if (!tokenNode) return null;

  const value = tokenNode.$value;
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    return resolvePrimitiveReference(value.slice(1, -1));
  }
  return value;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

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
  const parsed = parseNotes(spec.notes || "");

  const computed = {
    variant: spec.variant || "primary",
    state: spec.state || "default",
    theme: spec.theme || "base",
    label: spec.label || "Button",
    radius: null,
    fontSize: 14,
    paddingX: 16
  };

  if (parsed.subtle || parsed.quiet) computed.variant = "ghost";
  if (parsed.loud || parsed.bold) computed.variant = "primary";
  if (parsed.bolder || parsed.bold) computed.fontSize = 16;
  if (parsed.cinematic) {
    computed.radius = 0;
    computed.paddingX = 20;
  }
  if (parsed.soft || parsed.friendly) computed.radius = 12;
  if (parsed.uppercase) computed.label = computed.label.toUpperCase();

  return { ...spec, computed };
}

async function createButtonFromSpec(rawSpec) {
  const spec = applyNoteTweaks(rawSpec);

  const variant = spec.computed.variant;
  const state = spec.computed.state;
  const theme = spec.computed.theme;
  const label = spec.computed.label;

  const size = recipe.sizes.md;
  const variantConfig = recipe.variants[variant];
  const themeConfig = recipe.themeOverrides[theme] || recipe.themeOverrides.base;

  if (!variantConfig) {
    throw new Error(`Unknown variant: ${variant}`);
  }

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const component = figma.createComponent();
  component.name = `Button/${capitalize(variant)}/${capitalize(state)}`;
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = spec.computed.paddingX;
  component.paddingRight = spec.computed.paddingX;
  component.paddingTop = size.paddingY;
  component.paddingBottom = size.paddingY;
  component.itemSpacing = 8;
  component.cornerRadius = spec.computed.radius ?? themeConfig.radius;
  component.minHeight = size.height;

  let fillHex = variantConfig.fillToken ? resolveTokenValue(variantConfig.fillToken, theme) : null;
  let textHex = variantConfig.textToken ? resolveTokenValue(variantConfig.textToken, theme) : "#111111";
  let strokeHex = variantConfig.strokeToken ? resolveTokenValue(variantConfig.strokeToken, theme) : null;

  if (state === "hover") {
    if (variant === "primary") fillHex = resolveTokenValue("color.action.primary-hover", theme) || fillHex;
  }

  if (state === "disabled") {
    fillHex = "#737373";
    textHex = "#D4D4D4";
    strokeHex = variant === "ghost" ? "#737373" : null;
  }

  if (fillHex) {
    component.fills = [{ type: "SOLID", color: hexToRgb(fillHex) }];
  } else {
    component.fills = [];
  }

  if (strokeHex) {
    component.strokes = [{ type: "SOLID", color: hexToRgb(strokeHex) }];
    component.strokeWeight = 1.5;
  } else {
    component.strokes = [];
  }

  if (state === "active") {
    component.effects = [
      {
        type: "INNER_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.18 },
        offset: { x: 0, y: 2 },
        radius: 6,
        spread: 0,
        visible: true,
        blendMode: "NORMAL"
      }
    ];
  }

  const textNode = figma.createText();
  textNode.fontName = { family: "Inter", style: "Regular" };
  textNode.fontSize = spec.computed.fontSize;
  textNode.characters = label;
  textNode.fills = [{ type: "SOLID", color: hexToRgb(textHex) }];

  component.appendChild(textNode);

  figma.currentPage.appendChild(component);
  component.x = figma.viewport.center.x - component.width / 2;
  component.y = figma.viewport.center.y - component.height / 2;

  figma.currentPage.selection = [component];
  figma.viewport.scrollAndZoomIntoView([component]);
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "cancel") {
    figma.closePlugin();
    return;
  }

  if (msg.type === "generate-button") {
    try {
      const spec = JSON.parse(msg.specText);
      await createButtonFromSpec(spec);
      figma.notify("Button component generated.");
      figma.closePlugin();
    } catch (error) {
      figma.notify(`Error: ${error.message}`);
    }
  }
};