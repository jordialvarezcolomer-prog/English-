import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Play, 
  MapPin, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Instagram, 
  Linkedin, 
  Facebook, 
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Trophy
} from 'lucide-react';
import Tickets from './pages/Tickets';
import Accommodation from './pages/Accommodation';
import WhyAttend from './pages/WhyAttend';
import Exhibitors from './pages/Exhibitors';

function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header / Logo Section */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-6 px-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 border border-gold relative flex items-center justify-center">
                <div className="absolute w-6 h-[1px] bg-gold -rotate-45"></div>
                <div className="absolute w-6 h-[1px] bg-gold rotate-45"></div>
             </div>
             <span className="text-xl tracking-[0.3em] font-serif uppercase pt-1">Vivó & Alvarez</span>
          </div>
          <nav className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-white/70">
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#details" className="hover:text-gold transition-colors">Details</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden bg-[url('https://picsum.photos/seed/leather-dark/1920/1080?blur=10')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <p className="text-gold text-xs uppercase tracking-[0.4em] mb-6">Mastery & Heritage</p>
          <h1 className="text-5xl md:text-8xl font-serif leading-[0.9] uppercase mb-8 max-w-5xl mx-auto tracking-tighter">
            The 2nd International <br /> 
            <span className="italic text-gold">Luxury Leather</span> <br /> 
            Exhibition
          </h1>
          <p className="text-white/60 tracking-[0.1em] text-sm md:text-lg max-w-2xl mx-auto mb-10 font-light italic">
            Barcelona, Spain | October 12–15, 2026
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/tickets" target="_blank" className="bg-white text-black px-10 py-4 uppercase text-xs tracking-widest font-bold hover:bg-gold transition-all duration-300">
              Get Tickets
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Event Description */}
      <section id="about" className="py-32 px-10 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-gold text-xs uppercase tracking-[0.3em] block mb-8">Curated Experience</span>
          <h2 className="text-4xl md:text-6xl font-serif leading-tight mb-12">
            A VIVÓ & ALVAREZ curated experience. Discover the pinnacle of leather craftsmanship.
          </h2>
          <p className="text-xl text-black/60 font-light leading-relaxed mb-16 italic">
            Merging centuries of Spanish heritage with avant-garde global design. 
            The exhibition serves as a sanctuary for the world's most distinguished artisans and collectors.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 border border-black/5 hover:border-gold/30 transition-colors">
              <Trophy className="mx-auto mb-4 text-gold" size={32} />
               <p className="uppercase text-[10px] tracking-widest font-bold mb-2">Excellence</p>
               <p className="text-xs text-black/50">Only the top tier of international leather maisons.</p>
            </div>
            <div className="p-8 border border-black/5 hover:border-gold/30 transition-colors">
              <Star className="mx-auto mb-4 text-gold" size={32} />
               <p className="uppercase text-[10px] tracking-widest font-bold mb-2">Innovation</p>
               <p className="text-xs text-black/50">Sustainable practices and new material technologies.</p>
            </div>
            <div className="p-8 border border-black/5 hover:border-gold/30 transition-colors">
              <ShieldCheck className="mx-auto mb-4 text-gold" size={32} />
               <p className="uppercase text-[10px] tracking-widest font-bold mb-2">Authenticity</p>
               <p className="text-xs text-black/50">Guaranteed origin and hand-stitched traditional quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section id="details" className="py-24 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-12 border border-white/5 group hover:border-gold/50 transition-all">
              <MapPin className="text-gold mb-6" size={24} />
              <h3 className="text-lg uppercase tracking-widest mb-4">Venue</h3>
              <p className="text-white/50 text-sm text-center">Barcelona Convention Center<br/>Plaça de Willy Brandt, 11-14</p>
            </div>
            <div className="flex flex-col items-center p-12 lg:border-x border-white/10 group hover:border-gold/50 transition-all">
              <Calendar className="text-gold mb-6" size={24} />
              <h3 className="text-lg uppercase tracking-widest mb-4">Dates</h3>
              <p className="text-white/50 text-sm text-center">12 – 15 October<br/>Autumn 2026</p>
            </div>
            <div className="flex flex-col items-center p-12 border border-white/5 group hover:border-gold/50 transition-all">
              <Clock className="text-gold mb-6" size={24} />
              <h3 className="text-lg uppercase tracking-widest mb-4">Time</h3>
              <p className="text-white/50 text-sm text-center">10:00 – 19:00<br/>Daily Sessions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Placeholder */}
      <section className="py-32 px-10 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-video bg-white/5 flex items-center justify-center group cursor-pointer border border-white/10 overflow-hidden">
            <img 
               src="https://picsum.photos/seed/leather-workshop/1280/720" 
               className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-700" 
               alt="Luxury Leather Workshop"
               referrerPolicy="no-referrer"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
                <Play className="text-gold group-hover:text-black ml-1" fill="currentColor" size={24} />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] font-serif">Experience the World of Luxury Leather</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Links Grid */}
      <section className="py-24 px-10 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Tickets", path: "/tickets", desc: "VIP & General Access" },
            { title: "Accommodation", path: "/accommodation", desc: "Luxury Stay Partners" },
            { title: "Why Attend", path: "/why-attend", desc: "Exclusive Benefits" },
            { title: "Exhibitors", path: "/exhibitors", desc: "Brand Applications" }
          ].map((item) => (
            <Link 
              key={item.title} 
              to={item.path} 
              target="_blank"
              className="group p-10 border border-black/10 hover:border-gold bg-black text-white transition-all flex flex-col justify-between aspect-square"
            >
              <div className="flex justify-between items-start">
                 <h4 className="text-2xl font-serif uppercase tracking-tighter leading-tight">{item.title}</h4>
                 <ArrowRight className="text-gold group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Workshops & Speakers */}
      <section className="py-32 px-10 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
              <span className="text-gold text-xs uppercase tracking-widest block mb-4">Engage</span>
              <h3 className="text-4xl font-serif mb-8 leading-tight">Masterclasses & Creative Panels</h3>
              <p className="text-white/60 font-light mb-10 leading-relaxed">
                Connect with legacy artisans and forward-thinking designers. Our program includes 
                daily masterclasses on rare tanning techniques and panel discussions on the 
                future of high-end accessories.
              </p>
              <div className="flex items-center gap-4 text-gold border-b border-gold/30 pb-2 w-fit cursor-pointer hover:border-gold transition-colors">
                 <Users size={16} />
                 <span className="text-xs uppercase tracking-widest">Meet our 2026 Panel</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-12 border border-white/10 mt-10 md:mt-0">
               <h3 className="text-2xl font-serif mb-6 uppercase tracking-widest">Call for Speakers</h3>
               <p className="text-sm text-white/50 mb-8 leading-relaxed">
                 Are you an industry leader or master craftsman? We invite you to share your expertise.
               </p>
               <a href="mailto:speakers@luxury-leather.exhibition" className="flex items-center gap-3 text-gold group">
                 <Mail size={16} />
                 <span className="text-sm font-medium border-b border-transparent group-hover:border-gold transition-all">speakers@luxury-leather.exhibition</span>
               </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship */}
      <section className="py-24 bg-gold text-black">
        <div className="max-w-4xl mx-auto px-10 text-center">
          <h2 className="text-4xl font-serif mb-6">Partnerships in Excellence</h2>
          <p className="text-lg opacity-80 mb-10 font-medium">Gain unmatched visibility within the luxury sector. Network with premium brands and high-net-worth attendees.</p>
          <div className="inline-block border-2 border-black p-4 uppercase text-[10px] tracking-[0.3em] font-black cursor-pointer hover:bg-black hover:text-white transition-all">
            Download Prospectus
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-10 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div>
              <h2 className="text-5xl font-serif mb-12 uppercase tracking-tighter">Get in <br /> <span className="text-gold italic underline underline-offset-8">Touch</span></h2>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-gold">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-1">Telephone</p>
                    <p className="text-lg">+34 600 123 456</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-gold">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-1">Email</p>
                    <p className="text-lg">office@luxury-leather.exhibition</p>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="NAME" 
                  className="w-full bg-transparent border-b border-black/20 py-4 focus:border-gold outline-none text-xs tracking-widest"
                />
                <input 
                  type="email" 
                  placeholder="EMAIL" 
                  className="w-full bg-transparent border-b border-black/20 py-4 focus:border-gold outline-none text-xs tracking-widest"
                />
              </div>
              <textarea 
                rows={4} 
                placeholder="MESSAGE" 
                className="w-full bg-transparent border-b border-black/20 py-4 focus:border-gold outline-none text-xs tracking-widest"
              ></textarea>
              <button className="bg-black text-white w-full py-5 uppercase text-xs tracking-[0.3em] font-bold hover:bg-gold transition-colors">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 grayscale opacity-70">
             <div className="w-8 h-8 border border-white relative flex items-center justify-center">
                <div className="absolute w-5 h-[1px] bg-white -rotate-45"></div>
                <div className="absolute w-5 h-[1px] bg-white rotate-45"></div>
             </div>
             <span className="text-sm tracking-[0.3em] font-serif uppercase">Vivó & Alvarez</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-gold transition-colors"><Linkedin size={20} /></a>
            <a href="#" className="hover:text-gold transition-colors"><Facebook size={20} /></a>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-white/30">
            © 2026 Vivó & Alvarez • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/why-attend" element={<WhyAttend />} />
        <Route path="/exhibitors" element={<Exhibitors />} />
      </Routes>
    </BrowserRouter>
  );
}
