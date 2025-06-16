function OrderForm({ order, setOrder, handleOrder }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-semibold">Create Order</h2>
      <form onSubmit={handleOrder} className="space-y-4">
        <input
          type="number"
          value={order.user_id}
          onChange={(e) => setOrder({ ...order, user_id: e.target.value })}
          placeholder="User ID"
          className="border p-2 w-full"
        />
        <input
          type="number"
          value={order.product_id}
          onChange={(e) => setOrder({ ...order, product_id: e.target.value })}
          placeholder="Product ID"
          className="border p-2 w-full"
        />
        <input
          type="number"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
          placeholder="Quantity"
          className="border p-2 w-full"
        />
        <input
          type="text"
          value={order.shipping_address}
          onChange={(e) => setOrder({ ...order, shipping_address: e.target.value })}
          placeholder="Shipping Address"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Order
        </button>
      </form>
    </div>
  );
}

export default OrderForm;