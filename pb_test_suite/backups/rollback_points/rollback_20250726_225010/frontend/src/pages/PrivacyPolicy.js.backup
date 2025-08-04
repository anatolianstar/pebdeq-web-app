import { useState, useEffect } from 'react';
import { createApiUrl } from '../utils/config';

const PrivacyPolicy = () => {
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
  const hasCustomContent = siteSettings?.footer_legal_privacy_policy_content && 
                           siteSettings?.footer_legal_privacy_policy_content.trim() !== '';

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="legal-page">
          <h1>{siteSettings?.footer_legal_privacy_policy_title || 'Privacy Policy'}</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          {hasCustomContent ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {siteSettings?.footer_legal_privacy_policy_content}
            </div>
          ) : (
            <>
              {/* Default content when no custom content is provided */}
              <section>
            <h2>1. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We collect information you provide directly to us, such as when you:</p>
            <ul>
              <li>Create an account</li>
              <li>Make a purchase</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us</li>
            </ul>
            
            <h3>Information We Collect Automatically</h3>
            <p>We automatically collect certain information when you visit our website, including:</p>
            <ul>
              <li>Browser type and version</li>
              <li>IP address</li>
              <li>Pages visited</li>
              <li>Time and date of visit</li>
              <li>Device information</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your account or orders</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share your information with:</p>
            <ul>
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for transaction processing</li>
              <li>Shipping companies for order fulfillment</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2>6. California Privacy Rights (CCPA)</h2>
            <p>California residents have additional rights under the California Consumer Privacy Act (CCPA):</p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies and Tracking</h2>
            <p>We use cookies and similar tracking technologies to improve your experience on our website. You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>If you have any questions about this privacy policy, please contact us at:</p>
            <p>
              Email: privacy@pebdeq.com<br />
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

export default PrivacyPolicy; 
