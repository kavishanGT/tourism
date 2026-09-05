"use client";

import { useDestinations } from "@/features/destinations/hooks/use-destinations";

export default function TestApiPage() {
  const { data, isLoading, isError, error } = useDestinations({
    page: 0,
    size: 5,
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">API Connection Test</h1>
      <p className="text-gray-500 mb-6">
        Testing: <code className="text-emerald-600 bg-gray-100 px-1 rounded">GET /api/v1/destinations</code>
      </p>

      {isLoading && (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-700">❌ Connection failed</p>
          <p className="text-sm text-red-600 mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Make sure Spring Boot is running on{" "}
            <strong>localhost:8081</strong>
          </p>
        </div>
      )}

      {data && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-600 text-xl">✅</span>
            <span className="font-semibold text-green-700">
              Backend connected! Found {data.meta.totalElements} destinations.
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {data.data.map((d) => (
              <div key={d.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{d.name}</span>
                    <span className="ml-2 text-gray-400 text-sm">/{d.slug}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{d.shortDescription}</p>
              </div>
            ))}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-800">
              View raw JSON
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-gray-900 text-green-400 p-4 text-xs max-h-80">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
