import Service from "../models/Service.js";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE NAME → IMAGE MAP
// Mirrors the seed file exactly. Keys are lowercase + trimmed for safe matching.
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
  "blow dry": "/images/wash and full blowdry.JPG",
  "wash & set": "/images/Wash and set.JPG",
  "hair wash": "/images/Wash.JPG",
  "wash and straightening": "/images/Wash.JPG",
  "wash and full blowdry": "/images/wash and full blowdry.JPG",
  "undoing twists": "/images/Wash.JPG",
  "undoing cornrows": "/images/Wash.JPG",
  "undoing braids": "/images/Wash.JPG",
  "kids lines": "/images/center kids cornrows.JPG",
  "kito lines": "/images/center kids cornrows.JPG",
  "lip cornrows": "/images/center kids cornrows.JPG",
  "fulani cornrows": "/images/center kids cornrows.JPG",
  "back ghanaians": "/images/center kids cornrows.JPG",
  "up ghanaians": "/images/center kids cornrows.JPG",
  "knotless braids": "/images/center kids cornrows.JPG",
  "knotless twist braids": "/images/center kids cornrows.JPG",
  "jumbo knotless braids": "/images/center kids cornrows.JPG",
  crotchets: "/images/center kids cornrows.JPG",
  "fulani stitchlines": "/images/center kids cornrows.JPG",
  "up stitchlines": "/images/center kids cornrows.JPG",
  "back stitchlines": "/images/center kids cornrows.JPG",
  "box braids": "/images/center kids cornrows.JPG",
  "boho knotless braids": "/images/center kids cornrows.JPG",
  "boho bob braids": "/images/center kids cornrows.JPG",
  "twist braids": "/images/center kids cornrows.JPG",
  "marley twists": "/images/center kids cornrows.JPG",
  "spring twists": "/images/center kids cornrows.JPG",
  "twist outs": "/images/center kids cornrows.JPG",
  "mini twists": "/images/center kids cornrows.JPG",
  "coily twists": "/images/center kids cornrows.JPG",
  "havana curls": "/images/center kids cornrows.JPG",
  "invisible locs": "/images/center kids cornrows.JPG",
  "gel styling": "/images/center kids cornrows.JPG",
  "butterfly locs": "/images/center kids cornrows.JPG",
  "gypsy locs": "/images/center kids cornrows.JPG",
  "mermaid braids": "/images/center kids cornrows.JPG",
  "italian curls": "/images/center kids cornrows.JPG",
  "natural twists": "/images/center kids cornrows.JPG",
  "lemonade braids": "/images/center kids cornrows.JPG",
  "boho/bohemian braids/curls": "/images/center kids cornrows.JPG",
  "sisterlocks retouch": "/images/center kids cornrows.JPG",
  "loc retwist": "/images/center kids cornrows.JPG",
  "boho locs": "/images/center kids cornrows.JPG",
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

const resolveImage = (service) => {
  if (service.image) return service.image;
  const key = (service.name ?? "").trim().toLowerCase();
  if (SERVICE_IMAGE_MAP[key]) return SERVICE_IMAGE_MAP[key];
  return CATEGORY_FALLBACKS[(service.category ?? "").toUpperCase()] ?? CATEGORY_FALLBACKS.DEFAULT;
};

const withResolvedImage = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.image = resolveImage(obj);
  return obj;
};

// @desc    Get all services — images auto-resolved if missing
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services.map(withResolvedImage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a service — image auto-resolved if not provided
export const createService = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let image = req.body.image;
    if (req.file && req.file.path) image = req.file.path;
    const service = new Service({ name, category, price, description, image });
    const created = await service.save();
    res.status(201).json(withResolvedImage(created));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a service — image auto-resolved if cleared/not provided
export const updateService = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let image = req.body.image;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    service.name = name || service.name;
    service.category = category || service.category;
    service.price = price || service.price;
    service.description = description || service.description;
    if (req.file && req.file.path) {
      service.image = req.file.path;
    } else if (image !== undefined) {
      service.image = image;
    }
    const updated = await service.save();
    res.json(withResolvedImage(updated));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.deleteOne();
      res.json({ message: "Service removed" });
    } else {
      res.status(404).json({ message: "Service not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
