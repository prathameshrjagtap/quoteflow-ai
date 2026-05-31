import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Quotes from "./pages/Quotes";
import Dashboard from "./pages/Dashboard";
import CreateQuote from "./pages/CreateQuote";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-white flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />
            <Route
              path="/quotes"
              element={<Quotes />}
            />
            <Route
              path="/create-quote"
              element={<CreateQuote />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}