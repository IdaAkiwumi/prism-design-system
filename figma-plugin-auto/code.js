// PRISM Figma Plugin – Safe component creator
const CATALOG_URL = 'https://raw.githubusercontent.com/idaakiwumi/prism-design-system/main/generated/component-catalog.json';

figma.showUI(__html__, { width: 400, height: 300 });

function log(message) {
  figma.ui.postMessage({ type: 'log', text: message });
}

// Load a known font once
let fontLoaded = false;
async function loadFont() {
  if (fontLoaded) return;
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    fontLoaded = true;
    log("✅ Font loaded: Inter");
  } catch (e) {
    try {
      await figma.loadFontAsync({ family: "Arial", style: "Regular" });
      fontLoaded = true;
      log("✅ Fallback font loaded: Arial");
    } catch (err) {
      log("❌ Could not load any font. Components will be blank.");
    }
  }
}

async function fetchCatalog() {
  const resp = await fetch(CATALOG_URL);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  if (!Array.isArray(data)) throw new Error("Catalog is not an array");
  return data;
}

async function createComponent(comp, center) {
  const name = comp.name; // e.g., "button_component"
  if (!name) throw new Error("Component has no name");

  // 1. Remove any existing node with the same name (to avoid conflicts)
  const existing = figma.currentPage.findOne(n => n.name === name);
  if (existing) {
    existing.remove();
    log(`Removed old node: ${name}`);
  }

  // 2. Create a new component set
  const componentSet = figma.createComponentSet();
  componentSet.name = name;
  componentSet.x = center.x - 100;
  componentSet.y = center.y - 50;

  // 3. Create one variant (primary/default)
  const variant = componentSet.createVariant();
  variant.name = "variant=primary, state=default, size=medium";

  // 4. Background rectangle (placeholder blue)
  const bg = figma.createRectangle();
  bg.resize(120, 40);
  bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8 } }];
  bg.name = "Background";
  variant.appendChild(bg);

  // 5. Text label
  await loadFont();
  const text = figma.createText();
  // Explicitly set font to the loaded one
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = "Button";
  text.x = 10;
  text.y = 10;
  text.name = "Label";
  variant.appendChild(text);

  // 6. Add metadata as component description
  const { props, tokenMapping, accessibility } = comp;
  const desc = [];
  if (props?.length) desc.push(`Props: ${JSON.stringify(props, null, 2)}`);
  if (tokenMapping && Object.keys(tokenMapping).length) desc.push(`Tokens: ${JSON.stringify(tokenMapping, null, 2)}`);
  if (accessibility) desc.push(`Accessibility: ${accessibility}`);
  variant.description = desc.join('\n\n');

  log(`✅ Created component: ${name}`);
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'sync-components') {
    try {
      log("Fetching component catalog...");
      const catalog = await fetchCatalog();
      if (!catalog.length) {
        log("⚠️ No components found. Add a component definition to ai-rules.md (see docs).");
        figma.closePlugin();
        return;
      }
      log(`Found ${catalog.length} component(s).`);

      const center = figma.viewport.center;
      log(`Viewport center: (${center.x}, ${center.y})`);

      for (const comp of catalog) {
        await createComponent(comp, center);
      }

      log("Sync complete! Components placed near viewport center.");
      figma.closePlugin();
    } catch (err) {
      log(`❌ Error: ${err.message}`);
      console.error(err);
    }
  }
};