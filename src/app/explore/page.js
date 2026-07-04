'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Star, Users, Repeat, ChevronDown,
  CheckCircle2, MapPin, Clock, X, SlidersHorizontal
} from 'lucide-react';
import { mentors, categories } from '@/data/mock';
import styles from './page.module.css';

const levels = ['Tümü', 'Başlangıç', 'Orta', 'İleri'];
const sortOptions = [
  { value: 'rating', label: 'En Yüksek Puan' },
  { value: 'students', label: 'En Çok Öğrenci' },
  { value: 'price-low', label: 'Fiyat (Düşük)' },
  { value: 'price-high', label: 'Fiyat (Yüksek)' },
  { value: 'newest', label: 'En Yeni' },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [swapOnly, setSwapOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredMentors = useMemo(() => {
    let result = [...mentors];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter(m => m.categories.includes(selectedCategory));
    }

    if (swapOnly) {
      result = result.filter(m => m.acceptsSwap);
    }

    switch (sortBy) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'students': result.sort((a, b) => b.students - a.students); break;
      case 'price-low': result.sort((a, b) => a.hourlyRate - b.hourlyRate); break;
      case 'price-high': result.sort((a, b) => b.hourlyRate - a.hourlyRate); break;
      case 'newest': result.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)); break;
    }

    return result;
  }, [searchQuery, selectedCategory, swapOnly, sortBy]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <h1>Mentorları <span className="text-gradient">Keşfet</span></h1>
          <p>Binlerce uzman mentor arasından sana en uygun olanı bul</p>

          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="İsim, beceri veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Sidebar Filters */}
        <aside className={`${styles.sidebar} ${mobileFilterOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.filterSection}>
            <h3>Kategoriler</h3>
            <div className={styles.categoryList}>
              <button
                className={`${styles.categoryItem} ${!selectedCategory ? styles.categoryActive : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                Tümü
                <span className={styles.categoryCount}>{mentors.length}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryItem} ${selectedCategory === cat.name ? styles.categoryActive : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                >
                  <span>{cat.icon} {cat.name}</span>
                  <span className={styles.categoryCount}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3>Takas</h3>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={swapOnly}
                onChange={(e) => setSwapOnly(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.toggle} />
              Sadece takas yapanlar
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <div className={styles.main}>
          {/* Top Bar */}
          <div className={styles.topBar}>
            <p className={styles.resultCount}>
              <strong>{filteredMentors.length}</strong> mentor bulundu
            </p>

            <div className={styles.topActions}>
              <button
                className={styles.mobileFilterBtn}
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              >
                <SlidersHorizontal size={16} />
                Filtreler
              </button>

              <div className={styles.sortWrapper}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.sortIcon} />
              </div>
            </div>
          </div>

          {/* Mentor Grid */}
          <motion.div className={styles.mentorGrid} layout>
            <AnimatePresence mode="popLayout">
              {filteredMentors.map((mentor) => (
                <motion.div
                  key={mentor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/mentor/${mentor.id}`} className={styles.mentorCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.mentorAvatar} style={{ background: `linear-gradient(135deg, ${mentor.color}, ${mentor.color}88)` }}>
                        {mentor.initials}
                      </div>
                      <div className={styles.cardBadges}>
                        {mentor.verified && (
                          <span className={styles.verified}><CheckCircle2 size={14} /></span>
                        )}
                        {mentor.topMentor && (
                          <span className="badge badge-warning">⭐ Top</span>
                        )}
                        {mentor.acceptsSwap && (
                          <span className="badge badge-secondary">
                            <Repeat size={10} /> Takas
                          </span>
                        )}
                      </div>
                    </div>

                    <h3>{mentor.name}</h3>
                    <p className={styles.mentorTitle}>{mentor.title}</p>

                    <div className={styles.mentorMeta}>
                      <span><MapPin size={13} /> {mentor.location}</span>
                      <span><Clock size={13} /> {mentor.responseTime}</span>
                    </div>

                    <div className={styles.skillTags}>
                      {mentor.skills.slice(0, 4).map(skill => (
                        <span key={skill} className={styles.skillTag}>{skill}</span>
                      ))}
                      {mentor.skills.length > 4 && (
                        <span className={styles.skillMore}>+{mentor.skills.length - 4}</span>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardStats}>
                        <span className={styles.rating}>
                          <Star size={14} fill="var(--warning)" color="var(--warning)" />
                          {mentor.rating}
                          <small>({mentor.reviewCount})</small>
                        </span>
                        <span className={styles.students}>
                          <Users size={14} />
                          {mentor.students}
                        </span>
                      </div>
                      <div className={styles.cardPrice}>
                        <span className={styles.price}>₺{mentor.hourlyRate}</span>
                        <span className={styles.priceUnit}>/saat</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredMentors.length === 0 && (
            <div className={styles.emptyState}>
              <Search size={48} />
              <h3>Sonuç Bulunamadı</h3>
              <p>Farklı anahtar kelimeler veya filtreler deneyin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
