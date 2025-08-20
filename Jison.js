fetch('https://dummyjson.com/products')
  .then(res => res.json())
  .then(data => {
    const products = data.products.map(p => ({
      id: p.id,
      name: p.title,
      image: p.thumbnail,
      category: p.category,
      price: p.price,
      description: p.description,
      stockQuantity: p.stock
    }));

    
    const jsonStr = JSON.stringify(products, null, 4);

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

  
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(url);
  });