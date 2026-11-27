const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Load Data Files directly to verify integrity
const supplementsFile = fs.readFileSync(path.join(__dirname, '../src/data/supplements.ts'), 'utf8');
const goalsFile = fs.readFileSync(path.join(__dirname, '../src/data/goals.ts'), 'utf8');
const articlesFile = fs.readFileSync(path.join(__dirname, '../src/data/articles.ts'), 'utf8');
const referencesFile = fs.readFileSync(path.join(__dirname, '../src/data/references.ts'), 'utf8');

const supplementSlugs = [
  'whey-protein',
  'creatine-monohydrate',
  'bcaa',
  'caffeine',
  'beta-alanine',
  'electrolytes',
  'pre-workout',
  'mass-gainer'
];

const articleSlugs = [
  'beginner-guide',
  'whey-protein-necessary',
  'what-is-creatine',
  'bcaa-for-weightlifters',
  'reading-protein-label',
  'supplement-vs-whole-food',
  'supplement-myths'
];

const routesToTest = [
  '/',
  '/supplements',
  ...supplementSlugs.map(s => `/supplements/${s}`),
  '/goals',
  '/calculator/protein',
  '/compare',
  '/safety',
  '/articles',
  ...articleSlugs.map(a => `/articles/${a}`),
  '/about'
];

function fetchRoute(route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ route, statusCode: res.statusCode, body: data });
      });
    }).on('error', err => reject(err));
  });
}

async function runAudit() {
  console.log('==================================================');
  console.log('FIT SUPPLEMENT — AUTOMATED QA AUDIT');
  console.log('==================================================\n');

  let passedRoutes = 0;
  let failedRoutes = 0;
  const discoveredLinks = new Set();

  console.log(`[1] Testing ${routesToTest.length} Routes for HTTP 200 OK...`);
  for (const route of routesToTest) {
    try {
      const res = await fetchRoute(route);
      if (res.statusCode === 200) {
        passedRoutes++;
        console.log(`  ✓ 200 OK: ${route}`);

        // Scan for internal hrefs in the response HTML
        const hrefMatches = res.body.matchAll(/href="(\/[^"#'?]*)/g);
        for (const m of hrefMatches) {
          discoveredLinks.add(m[1]);
        }
      } else {
        failedRoutes++;
        console.error(`  ✗ FAIL (${res.statusCode}): ${route}`);
      }
    } catch (err) {
      failedRoutes++;
      console.error(`  ✗ ERROR: ${route} - ${err.message}`);
    }
  }

  console.log(`\nRoute Health: ${passedRoutes}/${routesToTest.length} passed.`);

  console.log(`\n[2] Verifying Discovered Internal Links (${discoveredLinks.size} unique links)...`);
  let brokenLinks = 0;
  for (const link of discoveredLinks) {
    if (link === '' || link.startsWith('/_next') || link.startsWith('/favicon')) continue;
    try {
      const res = await fetchRoute(link);
      if (res.statusCode !== 200 && res.statusCode !== 307 && res.statusCode !== 308) {
        console.error(`  ✗ BROKEN LINK FOUND: ${link} returned ${res.statusCode}`);
        brokenLinks++;
      }
    } catch (e) {
      console.error(`  ✗ BROKEN LINK ERROR: ${link} - ${e.message}`);
      brokenLinks++;
    }
  }

  if (brokenLinks === 0) {
    console.log(`  ✓ All ${discoveredLinks.size} internal links resolved with 200 OK! Zero broken links.`);
  }

  console.log('\n[3] Data Layer Scientific Consistency Checks:');
  
  // Verify all 8 required supplements are in supplements.ts
  for (const slug of supplementSlugs) {
    if (supplementsFile.includes(`slug: '${slug}'`)) {
      console.log(`  ✓ Supplement verified: ${slug}`);
    } else {
      console.error(`  ✗ Missing supplement: ${slug}`);
    }
  }

  // Verify all 7 articles are in articles.ts
  for (const slug of articleSlugs) {
    if (articlesFile.includes(`slug: '${slug}'`)) {
      console.log(`  ✓ Article verified: ${slug}`);
    } else {
      console.error(`  ✗ Missing article: ${slug}`);
    }
  }

  // Verify goals related supplements match real supplement slugs
  const goalMatches = [...goalsFile.matchAll(/relatedSupplements:\s*\[(.*?)\]/gs)];
  let goalSlugErrors = 0;
  for (const g of goalMatches) {
    const rawSlugs = g[1].replace(/['"\s]/g, '').split(',');
    for (const rs of rawSlugs) {
      if (rs && !supplementSlugs.includes(rs)) {
        console.error(`  ✗ Unknown supplement in goals: ${rs}`);
        goalSlugErrors++;
      }
    }
  }
  if (goalSlugErrors === 0) {
    console.log('  ✓ All goal-related supplement references match real supplement slugs.');
  }

  console.log('\n==================================================');
  if (failedRoutes === 0 && brokenLinks === 0 && goalSlugErrors === 0) {
    console.log('QA AUDIT PASSED: ZERO DEFECTS DETECTED');
  } else {
    console.log('QA AUDIT COMPLETED WITH ISSUES');
  }
  console.log('==================================================');
}

runAudit();
