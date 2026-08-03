"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر تسجيل الدخول");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="max-w-sm mx-auto px-6 py-16">
        <h2 className="text-xl font-medium mb-6 text-center">دخول المسؤول</h2>
        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl p-6">
          <label htmlFor="password" className="block text-sm text-ink/70 mb-2">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-lg border border-line px-4 py-3 mb-4 outline-none"
            required
          />
          {error && <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-lg bg-primary text-primary-foreground py-3 font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {loading ? "جارِ الدخول..." : "دخول"}
          </button>
        </form>
      </section>
    </main>
  );
}
