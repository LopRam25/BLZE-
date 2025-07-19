import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';

const AboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pages/about`);
      if (response.ok) {
        const data = await response.json();
        setAboutData(data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {aboutData?.title || "About BLZE"}
          </h1>
          {aboutData?.heroImage && (
            <div className="mt-8 max-w-4xl mx-auto">
              <img 
                src={aboutData.heroImage} 
                alt="About BLZE" 
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mission Statement */}
      {aboutData?.missionStatement && (
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Our Mission</h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                {aboutData.missionStatement}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-gray-700">
              {aboutData?.content && aboutData.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Experience Premium Cannabis?</h3>
          <p className="text-xl mb-8">Browse our menu and call to place your order today.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="/"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              View Menu
            </a>
            <a 
              href="tel:8285823092"
              className="bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;