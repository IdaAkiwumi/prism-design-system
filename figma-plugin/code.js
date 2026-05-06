figma.showUI(__html__, { width: 420, height: 380 });

var TOKENS = {
  primitives: {
    color: {
      blue: {
        "500": { $value: "#0066CC" },
        "700": { $value: "#004C99" }
      },
      red: {
        "500": { $value: "#E50914" }
      },
      amber: {
        "500": { $value: "#F4A300" }
      },
      gray: {
        "100": { $value: "#F5F5F5" },
        "500": { $value: "#737373" },
        "900": { $value: "#111111" }
      },
      white: { $value: "#FFFFFF" },
      black: { $value: "#0A0A0A" }
    }
  },

  semantic: {
    color: {
      action: {
        primary: { $value: "{color.blue.500}" },
        "primary-hover": { $value: "{color.blue.700}" }
      },
      feedback: {
        success: { $value: "#00AA44" },
        warning: { $value: "{color.amber.500}" },
        danger: { $value: "{color.red.500}" }
      },
      text: {
        primary: { $value: "{color.gray.900}" },
        inverse: { $value: "{color.white}" }
      }
    }
  },

  themes: {
    base: {},
    entertainment: {
      color: {
        action: {
          primary: { $value: "{color.red.500}" }
        },
        text: {
          primary: { $value: "{color.white}" }
        }
      }
    },
    education: {
      color: {
        action: {
          primary: { $value: "{color.amber.500}" }
        }
      }
    }
  }
};

var RECIPE = {
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

function getPath(obj, path) {
  var parts = path.split(".");
  var current = obj;
  var i;

  for (i = 0; i < parts.length; i++) {
    if (!current) return null;
    current = current[parts[i]];
  }

  return current;
}

function resolvePrimitiveReference(refPath) {
  var node = getPath(TOKENS.primitives, refPath);
  return node ? node.$value : null;
}

function getThemeOrSemanticNode(tokenPath, themeName) {
  var themeNode = getPath(TOKENS.themes[themeName] || {}, tokenPath);
  if (themeNode) return themeNode;

  var semanticNode = getPath(TOKENS.semantic, tokenPath);
  if (semanticNode) return semanticNode;

  return null;
}

function resolveTokenValue(tokenPath, themeName) {
  var tokenNode = getThemeOrSemanticNode(tokenPath, themeName);
  var value;
  var refPath;

  if (!tokenNode) return null;

  value = tokenNode.$value;

  if (
    typeof value === "string" &&
    value.indexOf("{") === 0 &&
    value.lastIndexOf("}") === value.length - 1
  ) {
    refPath = value.substring(1, value.length - 1);
    return resolvePrimitiveReference(refPath);
  }

  return value;
}

function hexToRgb(hex) {
  var clean;
  var bigint;

  if (!hex || typeof hex !== "string") {
    return { r: 0, g: 0, b: 0 };
  }

  clean = hex.replace("#", "");
  bigint = parseInt(clean, 16);

  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255
  };
}

function capitalize(value) {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseNotes(notes) {
  var lower = (notes || "").toLowerCase();

  return {
    bolder: lower.indexOf("bolder") !== -1,
    bold: lower.indexOf("bold") !== -1,
    cinematic: lower.indexOf("cinematic") !== -1,
    soft: lower.indexOf("soft") !== -1,
    friendly: lower.indexOf("friendly") !== -1,
    subtle: lower.indexOf("subtle") !== -1,
    quiet: lower.indexOf("quiet") !== -1,
    loud: lower.indexOf("loud") !== -1,
    uppercase: lower.indexOf("uppercase") !== -1
  };
}

function sanitizeSpec(rawSpec) {
  return {
    componentType: rawSpec.componentType || "button",
    theme: rawSpec.theme || "base",
    variant: rawSpec.variant || "primary",
    state: rawSpec.state || "default",
    label: rawSpec.label || "Button",
    notes: rawSpec.notes || ""
  };
}

function applyNoteTweaks(rawSpec) {
  var spec = sanitizeSpec(rawSpec);
  var parsed = parseNotes(spec.notes);
  var overrides = {
    radius: null,
    fontSize: 14,
    paddingX: 16
  };

  if (parsed.subtle || parsed.quiet) {
    spec.variant = "ghost";
  }

  if (parsed.loud || parsed.bold) {
    spec.variant = "primary";
  }

  if (parsed.uppercase) {
    spec.label = spec.label.toUpperCase();
  }

  if (parsed.bolder || parsed.bold) {
    overrides.fontSize = 16;
  }

  if (parsed.cinematic) {
    overrides.radius = 0;
    overrides.paddingX = 20;
  }

  if (parsed.soft || parsed.friendly) {
    overrides.radius = 12;
  }

  spec.overrides = overrides;
  return spec;
}

async function createButtonFromSpec(rawSpec) {
  var spec = applyNoteTweaks(rawSpec);
  var size;
  var variantConfig;
  var themeConfig;
  var component;
  var textNode;
  var fillHex;
  var textHex;
  var strokeHex;

  if (spec.componentType !== "button") {
    throw new Error("Only 'button' is supported.");
  }

  size = RECIPE.sizes.md;
  variantConfig = RECIPE.variants[spec.variant];
  themeConfig = RECIPE.themeOverrides[spec.theme] || RECIPE.themeOverrides.base;

  if (!variantConfig) {
    throw new Error("Unknown variant: " + spec.variant);
  }

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  component = figma.createComponent();
  component.name = "Button/" + capitalize(spec.variant) + "/" + capitalize(spec.state);
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = spec.overrides.paddingX;
  component.paddingRight = spec.overrides.paddingX;
  component.paddingTop = size.paddingY;
  component.paddingBottom = size.paddingY;
  component.itemSpacing = 8;
  component.cornerRadius = spec.overrides.radius !== null ? spec.overrides.radius : themeConfig.radius;

  fillHex = variantConfig.fillToken
    ? resolveTokenValue(variantConfig.fillToken, spec.theme)
    : null;

  textHex = variantConfig.textToken
    ? resolveTokenValue(variantConfig.textToken, spec.theme)
    : "#111111";

  strokeHex = variantConfig.strokeToken
    ? resolveTokenValue(variantConfig.strokeToken, spec.theme)
    : null;

  if (spec.state === "hover" && spec.variant === "primary") {
    fillHex = resolveTokenValue("color.action.primary-hover", spec.theme) || fillHex;
  }

  if (spec.state === "disabled") {
    fillHex = "#737373";
    textHex = "#D4D4D4";
    strokeHex = spec.variant === "ghost" ? "#737373" : null;
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

  textNode = figma.createText();
  textNode.fontName = { family: "Inter", style: "Regular" };
  textNode.fontSize = spec.overrides.fontSize;
  textNode.characters = spec.label;
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

figma.ui.onmessage = async function (msg) {
  if (msg.type === "cancel") {
    figma.closePlugin();
    return;
  }

  if (msg.type === "generate-button") {
    try {
      var rawSpec = JSON.parse(msg.specText);
      await createButtonFromSpec(rawSpec);
      figma.notify("Button component generated.");
      figma.closePlugin();
    } catch (error) {
      figma.notify("Error: " + error.message);
      console.error("PRISM plugin error: - code.js:355", error);
    }
  }
};