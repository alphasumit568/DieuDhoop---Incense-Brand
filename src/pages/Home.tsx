import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Star, Leaf, Sparkles, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { MOCK_PRODUCTS } from "../data/products";
import sand1 from "../assets/images/sand1.jpeg";
import sand2 from "../assets/images/sand2.jpeg";
import rose1 from "../assets/images/rose1.jpeg";
import rose2 from "../assets/images/rose2.jpeg";

const HERO_SLIDES = [
  {
    id: 1,
    category: "dhoop cones",
    title: "Heaven's Aroma for the Soul.",
    description: "The divine fragrance of Rudra, handcrafted to invoke strength and spiritual clarity. Dipped in pure essential oils for a powerful meditation experience.",
    image: sand1,
    signature: "Heaven's Aroma Rudra",
    accent: "Rudra",
    motto: "Strength in every wisp of smoke."
  },
  {
    id: 2,
    category: "Dhoop batti",
    title: "Premium Lavender Fields.",
    description: "Experience the calming essence of high-altitude lavender, hand-rolled with sacred resins to facilitate deep meditation and restful sleep.",
    image: sand2,
    signature: "Sacred Lavender",
    accent: "Lavender",
    motto: "Drift into divine silence."
  },
  {
    id: 3,
    category: "Lotus Bliss",
    title: "December Flower Lotus.",
    description: "Inspired by the purity of the lotus, this blend brings a sense of renewal and divine awakening to your sacred space.",
    image: rose1,
    signature: "Lotus Bliss",
    accent: "Lotus",
    motto: "Bloom in the light of peace."
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden bg-brand-beige text-brand-stone"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-20">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-2/3 h-full overflow-hidden opacity-30 pointer-events-none z-0">
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[500px] bg-gradient-to-t from-transparent via-brand-saffron/20 to-brand-gold/10 rounded-full blur-[80px] rotate-45"></div>
          <div className="absolute top-[5%] right-[20%] w-[300px] h-[600px] bg-gradient-to-b from-transparent via-white to-transparent blur-[100px] animate-pulse opacity-40"></div>
        </div>

        {/* Arabic Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" className="text-brand-gold/40">
            <defs>
              <pattern id="arabic-geo" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                <rect width="160" height="160" fill="none" />
                {/* Geometric Islamic Pattern Elements */}
                <path d="M80 0 L160 80 L80 160 L0 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0 0 L160 160 M160 0 L0 160" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
                
                {/* Center Star */}
                <path d="M80 40 L105 80 L80 120 L55 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M40 80 L80 105 L120 80 L80 55 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                
                {/* Circles */}
                <circle cx="80" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="currentColor" strokeWidth="0.1" />
                
                {/* Corner details */}
                <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="160" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="0" cy="160" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="160" cy="160" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arabic-geo)" />
          </svg>
        </div>

        {/* Doodles Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-10 transform -rotate-12">
            <svg width="40" height="80" viewBox="0 0 40 80" className="text-brand-stone/40">
              <line x1="20" y1="80" x2="20" y2="30" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M20 25 Q23 15 20 5 Q17 15 20 25" fill="none" stroke="currentColor" strokeWidth="1" className="animate-pulse" />
            </svg>
          </div>
          <div className="absolute top-1/3 left-1/4 transform rotate-12">
             <svg width="20" height="20" viewBox="0 0 20 20" className="text-brand-stone/20">
                <path d="M10 0 L0 20 L20 20 Z" fill="currentColor" />
             </svg>
             <svg width="20" height="40" viewBox="0 0 20 40" className="text-brand-stone/40">
               <path d="M10 40 L5 60 L15 60 Z" fill="currentColor" transform="translate(0 -20)" />
               <path d="M10 15 Q12 8 10 2 Q8 8 10 15" fill="none" stroke="currentColor" strokeWidth="1" className="animate-pulse" />
             </svg>
          </div>
          <div className="absolute bottom-1/4 left-1/2 transform -rotate-45">
            <svg width="30" height="60" viewBox="0 0 30 60" className="text-brand-stone/30">
              <line x1="15" y1="60" x2="15" y2="20" stroke="currentColor" strokeWidth="0.8" />
              <path d="M15 15 Q18 8 15 2 Q12 8 15 15" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute top-20 right-1/4 transform rotate-6">
            <svg width="40" height="60" viewBox="0 0 40 60" className="text-brand-gold/30">
              <path d="M20 40 L12 60 L28 60 Z" fill="currentColor" />
              <path d="M20 35 Q24 25 20 15 Q16 25 20 35" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute bottom-1/3 right-10 transform scale-125">
             <svg width="20" height="50" viewBox="0 0 20 50" className="text-brand-stone/20">
               <line x1="10" y1="50" x2="10" y2="15" stroke="currentColor" strokeWidth="1.5" />
               <path d="M10 10 Q12 5 10 0 Q8 5 10 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
             </svg>
          </div>
          {/* Extra Doodles */}
          <div className="absolute top-1/2 left-1/3 opacity-20 transform scale-75 -rotate-45">
             <svg width="30" height="30" viewBox="0 0 30 30" className="text-brand-stone">
                <circle cx="15" cy="15" r="2" fill="currentColor" />
                <path d="M15 13 Q17 5 15 1" fill="none" stroke="currentColor" strokeWidth="0.5" />
             </svg>
          </div>
          <div className="absolute bottom-10 left-20 opacity-20 transform rotate-12 scale-150">
             <svg width="20" height="40" viewBox="0 0 20 40" className="text-brand-gold">
                <path d="M10 30 Q12 25 10 20 Q8 25 10 30" fill="currentColor" />
                <line x1="10" y1="30" x2="10" y2="40" stroke="currentColor" strokeWidth="1" />
             </svg>
          </div>
          <div className="absolute top-10 right-20 opacity-10 transform -rotate-12">
             <Wind className="text-brand-stone" size={40} />
          </div>
          <div className="absolute bottom-1/2 right-1/3 opacity-15 transform rotate-90">
             <Sparkles className="text-brand-gold" size={32} />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-0 px-6 md:px-12 items-center relative z-10">
          <div className="col-span-12 lg:col-span-6 py-12 lg:py-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={slide.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 flex items-center space-x-2">
                  <div className="h-[1px] w-8 bg-brand-saffron"></div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron">{slide.category}</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-serif leading-[0.85] text-brand-stone mb-8">
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i} className={word === "Aroma" || word === "Lavender" || word === "Lotus" ? "italic text-brand-gold block md:inline" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </h2>
                
                <p className="text-base font-light leading-relaxed text-brand-stone-light mb-10 max-w-md">
                  {slide.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6">
                  <Link to="/shop" className="bg-brand-gold text-white px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold shadow-lg hover:brightness-110 transition-all border border-white/20">
                    The Collection
                  </Link>
                  <Link to="/quiz" className="border border-brand-gold text-brand-gold px-8 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-brand-gold/5 transition-all">
                    Fragrance Quiz
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="col-span-12 lg:col-span-6 relative h-full min-h-[500px] flex items-center justify-center">
            
            <div className="absolute w-[500px] h-[500px] md:w-[900px] md:h-[900px] border border-brand-border rounded-full flex items-center justify-center opacity-50">
              <div className="w-[420px] h-[420px] md:w-[720px] md:h-[720px] border border-brand-border rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center w-full">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center relative -mt-16"
                >
                  <div className="w-80 h-[450px] md:w-[480px] md:h-[600px] bg-brand-sand rounded-t-full shadow-2xl relative overflow-hidden group border-4 border-white mx-auto">
                    <img 
                      src={slide.image} 
                      className="w-full h-full object-cover" 
                      alt={slide.signature} 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/40"></div>
                    <div className="absolute bottom-10 left-0 right-0 p-6 text-white text-center">
                      <p className="text-[10px] uppercase tracking-widest mb-1 opacity-80 font-bold">Signature Scent</p>
                      <h3 className="text-2xl font-serif">{slide.signature}</h3>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20, rotate: 10 }}
                    animate={{ opacity: 1, x: 0, rotate: 3 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -right-4 md:-right-12 bottom-1/4 bg-white p-6 shadow-xl border border-brand-border max-w-[160px] text-left transform z-20"
                  >
                    <p className="text-[9px] uppercase tracking-tighter font-bold text-brand-saffron mb-1">New Arrival</p>
                    <p className="text-xs font-serif italic text-brand-stone">"{slide.motto}"</p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-8">
                <button 
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-brand-stone/40 hover:text-brand-stone hover:border-brand-gold transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex space-x-3">
                  {HERO_SLIDES.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        currentSlide === i ? "bg-brand-gold w-6" : "bg-brand-border"
                      )}
                    />
                  ))}
                </div>
                <button 
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-brand-stone/40 hover:text-brand-stone hover:border-brand-gold transition-all"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="absolute left-0 bottom-10 hidden md:flex flex-col items-center">
              <div className="w-[1px] h-20 bg-gradient-to-t from-brand-gold to-transparent"></div>
              <span className="vertical-text text-[10px] uppercase tracking-[0.5em] text-brand-gold py-4">ESTD. 2024</span>
            </div>
          </div>
        </div>

        {/* Info Footnote */}
        <div className="px-6 md:px-12 py-8 flex items-center justify-between border-t border-brand-border mt-auto">
           <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Luxury Spiritual Aromatherapy</span>
           <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Hand Rolled in India</span>
        </div>
      </section>

      {/* Sacred Collections Section */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-[1px] w-8 bg-brand-saffron"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron">Divine Selection</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif text-brand-stone leading-[0.9]">
                Sacred Artifact <br/><span className="italic text-brand-gold">Collections.</span>
              </h2>
            </div>
            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] font-bold max-w-[200px] text-right">
              Crafted for the conscious soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <CategoryCard 
              title="dhoop cones" 
              tag="Powerful" 
              img={rose1} 
            />
            <CategoryCard 
              title="Dhoop batti" 
              tag="Calming" 
              img={sand1}
              className="md:mt-24"
            />
            <CategoryCard 
              title="Agarbatti" 
              tag="Grounding" 
              img={sand2}
            />
          </div>
        </div>
      </section>

      {/* Featured Collection Bar */}
      <section className="bg-white border-t border-brand-border px-6 md:px-12 py-16">
        <div className="flex items-center justify-between mb-12">
          <h4 className="text-[11px] uppercase tracking-widest font-bold opacity-40">Curated Essentials</h4>
          <Link to="/shop" className="text-brand-gold font-bold text-[10px] uppercase tracking-widest hover:underline">See All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {MOCK_PRODUCTS.slice(0, 3).map(product => (
            <SimpleFeaturedItem 
              key={product.id}
              id={product.id}
              category={product.categories[0]} 
              title={product.name} 
              price={`₹${product.price}`} 
              img={product.images[0]}
            />
          ))}
        </div>
      </section>

      {/* Brand Story Section */}
      <section id="about" className="py-32 px-6 md:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-sm relative z-10 shadow-2xl">
                <img 
                  src={rose2} 
                  alt="Our Sacred Journey" 
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-full h-full border border-brand-gold/20 -z-0 rounded-sm"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-beige -z-0 rounded-full blur-3xl opacity-50"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-10"
            >
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="h-[1px] w-8 bg-brand-gold"></div>
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold">The Ashram Tradition</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-serif text-brand-stone leading-tight mb-8">
                  Our Sacred <br/><span className="italic text-brand-gold">Journey.</span>
                </h2>
                <div className="space-y-6 text-brand-stone-light font-serif text-lg leading-relaxed italic">
                  <p>
                    "At Dieudhoop, our journey began in the flickering light of traditional ashrams, where the art of dhoop-making was a silent prayer. We carry forward this ancient Vedic heritage, handcrafting each incense stick with pure essential oils and sacred resins."
                  </p>
                  <p className="not-italic font-sans text-sm tracking-wide leading-loose">
                    Our mission is to transform your daily rituals into moments of divine connection, bringing the purity of nature and the wisdom of the ancients into every home. Every fragrance is a testament to our commitment to artisanal quality and spiritual mindfulness.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link to="#about" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }} className="inline-flex items-center space-x-4 group">
                  <span className="text-xs uppercase tracking-[0.3em] font-bold text-brand-stone group-hover:text-brand-gold transition-colors">Discover Our Roots</span>
                  <div className="w-12 h-[1px] bg-brand-stone group-hover:w-20 group-hover:bg-brand-gold transition-all duration-500"></div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Layout Update */}
      <section className="py-32 bg-brand-sand/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <Benefit icon={<Leaf size={24} />} title="Natural Ingredients" desc="Pure extracts & resins" />
          <Benefit icon={<Sparkles size={24} />} title="Artisanal Quality" desc="Handcrafted for divinity" />
          <Benefit icon={<Wind size={24} />} title="Long Lasting" desc="Slow burning serenity" />
          <Benefit icon={<Star size={24} />} title="Ethically Sourced" desc="Respecting the earth" />
        </div>
      </section>
    </motion.div>
  );
}

function SimpleFeaturedItem({ id, category, title, price, img }: any) {
  return (
    <Link to={`/product/${id}`} className="flex items-start space-x-6 group hover:-translate-y-1 transition-all">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-beige border border-brand-border rounded overflow-hidden p-1 flex-shrink-0 group-hover:border-brand-gold transition-colors">
        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={title} referrerPolicy="no-referrer" loading="lazy" decoding="async" />
      </div>
      <div>
        <p className="text-[10px] text-brand-saffron font-bold tracking-widest uppercase mb-1">{category}</p>
        <p className="text-base font-serif font-bold group-hover:text-brand-gold transition-colors">{title}</p>
        <p className="text-xs text-brand-stone/60 font-bold mt-1">{price}</p>
      </div>
    </Link>
  );
}

function Benefit({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="text-brand-gold">{icon}</div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-stone">{title}</h4>
        <p className="text-[9px] text-brand-stone/50 mt-2 uppercase tracking-[0.1em] font-medium leading-relaxed max-w-[120px] mx-auto">{desc}</p>
      </div>
    </div>
  );
}

function CategoryCard({ title, img, tag, className }: { title: string, img: string, tag: string, className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -10 }}
      className={cn("group cursor-pointer relative", className)}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-sm mb-6">
        <img 
          src={img} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={title}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full">
            {tag}
          </span>
        </div>
      </div>
      <h3 className="text-2xl font-serif group-hover:text-brand-gold transition-colors">{title}</h3>
      <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Discover Collection</p>
    </motion.div>
  );
}
