import React from "react";
import { Sparkles, Instagram, Facebook, Twitter, Music } from "lucide-react";

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
                CC Beauty Clinic
              </h3>
            </div>
            <p className="text-white/60 font-light leading-relaxed mb-6 italic">
              Premium Beauty Clinic & Studio Experience. Where luxury meets
              expertise in every detail.
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
              <a
                href="https://www.tiktok.com/@cc_beauty_clinic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-white transition-colors"
              >
                <Music className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gold mb-6 border-b border-gold/20 pb-2">
              Experience
            </h3>
            <ul className="space-y-3 text-white/60 font-light">
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
                  href="/#reviews"
                  className="hover:text-gold transition-colors"
                >
                  Guest Reviews
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
            <ul className="space-y-3 text-white/60 font-light">
              <li className="flex justify-between">
                <span>Mon - Fri</span>{" "}
                <span className="text-white">8:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>{" "}
                <span className="text-gold/60">
                  10:00 AM - 9:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gold mb-6 border-b border-gold/20 pb-2">
              Location
            </h3>
            <ul className="space-y-4 text-white/60 font-light">
              <li className="flex items-start gap-3">
                <a
                  href="https://www.google.com/maps/place/CC+Beauty+Clinic/@-1.228597,36.8677963,17z/data=!4m6!3m5!1s0x182f3f0032d473b1:0xd4353544f547715e!8m2!3d-1.2286024!4d36.8703712"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gold transition-colors"
                >
                  CC Beauty Clinic,
                  <br />
                  Kilimanjaro City Arcade, Thome Road, Nairobi
                </a>
              </li>
              <li className="text-white">+254 759 934 198</li>
              <li className="text-white italic">
                Ccbeautyclinic21@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gold/10 pt-8 text-center text-white/40 text-sm font-light uppercase tracking-[0.2em]">
          <p>
            &copy; {new Date().getFullYear()} CC Beauty Clinic @ Handcrafted
            Luxury by Kevin Wairimu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
