// PRISM Figma Plugin – Auto‑create components from component-catalog.json
const CATALOG_URL = 'https://raw.githubusercontent.com/idaakiwumi/prism-design-system/main/generated/component-catalog.json';

figma.showUI(__html__, { width: 400, height: 300 });

// Helper to post log messages to the UI
function logToUI(message) {
  figma.ui.postMessage({ type: 'log', text: message });
}

// Load a font once
let fontLoaded = false;
async function ensureFont() {
  if (fontLoaded) return;
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    fontLoaded = true;
  } catch (e) {
    try {
      await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
      fontLoaded = true;
    } catch (err) {
      console.error("Could not load any font - code.js:23", err);
      // Fallback to a generic sans‑serif (may not work, but we try)
      await figma.loadFontAsync({ family: "Arial", style: "Regular" });
      fontLoaded = true;
    }
  }
}

async function fetchCatalog() {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Catalog is not an array");
  return data;
}

async function createOrUpdateComponent(componentData, viewportCenter) {
  const { name, props, tokenMapping, accessibility } = componentData;
  if (!name) throw new Error("Component missing 'name'");

  // Find existing component set (case‑insensitive)
  let componentSet = figma.currentPage.findOne(
    node => node.type === 'COMPONENT_SET' && node.name.toLowerCase() === name.toLowerCase()
  );
  
  if (!componentSet) {
    componentSet = figma.createComponentSet();
    componentSet.name = name;
    // Place near viewport center
    componentSet.x = viewportCenter.x - 100;
    componentSet.y = viewportCenter.y - 50;
    logToUI(`Created new component set: ${name}`);
  } else {
    logToUI(`Found existing component set: ${name}`);
  }

  // Ensure we have at least one variant (delete all existing variants for simplicity)
  const existingVariants = componentSet.children;
  for (const variant of existingVariants) {
    variant.remove();
  }

  // Create a single variant (primary/default)
  const variant = componentSet.createVariant();
  variant.name = `variant=primary, state=default, size=medium`;
  
  // Clear any default children (just in case)
  while (variant.children.length) variant.children[0].remove();

  // Add background rectangle
  const bg = figma.createRectangle();
  bg.resize(120, 40);
  bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8 } }]; // placeholder blue
  bg.name = "Background";
  variant.appendChild(bg);

  // Add text label
  await ensureFont();
  const text = figma.createText();
  // Explicitly set font to the one we loaded
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = "Button";
  text.x = 10;
  text.y = 10;
  text.name = "Label";
  variant.appendChild(text);

  // Add documentation as component description (visible in Dev Mode)
  const descriptionParts = [];
  if (props && props.length) descriptionParts.push(`Props: ${JSON.stringify(props, null, 2)}`);
  if (tokenMapping && Object.keys(tokenMapping).length) descriptionParts.push(`Tokens: ${JSON.stringify(tokenMapping, null, 2)}`);
  if (accessibility) descriptionParts.push(`Accessibility: ${accessibility}`);
  variant.description = descriptionParts.join('\n\n');
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'sync-components') {
    try {
      logToUI('Fetching catalog...');
      const catalog = await fetchCatalog();
      
      if (!catalog.length) {
        logToUI('⚠️ No components found in catalog. Add a component definition to ai-rules.md (see docs).');
        figma.closePlugin();
        return;
      }
      
      logToUI(`Found ${catalog.length} component(s).`);
      
      // Get viewport center
      const center = figma.viewport.center;
      logToUI(`Viewport center: (${center.x}, ${center.y})`);
      
      for (const comp of catalog) {
        await createOrUpdateComponent(comp, center);
        logToUI(`✅ Processed: ${comp.name || 'unnamed'}`);
      }
      
      logToUI('Sync complete! Components placed near viewport center.');
      figma.closePlugin();
    } catch (err) {
      logToUI(`❌ Error: ${err.message}`);
      console.error(err);
    }
  }
};