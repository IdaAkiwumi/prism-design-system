// PRISM Figma Plugin – Creates components (no component sets, works reliably)
const CATALOG_URL = 'https://raw.githubusercontent.com/idaakiwumi/prism-design-system/main/generated/component-catalog.json';

figma.showUI(__html__, { width: 400, height: 300 });

function log(message) {
  figma.ui.postMessage({ type: 'log', text: message });
}

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
  const name = comp.name;
  if (!name) throw new Error("Component has no name");

  // Remove any existing node with the same name
  const existing = figma.currentPage.findOne(n => n.name === name);
  if (existing) existing.remove();

  // Create a frame (will become the component)
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(120, 40);
  frame.x = center.x - 100;
  frame.y = center.y - 50;
  frame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }]; // light grey background for visibility

  // Background rectangle (simulating button background)
  const bg = figma.createRectangle();
  bg.resize(120, 40);
  bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8 } }]; // blue
  bg.name = "Background";
  frame.appendChild(bg);

  // Text label
  await loadFont();
  const text = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = "Button";
  text.x = 10;
  text.y = 10;
  text.name = "Label";
  frame.appendChild(text);

  // Convert the frame to a component
  const component = figma.createComponentFromNode(frame);
  component.name = name;

  // Add metadata as component description (visible in Figma Dev Mode)
  const { props, tokenMapping, accessibility } = comp;
  const desc = [];
  if (props && props.length) desc.push(`Props: ${JSON.stringify(props, null, 2)}`);
  if (tokenMapping && Object.keys(tokenMapping).length) desc.push(`Tokens: ${JSON.stringify(tokenMapping, null, 2)}`);
  if (accessibility) desc.push(`Accessibility: ${accessibility}`);
  component.description = desc.join('\n\n');

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