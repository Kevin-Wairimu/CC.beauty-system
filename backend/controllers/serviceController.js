import { prisma } from "../config/db.js";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE NAME → IMAGE MAP
// Mirrors the seed file exactly. Keys are lowercase + trimmed for safe matching.
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_IMAGE_MAP = {
  // NAILS
  "plain manicure": "/images/Manicure.JPG",
  "plain pedicure": "/images/milk and honey.JPG",
  "manicure gel": "/images/Manicure.JPG",
  "pedicure gel": "/images/milk and honey.JPG",
  "jelly pedicure (2 steps)": "/images/milk and honey.JPG",
  "jelly pedicure (4 steps)": "/images/milk and honey.JPG",
  "tips gel": "/images/tips builder.JPG",
  "tips builder": "/images/tips builder.JPG",
  "tips gum gel": "/images/Overlay gumgel.JPG",
  "overlay builder": "/images/Overlay builder.JPG",
  "overlay gum gel": "/images/Overlay gumgel.JPG",
  sculpting: "/images/Sculpting.JPG",
  "gel (full set)": "/images/Gel x.JPG",
  "overlay acrylic": "/images/acrylic overlay.JPG",
  "tips acrylic": "/images/acrylic overlay.JPG",

  // LASHES
  cluster: "/images/Cluster lashes.JPG",
  "individual classic": "/images/classic.JPG",
  hybrid: "/images/hybrid.JPG",
  volume: "/images/volume.JPG",
  "mega volume": "/images/mega.JPG",
  russian: "/images/mega.JPG",
  "mink lashes": "/images/mink lashes.JPG",
  "strip lashes": "/images/strip lashes.JPG",

  // WIGS
  "wig installation (gluing)": "/images/Wig styling.JPG",
  "wig gluing + edges": "/images/Wig styling.JPG",
  "wig styling": "/images/Wig styling.JPG",
  "wig curling": "/images/Wig curling.JPG",
  "wig flat ironing": "/images/flat iron.JPG",
  "wig tinting": "/images/Wig curling.JPG",
  "lace cutting": "/images/Wig styling.JPG",
  "wig laundry": "/images/Wig laundry.JPG",

  // MAKEUP
  "touch up": "/images/Touch up makeup.JPG",
  "soft glam": "/images/soft glam.JPG",
  "full makeup": "/images/full makeup.JPG",
  "bridal makeup": "/images/bridal makeup.JPG",
  "bridal team": "/images/Brides makeup.JPG",
  "photo shoot": "/images/full makeup.JPG",

  // HAIR
  "dread wash / braid hair": "/images/Wash.JPG",
  "wash & straighten": "/images/Wash.JPG",
  "wash & blowdry": "/images/wash and full blowdry.JPG",
  "kids lines": "/images/center kids cornrows.JPG",
  "havana curls": "/images/Wig styling.JPG",
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

  // Dynamic fallback for all services without a specific local asset
  if (service.name) {
    const seed = encodeURIComponent(service.name.trim().toLowerCase());
    return `https://loremflickr.com/500/500/beauty,${seed}/all?lock=${seed.length}`;
  }

  return CATEGORY_FALLBACKS[(service.category ?? "").toUpperCase()] ?? CATEGORY_FALLBACKS.DEFAULT;
};

const withResolvedImage = (doc) => {
  const obj = { ...doc, _id: doc.id };
  obj.image = resolveImage(obj);
  return obj;
};

// @desc    Get all services — images auto-resolved if missing
export const getServices = async (req, res) => {
  const start = Date.now();
  try {
    const services = await prisma.service.findMany({});
    console.log(`FETCH_SERVICES: Found ${services.length} items in ${Date.now() - start}ms`);
    res.json(services.map(withResolvedImage));
  } catch (error) {
    console.error(`SERVICE_CONTROLLER_ERROR [getServices]:`, error);
    res.status(500).json({ 
      message: "Failed to fetch services", 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
      hint: "Check if the DATABASE_URL is correct and tables are migrated." 
    });
  }
};

// @desc    Create a service — image auto-resolved if not provided
export const createService = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let image = req.body.image;
    if (req.file && req.file.path) image = req.file.path;
    const created = await prisma.service.create({
      data: {
        name,
        category,
        price,
        description,
        image
      }
    });
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
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ message: "Service not found" });
    
    const data = {
      name: name || service.name,
      category: category || service.category,
      price: price || service.price,
      description: description || service.description,
    };
    
    if (req.file && req.file.path) {
      data.image = req.file.path;
    } else if (image !== undefined) {
      data.image = image;
    }
    
    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(withResolvedImage(updated));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a service
export const deleteService = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (service) {
      await prisma.service.delete({ where: { id: req.params.id } });
      res.json({ message: "Service removed" });
    } else {
      res.status(404).json({ message: "Service not found" });
    }
  } catch (error) {
    console.error(`SERVICE_CONTROLLER_ERROR:`, error.message);
    res.status(500).json({ 
      message: "Operation failed", 
      error: error.message,
      hint: "Check if the database project is active and the connection string is correct." 
    });
  }
};
