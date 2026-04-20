import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Sparkles, Star, ChevronRight, X } from "lucide-react";
import { Icon } from "@iconify/react";

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE RESOLUTION
//
// The backend (serviceController.js) now resolves images at read time,
// so service.image is always populated. The maps below are a FRONTEND-ONLY
// safety net for edge cases (e.g. new services added before backend is redeployed).
//
// NOTE: Keys must match what the backend sends — raw filenames with spaces,
// NOT percent-encoded (%20). The browser handles encoding when used in <img src>.
// ─────────────────────────────────────────────────────────────────────────────

const SERVICE_IMAGE_MAP = {
  // NAILS
  "manicure plain": "/images/Manicure.JPG",
  "pedicure plain": "/images/milk and honey.JPG",
  "manicure gel": "/images/Manicure.JPG",
  "pedicure gel": "/images/milk and honey.JPG",
  "jelly pedicure (2 step)": "/images/milk and honey.JPG",
  "jelly pedicure (4 step)": "/images/milk and honey.JPG",
  santorini: "/images/Manicure.JPG",
  "tips gel": "/images/tips builder.JPG",
  "tips builder": "/images/tips builder.JPG",
  "tips gumgel": "/images/Overlay gumgel.JPG",
  "overlay builder": "/images/Overlay builder.JPG",
  "overlay gumgel": "/images/Overlay gumgel.JPG",
  sculpting: "/images/Sculpting.JPG",
  "gel x": "/images/Gel x.JPG",
  acrylics: "/images/acrylic overlay.JPG",
  "acrylic overlay": "/images/acrylic overlay.JPG",

  // LASHES
  clusters: "/images/Cluster lashes.JPG",
  "individual classic": "/images/classic.JPG",
  "individual hybrid": "/images/hybrid.JPG",
  "individual volume": "/images/volume.JPG",
  "individual mega volume": "/images/mega.JPG",
  "individual recession (refill/retouch)": "/images/Refill.JPG",
  "mink lashes": "/images/mink lashes.JPG",
  "strip lashes": "/images/strip lashes.JPG",

  // WIGS
  "wig laundry": "/images/Wig laundry.JPG",
  "wig gluing": "/images/Wig styling.JPG",
  "gluing + edges": "/images/Wig styling.JPG",
  "wig styling": "/images/Wig styling.JPG",
  "flat iron": "/images/flat iron.JPG",
  tinting: "/images/Wig curling.JPG",
  "cut lacing": "/images/Wig styling.JPG",

  // MAKEUP
  "touch up": "/images/Touch up makeup.JPG",
  "soft glam": "/images/soft glam.JPG",
  "full makeup": "/images/full makeup.JPG",
  "bridal makeup": "/images/bridal makeup.JPG",
  "bridal team": "/images/Brides makeup.JPG",

  // EYEBROWS
  "eyebrow tinting": "/images/Touch up makeup.JPG",
  "eyebrow threading": "/images/Touch up makeup.JPG",
  "eyebrow tweezing": "/images/Touch up makeup.JPG",
  "eyebrow trimming": "/images/Touch up makeup.JPG",

  // FACIAL
  "mini facial": "/images/mini facial.JPG",
  scrubbing: "/images/scrubbing.JPG",
  "full facial": "/images/full facial.JPG",

  // HAIR
  "hair wash": "/images/Wash.JPG",
  "wash and straightening": "/images/Wash.JPG",
  "wash and full blowdry": "/images/wash and full blowdry.JPG",
  "undoing twistouts": "/images/Wash.JPG",
  "undoing cornrows": "/images/Wash.JPG",
  "undoing braids": "/images/Wash.JPG",
  "kids lines": "/images/center kids cornrows.JPG",
  "big lines": "/images/center kids cornrows.JPG",
  "lip cornrows": "/images/center kids cornrows.JPG",
  "fulani cornrows": "/images/center kids cornrows.JPG",
  "back ghanaians": "/images/center kids cornrows.JPG",
  "up ghanaians": "/images/center kids cornrows.JPG",
  "knotless braids": "/images/center kids cornrows.JPG",
  "knotless twist braids": "/images/center kids cornrows.JPG",
  "jumbo knotless braids": "/images/center kids cornrows.JPG",
  crochets: "/images/center kids cornrows.JPG",
  "stitch lines": "/images/center kids cornrows.JPG",
  "box braids": "/images/center kids cornrows.JPG",
  "boho knotless braids": "/images/center kids cornrows.JPG",
  "boho bob braids": "/images/center kids cornrows.JPG",
  "latest braids": "/images/center kids cornrows.JPG",
  "marley twists": "/images/center kids cornrows.JPG",
  "spring twists": "/images/center kids cornrows.JPG",
  "twist outs": "/images/center kids cornrows.JPG",
  "mini twists": "/images/center kids cornrows.JPG",
  "coily twists": "/images/center kids cornrows.JPG",
  "havana curl": "/images/center kids cornrows.JPG",
  "invisible locs": "/images/center kids cornrows.JPG",
  "gel styling": "/images/center kids cornrows.JPG",
  "butterfly locs": "/images/center kids cornrows.JPG",
  "gypsy locs": "/images/center kids cornrows.JPG",
  "mermaid braids": "/images/center kids cornrows.JPG",
  "italian curls": "/images/center kids cornrows.JPG",
  "natural twists": "/images/center kids cornrows.JPG",
  "lemonade braids": "/images/center kids cornrows.JPG",
  "boho braids cornrows": "/images/center kids cornrows.JPG",
  "sisterlocs retouch": "/images/center kids cornrows.JPG",
  "loc retwist": "/images/center kids cornrows.JPG",
  "boho locks": "/images/center kids cornrows.JPG",
};

const CATEGORY_FALLBACKS = {
  NAILS: "/images/Manicure.JPG",
  LASHES: "/images/classic.JPG",
  WIGS: "/images/Wig laundry.JPG",
  MAKEUP: "/images/full makeup.JPG",
  EYEBROWS: "/images/Touch up makeup.JPG",
  FACIAL: "/images/mini facial.JPG",
  HAIR: "/images/Wash.JPG",
  DEFAULT: "/images/full facial.JPG",
};

/**
 * isValidImage — rejects any src that is clearly not a beauty/clinic image.
 * This catches cases where a service.image field was accidentally set to
 * an unrelated/animal image URL from a third-party source.
 *
 * Strategy: only trust images that are either:
 *   a) relative paths starting with /images/  (our own assets)
 *   b) from our own API domain
 *
 * Any absolute URL pointing elsewhere is rejected and falls through
 * to the name-based map.
 */
const isValidImage = (src) => {
  if (!src) return false;
  // Accept our own relative paths
  if (src.startsWith("/images/")) return true;
  // Accept relative paths without leading slash (edge case)
  if (!src.startsWith("http")) return true;
  // For absolute URLs: only trust our own backend domain
  try {
    const url = new URL(src);
    const ownDomains = ["localhost", "cc-beauty-system.onrender.com"];
    return ownDomains.some((d) => url.hostname.includes(d));
  } catch {
    return false;
  }
};

/**
 * getServiceImage — 3-tier priority:
 *   1. service.image from API — only if it passes isValidImage()
 *   2. SERVICE_IMAGE_MAP lookup by normalised name
 *   3. CATEGORY_FALLBACKS → DEFAULT
 */
const getServiceImage = (service) => {
  if (isValidImage(service?.image)) return service.image;

  const key = (service?.name ?? "").trim().toLowerCase();
  if (SERVICE_IMAGE_MAP[key]) return SERVICE_IMAGE_MAP[key];

  return (
    CATEGORY_FALLBACKS[(service?.category ?? "").toUpperCase()] ??
    CATEGORY_FALLBACKS.DEFAULT
  );
};

/**
 * handleImgError — fires if the resolved image itself 404s.
 * Nullifies itself first to prevent any infinite retry loop.
 * Falls back to the category image, then the global default.
 */
const handleImgError = (e, service) => {
  e.target.onerror = null;

  // Try category fallback
  const categoryFallback =
    CATEGORY_FALLBACKS[(service?.category ?? "").toUpperCase()];

  // If we're not already showing the category fallback, try it
  if (categoryFallback && !e.target.src.endsWith(categoryFallback)) {
    e.target.src = categoryFallback;
    return;
  }

  // Last resort — global default
  e.target.src = CATEGORY_FALLBACKS.DEFAULT;
};

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const reviewContainerRef = React.useRef(null);

  // ── Fetch Services ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/services");
        setServices(data);
        if (data.length > 0) setActiveCategory(data[0].category);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // ── Trustindex Widget ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!reviewContainerRef.current) return;
    const scriptId = "trustindex-script-manual";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://cdn.trustindex.io/loader.js?3cdb1b167b14014af636f4eb4f6";
      script.async = true;
      script.defer = true;
      reviewContainerRef.current.appendChild(script);
    } else if (window.Trustindex) {
      try {
        window.Trustindex.init();
      } catch (e) {
        console.error("Trustindex failed", e);
      }
    }
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const groupedServices = React.useMemo(() => {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    }, {});
  }, [services]);

  const categories = React.useMemo(() => Object.keys(groupedServices), [groupedServices]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-black min-h-screen text-white relative selection:bg-gold selection:text-black">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden z-10 border-b border-gold/20">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <img
          src="/images/full facial.JPG"
          alt="CC Beauty Clinic"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-40"
          loading="eager"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = CATEGORY_FALLBACKS.DEFAULT;
          }}
        />
        <div className="relative z-20 text-center px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-gold font-black uppercase tracking-[0.8em] text-[10px] mb-2 block">
              Luxury Spa
            </span>
            <span className="text-white/60 font-black uppercase tracking-[0.8em] text-[8px] mb-6 block">
              The Private Collection
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold uppercase tracking-tighter leading-none mb-6 text-white drop-shadow-2xl">
              <span className="text-gold">CC BEAUTY CLINIC</span>
            </h1>
            <p className="text-xs md:text-base font-light tracking-[0.4em] text-white/80 uppercase mb-10">
              Unrivaled Mastery • Absolute Luxury
            </p>
            <div className="flex justify-center">
              <a
                href="#menu"
                className="btn-gold px-10 py-4 text-xs tracking-widest"
              >
                Explore Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICE MENU ─────────────────────────────────────────────────────── */}
      <section
        id="menu"
        className="relative z-10 py-16 md:py-24 max-w-7xl mx-auto px-4"
      >
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest text-gold mb-4 text-shadow-lg">
              Our Services
            </h2>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 md:px-8 py-3 text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${
                activeCategory === cat
                  ? "bg-gold text-black border-gold shadow-[0_10px_40px_rgba(212,175,55,0.3)]"
                  : "border-gold/20 text-gold/40 hover:border-gold/60 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
          >
            {loading ? (
              <div className="col-span-full py-20 text-center text-gold animate-pulse uppercase text-[10px] tracking-[0.5em] font-black">
                Refining Masterpieces...
              </div>
            ) : (
              groupedServices[activeCategory]?.map((service) => {
                const imgSrc = getServiceImage(service);
                return (
                  <motion.button
                    key={service._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service)}
                    className="group relative bg-[#050505] border border-gold/10 p-6 md:p-8 text-left hover:border-gold transition-all duration-500 flex flex-col justify-between min-h-[150px] md:min-h-[180px]"
                  >
                    <div className="space-y-2 relative z-10">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg md:text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors leading-tight">
                          {service.name}
                        </h3>
                        <span className="text-lg md:text-2xl font-serif font-black text-gold shrink-0">
                          ksh {service.price}
                        </span>
                      </div>
                      <p className="text-[9px] md:text-xs uppercase tracking-[0.2em] text-white/40 font-bold group-hover:text-white/60 transition-colors line-clamp-2 italic">
                        {service.description ||
                          "A signature bespoke treatment for the discerning client."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between relative z-10">
                      <div className="h-px w-8 bg-gold/20 group-hover:w-12 group-hover:bg-gold transition-all duration-700" />
                      <ChevronRight className="h-4 w-4 text-gold group-hover:translate-x-2 transition-transform" />
                    </div>

                    {/* Service-specific background image */}
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-40 md:h-40 opacity-10 group-hover:opacity-30 transition-all duration-1000 pointer-events-none overflow-hidden">
                      <img
                        src={imgSrc}
                        alt=""
                        className="w-full h-full object-cover grayscale scale-110 group-hover:scale-100 transition-all duration-1000"
                        onError={(e) => handleImgError(e, service)}
                      />
                    </div>
                  </motion.button>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── GROUP DISCOUNTS ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-black relative overflow-hidden border-y border-gold/20">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-gold font-black uppercase tracking-[0.5em] text-[10px]">
                Shared Experiences
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest text-white mt-4">
                Group <span className="text-gold italic">Privileges</span>
              </h2>
              <div className="h-0.5 w-16 bg-gold mx-auto mt-6" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: "Girlies",
                guests: "5 People",
                discount: "15% OFF",
                icon: "mdi:spa",
                desc: "The ultimate squad retreat.",
              },
              {
                title: "The Trio",
                guests: "3 People",
                discount: "10% OFF",
                icon: "mdi:account-group",
                desc: "Perfect for best friends.",
              },
              {
                title: "Couples",
                guests: "2 People",
                discount: "5% OFF",
                icon: "mdi:account-heart",
                desc: "Intimate shared luxury.",
              },
              {
                title: "Family",
                guests: "2 Couples + Kids",
                discount: "10% OFF",
                icon: "mdi:human-male-female-child",
                desc: "A legacy of beauty.",
              },
            ].map((offer, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-[#080808] border border-gold/10 p-6 md:p-8 text-center space-y-4 hover:border-gold/50 transition-all duration-500"
              >
                <div className="flex justify-center mb-4">
                  <Icon icon={offer.icon} className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tighter">
                  {offer.title}
                </h3>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">
                    {offer.guests}
                  </p>
                  <p className="text-2xl font-serif font-black text-gold">
                    {offer.discount}
                  </p>
                </div>
                <p className="text-[9px] text-white/60 italic uppercase tracking-widest leading-relaxed pt-4 border-t border-gold/10">
                  {offer.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE QUICK-VIEW MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedService &&
          (() => {
            const modalImg = getServiceImage(selectedService);
            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedService(null)}
                  className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 40 }}
                  className="relative w-full max-w-5xl h-fit max-h-[90vh] bg-black border border-gold/30 shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row z-[110]"
                >
                  {/* Side image panel */}
                  <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden group shrink-0">
                    <img
                      src={modalImg}
                      alt={selectedService.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                      onError={(e) => handleImgError(e, selectedService)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 md:bottom-10 md:left-8 space-y-2">
                      <Sparkles className="text-gold h-6 w-6 md:h-8 md:w-8 animate-pulse" />
                      <h4 className="text-white font-serif text-base md:text-xl italic leading-snug">
                        The Art of <br />
                        Personal Perfection
                      </h4>
                    </div>
                  </div>

                  {/* Content panel */}
                  <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto">
                    <button
                      onClick={() => setSelectedService(null)}
                      className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:rotate-90 transition-transform duration-500 text-gold/60 hover:text-gold"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    <div className="space-y-6 md:space-y-8">
                      {/* Category label */}
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[8px] uppercase tracking-[0.6em] text-gold/50 font-black block pt-2 md:pt-0"
                      >
                        {selectedService.category}
                      </motion.span>

                      {/* Service name */}
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-5xl font-serif font-bold text-white uppercase tracking-tighter leading-none"
                      >
                        {selectedService.name}
                      </motion.h2>

                      {/* Price */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-4 md:py-6 border-y border-gold/10 flex items-end justify-between gap-4 flex-wrap"
                      >
                        <div>
                          <p className="text-[8px] uppercase text-gold/40 tracking-[0.3em] font-black mb-1">
                            Charge
                          </p>
                          <p className="text-3xl md:text-4xl font-serif font-black text-gold">
                            ksh {selectedService.price}
                          </p>
                        </div>
                      </motion.div>

                      {/* Description */}
                      {selectedService.description && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-white/50 text-xs md:text-sm font-light italic leading-relaxed"
                        >
                          {selectedService.description}
                        </motion.p>
                      )}

                      {/* Tags */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 md:gap-3"
                      >
                        {["Certified Master Techs", "Luxury Environment"].map(
                          (tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 border border-gold/20 bg-gold/5 text-[8px] uppercase tracking-[0.2em] text-gold font-black"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </motion.div>
                    </div>

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-8 pb-1"
                    >
                      <Link
                        to="/booking"
                        state={{ serviceName: selectedService.name }}
                        className="group relative overflow-hidden bg-gold px-8 py-4 flex items-center justify-center gap-3 transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]"
                        onClick={() => setSelectedService(null)}
                      >
                        <span className="relative z-10 text-black text-[11px] font-black uppercase tracking-[0.4em]">
                          Confirm Reservation
                        </span>
                        <ChevronRight className="relative z-10 h-4 w-4 text-black group-hover:translate-x-2 transition-transform" />
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>

      {/* ── FOOTER STATS ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 border-t border-gold/20 bg-black">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-10 md:gap-24">
          {[
            {
              icon: <Star className="h-10 w-10 text-gold animate-pulse" />,
              label: "5-Star Luxury",
            },
            {
              icon: (
                <Icon icon="mdi:hair-dryer" className="h-8 w-8 text-gold" />
              ),
              label: "Master Craft",
            },
            {
              icon: <Sparkles className="h-10 w-10 text-gold animate-pulse" />,
              label: "Pure Luxury",
            },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-4 group">
              {icon}
              <span className="text-[9px] uppercase tracking-[0.5em] font-black text-gold/60 group-hover:text-gold transition-colors">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
