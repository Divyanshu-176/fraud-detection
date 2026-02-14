import TransactionForm from "../components/TransactionForm";

export default function Dashboard() {
  return (

    <main className="flex">

      <div className="min-h-screen w-[90vw] bg-gray-900 text-white p-10  flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">
          Fraud Detection Dashboard (Version 1)
        </h1>
        <TransactionForm />
      </div>
  
    </main>

);
}
