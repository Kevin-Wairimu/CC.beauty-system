import React from "react";
import { Sparkles, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gold/20 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-gold h-6 w-6" />
              <h3 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold">
                CC Beauty
              </h3>
            </div>
            <p className="text-gray-400 font-light leading-relaxed mb-6 italic">
              Elite Spa & Salon Experience. Where luxury meets beauty in every
              detail.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/cc_beauty_clinic/"
                className="text-gold hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gold hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gold hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gold mb-6 border-b border-gold/20 pb-2">
              Experience
            </h3>
            <ul className="space-y-3 text-gray-400 font-light">
              <li>
                <a href="/" className="hover:text-gold transition-colors">
                  Services Menu
                </a>
              </li>
              <li>
                <a
                  href="/booking"
                  className="hover:text-gold transition-colors"
                >
                  Book Appointment
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-gold transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Opening hours */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gold mb-6 border-b border-gold/20 pb-2">
              Studio Hours
            </h3>
            <ul className="space-y-3 text-gray-400 font-light">
              <li className="flex justify-between">
                <span>Mon - Fri</span>{" "}
                <span className="text-gray-200">9:00 AM - 7:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>{" "}
                <span className="text-gray-200">9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>{" "}
                <span className="text-gray-200 text-gold/60">
                  9:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gold mb-6 border-b border-gold/20 pb-2">
              Location
            </h3>
            <ul className="space-y-4 text-gray-400 font-light">
              <li className="flex items-start gap-3">
                <span className="text-gray-200">
                  Roasters,Kilimanjaro arcade
                  <br />
                  Nairobi, Kenya
                </span>
              </li>
              <li className="text-gray-200">+254 759 934 198</li>
              <li className="text-gray-200 italic">
                ccbeautyclinic21@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gold/10 pt-8 text-center text-gray-500 text-sm font-light uppercase tracking-[0.2em]">
          <p>
            &copy; {new Date().getFullYear()} CC Beauty & Spa @ Handcrafted
            Luxury by Kevin Wairimu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
