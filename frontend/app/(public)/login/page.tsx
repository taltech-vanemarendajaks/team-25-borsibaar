export const dynamic = "force-dynamic";

export default function LoginPage() {
  // For OAuth, browser needs PUBLIC backend URL, not Docker internal URL
  const publicBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  return (
    <div className="flex min-h-screen flex-col content-center items-center justify-center gap-4">
      <h1 className="text-center text-2xl font-bold">Login</h1>
      <a href={`${publicBackendUrl}/oauth2/authorization/google`}>
        <button
          type="button"
          className="me-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
        >
          Login with Google
        </button>
      </a>
    </div>
  );
}
