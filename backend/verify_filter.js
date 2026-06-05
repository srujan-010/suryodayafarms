async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/public/homepage');
    const data = await res.json();
    const homepageCollections = data.collections || [];
    
    console.log("homepageCollections count:", homepageCollections.length);
    
    const dynamicCats = homepageCollections.filter(c => {
      console.log(`Checking collection title: "${c.title}"`);
      console.log(`  description is type: ${typeof c.description}`);
      console.log(`  description value: ${c.description}`);
      if (c.description) {
        console.log(`  description starts with '{': ${c.description.startsWith('{')}`);
      }
      
      if (c.description && c.description.startsWith('{')) {
        try {
          const parsed = JSON.parse(c.description);
          console.log(`  parsed isPromoCategory:`, parsed.isPromoCategory);
          return !!parsed.isPromoCategory;
        } catch (e) {
          console.log(`  JSON parse error:`, e.message);
        }
      }
      return false;
    });
    
    console.log("\ndynamicCats count:", dynamicCats.length);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
