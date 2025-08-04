import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const About = () => {
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState({
    about_page_title: 'About Us',
    about_page_subtitle: 'Learn more about our company and mission',
    about_page_content: 'Welcome to PEBDEQ, your trusted e-commerce platform.',
    about_page_mission_title: 'Our Mission',
    about_page_mission_content: 'At PEBDEQ, we specialize in providing high-quality products across four main categories: 3D printing services, professional tools, vintage light bulbs, and custom laser engraving.',
    about_page_values_title: 'Our Values',
    about_page_values_content: 'Quality products and services, competitive prices, fast and reliable shipping, excellent customer support, secure payment options.',
    about_page_team_title: 'Our Team',
    about_page_team_content: 'Our dedicated team works hard to provide the best experience for our customers.',
    about_page_history_title: 'Our History',
    about_page_history_content: 'Founded with a vision to bring quality products to customers worldwide.',
    about_page_contact_title: 'Get in Touch',
    about_page_contact_content: 'Contact us for more information about our products and services.',
    about_page_show_mission: true,
    about_page_show_values: true,
    about_page_show_team: true,
    about_page_show_history: true,
    about_page_show_contact: true,
    about_page_background_image: '',
    about_page_background_color: '#ffffff'
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('api/site-settings'));
      
      if (response.ok) {
        const data = await response.json();
        setAboutData(data);
      } else {
        toast.error('Failed to load about page content');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('Failed to load about page content');
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content) => {
    if (!content) return '';
    
    // Convert line breaks to paragraphs
    return content.split('\n').map((paragraph, index) => (
      paragraph.trim() && <p key={index}>{paragraph}</p>
    )).filter(Boolean);
  };

  const formatList = (content) => {
    if (!content) return null;
    
    // Check if content has list items (lines starting with - or *)
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const hasListItems = lines.some(line => line.startsWith('-') || line.startsWith('*'));
    
    if (hasListItems) {
      return (
        <ul>
          {lines.map((line, index) => {
            if (line.startsWith('-') || line.startsWith('*')) {
              return <li key={index}>{line.substring(1).trim()}</li>;
            } else {
              return <li key={index}>{line}</li>;
            }
          })}
        </ul>
      );
    } else {
      return formatContent(content);
    }
  };

  if (loading) {
    return (
      <div className="about fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading about page...</p>
          </div>
        </div>
      </div>
    );
  }

  const pageStyle = {
    backgroundColor: aboutData.about_page_background_color || '#ffffff',
    backgroundImage: aboutData.about_page_background_image 
      ? `url(${aboutData.about_page_background_image})` 
      : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh'
  };

  return (
    <div className="about fade-in" style={pageStyle}>
      <div className="container">
        <div className="about-header">
          <h1>{aboutData.about_page_title}</h1>
          {aboutData.about_page_subtitle && (
            <p className="about-subtitle">{aboutData.about_page_subtitle}</p>
          )}
        </div>
        
        <div className="about-content">
          {/* Main About Content */}
          <section className="about-section">
            <div className="about-main-content">
              {formatContent(aboutData.about_page_content)}
            </div>
          </section>

          {/* Mission Section */}
          {aboutData.about_page_show_mission && (
            <section className="about-section">
              <h2>{aboutData.about_page_mission_title}</h2>
              <div className="section-content">
                {formatContent(aboutData.about_page_mission_content)}
              </div>
            </section>
          )}

          {/* Values Section */}
          {aboutData.about_page_show_values && (
            <section className="about-section">
              <h2>{aboutData.about_page_values_title}</h2>
              <div className="section-content">
                {formatList(aboutData.about_page_values_content)}
              </div>
            </section>
          )}

          {/* Team Section */}
          {aboutData.about_page_show_team && (
            <section className="about-section">
              <h2>{aboutData.about_page_team_title}</h2>
              <div className="section-content">
                {formatContent(aboutData.about_page_team_content)}
              </div>
            </section>
          )}

          {/* History Section */}
          {aboutData.about_page_show_history && (
            <section className="about-section">
              <h2>{aboutData.about_page_history_title}</h2>
              <div className="section-content">
                {formatContent(aboutData.about_page_history_content)}
              </div>
            </section>
          )}

          {/* Contact Section */}
          {aboutData.about_page_show_contact && (
            <section className="about-section">
              <h2>{aboutData.about_page_contact_title}</h2>
              <div className="section-content">
                {formatContent(aboutData.about_page_contact_content)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default About; 