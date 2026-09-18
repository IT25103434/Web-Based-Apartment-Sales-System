export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-forest-800 text-forest-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-display text-lg">Nestlyn</p>
            <p className="mt-2 max-w-xs text-sm text-forest-100">
              A university group project - apartment listings, site visits, and
              agent tools, built end to end with React and Spring Boot.
            </p>
          </div>
          <div className="text-sm text-forest-100">
            <p>Year 2 Software Engineering Group Project</p>
            <p className="mt-1">Not a real estate service - demo data only.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
