const storeCategories = [
  'Clothing',
  'Dresses',
  'Bags',
  'Shoes',
  'Wigs',
  'Ice chests',
  'Refrigerators',
  'Washing machines',
  'More categories'
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm text-slate-200">
              Unique RoseJay Enterprises
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              One URJ experience. Store, Hotels and Apartments.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">
              Explore distinct business sections through one international platform, with centralized administration for the business.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#store" className="rounded-full bg-brand-500 px-6 py-3 font-medium text-white transition hover:bg-brand-400">
                Explore the Store
              </a>
              <a href="#stays" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10">
                Browse stays
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">One main website</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {['Store', 'Hotels', 'Apartments'].map((section) => (
                <div key={section} className="rounded-2xl bg-white/10 p-5">
                  <p className="text-lg font-semibold">{section}</p>
                  <p className="mt-2 text-sm text-slate-300">A dedicated URJ business section</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-slate-300">Centralized administration across the business areas</p>
          </div>
        </div>
      </section>

      <section id="store" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Store / E-commerce</p>
            <h2 className="mt-2 text-3xl font-semibold">A broad and extensible catalog</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              The Store is designed for varied product types, with room to add categories as the business grows.
            </p>
          </div>
          <a href="/store" className="text-sm font-medium text-slate-700 hover:text-slate-900">Visit Store</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storeCategories.map((category) => (
            <div key={category} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold">{category}</p>
              <p className="mt-1 text-sm text-slate-500">Category scope confirmed; product listings pending</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stays" className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">URJ stays</p>
            <h2 className="mt-2 text-3xl font-semibold">Hotels and Apartments</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Dedicated discovery sections for properties. Availability, rates and booking policies will be shown only when supplied and supported by approved workflows.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { name: 'Hotels', href: '/hotels' },
              { name: 'Apartments', href: '/apartments' }
            ].map((section) => (
              <article key={section.name} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm text-slate-500">URJ business section</p>
                <h3 className="mt-2 text-2xl font-semibold">{section.name}</h3>
                <p className="mt-3 text-slate-600">Property listings and request workflows are planned; no live inventory is currently connected.</p>
                <a href={section.href} className="mt-6 inline-block font-medium text-brand-700">Explore {section.name}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-slate-900 p-8 text-white lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Centralized administration</p>
              <h2 className="mt-2 text-3xl font-semibold">One administration area for URJ business operations.</h2>
              <p className="mt-3 text-slate-300">Specific staff roles and permissions remain to be confirmed.</p>
            </div>
            <a href="/admin" className="rounded-full bg-brand-500 px-6 py-3 font-medium text-white transition hover:bg-brand-400">
              Administration
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
