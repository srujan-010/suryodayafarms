async function test() {
  try {
    const res = await fetch('https://suryodayafarms.onrender.com/api/public/homepage');
    const data = await res.json();
    console.log("=== HERO SLIDES ===");
    data.heroes.forEach(h => {
      console.log(JSON.stringify({
        id: h.id,
        headingLine1: h.headingLine1,
        headingHighlight: h.headingHighlight,
        headingLine2: h.headingLine2,
        heroImage: h.heroImage,
        featuredProductName: h.featuredProduct?.name,
        featuredProductSlug: h.featuredProduct?.slug,
        featuredProductImage: h.featuredProduct?.images?.[0]?.url
      }));
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
