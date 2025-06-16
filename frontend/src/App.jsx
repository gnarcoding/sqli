import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import ProductList from './components/ProductList';
import UserSummary from './components/UserSummary';
import OrderForm from './components/OrderForm';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [products, setProducts] = useState([]);
  const [userSummary, setUserSummary] = useState(null);
  const [order, setOrder] = useState({
    user_id: '',
    product_id: '',
    quantity: 1,
    shipping_address: '',
  });
  const [message, setMessage] = useState('');

  // Fetch products by category
  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${category}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setMessage('Error fetching products');
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Logged in as ${data.user.username}`);
      } else {
        setMessage('Login failed');
      }
    } catch (err) {
      setMessage('Error during login');
    }
  };

  // Fetch user summary
  const fetchUserSummary = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user-summary/${username}`);
      const data = await response.json();
      setUserSummary(data[0]);
    } catch (err) {
      setMessage('Error fetching user summary');
    }
  };

  // Handle order creation
  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await response.json();
      setMessage(`Order created: ${data.id}`);
    } catch (err) {
      setMessage('Error creating order');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Vulnerable Webapp</h1>
      <p className="text-red-500">Warning: This app is intentionally vulnerable to SQL injection for testing purposes.</p>
      {message && <p className="text-red-500">{message}</p>}

      <LoginForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />

      <ProductList
        category={category}
        setCategory={setCategory}
        products={products}
      />

      <UserSummary
        username={username}
        userSummary={userSummary}
        fetchUserSummary={fetchUserSummary}
      />

      <OrderForm
        order={order}
        setOrder={setOrder}
        handleOrder={handleOrder}
      />
    </div>
  );
}

export default App;