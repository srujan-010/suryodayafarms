async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/public/homepage');
    const data = await res.json();
    console.log("=== API public/homepage response success ===");
    console.log("Success:", data.success);
    
    console.log("\n=== Categories in response ===");
    console.log(JSON.stringify(data.categories, null, 2));

    console.log("\n=== Collections in response ===");
    console.log(JSON.stringify(data.collections, null, 2));
    
  } catch (err) {
    console.error("Error fetching from API:", err.message);
  }
}

test();
