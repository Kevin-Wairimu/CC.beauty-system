import React from "react";
import { Sparkles, Instagram, Facebook, Twitter, Music, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gold/20 text-white selection:bg-gold selection:text-black">
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          {/* Brand section - spans 4 columns */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border border-gold/40 flex items-center justify-center group-hover:border-gold transition-colors">
                   <Sparkles className="text-gold h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-3xl font-serif font-bold uppercase tracking-[0.2em] text-white">
                  CC <span className="text-gold italic">Beauty</span>
                </h3>
              </div>
              <p className="max-w-md text-white/50 font-light leading-relaxed italic text-sm tracking-wide">
                "Where bespoke mastery meets the pinnacle of luxury. We don't just provide services; we curate timeless beauty rituals for the discerning individual."
              </p>
            </div>
            
            <div className="flex space-x-6">
              {[
                { icon: <Instagram className="h-4 w-4" />, url: "https://www.instagram.com/cc_beauty_clinic/" },
                { icon: <Music className="h-4 w-4" />, url: "https://www.tiktok.com/@cc_beauty_clinic" },
                { icon: <Facebook className="h-4 w-4" />, url: "#" },
                { icon: <Twitter className="h-4 w-4" />, url: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 border border-gold/10 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/40 transition-all duration-500 rounded-none"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Experience Links - spans 2 columns */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-8">
              Experience
            </h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] font-bold text-white/40">
              <li><a href="/" className="hover:text-gold transition-colors block">Studio Menu</a></li>
              <li><a href="/booking" className="hover:text-gold transition-colors block">Reservations</a></li>
              <li><a href="/contact" className="hover:text-gold transition-colors block">Inquiries</a></li>
              <li><a href="/login" className="hover:text-gold transition-colors block">Member Access</a></li>
            </ul>
          </div>

          {/* Studio Hours - spans 2 columns */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-8">
              Studio Hours
            </h3>
            <div className="space-y-6 text-[11px] uppercase tracking-[0.15em] font-medium text-white/40">
              <div className="space-y-1">
                <p className="text-white/60 font-black">Mon — Sat</p>
                <p>08:00 — 21:00</p>
              </div>
              <div className="space-y-1">
                <p className="text-gold/60 font-black italic text-[9px]">Sunday Rituals</p>
                <p>10:00 — 21:00</p>
              </div>
            </div>
          </div>

          {/* Contact Details - spans 3 columns */}
          <div className="md:col-span-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-8">
              The Atelier
            </h3>
            <ul className="space-y-6 text-[11px] font-light tracking-wide text-white/60">
              <li className="flex gap-4 group">
                <MapPin className="h-4 w-4 text-gold/40 shrink-0 group-hover:text-gold transition-colors" />
                <a
                  href="https://www.google.com/maps/place/CC+Beauty+Clinic/@-1.228597,36.8677963,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  Kilimanjaro City Arcade,<br />Thome Road, Nairobi, KE
                </a>
              </li>
              <li className="flex gap-4 group">
                <Phone className="h-4 w-4 text-gold/40 shrink-0 group-hover:text-gold transition-colors" />
                <span className="group-hover:text-white transition-colors">+254 759 934 198</span>
              </li>
              <li className="flex gap-4 group">
                <Mail className="h-4 w-4 text-gold/40 shrink-0 group-hover:text-gold transition-colors" />
                <span className="group-hover:text-white transition-colors italic">Ccbeautyclinic21@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION - Redesigned with Credits on the left */}
        <div className="mt-24 pt-12 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Credits - Bottom Left */}
          <div className="order-2 md:order-1 flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black text-white/30">
              <span>Architected By</span>
              <div className="h-px w-8 bg-gold/20" />
              <a 
                href="#" 
                className="text-gold/60 hover:text-gold transition-all duration-500 hover:tracking-[0.6em]"
              >
                Kevin Wairimu
              </a>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/20">
              Handcrafted Luxury &bull; Digital Experience &copy; {new Date().getFullYear()}
            </p>
          </div>

          {/* Legal / Secondary Nav - Bottom Right */}
          <div className="order-1 md:order-2 flex items-center gap-8 text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
            <a href="#" className="hover:text-gold/40 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold/40 transition-colors">Terms</a>
            <div className="h-1 w-1 bg-gold/40 rounded-full" />
            <span className="text-white/40">CC Beauty Clinic&trade;</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
