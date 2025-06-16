function LoginForm({ username, setUsername, password, setPassword, handleLogin }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-semibold">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border p-2 w-full"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;