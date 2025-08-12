import React from "react";
import PageTransition from "../components/shared/PageTransition";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGem, FaHeart, FaTshirt } from "react-icons/fa";
import { useCMS } from "../context/CMSContext";

const iconMap = {
  FaTshirt: <FaTshirt className="w-10 h-10 text-red-600" />,
  FaGem: <FaGem className="w-10 h-10 text-red-600" />,
  FaHeart: <FaHeart className="w-10 h-10 text-red-600" />,
};

const FeatureCard = ({ icon, title, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay }}
    className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300"
  >
    <div className="flex justify-center mb-4">
      <div className="bg-red-100 p-4 rounded-full">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{text}</p>
  </motion.div>
);

const About = () => {
  const { content, loading } = useCMS();

  if (loading || !content?.about) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-16 animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="h-8 w-1/2 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="h-80 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
      </PageTransition>
    );
  }

  const aboutContent = content.about;

  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-white text-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${aboutContent.heroImageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 p-4"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold" style={{ textShadow: "0 2px 5px rgba(0,0,0,0.5)" }}>
            {aboutContent.heroHeadline}
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            {aboutContent.heroSubheadline}
          </p>
        </motion.div>
      </div>

      {/* Our Story Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-gray-700"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {aboutContent.storyTitle}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {aboutContent.storyContent}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={aboutContent.storyImageUrl}
                alt="Intricate fabric and artisanal fashion work"
                className="rounded-lg shadow-2xl object-cover w-full h-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
          >
            {aboutContent.featuresHeadline}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {aboutContent.features.map((feature, index) => (
               <FeatureCard
                key={index}
                icon={iconMap[feature.icon] || <FaHeart className="w-10 h-10 text-red-600" />}
                title={feature.title}
                text={feature.text}
                delay={(index + 1) * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Meet The Team Section */}
      {/* ✅ MODIFIED: Added id="team-section" to this section */}
      <section id="team-section" className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
          >
            {aboutContent.teamHeadline}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {aboutContent.teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-32 h-32 mx-auto rounded-full shadow-md object-cover mb-4"
                />
                <h4 className="font-bold text-gray-800">{member.name}</h4>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-red-600 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            {aboutContent.ctaHeadline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 max-w-xl mx-auto"
          >
            {aboutContent.ctaSubheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to={aboutContent.ctaButtonLink}
              className="bg-white text-red-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors duration-300"
            >
              {aboutContent.ctaButtonText}
            </Link>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default About;