const fs = require('fs');
const path = require('path');

const apiDirs = [
  'employees', 'expenses', 'inventory', 'measurements', 'orders', 'quotations', 'transporters'
];

for (const dir of apiDirs) {
  const routePath = path.join(__dirname, 'src/app/api', dir, 'route.ts');
  if (fs.existsSync(routePath)) {
    let content = fs.readFileSync(routePath, 'utf8');

    // Pattern to replace
    const oldPattern = /const storeId = \(session\.user as any\)\.storeId;\s*if \(\!storeId\) \{\s*return NextResponse\.json\(\{ error: "No store context for user" \}, \{ status: 400 \}\);\s*\}/;
    
    // Some routes might fetch req.json() later. Let's do a more robust replacement.
    // Replace old pattern with our new one, but we MUST ensure `data` doesn't conflict.
    // Instead of `const data = await req.json()`, we'll just parse it if Admin needs it.
    
    // Let's do a regex replacement that matches the storeId extraction
    const newReplacement = `
    const role = (session.user as any).role;
    let storeId = (session.user as any).storeId;
    
    // We will parse JSON body lazily to get storeId if Admin
    let bodyData: any = {};
    try {
      // Clone the request so we can read json multiple times
      const reqClone = req.clone();
      bodyData = await reqClone.json();
    } catch (e) {}

    if (role === "Admin" && bodyData.storeId) {
      storeId = bodyData.storeId;
    }

    if (!storeId) {
      return NextResponse.json({ error: "No store context for user. Please select a store." }, { status: 400 });
    }
    `;

    if (content.match(oldPattern)) {
      content = content.replace(oldPattern, newReplacement);
      fs.writeFileSync(routePath, content, 'utf8');
      console.log(`Patched ${routePath}`);
    } else {
      console.log(`Could not find pattern in ${routePath}`);
    }
  }
}
