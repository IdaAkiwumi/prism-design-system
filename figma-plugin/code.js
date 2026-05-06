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
      },
      surface: {
        raised: { $value: "{color.gray.100}" }
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
        },
        surface: {
          raised: { $value: "#1A1A1A" }
        }
      }
    },
    education: {
      color: {
        action: {
          primary: { $value: "{color.amber.500}" }
        },
        surface: {
          raised: { $value: "#FFF7E8" }
        }
      }
    }
  }
};

var RECIPE = {
  button: {
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
  },
  card: {
    width: 380,
    padding: 24,
    gap: 16,
    radius: 16
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
    notes: rawSpec.notes || "",
    badgeState: rawSpec.badgeState || "success",
    cardTitle: rawSpec.cardTitle || "",
    cardBody: rawSpec.cardBody || ""
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

function getBadgeStyle(badgeState) {
  if (badgeState === "warning") {
    return {
      label: "Needs review",
      fill: "#F4A300",
      text: "#111111"
    };
  }

  if (badgeState === "danger") {
    return {
      label: "At risk",
      fill: "#E50914",
      text: "#FFFFFF"
    };
  }

  return {
    label: "Recently approved",
    fill: "#00AA44",
    text: "#FFFFFF"
  };
}

async function createTextNode(text, size, colorHex, width) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  var node = figma.createText();
  node.fontName = { family: "Inter", style: "Regular" };
  node.fontSize = size;
  node.characters = text;
  node.fills = [
    {
      type: "SOLID",
      color: hexToRgb(colorHex)
    }
  ];

  if (width) {
    node.resize(width, node.height);
    node.textAutoResize = "HEIGHT";
  }

  return node;
}

async function createButtonNode(spec) {
  var size = RECIPE.button.sizes.md;
  var variantConfig = RECIPE.button.variants[spec.variant];
  var themeConfig = RECIPE.button.themeOverrides[spec.theme] || RECIPE.button.themeOverrides.base;
  var button;
  var textNode;
  var fillHex;
  var textHex;
  var strokeHex;

  if (!variantConfig) {
    throw new Error("Unknown variant: " + spec.variant);
  }

  button = figma.createFrame();
  button.name = "Button";
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "AUTO";
  button.paddingLeft = spec.overrides.paddingX;
  button.paddingRight = spec.overrides.paddingX;
  button.paddingTop = size.paddingY;
  button.paddingBottom = size.paddingY;
  button.itemSpacing = 8;
  button.cornerRadius = spec.overrides.radius !== null ? spec.overrides.radius : themeConfig.radius;

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
    button.fills = [
      {
        type: "SOLID",
        color: hexToRgb(fillHex)
      }
    ];
  } else {
    button.fills = [];
  }

  if (strokeHex) {
    button.strokes = [
      {
        type: "SOLID",
        color: hexToRgb(strokeHex)
      }
    ];
    button.strokeWeight = 1.5;
  } else {
    button.strokes = [];
  }

  textNode = await createTextNode(spec.label, spec.overrides.fontSize, textHex);
  button.appendChild(textNode);

  return button;
}

async function createNotificationCardFromSpec(rawSpec) {
  var spec = applyNoteTweaks(rawSpec);
  var card;
  var topRow;
  var copyGroup;
  var titleNode;
  var bodyNode;
  var badge;
  var badgeText;
  var buttonNode;
  var badgeStyle;
  var cardBg;
  var cardText;
  var contentWidth;
  var badgeWidthEstimate;

  card = figma.createComponent();
  card.name = "NotificationCard/" + capitalize(spec.theme) + "/" + capitalize(spec.variant) + "/" + capitalize(spec.state);
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.paddingLeft = RECIPE.card.padding;
  card.paddingRight = RECIPE.card.padding;
  card.paddingTop = RECIPE.card.padding;
  card.paddingBottom = RECIPE.card.padding;
  card.itemSpacing = RECIPE.card.gap;
  card.cornerRadius = RECIPE.card.radius;

  if (spec.theme === "entertainment") {
    cardBg = "#1A1A1A";
    cardText = "#FFFFFF";
  } else if (spec.theme === "education") {
    cardBg = "#FFF7E8";
    cardText = "#111111";
  } else {
    cardBg = "#FFFFFF";
    cardText = "#111111";
  }

  card.fills = [
    {
      type: "SOLID",
      color: hexToRgb(cardBg)
    }
  ];

  topRow = figma.createFrame();
  topRow.name = "Top Row";
  topRow.layoutMode = "HORIZONTAL";
  topRow.primaryAxisSizingMode = "AUTO";
  topRow.counterAxisSizingMode = "AUTO";
  topRow.itemSpacing = 12;
  topRow.fills = [];

  copyGroup = figma.createFrame();
  copyGroup.name = "Copy";
  copyGroup.layoutMode = "VERTICAL";
  copyGroup.primaryAxisSizingMode = "AUTO";
  copyGroup.counterAxisSizingMode = "AUTO";
  copyGroup.itemSpacing = 8;
  copyGroup.fills = [];

  badgeStyle = getBadgeStyle(spec.badgeState);
  badgeWidthEstimate = 90;
  contentWidth = RECIPE.card.width - (RECIPE.card.padding * 2) - badgeWidthEstimate - 12;

  titleNode = await createTextNode(spec.cardTitle || "Notification", 20, cardText, contentWidth);
  bodyNode = await createTextNode(spec.cardBody || "Message body", 14, cardText, RECIPE.card.width - (RECIPE.card.padding * 2));

  copyGroup.appendChild(titleNode);

  badge = figma.createFrame();
  badge.name = "Badge";
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "AUTO";
  badge.paddingLeft = 10;
  badge.paddingRight = 10;
  badge.paddingTop = 6;
  badge.paddingBottom = 6;
  badge.cornerRadius = 999;
  badge.fills = [
    {
      type: "SOLID",
      color: hexToRgb(badgeStyle.fill)
    }
  ];

  badgeText = await createTextNode(badgeStyle.label, 12, badgeStyle.text);
  badge.appendChild(badgeText);

  topRow.appendChild(copyGroup);
  topRow.appendChild(badge);

  buttonNode = await createButtonNode(spec);

  card.appendChild(topRow);
  card.appendChild(bodyNode);
  card.appendChild(buttonNode);

  figma.currentPage.appendChild(card);

  card.resize(RECIPE.card.width, card.height);

  figma.currentPage.selection = [card];
  figma.viewport.scrollAndZoomIntoView([card]);
}

async function createButtonOnlyFromSpec(rawSpec) {
  var spec = applyNoteTweaks(rawSpec);
  var component;
  var buttonNode;

  component = figma.createComponent();
  component.name = "Button/" + capitalize(spec.variant) + "/" + capitalize(spec.state);
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.fills = [];

  buttonNode = await createButtonNode(spec);
  component.appendChild(buttonNode);

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
      var hasCardData = !!(rawSpec.cardTitle || rawSpec.cardBody || rawSpec.badgeState);

      if (hasCardData) {
        await createNotificationCardFromSpec(rawSpec);
        figma.notify("Notification card component generated.");
      } else {
        await createButtonOnlyFromSpec(rawSpec);
        figma.notify("Button component generated.");
      }

      figma.closePlugin();
    } catch (error) {
      figma.notify("Error: " + error.message);
      console.error("PRISM plugin error: - code.js:532", error);
    }
  }
};