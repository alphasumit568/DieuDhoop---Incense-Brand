import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import { Product } from "../types";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_PRODUCTS } from "../data/products";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS as Product[]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [priceRange, setPriceRange] = useState(2000);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 8;

  const categories = ["All", "Agarbatti", "Dhoop batti", "Dhoop sticks", "dhoop cones"];

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery, priceRange]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Use real products if they exist, otherwise fallback/merge with mock
        const allProducts = [...dbProducts, ...(MOCK_PRODUCTS as Product[])];
        
        let filtered = allProducts;
        
        if (selectedCategory !== "All") {
          filtered = filtered.filter((p) => p.categories?.includes(selectedCategory));
        }

        if (searchQuery) {
          const queryStr = searchQuery.toLowerCase();
          filtered = filtered.filter((p) => 
            p.name.toLowerCase().includes(queryStr) || 
            p.categories?.some((cat: string) => cat.toLowerCase().includes(queryStr))
          );
        }

        filtered = filtered.filter((p) => p.price <= priceRange);

        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to mock on error
        setProducts(MOCK_PRODUCTS as Product[]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, priceRange]);

  const suggestions = searchQuery.length > 1 ? [
    ...categories.filter(cat => 
      cat.toLowerCase().includes(searchQuery.toLowerCase()) && cat !== "All"
    ).map(cat => ({ type: "category", value: cat })),
    ...MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(p => ({ type: "product", value: p.name, id: p.id }))
  ].slice(0, 6) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-4"
    >
      {/* Header */}
      <div className="mb-20">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-[1px] w-8 bg-brand-saffron"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron">Our Collections</span>
        </div>
        <h1 className="text-7xl md:text-8xl font-serif leading-none text-brand-stone">
          The Sacred <br/><span className="italic text-brand-gold">Aura Repository.</span>
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-8 border-y border-brand-border mb-16 space-y-8 lg:space-y-0">
        <div className="flex items-center space-x-8 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide w-full lg:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-2",
                selectedCategory === cat ? "text-brand-gold" : "text-brand-stone/40 hover:text-brand-stone"
              )}
            >
              {cat}
              {selectedCategory === cat && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-8 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-80 group">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-stone/40 pointer-events-none" />
            <input 
              type="text" 
              placeholder="SEARCH DIVINE SCENTS..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-transparent border-b border-brand-border rounded-none pl-6 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-brand-gold outline-none"
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-brand-border z-50 mt-2 shadow-2xl py-2"
                >
                  {suggestions.map((s, idx) => (
                    <button
                      key={`${s.type}-${idx}`}
                      onClick={() => {
                        if (s.type === "category") {
                          setSelectedCategory(s.value);
                          setSearchQuery("");
                        } else {
                          setSearchQuery(s.value);
                        }
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-6 py-3 hover:bg-brand-beige/20 transition-colors flex items-center justify-between group/item"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone">
                        {s.value}
                      </span>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-brand-stone/40 group-hover/item:text-brand-gold">
                        {s.type === "category" ? "Category" : "Product"}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setShowRefine(!showRefine)}
            className={cn(
              "flex items-center space-x-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors",
              showRefine ? "text-brand-gold" : "text-brand-stone hover:text-brand-gold"
            )}
          >
            <SlidersHorizontal size={14} />
            <span>Refine</span>
          </button>
        </div>
      </div>

      {/* Refine Options */}
      <AnimatePresence>
        {showRefine && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-16 border-b border-brand-border pb-8"
          >
            <div className="max-w-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-stone/60 mb-6 font-sans">Price Range: ₹0 - ₹{priceRange}</h3>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-brand-gold cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-[9px] font-bold text-brand-stone/40">
                <span>₹0</span>
                <span>₹2000+</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[4/5] bg-stone-100 rounded-sm" />
              <div className="h-4 bg-stone-100 w-3/4" />
              <div className="h-4 bg-stone-100 w-1/2" />
            </div>
          ))
        ) : products.length > 0 ? (
          products.slice(0, visibleCount).map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="font-serif text-2xl text-stone-400">No divine aromas found in this collection.</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {products.length > visibleCount && !loading && (
        <div className="mt-24 flex justify-center">
          <button
            onClick={async () => {
              setLoadingMore(true);
              // Small artificial delay to feel like fetching
              await new Promise(resolve => setTimeout(resolve, 800));
              setVisibleCount(prev => prev + ITEMS_PER_PAGE);
              setLoadingMore(false);
            }}
            disabled={loadingMore}
            className="group relative flex flex-col items-center space-y-4"
          >
            <div className="flex items-center space-x-4">
              <div className="h-[1px] w-12 bg-brand-sand transition-all group-hover:w-20"></div>
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-stone transition-all group-hover:text-brand-gold">
                {loadingMore ? "Seeking more..." : "Explore more"}
              </span>
              <div className="h-[1px] w-12 bg-brand-sand transition-all group-hover:w-20"></div>
            </div>
            {loadingMore ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full"
              />
            ) : (
              <ChevronDown size={16} className="text-brand-gold animate-bounce" />
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
