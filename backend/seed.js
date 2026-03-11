import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const services = [
  // NAILS
  { name: 'Manicure Plain', category: 'NAILS', price: '500/=' },
  { name: 'Pedicure Plain', category: 'NAILS', price: '600/=' },
  { name: 'Manicure Gel', category: 'NAILS', price: '1000/=' },
  { name: 'Pedicure Gel', category: 'NAILS', price: '1100/=' },
  { name: 'Jelly Pedicure 2 Step', category: 'NAILS', price: '800/=' },
  { name: 'Jelly Pedicure 4 Step', category: 'NAILS', price: '1000/=' },
  { name: 'Santorini', category: 'NAILS', price: '1000/=' },
  { name: 'Tips Gel', category: 'NAILS', price: '1000/=' },
  { name: 'Tips Builder', category: 'NAILS', price: '1500/=' },
  { name: 'Tips Acrygel', category: 'NAILS', price: '2000/=' },
  { name: 'Overlay Builder', category: 'NAILS', price: '1000/=' },
  { name: 'Overlay Acrygel', category: 'NAILS', price: '1500/=' },
  { name: 'Sculpting', category: 'NAILS', price: '3000/=' },
  { name: 'Gel X', category: 'NAILS', price: '2500/=' },
  { name: 'Acrylics', category: 'NAILS', price: '3000/=' },
  { name: 'Acrylic Overlay', category: 'NAILS', price: '3000/=' },

  // LASHES
  { name: 'Clusters', category: 'LASHES', price: '1500/=' },
  { name: 'Individual Classic', category: 'LASHES', price: '2500/=' },
  { name: 'Hybrid', category: 'LASHES', price: '3500/=' },
  { name: 'Volume', category: 'LASHES', price: '4500/=' },
  { name: 'Mega Volume', category: 'LASHES', price: '6500/=' },
  { name: 'Russian', category: 'LASHES', price: '7500/=' },
  { name: 'Mink Lashes', category: 'LASHES', price: '400/=' },
  { name: 'Strip Lashes', category: 'LASHES', price: '150/=' },

  // EYEBROWS
  { name: 'Eyebrow Tinting', category: 'EYEBROWS', price: '200/=' },
  { name: 'Eyebrow Trimming', category: 'EYEBROWS', price: '150/=' },
  { name: 'Threading', category: 'EYEBROWS', price: '300/=' },
  { name: 'Tweezing', category: 'EYEBROWS', price: '300/=' },
  { name: 'Razor Cutting', category: 'EYEBROWS', price: '200/=' },

  // MAKEUP
  { name: 'Touch Up', category: 'MAKEUP', price: '1500/=' },
  { name: 'Soft Glam', category: 'MAKEUP', price: '2000/=' },
  { name: 'Full Makeup', category: 'MAKEUP', price: '2500/=' },
  { name: 'Bride Makeup', category: 'MAKEUP', price: '3500/=' },
  { name: 'Bridal Team', category: 'MAKEUP', price: '3000/=' },

  // HAIR / WIG SERVICES
  { name: 'Laundry', category: 'HAIR / WIG', price: '1000/=' },
  { name: 'Wig Gluing', category: 'HAIR / WIG', price: '1000/=' },
  { name: 'Gluing Edges', category: 'HAIR / WIG', price: '1100/=' },
  { name: 'Wig Styling', category: 'HAIR / WIG', price: '2000/=' },
  { name: 'Flat Iron', category: 'HAIR / WIG', price: '1000/=' },
  { name: 'Tinting', category: 'HAIR / WIG', price: '300/=' },
  { name: 'Cut Lace', category: 'HAIR / WIG', price: '200/=' },

  // FACIAL
  { name: 'Mini Facial', category: 'FACIAL', price: '1000/=' },
  { name: 'Scrubbing', category: 'FACIAL', price: '500/=' },
  { name: 'Full Facial', category: 'FACIAL', price: '2000/=' },
  { name: 'Steaming', category: 'FACIAL', price: '1000/=' },

  // SALON / HAIR STYLING
  { name: 'Hair Wash', category: 'SALON', price: '500/=' },
  { name: 'Wash & Straightening', category: 'SALON', price: '500/=' },
  { name: 'Wash & Full Blowdry', category: 'SALON', price: '1000/=' },
  { name: 'Twist Outs', category: 'SALON', price: '1500/=' },
  { name: 'Mini Twists', category: 'SALON', price: '3000/=' },
  { name: 'Crochet', category: 'SALON', price: '1500/=' },
  { name: 'Havana Curl', category: 'SALON', price: '2000/=' },
  { name: 'Invisible Locs', category: 'SALON', price: '1700/=' },
  { name: 'Gel Styling', category: 'SALON', price: '1500/=' },
  { name: 'Butterfly Locs', category: 'SALON', price: '2500/=' },
  { name: 'Gypsy Locs', category: 'SALON', price: '2000/=' },
  { name: 'Mermaid Braids', category: 'SALON', price: '2000/=' },
  { name: 'Box Braids', category: 'SALON', price: '1500/=' },
  { name: 'Boho Knotless Braids', category: 'SALON', price: '2500/=' },
  { name: 'Lemonade Braids', category: 'SALON', price: '1700/=' },
  { name: 'Natural Twists', category: 'SALON', price: '2000/=' },
  { name: 'Italian Curls', category: 'SALON', price: '2000/=' },
  { name: 'Retwist', category: 'SALON', price: '1500-2000/=' }
];

const importData = async () => {
  try {
    await Service.deleteMany();
    await User.deleteMany();

    await Service.insertMany(services);

    const adminUser = {
      name: 'Admin User',
      email: 'admin@ccbeauty.com',
      password: 'adminpassword123',
      isAdmin: true
    };

    await User.create(adminUser);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
