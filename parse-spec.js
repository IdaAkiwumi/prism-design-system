const fs = require('fs');
const path = require('path');

// Read your ai-rules.md file
const markdown = fs.readFileSync('ai-rules.md', 'utf8');

console.log('🔍 Parsing airules.md... - parse-spec.js:7');

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
  
  const semanticRegex = /- (color-[a-z]+-[a-z]+) → ([a-z0-9-]+)/gi;
  let match;
  while ((match = semanticRegex.exec(markdown)) !== null) {
    const parts = match[1].split('-');
    const category = parts[1];
    const token = parts[2];
    if (!semantic.color[category]) semantic.color[category] = {};
    semantic.color[category][token] = { $value: `{${match[2]}}`, $type: 'color' };
  }
  
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
// 3. EXTRACT THEMES (UPDATED LINE-BY-LINE)
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
      i++; // skip separator line
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
    if (inTable && (line === '' || line.startsWith('##'))) {
      inTable = false;
    }
  }
  return themes;
}

// ============================================
// 4. EXTRACT COMPONENT CONTRACTS
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
  let css = `/* PRISM Design System - Generated from ai-rules.md */\n\n`;
  css += `/* BASE THEME (default) */\n:root {\n`;
  if (themes.base) {
    Object.entries(themes.base).forEach(([varName, value]) => {
      css += `  --${varName}: ${value};\n`;
    });
  }
  css += `}\n\n`;
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
console.log('📝 Extracting primitives... - parse-spec.js:183');
const primitives = extractPrimitives(markdown);
console.log('📝 Extracting semantic tokens... - parse-spec.js:185');
const semantic = extractSemantic(markdown);
console.log('📝 Extracting themes... - parse-spec.js:187');
const themes = extractThemes(markdown);
console.log('📝 Extracting component contracts... - parse-spec.js:189');
const components = extractComponents(markdown);
console.log('📝 Extracting AI rules... - parse-spec.js:191');
const aiRules = extractAIRules(markdown);
console.log('📝 Generating CSS variables... - parse-spec.js:193');
const cssVariables = generateCSSVariables(themes);

// Create directories: tokens/ and generated/
const dirs = ['tokens', 'tokens/themes', 'generated'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

fs.writeFileSync('tokens/primitives.json', JSON.stringify(primitives, null, 2));
console.log('✅ Written: tokens/primitives.json - parse-spec.js:205');

fs.writeFileSync('tokens/semantic.json', JSON.stringify(semantic, null, 2));
console.log('✅ Written: tokens/semantic.json - parse-spec.js:208');

Object.entries(themes).forEach(([themeName, themeValues]) => {
  fs.writeFileSync(`tokens/themes/${themeName}.json`, JSON.stringify(themeValues, null, 2));
  console.log(`✅ Written: tokens/themes/${themeName}.json - parse-spec.js:212`);
});

if (Object.keys(components).length > 0) {
  fs.writeFileSync('generated/components.json', JSON.stringify(components, null, 2));
  console.log('✅ Written: generated/components.json - parse-spec.js:217');
} else {
  console.log('ℹ️ No component contracts found  skipping components.json - parse-spec.js:219');
}

fs.writeFileSync('generated/ai-rules.json', JSON.stringify(aiRules, null, 2));
console.log('✅ Written: generated/airules.json - parse-spec.js:223');

fs.writeFileSync('generated/prism-variables.css', cssVariables);
console.log('✅ Written: generated/prismvariables.css - parse-spec.js:226');

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
console.log('✅ Written: generated/specsummary.json - parse-spec.js:247');

console.log('\n🎉 DONE! All files generated from airules.md - parse-spec.js:249');
console.log(`\n📊 Summary: - parse-spec.js:250`);
console.log(`${summary.stats.primitiveColors} primitive colors - parse-spec.js:251`);
console.log(`${summary.stats.semanticTokens} semantic tokens - parse-spec.js:252`);
console.log(`${summary.stats.themes.length} themes: ${summary.stats.themes.join(', ')} - parse-spec.js:253`);
console.log(`${summary.stats.aiRules.token} token rules, ${summary.stats.aiRules.motion} motion rules - parse-spec.js:254`);
console.log('\n🚀 Run `npm run sync` anytime you update airules.md - parse-spec.js:255');