import { useNavigate } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (

    <main className="flex">

      <div className="min-h-screen w-screen bg-gray-900 text-white p-10  flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Fraud Detection Dashboard (Version 1)
          </h1>
          <button
            onClick={handleLogout}
            className="border-2 border-red-500 py-2 px-4 rounded-2xl cursor-pointer hover:bg-red-600 "
          >
            Logout
          </button>
        </div>
        <TransactionForm />
      </div>
  
    </main>

);
}
