import React from "react";
import { Scroll } from "lucide-react";
import { motion } from "motion/react";

export default function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Scroll className="mx-auto text-brand-gold mb-6" size={48} />
          <h1 className="text-5xl font-serif mb-4">Sacred Covenant</h1>
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-bold">Terms of Our Spiritual Agreement</p>
        </motion.div>

        <div className="prose prose-stone max-w-none space-y-12 text-brand-stone/80 font-serif leading-relaxed">
          <section>
            <h2 className="text-2xl text-brand-stone mb-4">1. Acceptance of Terms</h2>
            <p>By entering the sanctuary of DieuDhoop, you agree to wander through our digital space with respect and mindfulness. These terms govern your use of our platform and the purchase of our aromatic artifacts.</p>
          </section>

          <section>
            <h2 className="text-2xl text-brand-stone mb-4">2. Artisanal Nature</h2>
            <p>Our incense products are hand-crafted. Subtle variations in color and texture are signs of divine craftsmanship and natural purity, not defects.</p>
          </section>

          <section>
            <h2 className="text-2xl text-brand-stone mb-4">3. Intellectual Divinity</h2>
            <p>All content, branding, and aromatic descriptions are the intellectual property of DieuDhoop. Sacred reuse without permission is kindly discouraged.</p>
          </section>

          <section>
            <h2 className="text-2xl text-brand-stone mb-4">4. Shipping & Returns</h2>
            <p>We manifest and dispatch orders within 3-5 lunar cycles. Due to the sacred nature of our scents, returns are only accepted if the seal of purity remains unbroken.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
