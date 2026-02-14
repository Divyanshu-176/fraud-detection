export default function Login() {
  const loginWithGithub = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="font-bold text-2xl mb-4 text-white">
        Login
      </div>
      <button onClick={loginWithGithub} className="px-6 py-3 bg-white text-black rounded-lg font-semibold cursor-pointer hover:bg-gray-300">
        Login with GitHub
      </button>
    </div>
  );
}
