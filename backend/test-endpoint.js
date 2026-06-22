import axios from 'axios';

async function test() {
  try {
    const response = await axios.get('https://suryodayafarms.onrender.com/api/products?limit=100');
    console.log("Success:", response.data.success);
    console.log("Count:", response.data.count);
    if (response.data.products) {
      console.log("First product sample:", JSON.stringify(response.data.products[0], null, 2));
    }
  } catch (err) {
    console.error("Error fetching from API:", err.message);
  }
}

test();
