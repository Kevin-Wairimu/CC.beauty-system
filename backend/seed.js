import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Service from './models/Service.js';

dotenv.config();
connectDB();

const services = [
  // NAILS
  { name: 'Manicure Plain', category: 'NAILS', price: '600', duration: '45 mins', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pedicure Plain', category: 'NAILS', price: '800', duration: '60 mins', image: 'https://images.unsplash.com/photo-1519415510236-8559b1985a22?auto=format&fit=crop&w=800&q=80' },
  { name: 'Manicure Gel', category: 'NAILS', price: '1200', duration: '60 mins', image: 'https://images.unsplash.com/photo-1604654894610-df490c9a77ca?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pedicure Gel', category: 'NAILS', price: '1500', duration: '75 mins', image: 'https://images.unsplash.com/photo-1522338140262-f46f591261c8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jelly Pedicure (2 Step)', category: 'NAILS', price: '1000', duration: '75 mins', image: 'https://images.unsplash.com/photo-1544467328-94451631dff5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jelly Pedicure (4 Step)', category: 'NAILS', price: '1200', duration: '90 mins', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80' },
  { name: 'Santorini', category: 'NAILS', price: '1000', duration: '60 mins', image: 'https://images.unsplash.com/photo-1563161433-ef291f176222?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tips Gel', category: 'NAILS', price: '1300', duration: '90 mins', image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tips Builder', category: 'NAILS', price: '1500', duration: '120 mins', image: 'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tips Gumgel', category: 'NAILS', price: '2000', duration: '120 mins', image: 'https://images.unsplash.com/photo-1457972851104-4fd469440bf9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Overlay Builder', category: 'NAILS', price: '1500', duration: '90 mins', image: 'https://images.unsplash.com/photo-1510520434124-5bc7e642b61d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Overlay Gumgel', category: 'NAILS', price: '2000', duration: '90 mins', image: 'https://images.unsplash.com/photo-1599426184804-5ec8f540bd0a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sculpting', category: 'NAILS', price: '3000', duration: '150 mins', image: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gel X', category: 'NAILS', price: '3000', duration: '120 mins', image: 'https://images.unsplash.com/photo-1629190842240-5e60802c011e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Acrylics', category: 'NAILS', price: '3500', duration: '150 mins', image: 'https://images.unsplash.com/photo-1610992015732-2449b0c26670?auto=format&fit=crop&w=800&q=80' },
  { name: 'Acrylic Overlay', category: 'NAILS', price: '3000', duration: '120 mins', image: 'https://images.unsplash.com/photo-1522337628061-92f35a78274d?auto=format&fit=crop&w=800&q=80' },

  // LASHES
  { name: 'Clusters', category: 'LASHES', price: '1500', duration: '45 mins', image: 'https://images.unsplash.com/photo-1583001931046-f080373c66f7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Individual Classic', category: 'LASHES', price: '2500', duration: '90 mins', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' },
  { name: 'Individual Hybrid', category: 'LASHES', price: '3500', duration: '120 mins', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80' },
  { name: 'Individual Volume', category: 'LASHES', price: '4500', duration: '150 mins', image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80' },
  { name: 'Individual Mega Volume', category: 'LASHES', price: '6500', duration: '180 mins', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80' },
  { name: 'Individual Recession (Refill/Retouch)', category: 'LASHES', price: '1500', duration: '60 mins', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mink Lashes', category: 'LASHES', price: '8500', duration: '150 mins', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Strip Lashes', category: 'LASHES', price: '200', duration: '15 mins', image: 'https://images.unsplash.com/photo-1588331464319-756ef1b854ec?auto=format&fit=crop&w=800&q=80' },

  // WIGS
  { name: 'Laundry', category: 'WIGS', price: '1000', duration: '120 mins', image: 'https://images.unsplash.com/photo-1620331311520-246422ff82f9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Wig Gluing', category: 'WIGS', price: '1000', duration: '60 mins', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gluing + Edges', category: 'WIGS', price: '1100', duration: '75 mins', image: 'https://images.unsplash.com/photo-1632233033500-606623668858?auto=format&fit=crop&w=800&q=80' },
  { name: 'Wig Styling', category: 'WIGS', price: '2000', duration: '90 mins', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
  { name: 'Flat Iron', category: 'WIGS', price: '1000', duration: '60 mins', image: 'https://images.unsplash.com/photo-1595475241949-0f024f7836fd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tinting', category: 'WIGS', price: '300', duration: '45 mins', image: 'https://images.unsplash.com/photo-1620331310118-2059344199c4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cut Lace', category: 'WIGS', price: '200', duration: '30 mins', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },

  // MAKEUP
  { name: 'Touch Up', category: 'MAKEUP', price: '1500', duration: '30 mins', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Soft Glam', category: 'MAKEUP', price: '2000', duration: '60 mins', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Full Makeup', category: 'MAKEUP', price: '2500', duration: '90 mins', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bridal Makeup', category: 'MAKEUP', price: '3500', duration: '120 mins', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bridal Team', category: 'MAKEUP', price: '30000', duration: '300 mins', image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80' },

  // EYEBROWS
  { name: 'Eyebrow Tinting', category: 'EYEBROWS', price: '500', duration: '30 mins', image: 'https://images.unsplash.com/photo-1522337628061-92f35a78274d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Eyebrow Threading', category: 'EYEBROWS', price: '300', duration: '20 mins', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' },
  { name: 'Eyebrow Tweezing', category: 'EYEBROWS', price: '300', duration: '20 mins', image: 'https://images.unsplash.com/photo-1600428791234-170fab1149c5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Eyebrow Razor Cutting', category: 'EYEBROWS', price: '200', duration: '15 mins', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
  { name: 'Eyebrow Trimming', category: 'EYEBROWS', price: '150', duration: '15 mins', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' },

  // FACIAL
  { name: 'Mini Facial', category: 'FACIAL', price: '2000', duration: '45 mins', image: 'https://images.unsplash.com/photo-1570172619666-1142fa96105e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Scrubbing', category: 'FACIAL', price: '1500', duration: '30 mins', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Full Facial', category: 'FACIAL', price: '3500', duration: '90 mins', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Steaming', category: 'FACIAL', price: '1000', duration: '30 mins', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80' }
];

const importData = async () => {
  try {
    await Service.deleteMany();
    await Service.insertMany(services);
    console.log('--- COMPREHENSIVE LUXURY CATALOG SYNCED ---');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
