"use client";

export default function LogoutButton() {
  // We'll update context by forcing a reload of /api/me after logout
  const handleLogout = async () => {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    // Force reload of the page to trigger UserProvider's useEffect
    window.location.href = "/login";
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
