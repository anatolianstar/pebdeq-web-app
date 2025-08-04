import { useState, useEffect } from 'react';
import { createApiUrl } from '../utils/config';

const TermsOfService = () => {
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch(createApiUrl('api/site-settings'));
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="legal-page">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  // If custom content exists, use it; otherwise use default content
  const hasCustomContent = siteSettings?.footer_legal_terms_of_service_content && 
                           siteSettings?.footer_legal_terms_of_service_content.trim() !== '';

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="legal-page">
          <h1>{siteSettings?.footer_legal_terms_of_service_title || 'Terms of Service'}</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          {hasCustomContent ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {siteSettings?.footer_legal_terms_of_service_content}
            </div>
          ) : (
            <>
              {/* Default content when no custom content is provided */}
              <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>PEBDEQ provides an e-commerce platform that allows users to browse, purchase, and receive various products including 3D printed items, vintage tools, smart gadgets, and related accessories.</p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>To access certain features of our service, you must create an account. You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2>4. Prohibited Uses</h2>
            <p>You may not use our service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
            </ul>
          </section>

          <section>
            <h2>5. Products and Services</h2>
            <p>All products and services are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.</p>
            <h3>Product Information</h3>
            <p>We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display will be accurate.</p>
          </section>

          <section>
            <h2>6. Payment Terms</h2>
            <p>Payment is due at the time of purchase. We accept various payment methods as displayed during checkout. All payments are processed securely through our payment partners.</p>
          </section>

          <section>
            <h2>7. Shipping and Delivery</h2>
            <p>We will make every effort to deliver products within the estimated timeframe. However, we are not responsible for delays caused by shipping carriers or circumstances beyond our control.</p>
          </section>

          <section>
            <h2>8. Returns and Refunds</h2>
            <p>Please refer to our Return & Refund Policy for detailed information about returns, exchanges, and refunds.</p>
          </section>

          <section>
            <h2>9. Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are and will remain the exclusive property of PEBDEQ and its licensors. The service is protected by copyright, trademark, and other laws.</p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>In no event shall PEBDEQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
          </section>

          <section>
            <h2>11. Disclaimer</h2>
            <p>The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:</p>
            <ul>
              <li>Excludes all representations and warranties relating to this website and its contents</li>
              <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
            </ul>
          </section>

          <section>
            <h2>12. Governing Law</h2>
            <p>These Terms shall be interpreted and governed by the laws of the State of [Your State], without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2>13. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
          </section>

          <section>
            <h2>14. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <p>
              Email: legal@pebdeq.com<br />
              Address: [Your Business Address]<br />
              Phone: [Your Phone Number]
            </p>
          </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 
