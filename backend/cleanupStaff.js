import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const cleanupStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- Cleaning Up Staff Database ---');
    
    // 1. Find all staff members (role staff, manager, or admin)
    const allStaff = await User.find({ role: { $in: ['staff', 'manager', 'admin'] } });
    console.log(`Found ${allStaff.length} staff/admin accounts.`);

    const VALID_MAP = {
        'HAIRDRESSER': 'HAIR',
        'NAIL TECHNICIAN': 'NAILS',
        'MAKEUP ARTIST': 'MAKEUP',
        'LASH TECHNICIAN': 'LASHES',
        'WIG STYLIST': 'WIGS',
        'BROW SPECIALIST': 'EYEBROWS',
        'ESTHETICIAN': 'FACIAL',
        'SKIN SPECIALIST': 'SKIN'
    };

    const STANDARDIZED = ["NAILS", "MAKEUP", "LASHES", "WIGS", "HAIR", "EYEBROWS", "FACIAL", "SKIN"];

    for (const s of allStaff) {
        let updatedSpecs = (s.specialization || []).map(sp => sp.toUpperCase().trim());
        
        // Map old/verbose names to standardized ones
        updatedSpecs = updatedSpecs.map(sp => VALID_MAP[sp] || sp);
        
        // Filter out any that are not in our STANDARDIZED list (like RECEPTIONIST)
        // unless we want to keep them but know they won't be bookable.
        // The user says "all staff members are bookable", so let's make sure they have a valid spec.
        
        if (updatedSpecs.length === 0 || !updatedSpecs.some(sp => STANDARDIZED.includes(sp))) {
            console.log(`! Staff ${s.name} has no valid beauty specs. Adding 'HAIR' as default to make bookable.`);
            updatedSpecs.push('HAIR');
        }

        // Remove duplicates and keep only standardized ones
        const finalSpecs = [...new Set(updatedSpecs.filter(sp => STANDARDIZED.includes(sp)))];
        
        s.specialization = finalSpecs;
        await s.save();
        console.log(`✅ Updated ${s.name} (${s.email}) -> Specs: [${finalSpecs.join(', ')}]`);
    }

    console.log('\n--- Cleanup Complete ---');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

cleanupStaff();
