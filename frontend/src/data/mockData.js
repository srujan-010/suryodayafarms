// Suryodaya Farms Premium Mock Data Layer

// 1. Organic Farming Process Steps
export const farmingProcessSteps = [
  {
    id: 1,
    title: "Soil Enrichment",
    description: "We naturally enrich the soil using Panchagavya, Jeevamrutham, and organic compost, establishing a robust microbes ecosystem long before seeds are sown.",
    icon: "GiEarthWorm",
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Native Seed Selection",
    description: "We preserve biodiverse heirloom seeds (Desi breeds) passed down through generations, selected for their rich nutrient profile and natural resilience.",
    icon: "GiSeedling",
    image: "https://images.unsplash.com/photo-1532499016263-f2c3e89df9cd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Natural Cultivation",
    description: "Without chemical pesticides or artificial growth enhancers, we rely on nature's beneficial insects, multi-cropping, and natural pest-repellent extracts.",
    icon: "GiWateringCan",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    title: "Artisanal Harvesting",
    description: "Crops are hand-harvested at the peak of their nutritional content. Our farmers assess ripeness using traditional wisdom, ensuring maximum vitality.",
    icon: "GiScythe",
    image: "https://images.unsplash.com/photo-1533752128965-042517852b7a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    title: "Cold / Wood Pressing",
    description: "For our premium oils, we use traditional wood-press systems (Ghani) at extremely slow speeds, preserving sensitive enzymes, aromas, and vitamins.",
    icon: "GiOilDrum",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    title: "Sustainable Packaging",
    description: "To complete the circle of respect for mother earth, we pack fresh harvests in eco-friendly glass jars, organic cloth, and biodegradable cardboard boxes.",
    icon: "GiGiftBox",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=800"
  }
];

// 2. Premium Organic Products
export const products = [
  {
    id: "p1",
    name: "A2 Gir Cow Ghee (Bilona)",
    category: "Dairy",
    price: "₹1,450 / 500ml",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Traditional wood-churned A2 ghee made from the milk of free-grazing native Gir cows.",
    longDesc: "Our premium A2 Gir Cow Ghee is crafted using the ancient Bilona method. We first boil the nutritious A2 milk, convert it to curd, and slow-churn the curd using wooden churners in the early hours of sunrise. The butter obtained is then clarified over low wood-fire heat to produce highly aromatic, granular ghee loaded with vitamins, healthy fatty acids, and gut-healing properties.",
    benefits: ["Rich in Vitamin A, D, E, K", "Aromatic granular texture", "Improves digestion & joint health", "Sourced from free-grazing native Indian cows"],
    origin: "Gir Conservation Zone, Suryodaya Farms",
    isComingSoon: false,
    nutrients: "Energy: 897 kcal, Healthy Fats: 99.6g, Vitamin A: 850mcg (per 100g)"
  },
  {
    id: "p2",
    name: "Wood Pressed Mustard Oil",
    category: "Cold Pressed Oils",
    price: "₹380 / 1 Liter",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Pungent, cold-extracted oil from organic mustard seeds using traditional wooden ghanis.",
    longDesc: "Pressed slowly at low temperatures under 35°C in wooden ghanis (Vaagai wood), this mustard oil retains its strong native aroma, high concentration of MUFA, and active nutrients. No heat or solvents are ever added, resulting in a rich golden oil that enhances Indian culinary tastes while guarding cardiac wellness.",
    benefits: ["100% natural, single-press", "Zero chemicals & preservatives", "Excellent source of Omega-3", "Helps clear congestion and supports digestion"],
    origin: "Mustard Plots, Suryodaya North Fields",
    isComingSoon: false,
    nutrients: "Monounsaturated Fats: 59g, Polyunsaturated Fats: 21g, Zero Trans Fats"
  },
  {
    id: "p3",
    name: "Heirloom Pearl Millet (Bajra)",
    category: "Millets",
    price: "₹180 / 1 Kg",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Gluten-free, highly nutritious ancient grain harvested from rain-fed arid fields.",
    longDesc: "Harvested by hand in our rain-fed fields, Suryodaya Pearl Millet is an ancient, gluten-free power grain. Rich in complex carbs, iron, and magnesium, it digests slowly, keeping blood sugars steady and providing steady energy throughout the day. It is an perfect substitute for rice or wheat in modern daily diets.",
    benefits: ["High in Iron and Zinc", "Gluten-free digestive aid", "Slow-release complex carbohydrates", "Preserves traditional seed lineages"],
    origin: "Drylands Plot B, Suryodaya Farms",
    isComingSoon: false,
    nutrients: "Fiber: 8.9g, Protein: 11.6g, Iron: 8mg (per 100g)"
  },
  {
    id: "p4",
    name: "Wood Pressed Groundnut Oil",
    category: "Cold Pressed Oils",
    price: "₹420 / 1 Liter",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Highly aromatic wood-pressed peanut oil with a smooth, sweet, nutty finish.",
    longDesc: "Extracted carefully from naturally dried, sun-cured premium organic peanuts using wooden press cylinders. This oil captures the original flavor of peanuts with absolute purity. Because it is never heated artificially, it remains high in Vitamin E and antioxidants, boasting a high smoke point perfect for sautéing and deep frying.",
    benefits: ["High smoke point for cooking", "Rich in natural Vitamin E", "Zero cholesterol, heart-healthy", "Sweet, authentic peanut aroma"],
    origin: "Suryodaya Groundnut Fields, Wardha",
    isComingSoon: false,
    nutrients: "Vitamin E: 15.7mg, Monounsaturated Fats: 46.2g (per 100g)"
  },
  {
    id: "p5",
    name: "Ancient Finger Millet (Ragi)",
    category: "Millets",
    price: "₹160 / 1 Kg",
    image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Calcium-rich super millet, stone-ground to preserve the high fiber germ layer.",
    longDesc: "Sourced from native organic seeds, our Finger Millet (Ragi) has up to 3 times more calcium than milk. It is stone-ground at low revolutions to prevent heating, keeping all dietary fibers, amino acids, and essential minerals completely intact. Ideal for making traditional ragi mudde, rotis, or healthy breakfast porridges.",
    benefits: ["Unmatched natural calcium content", "Highly recommended for kids and infants", "Rich in essential amino acids", "100% whole grain, unprocessed"],
    origin: "Highland Plots, Suryodaya Farms",
    isComingSoon: false,
    nutrients: "Calcium: 344mg, Protein: 7.3g, Dietary Fiber: 11.5g (per 100g)"
  },
  {
    id: "p6",
    name: "Organically Grown Alphonso Mangoes",
    category: "Fruits",
    price: "₹1,200 / Dozen",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Rich, luscious, naturally ripened Alphonso mangoes straight from our orchard trees.",
    longDesc: "Grown in our premium chemical-free coastal orchards, these Alphonso Mangoes are nurtured using natural organic manures and herbal sprays. They are hand-picked at partial maturity and allowed to ripen naturally in hay layers inside dry rooms. The result is an intensely sweet, non-fibrous pulp with an enchanting, heavenly fragrance.",
    benefits: ["Naturally ripened in straw (no carbide)", "Rich, velvety pulp texture", "Intensely sweet, authentic aroma", "Direct tree-to-home delivery"],
    origin: "Mango Orchards, Suryodaya West",
    isComingSoon: true,
    nutrients: "Vitamin C: 36.4mg, Vitamin A: 1082IU, Rich in Folates (per 100g)"
  },
  {
    id: "p7",
    name: "Sun-Dried Basmati Grains (Long Grain)",
    category: "Organic Grains",
    price: "₹240 / 1 Kg",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Premium, aged aromatic basmati rice nurtured with organic mountain runoff water.",
    longDesc: "Harvested lovingly from fertile soils at the foothills of the farm, our premium basmati rice is aged naturally for over 12 months. This process reduces moisture, intensifying its classic nutty fragrance and expanding the grains up to twice their size during cooking. Grown with strictly organic bio-fertilizers and pristine water feeds.",
    benefits: ["Naturally aged for 1+ years", "Slender, extra-long grains", "Exquisite natural fragrance", "Low glycemic index compared to polished rice"],
    origin: "Paddy Meadows, Suryodaya Farms",
    isComingSoon: false,
    nutrients: "Carbohydrates: 78g, Protein: 8.1g, Dietary Fiber: 2.2g (per 100g)"
  },
  {
    id: "p8",
    name: "Heirloom Vine Tomatoes",
    category: "Vegetables",
    price: "₹120 / 1 Kg",
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Sweet, juicy heirloom tomatoes vine-ripened and handpicked under the morning sun.",
    longDesc: "Grown in native organic compost, our heirloom tomatoes are picked only when they display deep crimson shades. They carry a perfect balance of sweetness and acidity, with thin skins and rich flesh. Free from chemical accelerators or artificial wax coatings.",
    benefits: ["Rich in Lycopene antioxidants", "Fully vine-ripened for maximum taste", "No artificial ripening sprays", "Freshly harvested on dispatch morning"],
    origin: "Vegetable Polyhouse A, Suryodaya Farms",
    isComingSoon: false,
    nutrients: "Lycopene: 3.1mg, Vitamin C: 13.7mg, Water Content: 94%"
  },
  {
    id: "p9",
    name: "Cold Pressed Coconut Oil",
    category: "Cold Pressed Oils",
    price: "₹450 / 1 Liter",
    image: "https://images.unsplash.com/photo-1622484211148-716298516089?auto=format&fit=crop&q=80&w=800",
    shortDesc: "Pure, crystal clear wood-pressed oil extracted from sun-dried organic coconut copra.",
    longDesc: "Our raw coconut oil is extracted in small batches using traditional wooden churns from organically grown, sulphur-free copra. It is filtered naturally through sun sediment action, keeping its rich lauric acid content and delicate, fresh coconut flavor fully intact. Ideal for cooking, raw consumption, and moisturizing skin.",
    benefits: ["Contains 50% Lauric Acid", "100% Sulphur-free copra selection", "Unrefined & unbleached", "Boosts metabolism and immune functions"],
    origin: "Coconut Groves, Suryodaya South Orchards",
    isComingSoon: false,
    nutrients: "Lauric Acid: 50.1g, Caprylic Acid: 7.8g, Medium Chain Triglycerides: 64%"
  }
];

// 3. Farm Gallery Items
export const galleryItems = [
  {
    id: 1,
    title: "Soil Microbiome Testing",
    category: "Scientific Farming",
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200",
    description: "Taking soil core samples in our Wardha fields to run microbiological counts, ensuring a thriving community of beneficial fungi and nitrogen-fixing bacteria."
  },
  {
    id: 2,
    title: "Cold Wood Pressing Vagai Logs",
    category: "Natural Nutrition",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=1200",
    description: "Our high-density Vaagai wood presses operating at slow speeds, cold-extracting seed oils without exceeding 35°C to protect delicate botanical nutrients."
  },
  {
    id: 3,
    title: "Moringa Superfood Harvesting",
    category: "Superfoods",
    image: "https://images.unsplash.com/photo-1532499016263-f2c3e89df9cd?auto=format&fit=crop&q=80&w=1200",
    description: "Hand-harvesting fresh, nutrient-dense Moringa leaves, which are gently washed and shade-dried to retain up to 90% of their active Vitamin A and C value."
  },
  {
    id: 4,
    title: "Hygienic Sprouted Grains",
    category: "Wellness & Healthy Living",
    image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=1200",
    description: "Strictly monitored sprouting of organic finger millet (Ragi), which boosts iron absorption and unlocks bioactive enzymes for clean daily wellness."
  },
  {
    id: 5,
    title: "Vibrant Wheatgrass Trays",
    category: "Wellness & Healthy Living",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200",
    description: "Trays of vibrant organic wheatgrass nurtured under natural sun and morning mist, ready for low-speed cold-juicing extraction."
  },
  {
    id: 6,
    title: "Vedic Curd Churning",
    category: "Natural Nutrition",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=1200",
    description: "Curd made from Gir Cow A2 milk being slowly churned using double-directional wooden rods to isolate butter for ghee clarification."
  },
  {
    id: 7,
    title: "Pristine Packaging Standard",
    category: "Wellness & Healthy Living",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=1200",
    description: "Our farm-to-consumer glass jars and biodegradable cartons being packed in a temperature-controlled, sanitized clean room."
  },
  {
    id: 8,
    title: "Shade-Drying Medicinal Herbs",
    category: "Superfoods",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200",
    description: "Gentle shade drying of functional botanicals, preserving active organic compounds and essential oils."
  }
];

// 4. Customer & Farmer Testimonials
export const testimonials = [
  {
    id: 1,
    name: "Dr. Radhika Krishnan",
    role: "Ayurveda Practitioner & Health Advisor",
    review: "Suryodaya's cold wood-pressed sesame oil and Bilona A2 ghee are foundational to high-potency nutritional therapies. The bio-availability of nutrients is outstanding because they preserve active natural enzymes by avoiding heat and solvent refinement. A remarkable standard of purity.",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Verified Consumer"
  },
  {
    id: 2,
    name: "Prof. Amit V. Sathe",
    role: "Agritech Researcher & Nutritionist",
    review: "What sets Suryodaya Farms apart is their scientifically guided production combined with traditional wisdom. Their focus on dryland multi-cropping and soil microbiome enrichment yields crops with significantly higher trace mineral and antioxidant levels. This is science meeting heritage.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Cooperative Farmer"
  },
  {
    id: 3,
    name: "Shalini Sen",
    role: "Functional Wellness Coach",
    review: "I recommend Suryodaya's organic grains, especially sprouted finger millet, to all my clients seeking digestive wellness and clean energy. Being gluten-free and processed under strictly hygienic standards, it provides a stable slow-release carb profile that nourishes rather than spikes.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Verified Consumer"
  },
  {
    id: 4,
    name: "Rajesh Verma",
    role: "Executive Chef, Wellness Retreat",
    review: "In clean culinary arts, the purity of base oils and grains is non-negotiable. The fragrant wood-pressed mustard oil and sun-dried long-grain rice from Suryodaya are magnificent. No artificial preservatives or bleaching clays—just honest, farm-to-consumer nutrition.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Commercial Partner"
  }
];

// 5. Editorial Blog Articles
export const blogArticles = [
  {
    id: "b1",
    title: "Moringa: The Green Powerhouse of Ancient Nutrition",
    category: "Superfood Science",
    date: "May 28, 2026",
    readTime: "5 min read",
    summary: "Packed with over 90 nutrients and 46 antioxidants, Moringa oleifera is nature's ultimate multi-vitamin. Explore the science behind its organic cultivation.",
    content: "Often called the 'Miracle Tree', Moringa oleifera has been valued in traditional Indian wellness for thousands of years. Modern scientific analysis fully validates this heritage: gram-for-gram, fresh moringa leaves carry 7 times the Vitamin C of oranges, 4 times the calcium of milk, and 3 times the potassium of bananas.\n\nOur farmers harvest moringa at the break of dawn when leaf vitality is peak. We immediately wash the leaves in purified water and shade-dry them in clean, custom temperature-regulated rooms. This gentle drying process ensures that heat-sensitive enzymes, vitamins, and antioxidants remain entirely active, offering a highly bio-available green powder that supports immune system functions, liver detox, and cardiovascular health.",
    image: "https://images.unsplash.com/photo-1532499016263-f2c3e89df9cd?auto=format&fit=crop&q=80&w=800",
    author: "Gayatri Devi, Agronomy Expert"
  },
  {
    id: "b2",
    title: "Wheatgrass: The Ultimate Bio-Active Detox Elixir",
    category: "Detox & Wellness",
    date: "May 15, 2026",
    readTime: "6 min read",
    summary: "Fresh wheatgrass juice is liquid solar energy. Dive into the enzymes, chlorophyll structures, and trace elements that make this young grass a cellular detox giant.",
    content: "Wheatgrass is the young grass of the common wheat plant, harvested just 7 to 10 days after germination at its nutritional 'jointing stage'. At this peak growth phase, the grass is packed with chlorophyll—often referred to as 'green blood' due to its chemical similarity to human hemoglobin. Chlorophyll acts as a heavy metal chelator and blood cleanser, boosting oxygen transport and alkalizing the body's internal environment.\n\nFurthermore, raw wheatgrass contains active living enzymes like superoxide dismutase (SOD) and cytochrome oxidase, which combat oxidative stress at the cellular level. By cultivating wheatgrass under natural sun and mineralized groundwater, we ensure the grass is loaded with magnesium, zinc, and selenium, delivering a pure shot of cellular vitality.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800",
    author: "Dr. Sandeep Shastri, Ayurveda Consultant"
  },
  {
    id: "b3",
    title: "Microgreens: Miniature Leaves, Massive Nutrition Power",
    category: "Scientific Farming",
    date: "April 29, 2026",
    readTime: "4 min read",
    summary: "Why are tiny cotyledon leaves up to 40 times more nutrient-dense than their mature counterparts? We look at the plant physiology of microgreens.",
    content: "Microgreens are tender young greens harvested right after the first true leaves emerge. While small in stature, recent plant physiology studies have shown that microgreens carry up to 40 times higher concentrations of vitamins, minerals, and phytonutrients than fully mature vegetables of the same variety.\n\nThis is because all the concentrated nutrition, growth factors, and enzymes needed for a seed to build a whole mature plant are packed into these first leaves. Cultivated under precise micro-climates in our clean polyhouses using organic coco-peat and solar-purified water, we harvest premium broccoli, radish, and mustard microgreens at their absolute prime. Adding these tiny leaves to daily meals provides a massive blast of sulforaphane, lutein, and bioactive minerals.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800",
    author: "Gayatri Devi, Agronomy Expert"
  },
  {
    id: "b4",
    title: "Functional Mushrooms: Adaptogens for Modern Immune Systems",
    category: "Nutrition Science",
    date: "April 10, 2026",
    readTime: "7 min read",
    summary: "From Lion's Mane to Reishi, adaptogenic mushrooms are revolutionary tools for stress adaptation and neurological longevity. Explore their cellular chemistry.",
    content: "Functional mushrooms are not your ordinary culinary fungi; they are powerful adaptogenic organisms. Mushrooms like Reishi (Ganoderma lucidum), Lion's Mane (Hericium erinaceus), and Cordyceps contain complex polysaccharides known as beta-glucans, which interact directly with immune receptors, training the body's natural defense systems to respond optimally to stress.\n\nLion's Mane, in particular, contains active compounds (hericenones and erinacines) that stimulate the synthesis of Nerve Growth Factor (NGF), promoting neurogenesis, focus, and memory retention. Cultivated under strict sterile conditions on organic wood substrates mimicking their natural forest habitats, our functional mushrooms are slowly dried and water-extracted to ensure these delicate, adaptogenic compounds are fully soluble and bio-available.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    author: "Dr. Sandeep Shastri, Ayurveda Consultant"
  },
  {
    id: "b5",
    title: "Nutrition Science: The Bio-Chemistry of Slow Wood Pressing",
    category: "Processing Science",
    date: "March 20, 2026",
    readTime: "5 min read",
    summary: "Why does cold extraction under 35°C preserve delicate vitamin complexes and essential fatty acids? The molecular look at wood-pressed cooking oils.",
    content: "Modern supermarket cooking oils are extracted using petroleum-derived hexane solvents and subjected to brutal refining steps exceeding 200°C. This aggressive heating and chemical stripping changes the molecular configuration of fats, destroying natural Vitamin E, eliminating heart-healthy phytosterols, and creating toxic trans-fatty acid molecules.\n\nIn contrast, traditional slow wood pressing (Ghani) using high-density Vaagai wood works purely via mechanical pressure. Operating at slow speeds of under 14 revolutions per minute, the friction generates minimal warmth, keeping the oil's extraction temperature under 35°C. At this low molecular stress, the natural cold-pressed oil preserves its natural monounsaturated fatty acids (MUFA), active polyphenols, and delicate tocopherols completely intact. It is a scientifically validated method that delivers pure, uncompromised nutrition.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
    author: "Acharya Rajesh, Vedic Farm Director"
  }
];


// 6. Farm Metrics
export const farmMetrics = [
  { value: 180, label: "Acres Nurtured", suffix: "+" },
  { value: 45, label: "Organic Products", suffix: "+" },
  { value: 2500, label: "Families Served", suffix: "+" },
  { value: 120, label: "Local Farmers Supported", suffix: "" }
];
