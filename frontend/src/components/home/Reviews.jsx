// src/components/home/Reviews.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Reviews = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Olivia Martinez',
      role: 'Fashion Director, Vogue',
      content: 'The craftsmanship of these collections rivals luxury boutiques in Paris. I consistently recommend this brand to my colleagues for editorial shoots.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5,
      featured: true
    },
    {
      id: 2,
      name: 'James Wilson',
      role: 'Creative Director, GQ',
      content: 'As someone who works with premium brands daily, I can attest to the exceptional quality-to-price ratio. Their attention to detail is remarkable.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5,
      featured: true
    },
    {
      id: 3,
      name: 'Sophia Chen',
      role: 'CEO, StyleForward',
      content: 'Our entire executive team wears pieces from this collection. The fabrics are sustainable yet luxurious - a rare combination in today\'s market.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5,
      featured: true
    },
    {
      id: 4,
      name: 'Ethan Taylor',
      role: 'Fashion Editor, Harper\'s Bazaar',
      content: 'I\'ve featured this brand in three consecutive issues. The designs consistently push boundaries while remaining wearable.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5,
      featured: true
    },
    {
      id: 5,
      name: 'Isabella Rodriguez',
      role: 'Stylist, Elle Magazine',
      content: 'The fit and finish of every piece is impeccable. My clients are always thrilled when I source from this collection.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5,
      featured: false
    },
    {
      id: 6,
      name: 'Alexander Kim',
      role: 'Fashion Photographer',
      content: 'These pieces photograph beautifully. The textures and colors translate perfectly both in studio and outdoor shoots.',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 4,
      featured: false
    },
    {
      id: 7,
      name: 'Mia Johnson',
      role: 'Lifestyle Influencer',
      content: 'My followers go crazy for this brand! The engagement on posts featuring these pieces is consistently 30% higher than average.',
      avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5,
      featured: false
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('right');

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.filter(t => t.featured).length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const featuredTestimonials = testimonials.filter(t => t.featured);
  const regularTestimonials = testimonials.filter(t => !t.featured);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Client Testimonials</h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-sm md:text-base">
            Trusted by industry leaders and fashion connoisseurs worldwide
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative h-[500px] overflow-hidden mb-12">
          {featuredTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={`absolute inset-0 flex items-center justify-center px-2 ${index === currentIndex ? 'z-10' : 'z-0'}`}
              initial={{ 
                x: index === 0 ? '0%' : '100%',
                opacity: index === 0 ? 1 : 0 
              }}
              animate={{ 
                x: index === currentIndex ? '0%' : 
                   index < currentIndex ? '-100%' : '100%',
                opacity: index === currentIndex ? 1 : 0 
              }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm flex flex-col items-center">
                <div className="relative mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-100 shadow-md"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    Verified
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-500' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 text-center text-sm md:text-base mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Verified purchase
                </div>
              </div>
            </motion.div>
          ))}
          <div className="flex justify-center mt-6 space-x-2 absolute bottom-0 left-0 right-0">
            {featuredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 'right' : 'left');
                  setCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full ${index === currentIndex ? 'bg-amber-600' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden md:block relative h-[350px] overflow-hidden mb-16">
          {featuredTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={`absolute inset-0 flex items-center justify-center px-6 ${index === currentIndex ? 'z-10' : 'z-0'}`}
              initial={{ 
                x: index === 0 ? '0%' : '100%',
                opacity: index === 0 ? 1 : 0 
              }}
              animate={{ 
                x: index === currentIndex ? '0%' : 
                   index < currentIndex ? '-100%' : '100%',
                opacity: index === currentIndex ? 1 : 0 
              }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl w-full flex flex-row gap-8">
                <div className="w-1/3 flex flex-col items-center">
                  <div className="relative mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-amber-100 shadow-md"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Verified Buyer
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="w-2/3 flex flex-col justify-center">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${i < testimonial.rating ? 'text-amber-500' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Verified purchase · {testimonial.rating}.0/5.0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="flex justify-center mt-8 space-x-2">
            {featuredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 'right' : 'left');
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-amber-600' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Additional Reviews Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularTestimonials.map(testimonial => (
            <motion.div 
              key={testimonial.id}
              whileHover={{ y: -5 }}
              className="bg-white p-5 rounded-lg shadow-md border-t-4 border-amber-500 flex flex-col h-full"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="font-semibold text-sm md:text-base">{testimonial.name}</h4>
                  <p className="text-gray-600 text-xs md:text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 md:w-5 md:h-5 ${i < testimonial.rating ? 'text-amber-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-sm md:text-base mb-3">"{testimonial.content.substring(0, 120)}..."</p>
              <div className="mt-auto flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Verified purchase
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;