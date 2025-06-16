function ProductList({ category, setCategory, products }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-semibold">Products</h2>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="Electronics">Electronics</option>
        <option value="Furniture">Furniture</option>
        <option value="Appliances">Appliances</option>
      </select>
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="border p-2">
            id: {product.id} | {product.name} - ${product.price} ({product.stock_quantity} in stock)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;