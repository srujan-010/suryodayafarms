async function main() {
  try {
    const res = await fetch('http://localhost:5000/api/products?limit=100');
    const data = await res.json();
    console.log("API response success:", data.success);
    console.log("API products count:", data.products?.length);
    if (data.products && data.products.length > 0) {
      console.log("Sample product name:", data.products[0].name);
      console.log("Sample product categories:", JSON.stringify(data.products[0].categories, null, 2));
    }
  } catch (err) {
    console.error("API test failed:", err.message);
  }
}

main();
