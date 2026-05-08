// PRISM Figma Plugin – Auto‑create components from component-catalog.json
const CATALOG_URL = 'https://raw.githubusercontent.com/idaakiwumi/prism-design-system/main/generated/component-catalog.json';

figma.showUI(__html__, { width: 400, height: 300 });

let fontLoaded = false;
async function ensureFont() {
  if (fontLoaded) return;
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    fontLoaded = true;
  } catch (err) {
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    fontLoaded = true;
  }
}

async function fetchCatalog() {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function createOrUpdateComponent(componentData, viewportCenter) {
  const { name, props, tokenMapping, accessibility } = componentData;

  let componentSet = figma.currentPage.findOne(node => node.type === 'COMPONENT_SET' && node.name === name);
  if (!componentSet) {
    componentSet = figma.createComponentSet();
    componentSet.name = name;
    // Move to viewport center
    componentSet.x = viewportCenter.x - 100;
    componentSet.y = viewportCenter.y - 50;
  }

  // For demo: create one variant (primary/default)
  const variant = componentSet.createVariant();
  variant.name = `variant=primary,state=default,size=medium`;
  const frame = variant;

  // Clear existing children
  while (frame.children.length) frame.children[0].remove();

  // Background (placeholder – would use token later)
  const bg = figma.createRectangle();
  bg.resize(120, 40);
  bg.fills = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8 } }];
  bg.name = "Background";
  frame.appendChild(bg);

  // Text label
  await ensureFont();
  const text = figma.createText();
  await figma.loadFontAsync(text.fontName);
  text.characters = "Button";
  text.x = 10;
  text.y = 10;
  text.name = "Label";
  frame.appendChild(text);

  // Add metadata as description
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
      if (!catalog.length) {
        figma.ui.postMessage({ type: 'log', text: '⚠️ No components found in catalog. Add a component definition to ai-rules.md (see docs).' });
        figma.closePlugin();
        return;
      }
      figma.ui.postMessage({ type: 'log', text: `Found ${catalog.length} components.` });

      // Get current viewport center
      const { x, y } = figma.viewport.center;
      for (const comp of catalog) {
        await createOrUpdateComponent(comp, { x, y });
        figma.ui.postMessage({ type: 'log', text: `✅ Created/updated: ${comp.name}` });
      }

      figma.ui.postMessage({ type: 'log', text: 'Sync complete! Components placed at viewport center.' });
      figma.closePlugin();
    } catch (err) {
      figma.ui.postMessage({ type: 'log', text: `Error: ${err.message}` });
      console.error(err);
    }
  }
};