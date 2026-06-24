export const mapProduct = (product) => {
  if (!product) return null;

  let urls = [];

  // 1. Try parsing product.images (could be String[] or Object[])
  if (Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (typeof img === 'string') {
        if (img) urls.push(img);
      } else if (img && typeof img === 'object' && img.url) {
        urls.push(img.url);
      }
    });
  }

  // 2. Try parsing product.productImages relation (Object[] or String[])
  if (Array.isArray(product.productImages)) {
    product.productImages.forEach(img => {
      if (img && typeof img === 'object' && img.url) {
        urls.push(img.url);
      } else if (typeof img === 'string' && img) {
        urls.push(img);
      }
    });
  }

  // 3. Fallback to existing image fields if urls is empty
  if (urls.length === 0) {
    if (product.hoverImage) {
      urls.push(product.hoverImage);
    }
  }

  // Dedup and filter empty values
  urls = [...new Set(urls)].filter(Boolean);

  // Frontend expects product.images to be an array of objects: [{ id, productId, url, isFeatured }]
  const mappedImages = urls.map((url, idx) => ({
    id: `${product.id}-${idx}`,
    productId: product.id,
    url: url,
    isFeatured: idx === 0
  }));

  const mainImage = urls[0] || '';
  const fallbackHover = urls[1] || product.hoverImage || mainImage;

  return {
    ...product,
    images: mappedImages,
    image: mainImage,
    hoverImage: fallbackHover,
    galleryImage: fallbackHover,
    galleryImages: urls.slice(1)
  };
};

export const mapProducts = (products) => {
  if (!products) return [];
  return products.map(mapProduct);
};

export const mapCartItem = (item) => {
  if (!item || !item.product) return item;
  return {
    ...item,
    product: mapProduct(item.product)
  };
};

export const mapWishlistItem = (item) => {
  if (!item || !item.product) return item;
  return {
    ...item,
    product: mapProduct(item.product)
  };
};

export const mapOrderItem = (item) => {
  if (!item || !item.product) return item;
  return {
    ...item,
    product: mapProduct(item.product)
  };
};

export const mapOrder = (order) => {
  if (!order || !order.orderItems) return order;
  return {
    ...order,
    orderItems: order.orderItems.map(mapOrderItem)
  };
};
