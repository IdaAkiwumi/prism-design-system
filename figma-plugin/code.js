figma.showUI(__html__, { width: 420, height: 380 });

const TOKENS = {
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

const RECIPE = {
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
  return path.split(".").reduce((acc, part) => {
    if (!acc) return null;
    return acc[part];
  }, obj);
}

function resolvePrimitiveReference(refPath) {
  const node = getPath(TOKENS.primitives, refPath);
  return node ? node.$value : null;
}

function getThemeOrSemanticNode(tokenPath, themeName) {
  const themeNode = getPath(TOKENS.themes[themeName] || {}, tokenPath);
  if (themeNode) return themeNode;

  const semanticNode = getPath(TOKENS.semantic, tokenPath);
  if (semanticNode) return semanticNode;

  return null;
}

function resolveTokenValue(tokenPath, themeName) {
  const tokenNode = getThemeOrSemanticNode(tokenPath, themeName);
  if (!tokenNode) return null;

  const value = tokenNode.$value;

  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    const refPath = value.slice(1, -1);
    return resolvePrimitiveReference(refPath);
  }

  return value;
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") {
    return { r: 0, g: 0, b: 0 };
  }

  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);

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
  const spec = sanitizeSpec(rawSpec);
  const parsed = parseNotes(spec.notes);

  const overrides = {
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

  return {
    ...spec,
    overrides
  };
}

async function createButtonFromSpec(rawSpec) {
  const spec = applyNoteTweaks(rawSpec);

  if (spec.componentType !== "button") {
    throw new Error("Only 'button' is supported.");
  }

  const size = RECIPE.sizes.md;
  const variantConfig = RECIPE.variants[spec.variant];
  const themeConfig = RECIPE.themeOverrides[spec.theme] || RECIPE.themeOverrides.base;

  if (!variantConfig) {
    throw new Error(`Unknown variant: ${spec.variant}`);
  }

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const component = figma.createComponent();
  component.name = `Button/${capitalize(spec.variant)}/${capitalize(spec.state)}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = spec.overrides.paddingX;
  component.paddingRight = spec.overrides.paddingX;
  component.paddingTop = size.paddingY;
  component.paddingBottom = size.paddingY;
  component.itemSpacing = 8;
  component.cornerRadius = spec.overrides.radius ?? themeConfig.radius;

  let fillHex = variantConfig.fillToken
    ? resolveTokenValue(variantConfig.fillToken, spec.theme)
    : null;

  let textHex = variantConfig.textToken
    ? resolveTokenValue(variantConfig.textToken, spec.theme)
    : "#111111";

  let strokeHex = variantConfig.strokeToken
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

  const textNode = figma.createText();
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

figma.ui.onmessage = async (msg) => {
  if (msg.type === "cancel") {
    figma.closePlugin();
    return;
  }

  if (msg.type === "generate-button") {
    try {
      const rawSpec = JSON.parse(msg.specText);
      await createButtonFromSpec(rawSpec);
      figma.notify("Button component generated.");
      figma.closePlugin();
    } catch (error) {
      figma.notify(`Error: ${error.message}`);
      console.error("PRISM plugin error: - code.js:335", error);
    }
  }
};