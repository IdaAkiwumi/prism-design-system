// PRISM Figma Plugin – Auto‑create components from component-catalog.json
const CATALOG_URL = 'https://raw.githubusercontent.com/idaakiwumi/prism-design-system/main/generated/component-catalog.json';

figma.showUI(__html__, { width: 400, height: 300 });

function logToUI(message) {
  figma.ui.postMessage({ type: 'log', text: message });
}

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
      console.error("Could not load any font - code.js:21", err);
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

  // 1. Delete any existing node with the same name (component, component set, or frame)
  const existing = figma.currentPage.findOne(node => node.name === name);
  if (existing) {
    existing.remove();
    logToUI(`Removed existing node: ${name}`);
  }

  // 2. Create a brand new component set
  const componentSet = figma.createComponentSet();
  componentSet.name = name;
  componentSet.x = viewportCenter.x - 100;
  componentSet.y = viewportCenter.y - 50;

  // 3. Create one variant (primary/default)
  const variant = componentSet.createVariant();
  variant.name = "variant=primary, state=default, size=medium";

  // 4. Add background rectangle
  const bg = figma.createRectangle();
  bg.resize(120, 40);
  bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8 } }]; // placeholder blue
  bg.name = "Background";
  variant.appendChild(bg);

  // 5. Add text label
  await ensureFont();
  const text = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = "Button";
  text.x = 10;
  text.y = 10;
  text.name = "Label";
  variant.appendChild(text);

  // 6. Add documentation as component description
  const descriptionParts = [];
  if (props && props.length) descriptionParts.push(`Props: ${JSON.stringify(props, null, 2)}`);
  if (tokenMapping && Object.keys(tokenMapping).length) descriptionParts.push(`Tokens: ${JSON.stringify(tokenMapping, null, 2)}`);
  if (accessibility) descriptionParts.push(`Accessibility: ${accessibility}`);
  variant.description = descriptionParts.join('\n\n');

  logToUI(`✅ Created component: ${name}`);
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
      const center = figma.viewport.center;
      logToUI(`Viewport center: (${center.x}, ${center.y})`);

      for (const comp of catalog) {
        await createOrUpdateComponent(comp, center);
      }

      logToUI('Sync complete! Components placed near viewport center.');
      figma.closePlugin();
    } catch (err) {
      logToUI(`❌ Error: ${err.message}`);
      console.error(err);
    }
  }
};