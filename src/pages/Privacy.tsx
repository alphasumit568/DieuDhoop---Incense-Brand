import React from "react";
import { Shield } from "lucide-react";
import { motion } from "motion/react";

export default function Privacy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Shield className="mx-auto text-brand-gold mb-6" size={48} />
          <h1 className="text-5xl font-serif mb-4">Privacy Rituals</h1>
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-bold">Safeguarding Your Sacred Data</p>
        </motion.div>

        <div className="prose prose-stone max-w-none space-y-12 text-brand-stone/80 font-serif leading-relaxed">
          <section>
            <h2 className="text-2xl text-brand-stone mb-4">1. Collection of Essence</h2>
            <p>At DieuDhoop, we collect only the essential information required to fulfill your sacred requests. This includes your name, contact details, and shipping address provided during checkout.</p>
          </section>

          <section>
            <h2 className="text-2xl text-brand-stone mb-4">2. Sacred Use of Information</h2>
            <p>Your data is used solely to enhance your aromatic experience: processing orders, sending relevant spiritual updates (if opted in), and improving our hand-crafted offerings.</p>
          </section>

          <section>
            <h2 className="text-2xl text-brand-stone mb-4">3. Data Guardianship</h2>
            <p>We employ industry-standard encryption to protect your information. Your details are never traded or shared with external parties for profit. We believe in the sanctity of your digital space.</p>
          </section>

          <section>
            <h2 className="text-2xl text-brand-stone mb-4">4. Your Choice</h2>
            <p>You may request enlightenment regarding your stored data or its deletion at any time by contacting our sanctuary keepers.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
