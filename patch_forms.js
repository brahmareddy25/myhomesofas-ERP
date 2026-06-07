const fs = require('fs');

const files = [
  'src/app/(dashboard)/expenses/ExpenseForm.tsx',
  'src/app/(dashboard)/inventory/InventoryForm.tsx',
  'src/app/(dashboard)/orders/OrderForm.tsx'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');

    if (!content.includes('StoreSelector')) {
      // 1. Add import
      content = content.replace(
        /import \{ (.*) \} from "lucide-react";/,
        'import { $1 } from "lucide-react";\nimport StoreSelector from "@/components/ui/StoreSelector";'
      );

      // 2. Add state
      const formCompRegex = /(export default function [a-zA-Z]+Form\([^)]*\)\s*\{\s*)(const router = useRouter\(\);)/;
      content = content.replace(formCompRegex, '$1$2\n  const [storeId, setStoreId] = useState("");');

      // 3. Add to payload
      const payloadRegex = /(const payload = \{[\s\S]*?)(};)/;
      if (content.match(payloadRegex)) {
        content = content.replace(payloadRegex, '$1  storeId: storeId || undefined\n$2');
      }

      // 4. Add UI component
      const formTagRegex = /(<form onSubmit=\{handleSubmit\}[^>]*>)/;
      content = content.replace(formTagRegex, '$1\n      {/* Store Selector */}\n      {!(initialData || employeeId || Object.keys(initialData || {}).length) && <StoreSelector value={storeId} onChange={setStoreId} />}');
      
      // Specifically fix the condition for displaying StoreSelector. If the prop is not employeeId, it's just initialData.
      content = content.replace(/{!\(initialData \|\| employeeId \|\| Object\.keys\(initialData \|\| \{\}\)\.length\) && <StoreSelector value=\{storeId\} onChange=\{setStoreId\} \/>}/,
      '{!initialData && <StoreSelector value={storeId} onChange={setStoreId} />}');

      fs.writeFileSync(f, content, 'utf8');
      console.log(`Patched ${f}`);
    }
  }
}
