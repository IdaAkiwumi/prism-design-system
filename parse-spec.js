const fs = require('fs');
const path = require('path');

// Read your ai-rules.md file
const markdown = fs.readFileSync('ai-rules.md', 'utf8');

console.log('🔍 Parsing airules.md... - parse-spec.js:7');

// ============================================
// 1. EXTRACT PRIMITIVE TOKENS
// ============================================
function extractPrimitives(markdown) {
  const primitives = {
    color: {},
    spacing: {},
    motion: {}
  };
  
  // Extract colors: - color-blue-500: #0066CC
  const colorRegex = /- (color-[a-z]+-[0-9]+): (#[A-F0-9]{6})/gi;
  let match;
  while ((match = colorRegex.exec(markdown)) !== null) {
    const parts = match[1].split('-');
    const colorFamily = parts[1]; // blue, red, amber, gray, etc.
    const shade = parts[2]; // 500, 700, 900
    if (!primitives.color[colorFamily]) primitives.color[colorFamily] = {};
    primitives.color[colorFamily][shade] = { $value: match[2], $type: 'color' };
  }
  
  // Extract spacing: - spacing-8: 8px
  const spacingRegex = /- (spacing-[0-9]+): ([0-9]+)px/gi;
  while ((match = spacingRegex.exec(markdown)) !== null) {
    primitives.spacing[match[1]] = { $value: match[2], $type: 'dimension' };
  }
  
  // Extract motion duration: - duration-fast: 200ms
  const durationRegex = /- (duration-[a-z]+): ([0-9]+)ms/gi;
  while ((match = durationRegex.exec(markdown)) !== null) {
    if (!primitives.motion.duration) primitives.motion.duration = {};
    primitives.motion.duration[match[1]] = { $value: match[2] + 'ms', $type: 'duration' };
  }
  
  // Extract motion easing
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
  const semantic = {
    color: {}
  };
  
  // Match: - color-action-primary → color-blue-500
  const semanticRegex = /- (color-[a-z]+-[a-z]+) → ([a-z0-9-]+)/gi;
  let match;
  while ((match = semanticRegex.exec(markdown)) !== null) {
    const parts = match[1].split('-');
    const category = parts[1]; // action, feedback, text, surface
    const token = parts[2]; // primary, destructive, success, etc.
    
    if (!semantic.color[category]) semantic.color[category] = {};
    semantic.color[category][token] = { $value: `{${match[2]}}`, $type: 'color' };
  }
  
  // Also catch direct hex values like: - color-feedback-success → #00AA44
  const hexSemanticRegex = /- (color-[a-z]+-[a-z]+) → (#[A-F0-9]{6})/gi;
  while ((match = hexSemanticRegex.exec(markdown)) !== null) {
    const parts = match[1].split('-');
    const category = parts[1];
    const token = parts[2];
    
    if (!semantic.color[category]) semantic.color[category] = {};
    semantic.color[category][token] = { $value: match[2], $type: 'color' };
  }
  
  return semantic;
}

// ============================================
// 3. EXTRACT THEMES (FULL VALUES)
// ============================================
function extractThemes(markdown) {
  const themes = {};
  
  // Find each theme block between "THEME:" and the next theme or end of file
  const themeBlocks = markdown.split(/\n## Theme: /i);
  
  for (let i = 1; i < themeBlocks.length; i++) {
    const block = themeBlocks[i];
    const themeNameMatch = block.match(/^([A-Z]+)/i);
    if (!themeNameMatch) continue;
    
    const themeName = themeNameMatch[1].toLowerCase();
    themes[themeName] = {};
    
    // Extract ALL CSS variable values from the theme block
    // Matches: --color-action-primary: #0066CC
    const varRegex = /--([a-z-]+): (#[A-F0-9]{6}|#[A-F0-9]{3}|[a-z]+)/gi;
    let varMatch;
    while ((varMatch = varRegex.exec(block)) !== null) {
      themes[themeName][varMatch[1]] = varMatch[2];
    }
  }
  
  return themes;
}

// ============================================
// 4. EXTRACT COMPONENT CONTRACTS (if you add them)
// ============================================
function extractComponents(markdown) {
  const components = {};
  
  // Look for component sections (you can expand this)
  const componentMatches = markdown.match(/### ([A-Za-z]+) Component[\s\S]*?(?=### |$)/g);
  
  if (componentMatches) {
    componentMatches.forEach(compBlock => {
      const nameMatch = compBlock.match(/### ([A-Za-z]+) Component/);
      if (!nameMatch) return;
      
      const compName = nameMatch[1].toLowerCase();
      components[compName] = {};
      
      // Extract props table (if present in markdown table format)
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
// 5. EXTRACT AI RULES (for reference)
// ============================================
function extractAIRules(markdown) {
  const rules = {
    token: [],
    motion: [],
    theme: [],
    accessibility: [],
    agentic: []
  };
  
  // Extract token rules (between "Token Rules" and next section)
  const tokenSection = markdown.match(/## Token Rules([\s\S]*?)(?=\n## |$)/i);
  if (tokenSection) {
    rules.token = tokenSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  }
  
  // Extract motion rules
  const motionSection = markdown.match(/## Motion Rules([\s\S]*?)(?=\n## |$)/i);
  if (motionSection) {
    rules.motion = motionSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  }
  
  // Extract theme rules
  const themeSection = markdown.match(/## Theme Rules([\s\S]*?)(?=\n## |$)/i);
  if (themeSection) {
    rules.theme = themeSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  }
  
  // Extract accessibility rules
  const a11ySection = markdown.match(/## Accessibility([\s\S]*?)(?=\n## |$)/i);
  if (a11ySection) {
    rules.accessibility = a11ySection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  }
  
  // Extract agentic UI patterns
  const agenticSection = markdown.match(/## Agentic UI Patterns([\s\S]*?)(?=\n## |$)/i);
  if (agenticSection) {
    rules.agentic = agenticSection[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim());
  }
  
  return rules;
}

// ============================================
// 6. GENERATE CSS VARIABLES FILE FOR ENGINEERS
// ============================================
function generateCSSVariables(themes) {
  let css = `/* PRISM Design System - Generated from ai-rules.md */\n\n`;
  css += `/* BASE THEME (default) */\n:root {\n`;
  
  // Base theme variables
  if (themes.base) {
    Object.entries(themes.base).forEach(([varName, value]) => {
      css += `  --${varName}: ${value};\n`;
    });
  }
  css += `}\n\n`;
  
  // Other themes as data attributes
  Object.entries(themes).forEach(([themeName, vars]) => {
    if (themeName === 'base') return;
    css += `/* ${themeName.toUpperCase()} THEME */\n`;
    css += `[data-theme="${themeName}"] {\n`;
    Object.entries(vars).forEach(([varName, value]) => {
      css += `  --${varName}: ${value};\n`;
    });
    css += `}\n\n`;
  });
  
  return css;
}

// ============================================
// RUN EVERYTHING
// ============================================

console.log('📝 Extracting primitives... - parse-spec.js:228');
const primitives = extractPrimitives(markdown);

console.log('📝 Extracting semantic tokens... - parse-spec.js:231');
const semantic = extractSemantic(markdown);

console.log('📝 Extracting themes... - parse-spec.js:234');
const themes = extractThemes(markdown);

console.log('📝 Extracting component contracts... - parse-spec.js:237');
const components = extractComponents(markdown);

console.log('📝 Extracting AI rules... - parse-spec.js:240');
const aiRules = extractAIRules(markdown);

console.log('📝 Generating CSS variables... - parse-spec.js:243');
const cssVariables = generateCSSVariables(themes);

// ============================================
// WRITE ALL FILES
// ============================================

// Ensure directories exist
const dirs = ['tokens', 'tokens/themes', 'docs'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write primitive tokens
fs.writeFileSync('tokens/primitives.json', JSON.stringify(primitives, null, 2));
console.log('✅ Written: tokens/primitives.json - parse-spec.js:260');

// Write semantic tokens
fs.writeFileSync('tokens/semantic.json', JSON.stringify(semantic, null, 2));
console.log('✅ Written: tokens/semantic.json - parse-spec.js:264');

// Write theme files
Object.entries(themes).forEach(([themeName, themeValues]) => {
  fs.writeFileSync(`tokens/themes/${themeName}.json`, JSON.stringify(themeValues, null, 2));
  console.log(`✅ Written: tokens/themes/${themeName}.json - parse-spec.js:269`);
});

// Write component contracts (if any found)
if (Object.keys(components).length > 0) {
  fs.writeFileSync('tokens/components.json', JSON.stringify(components, null, 2));
  console.log('✅ Written: tokens/components.json - parse-spec.js:275');
}

// Write AI rules as JSON (for machine reading)
fs.writeFileSync('docs/ai-rules.json', JSON.stringify(aiRules, null, 2));
console.log('✅ Written: docs/airules.json - parse-spec.js:280');

// Write CSS variables file
fs.writeFileSync('docs/prism-variables.css', cssVariables);
console.log('✅ Written: docs/prismvariables.css - parse-spec.js:284');

// Write a summary file
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

fs.writeFileSync('docs/spec-summary.json', JSON.stringify(summary, null, 2));
console.log('✅ Written: docs/specsummary.json - parse-spec.js:306');

console.log('\n🎉 DONE! All files generated from airules.md - parse-spec.js:308');
console.log('\n📊 Summary: - parse-spec.js:309');
console.log(`${summary.stats.primitiveColors} primitive colors - parse-spec.js:310`);
console.log(`${summary.stats.semanticTokens} semantic tokens - parse-spec.js:311`);
console.log(`${summary.stats.themes.length} themes: ${summary.stats.themes.join(', ')} - parse-spec.js:312`);
console.log(`${summary.stats.aiRules.token} token rules, ${summary.stats.aiRules.motion} motion rules - parse-spec.js:313`);
console.log('\n🚀 Run `npm run sync` anytime you update airules.md - parse-spec.js:314');