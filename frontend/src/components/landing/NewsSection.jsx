import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { newsItems } from '../../data/mockData';

const NewsSection = () => {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  return (
    <section className="news-section" id="news">
      <h2 className="news-heading">News</h2>

      <div className="news-carousel-wrapper">
        <div className="news-carousel" ref={carouselRef}>
          {newsItems.map((item) => (
            <a key={item.id} href={item.url} className="news-card">
              <img
                src={item.image}
                alt={item.title}
                className="news-card-image"
                loading="lazy"
              />
              <div className="news-card-body">
                <div className="news-card-category">{item.category}</div>
                <h3 className="news-card-title">{item.title}</h3>
                <div className="news-card-date">{item.date}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="news-nav">
        <button className="news-nav-btn" onClick={scrollLeft} aria-label="Previous">
          <ChevronLeft size={20} />
        </button>
        <button className="news-nav-btn" onClick={scrollRight} aria-label="Next">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default NewsSection;
