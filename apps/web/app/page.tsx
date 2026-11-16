const featuredProducts = [
  { name: 'Luna Satin Dress', price: '$128', category: 'Dresses' },
  { name: 'Aster Leather Tote', price: '$94', category: 'Bags' },
  { name: 'Noir City Loafers', price: '$142', category: 'Shoes' }
];

const featuredHotels = [
  { name: 'Harbor Glass Retreat', location: 'Capetown', price: '$220 / night' },
  { name: 'Riviera Courtyard', location: 'Milan', price: '$310 / night' },
  { name: 'Amber Peak Lodge', location: 'Zurich', price: '$260 / night' }
];

const featuredApartments = [
  { name: 'Seabreeze Residence', location: 'Lisbon', price: '$180 / night' },
  { name: 'Cedar Terrace Loft', location: 'Berlin', price: '$205 / night' },
  { name: 'Sunset Courtyard', location: 'Barcelona', price: '$240 / night' }
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm text-slate-200">
              Integrated lifestyle platform
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Fashion, hotels and stays in one premium experience.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">
              UniqueRosejay brings together shopping, travel discovery and short-stay reservations within a single modern platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#fashion" className="rounded-full bg-brand-500 px-6 py-3 font-medium text-white transition hover:bg-brand-400">
                Explore fashion
              </a>
              <a href="#stays" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10">
                Browse stays
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-200">Fashion</p>
                <p className="mt-3 text-3xl font-semibold">120+</p>
                <p className="text-sm text-slate-300">Curated product lines</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-200">Hotels</p>
                <p className="mt-3 text-3xl font-semibold">48</p>
                <p className="text-sm text-slate-300">Featured stays</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 sm:col-span-2">
                <p className="text-sm text-slate-200">Reservation flow</p>
                <p className="mt-3 text-xl font-semibold">Request-based booking with future availability checks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fashion" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Fashion</p>
            <h2 className="mt-2 text-3xl font-semibold">Featured collections</h2>
          </div>
          <a href="/fashion" className="text-sm font-medium text-slate-700 hover:text-slate-900">View all</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="h-56 bg-gradient-to-br from-rose-100 via-fuchsia-50 to-slate-100" />
              <div className="p-6">
                <p className="text-sm text-slate-500">{product.category}</p>
                <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-lg font-semibold text-brand-700">{product.price}</p>
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add to cart</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="stays" className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">Hotels & apartments</p>
              <h2 className="mt-2 text-3xl font-semibold">Stay discovery</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-semibold">Hotels</h3>
              <div className="space-y-4">
                {featuredHotels.map((hotel) => (
                  <div key={hotel.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{hotel.name}</p>
                        <p className="text-sm text-slate-500">{hotel.location}</p>
                      </div>
                      <span className="font-semibold text-brand-700">{hotel.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold">Apartments</h3>
              <div className="space-y-4">
                {featuredApartments.map((apartment) => (
                  <div key={apartment.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{apartment.name}</p>
                        <p className="text-sm text-slate-500">{apartment.location}</p>
                      </div>
                      <span className="font-semibold text-brand-700">{apartment.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-slate-900 p-8 text-white lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Business model</p>
              <h2 className="mt-2 text-3xl font-semibold">Unified admin, shared customer account, flexible operations.</h2>
            </div>
            <a href="/admin" className="rounded-full bg-brand-500 px-6 py-3 font-medium text-white transition hover:bg-brand-400">
              Admin overview
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
