// PRISM Figma Plugin – Auto‑create components from component-catalog.json
const CATALOG_URL = 'https://raw.githubusercontent.com/IdaAkiwumi/prism-design-system/main/generated/component-catalog.json';

figma.showUI(__html__, { width: 400, height: 300 });

// Global font promise – load once
let fontLoaded = false;
async function ensureFont() {
  if (fontLoaded) return;
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    fontLoaded = true;
  } catch (err) {
    console.warn("Inter font not available, falling back to system font - code.js:14");
    // Fallback to a generic font that Figma always has
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    fontLoaded = true;
  }
}

async function fetchCatalog() {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function createOrUpdateComponent(componentData) {
  const { name, props, tokenMapping, accessibility } = componentData;

  // Find existing component set
  let componentSet = figma.currentPage.findOne(node => node.type === 'COMPONENT_SET' && node.name === name);
  if (!componentSet) {
    componentSet = figma.createComponentSet();
    componentSet.name = name;
  }

  // For demo: create one variant (primary/default). In reality you would iterate over props.
  const variant = componentSet.createVariant();
  variant.name = `variant=primary,state=default,size=medium`;
  const frame = variant;

  // Clear any existing children
  while (frame.children.length) frame.children[0].remove();

  // Add background rectangle
  const bg = figma.createRectangle();
  bg.resize(120, 40);
  bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8 } }]; // placeholder, would map to token
  bg.name = "Background";
  frame.appendChild(bg);

  // Add text label
  await ensureFont();
  const text = figma.createText();
  await figma.loadFontAsync(text.fontName); // use already loaded font
  text.characters = "Button";
  text.x = 10;
  text.y = 10;
  text.name = "Label";
  frame.appendChild(text);

  // Store metadata as component description (visible in Dev Mode)
  const descriptionParts = [];
  if (props.length) descriptionParts.push(`Props: ${JSON.stringify(props)}`);
  if (Object.keys(tokenMapping).length) descriptionParts.push(`Tokens: ${JSON.stringify(tokenMapping)}`);
  if (accessibility) descriptionParts.push(`Accessibility: ${accessibility}`);
  frame.description = descriptionParts.join('\n\n');
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'sync-components') {
    try {
      figma.ui.postMessage({ type: 'log', text: 'Fetching catalog...' });
      const catalog = await fetchCatalog();
      figma.ui.postMessage({ type: 'log', text: `Found ${catalog.length} components.` });

      for (const comp of catalog) {
        await createOrUpdateComponent(comp);
        figma.ui.postMessage({ type: 'log', text: `✅ Created/updated component: ${comp.name}` });
      }

      figma.ui.postMessage({ type: 'log', text: 'Sync complete!' });
      figma.closePlugin();
    } catch (err) {
      figma.ui.postMessage({ type: 'log', text: `Error: ${err.message}` });
      console.error(err);
    }
  }
};