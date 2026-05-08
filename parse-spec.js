const fs = require('fs');

const markdown = fs.readFileSync('ai-rules.md', 'utf8');
console.log('🔍 Parsing airules.md... - parse-spec.js:4');

// ============================================
// 1. EXTRACT PRIMITIVE TOKENS
// ============================================
function extractPrimitives(markdown) {
  const primitives = { color: {}, spacing: {}, motion: {} };
  const colorRegex = /- (color-[a-z]+-[0-9]+): (#[A-F0-9]{6})/gi;
  let match;
  while ((match = colorRegex.exec(markdown)) !== null) {
    const parts = match[1].split('-');
    const colorFamily = parts[1];
    const shade = parts[2];
    if (!primitives.color[colorFamily]) primitives.color[colorFamily] = {};
    primitives.color[colorFamily][shade] = { $value: match[2], $type: 'color' };
  }
  const spacingRegex = /- (spacing-[0-9]+): ([0-9]+)px/gi;
  while ((match = spacingRegex.exec(markdown)) !== null) {
    primitives.spacing[match[1]] = { $value: match[2], $type: 'dimension' };
  }
  const durationRegex = /- (duration-[a-z]+): ([0-9]+)ms/gi;
  while ((match = durationRegex.exec(markdown)) !== null) {
    if (!primitives.motion.duration) primitives.motion.duration = {};
    primitives.motion.duration[match[1]] = { $value: match[2] + 'ms', $type: 'duration' };
  }
  const easingRegex = /- (easing-[a-z]+): cubic-bezier\(([^)]+)\)/gi;
  while ((match = easingRegex.exec(markdown)) !== null) {
    if (!primitives.motion.easing) primitives.motion.easing = {};
    primitives.motion.easing[match[1]] = { $value: `cubic-bezier(${match[2]})`, $type: 'cubicBezier' };
  }
  return primitives;
}

// ============================================
// 2. EXTRACT SEMANTIC TOKENS
// ============================================
function extractSemantic(markdown) {
  const semantic = { color: {} };
  const semanticRegex = /- (color-[a-z]+-[a-z]+) → ([a-z0-9#-]+)(?:\s*\|\s*(.*))?/gi;
  let match;
  while ((match = semanticRegex.exec(markdown)) !== null) {
    const parts = match[1].split('-');
    const category = parts[1];
    const token = parts[2];
    const value = match[2];
    const description = match[3] ? match[3].trim() : "";
    if (!semantic.color[category]) semantic.color[category] = {};
    const tokenObj = { $value: value.startsWith('#') ? value : `{${value}}`, $type: "color" };
    if (description) tokenObj.$description = description;
    semantic.color[category][token] = tokenObj;
  }
  return semantic;
}

// ============================================
// 3. EXTRACT THEMES
// ============================================
function extractThemes(markdown) {
  const themes = {};
  const lines = markdown.split('\n');
  let currentTheme = null;
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const themeMatch = line.match(/^## Theme:\s*([A-Za-z]+)/i);
    if (themeMatch) {
      currentTheme = themeMatch[1].toLowerCase();
      themes[currentTheme] = {};
      inTable = false;
      continue;
    }
    if (line.startsWith('| Token | Value |')) {
      inTable = true;
      i++; // skip separator
      continue;
    }
    if (inTable && currentTheme && line.startsWith('|')) {
      const rowMatch = line.match(/\|\s*--([a-z-]+)\s*\|\s*([#A-F0-9a-f]+|[a-z]+)\s*\|/i);
      if (rowMatch) {
        const tokenName = rowMatch[1];
        const tokenValue = rowMatch[2];
        themes[currentTheme][tokenName] = tokenValue;
      }
    }
    if (inTable && (line === '' || line.startsWith('##'))) inTable = false;
  }
  return themes;
}

// ============================================
// 4. EXTRACT OLD COMPONENT CONTRACTS (optional)
// ============================================
function extractComponents(markdown) {
  const components = {};
  const componentMatches = markdown.match(/### ([A-Za-z]+) Component[\s\S]*?(?=### |$)/g);
  if (componentMatches) {
    componentMatches.forEach(compBlock => {
      const nameMatch = compBlock.match(/### ([A-Za-z]+) Component/);
      if (!nameMatch) return;
      const compName = nameMatch[1].toLowerCase();
      components[compName] = {};
      const tableRegex = /\| ([a-z]+) \| (enum|boolean|string) \| ([^\|]+) \| ([^\|]+) \|/gi;
      let tableMatch;
      while ((tableMatch = tableRegex.exec(compBlock)) !== null) {
        if (!components[compName].props) components[compName].props = {};
        components[compName].props[tableMatch[1]] = {
          type: tableMatch[2],
          options: tableMatch[3].trim(),
          default: tableMatch[4].trim()
        };
      }
    });
  }
  return components;
}

// ============================================
// 5. EXTRACT AI RULES
// ============================================
function extractAIRules(markdown) {
  const rules = { token: [], motion: [], theme: [], accessibility: [], agentic: [] };
  const tokenSection = markdown.match(/## Token Rules([\s\S]*?)(?=\n## |$)/i);
  if (tokenSection) rules.token = tokenSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  const motionSection = markdown.match(/## Motion Rules([\s\S]*?)(?=\n## |$)/i);
  if (motionSection) rules.motion = motionSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  const themeSection = markdown.match(/## Theme Rules([\s\S]*?)(?=\n## |$)/i);
  if (themeSection) rules.theme = themeSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  const a11ySection = markdown.match(/## Accessibility([\s\S]*?)(?=\n## |$)/i);
  if (a11ySection) rules.accessibility = a11ySection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  const agenticSection = markdown.match(/## Agentic UI Patterns([\s\S]*?)(?=\n## |$)/i);
  if (agenticSection) rules.agentic = agenticSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  return rules;
}

// ============================================
// 6. GENERATE CSS VARIABLES
// ============================================
function generateCSSVariables(themes) {
  let css = '/* PRISM Design System - Generated from ai-rules.md */\n\n';
  css += '/* BASE THEME (default) */\n:root {\n';
  if (themes.base) {
    Object.entries(themes.base).forEach(([varName, value]) => {
      css += `  --${varName}: ${value};\n`;
    });
  }
  css += '}\n\n';
  Object.entries(themes).forEach(([themeName, vars]) => {
    if (themeName === 'base') return;
    css += `/* ${themeName.toUpperCase()} THEME */\n`;
    css += `[data-theme="${themeName}"] {\n`;
    Object.entries(vars).forEach(([varName, value]) => {
      css += `  --${varName}: ${value};\n`;
    });
    css += '}\n\n';
  });
  return css;
}

// ============================================
// 7. NEW: EXTRACT COMPONENT CATALOG FOR FIGMA (fixed for multi‑word names)
// ============================================
function extractComponentsCatalog(markdown) {
  const components = [];
  // Split by "### " (three hashes and a space) – captures any heading line
  const sections = markdown.split(/\n### /);
  // First element is text before first heading, skip it
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const headingEnd = section.indexOf('\n');
    if (headingEnd === -1) continue;
    const rawName = section.substring(0, headingEnd).trim();
    const content = section.substring(headingEnd + 1);
    
    // Use the full heading as component name (e.g., "Button Component")
    const name = rawName.toLowerCase().replace(/\s+/g, '_'); // store as button_component
    
    const component = { name, props: [], tokenMapping: {}, accessibility: '', description: '' };
    
    // 1. Extract props table (must have exactly these columns)
    const tableRegex = /\|\s*([a-z]+)\s*\|\s*(enum|boolean|string)\s*\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|/gi;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      component.props.push({
        name: match[1],
        type: match[2],
        options: match[3].trim().split(/,\s*/),
        default: match[4].trim(),
        description: match[5].trim()
      });
    }
    
    // 2. Extract token mapping block
    const tokenMatch = content.match(/\*\*Token mapping:\*\*([\s\S]*?)(?=\n\*\*|$)/);
    if (tokenMatch) {
      const lines = tokenMatch[1].split('\n');
      lines.forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const value = line.slice(colonIdx+1).trim();
          component.tokenMapping[key] = value;
        }
      });
    }
    
    // 3. Extract accessibility block
    const a11yMatch = content.match(/\*\*Accessibility:\*\*([\s\S]*?)(?=\n\*\*|$)/);
    if (a11yMatch) component.accessibility = a11yMatch[1].trim();
    
    // Only add component if it has at least a table or token mapping
    if (component.props.length > 0 || Object.keys(component.tokenMapping).length > 0) {
      components.push(component);
    }
  }
  return components;
}

// ============================================
// RUN ALL EXTRACTIONS
// ============================================
console.log('📝 Extracting primitives... - parse-spec.js:224');
const primitives = extractPrimitives(markdown);
console.log('📝 Extracting semantic tokens... - parse-spec.js:226');
const semantic = extractSemantic(markdown);
console.log('📝 Extracting themes... - parse-spec.js:228');
const themes = extractThemes(markdown);
console.log('📝 Extracting component contracts (legacy)... - parse-spec.js:230');
const componentsLegacy = extractComponents(markdown);
console.log('📝 Extracting AI rules... - parse-spec.js:232');
const aiRules = extractAIRules(markdown);
console.log('📝 Extracting component catalog for Figma... - parse-spec.js:234');
const componentCatalog = extractComponentsCatalog(markdown);
console.log('📝 Generating CSS variables... - parse-spec.js:236');
const cssVariables = generateCSSVariables(themes);

// ============================================
// ENSURE DIRECTORIES EXIST
// ============================================
const dirs = ['tokens', 'tokens/themes', 'generated'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================
// WRITE ALL GENERATED FILES
// ============================================
fs.writeFileSync('tokens/primitives.json', JSON.stringify(primitives, null, 2));
console.log('✅ Written: tokens/primitives.json - parse-spec.js:251');

fs.writeFileSync('tokens/semantic.json', JSON.stringify(semantic, null, 2));
console.log('✅ Written: tokens/semantic.json - parse-spec.js:254');

Object.entries(themes).forEach(([themeName, themeValues]) => {
  fs.writeFileSync(`tokens/themes/${themeName}.json`, JSON.stringify(themeValues, null, 2));
  console.log(`✅ Written: tokens/themes/${themeName}.json - parse-spec.js:258`);
});

if (Object.keys(componentsLegacy).length > 0) {
  fs.writeFileSync('generated/components-legacy.json', JSON.stringify(componentsLegacy, null, 2));
  console.log('✅ Written: generated/componentslegacy.json - parse-spec.js:263');
} else {
  console.log('ℹ️ No legacy component contracts found  skipping - parse-spec.js:265');
}

fs.writeFileSync('generated/ai-rules.json', JSON.stringify(aiRules, null, 2));
console.log('✅ Written: generated/airules.json - parse-spec.js:269');

fs.writeFileSync('generated/prism-variables.css', cssVariables);
console.log('✅ Written: generated/prismvariables.css - parse-spec.js:272');

fs.writeFileSync('generated/component-catalog.json', JSON.stringify(componentCatalog, null, 2));
console.log('✅ Written: generated/componentcatalog.json - parse-spec.js:275');

const summary = {
  generatedAt: new Date().toISOString(),
  sourceFile: 'ai-rules.md',
  stats: {
    primitiveColors: Object.keys(primitives.color || {}).length,
    primitiveSpacing: Object.keys(primitives.spacing || {}).length,
    semanticTokens: Object.keys(semantic.color || {}).reduce((acc, cat) => acc + Object.keys(semantic.color[cat]).length, 0),
    themes: Object.keys(themes),
    aiRules: {
      token: aiRules.token.length,
      motion: aiRules.motion.length,
      theme: aiRules.theme.length,
      accessibility: aiRules.accessibility.length,
      agentic: aiRules.agentic.length
    }
  }
};
fs.writeFileSync('generated/spec-summary.json', JSON.stringify(summary, null, 2));
console.log('✅ Written: generated/specsummary.json - parse-spec.js:295');

console.log('\n🎉 DONE! All files generated from airules.md - parse-spec.js:297');
console.log(`\n📊 Summary: - parse-spec.js:298`);
console.log(`${summary.stats.primitiveColors} primitive colors - parse-spec.js:299`);
console.log(`${summary.stats.semanticTokens} semantic tokens - parse-spec.js:300`);
console.log(`${summary.stats.themes.length} themes: ${summary.stats.themes.join(', ')} - parse-spec.js:301`);
console.log(`${summary.stats.aiRules.token} token rules, ${summary.stats.aiRules.motion} motion rules - parse-spec.js:302`);
console.log('\n🚀 Run `npm run sync` anytime you update airules.md - parse-spec.js:303');