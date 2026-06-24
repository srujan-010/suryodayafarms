async function test() {
  try {
    const res = await fetch('https://suryodayafarms.onrender.com/api/public/homepage');
    const data = await res.json();
    console.log("=== HEROES ===");
    console.log(JSON.stringify(data.heroes || data.hero, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
