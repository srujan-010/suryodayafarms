# TestSprite Product Test Data

This file contains the test product description and API payload generated for testing the Suryodaya Farms application using TestSprite.

## Product Details (For UI/Form Testing)

* **Product Name:** `Premium Wood-Pressed Yellow Mustard Oil – 1L`
* **Brand:** `Suryodaya Farms`
* **SKU:** `TEST-OIL-YMRD-1L`
* **Price (Sale Price):** `380`
* **Compare At Price (Original Price):** `450`
* **MRP:** `450`
* **Tax Percent:** `5`
* **Weight / Size:** `1 Litre`
* **Stock Status:** `IN_STOCK`
* **Inventory Count:** `150`
* **Shelf Life:** `12 Months`
* **Origin:** `Rajasthan, India`
* **Delivery ETA:** `2-4 Days`
* **Nutrient Information:** `Rich in Monounsaturated Fatty Acids (MUFA), Omega-3, and Omega-6.`
* **Short Description:** 100% pure, single-press cold-extracted yellow mustard oil from native organic seeds.
* **Full Description:** Suryodaya Farms' Premium Wood-Pressed Yellow Mustard Oil is traditionally extracted using wooden ghani at low temperatures to preserve all natural nutrients, rich flavor, and health properties. Pressed from select high-quality organic yellow mustard seeds, this oil is ideal for authentic Indian cooking, sautéing, pickling, and skin care. It contains no artificial colors, chemicals, or preservatives.
* **SEO Title:** `Buy Premium Wood-Pressed Yellow Mustard Oil Online | Suryodaya Farms`
* **SEO Description:** `Shop pure and traditional wood-pressed yellow mustard oil. 100% unrefined cold-pressed oil extracted at low temperatures for maximum health benefits.`
* **SEO Keywords:** `yellow mustard oil, cold pressed oil, wood pressed oil, mustard oil online, organic oil`

---

## JSON Payload (For API Endpoint Testing)

Use the JSON below for automated API tests targeting the `POST /api/admin/products` endpoint.

> [!NOTE]
> Make sure to replace `YOUR_CATEGORY_ID` with a valid category UUID from your database (e.g. from the `Category` table).

```json
{
  "name": "Premium Wood-Pressed Yellow Mustard Oil – 1L",
  "categoryIds": ["YOUR_CATEGORY_ID"],
  "brand": "Suryodaya Farms",
  "productType": "Cold Pressed Oils",
  "price": 380,
  "compareAtPrice": 450,
  "mrp": 450,
  "discountPercent": 15.5,
  "taxPercent": 5,
  "stockStatus": "IN_STOCK",
  "sku": "TEST-OIL-YMRD-1L",
  "inventory": 150,
  "weight": "1 Litre",
  "origin": "Rajasthan, India",
  "shelfLife": "12 Months",
  "deliveryEta": "2-4 Days",
  "shortDescription": "100% pure, single-press cold-extracted yellow mustard oil from native organic seeds.",
  "description": "Suryodaya Farms' Premium Wood-Pressed Yellow Mustard Oil is traditionally extracted using wooden ghani at low temperatures to preserve all natural nutrients, rich flavor, and health properties. Pressed from select high-quality organic yellow mustard seeds, this oil is ideal for authentic Indian cooking, sautéing, pickling, and skin care. It contains no artificial colors, chemicals, or preservatives.",
  "isFeatured": true,
  "isTrending": false,
  "isBestseller": true,
  "isNewLaunch": true,
  "isVisible": true,
  "isComingSoon": false,
  "codAvailable": true,
  "returnEligible": false,
  "seoTitle": "Buy Premium Wood-Pressed Yellow Mustard Oil Online | Suryodaya Farms",
  "seoDescription": "Shop pure and traditional wood-pressed yellow mustard oil. 100% unrefined cold-pressed oil extracted at low temperatures for maximum health benefits.",
  "seoKeywords": "yellow mustard oil, cold pressed oil, wood pressed oil, mustard oil online, organic oil",
  "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800"
}
```
