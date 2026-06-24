async function test() {
  try {
    const res = await fetch('https://suryodayafarms.onrender.com/api/products');
    const data = await res.json();
    console.log("=== PRODUCTS ===");
    data.products.forEach(p => {
      console.log(JSON.stringify({
        id: p.id || p._id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url || p.image,
        category: p.categories?.[0]?.name
      }));
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
