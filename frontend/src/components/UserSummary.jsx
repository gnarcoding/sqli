function UserSummary({ username, userSummary, fetchUserSummary }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-semibold">User Summary</h2>
      <button
        onClick={fetchUserSummary}
        className="bg-green-500 text-white p-2 rounded mb-4"
      >
        Fetch User Summary
      </button>
      {userSummary && (
        <div>
          <p>Username: {userSummary.username}</p>
          <p>Email: {userSummary.email}</p>
          <p>Role: {userSummary.role}</p>
          <p>Balance: ${userSummary.account_balance}</p>
          <p>Total Orders: {userSummary.total_orders}</p>
        </div>
      )}
    </div>
  );
}

export default UserSummary;