figma.showUI(__html__, { width: 420, height: 360 });

// ------------------------------
// Embedded token data
// ------------------------------
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
      "primary-hover": { $value: "{color.blue.700}", $type: "color" },
      destructive: { $value: "{color.red.500}", $type: "color" }
    },
    feedback: {
      success: { $value: "#00AA44", $type: "color" },
      warning: { $value: "{color.amber.500}", $type: "color" },
      danger: { $value: "{color.red.500}", $type: "color" }
    },
    text: {
      primary: { $value: "{color.gray.900}", $type: "color" },
      inverse: { $value: "{color.white}", $type: "color" },
      disabled: { $value: "{color.gray.500}", $type: "color" }
    },
    surface: {
      default: { $value: "{color.white}", $type: "color" },
      raised: { $value: "{color.gray.100}", $type: "color" }
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
      },
      surface: {
        default: { $value: "{color.black}", $type: "color" },
        raised: { $value: "#1A1A1A", $type: "color" }
      }
    }
  },
  education: {
    color: {
      action: {
        primary: { $value: "{color.amber.500}", $type: "color" }
      },
      surface: {
        default: { $value: "#FFFBF2", $type: "color" }
      }
    }
  }
};

const recipe = {
  componentType: "button",
  sizes: {
    md: {
      height: 40,
      paddingX: 16,
      paddingY: 10,
      fontSize: 14,
      fontWeight: 500
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
    }
  },
  states: {
    default: {},
    disabled: {
      fillOverride: "#737373",
      textOverride: "#D4D4D4",
      strokeOverride: "#737373"
    }
  },
  themeOverrides: {
    base: { radius: 6 },
    entertainment: { radius: 0 },
    education: { radius: 10 }
  }
};

// ------------------------------
// Helpers
// ------------------------------
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);

  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  return { r, g, b };
}

function getPath(obj, path) {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (!current || current[part] === undefined) {
      return null;
    }
    current = current[part];
  }

  return current;
}

function resolvePrimitiveReference(refPath) {
  const primitiveNode = getPath(primitives, refPath);
  if (!primitiveNode) return null;
  return primitiveNode.$value || null;
}

function getThemeOrSemanticNode(tokenPath, themeName) {
  const themeNode = getPath(themes[themeName] || {}, tokenPath);
  if (themeNode) return themeNode;

  const semanticNode = getPath(semantic, tokenPath);
  if (semanticNode) return semanticNode;

  return null;
}

function resolveTokenValue(tokenPath, themeName) {
  const tokenNode = getThemeOrSemanticNode(tokenPath, themeName);

  if (!tokenNode) {
    return null;
  }

  const value = tokenNode.$value;

  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    const refPath = value.slice(1, -1);
    return resolvePrimitiveReference(refPath);
  }

  return value;
}

async function createButtonFromSpec(spec) {
  if (spec.componentType !== "button") {
    throw new Error("Only button is supported in this MVP.");
  }

  const variant = spec.variant || "primary";
  const state = spec.state || "default";
  const theme = spec.theme || "base";
  const label = spec.label || "Button";

  const size = recipe.sizes.md;
  const variantConfig = recipe.variants[variant];
  const stateConfig = recipe.states[state] || {};
  const themeConfig = recipe.themeOverrides[theme] || recipe.themeOverrides.base;

  if (!variantConfig) {
    throw new Error(`Unknown variant: ${variant}`);
  }

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const component = figma.createComponent();
  component.name = `Button/${capitalize(variant)}/${capitalize(state)}`;
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = size.paddingX;
  component.paddingRight = size.paddingX;
  component.paddingTop = size.paddingY;
  component.paddingBottom = size.paddingY;
  component.itemSpacing = 8;
  component.cornerRadius = themeConfig.radius;
  component.minHeight = size.height;

  let fillHex = null;
  let textHex = null;
  let strokeHex = null;

  if (state === "disabled") {
    fillHex = stateConfig.fillOverride || null;
    textHex = stateConfig.textOverride || null;
    strokeHex = stateConfig.strokeOverride || null;
  } else {
    fillHex = variantConfig.fillToken ? resolveTokenValue(variantConfig.fillToken, theme) : null;
    textHex = variantConfig.textToken ? resolveTokenValue(variantConfig.textToken, theme) : null;
    strokeHex = variantConfig.strokeToken ? resolveTokenValue(variantConfig.strokeToken, theme) : null;
  }

  if (fillHex) {
    component.fills = [
      {
        type: "SOLID",
        color: hexToRgb(fillHex)
      }
    ];
  } else {
    component.fills = [];
  }

  if (strokeHex) {
    component.strokes = [
      {
        type: "SOLID",
        color: hexToRgb(strokeHex)
      }
    ];
    component.strokeWeight = 1.5;
  } else {
    component.strokes = [];
  }

  const textNode = figma.createText();
  textNode.characters = label;
  textNode.fontName = { family: "Inter", style: "Medium" };
  textNode.fontSize = size.fontSize;

  if (!textHex) {
    textHex = "#111111";
  }

  textNode.fills = [
    {
      type: "SOLID",
      color: hexToRgb(textHex)
    }
  ];

  component.appendChild(textNode);

  figma.currentPage.appendChild(component);
  component.x = figma.viewport.center.x - component.width / 2;
  component.y = figma.viewport.center.y - component.height / 2;

  figma.currentPage.selection = [component];
  figma.viewport.scrollAndZoomIntoView([component]);
}

function capitalize(value) {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ------------------------------
// UI messaging
// ------------------------------
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