export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

/** Pulls a readable message out of an axios error / ApiResponse error body. */
export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}
