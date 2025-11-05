import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col min-h-[200px] text-white text-xs">
      {/* Main footer section */}
      <div className="bg-[#1a0000] flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brand */}
            <div className="space-y-2">
              <a href="/" className="inline-flex items-center">
                <img
                  src="/Feroz_logo.jpg"
                  alt="Firoz Autos"
                  className="h-8 w-auto rounded bg-white/5 p-0.5 ring-1 ring-white/15"
                />
              </a>
              <p className="text-[11px] leading-snug text-white/80">
                Genuine & aftermarket motorcycle parts. Fast service, fair prices.
              </p>
            </div>

            {/* Shop links */}
            <div>
              <h3 className="font-semibold tracking-wide text-red-400 uppercase text-xs">
                Shop
              </h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="/categories/engine" className="hover:text-red-400">
                    Engine Parts
                  </a>
                </li>
                <li>
                  <a href="/categories/brakes" className="hover:text-red-400">
                    Brakes & Suspension
                  </a>
                </li>
                <li>
                  <a href="/categories/electrical" className="hover:text-red-400">
                    Electrical
                  </a>
                </li>
                <li>
                  <a href="/categories/filters" className="hover:text-red-400">
                    Filters & Fluids
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold tracking-wide text-red-400 uppercase text-xs">
                Contact
              </h3>
              <ul className="mt-2 space-y-1 text-white/85">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-red-400" />
                  Jessore, Bangladesh
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-3.5 w-3.5 text-red-400" />
                  <a href="tel:+8801715488288" className="hover:text-red-400">
                    +880 1715-488-288
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 text-red-400" />
                  <a
                    href="mailto:support@firozautos.com"
                    className="hover:text-red-400"
                  >
                    support@firozautos.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-red-700 text-center py-3 font-semibold">
        <p>
          © {year} <span className="font-bold">Firoz Autos</span>. All rights
          reserved.{" "}
          <span>
            Powered by{" "}
            <a
              href="https://utshabtech.com"
              className="hover:underline text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Utshab Technology Ltd.
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
