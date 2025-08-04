import { useState, useEffect } from 'react';
import { createApiUrl } from '../utils/config';

const ReturnPolicy = () => {
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
  const hasCustomContent = siteSettings?.footer_legal_return_policy_content && 
                           siteSettings?.footer_legal_return_policy_content.trim() !== '';

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="legal-page">
          <h1>{siteSettings?.footer_legal_return_policy_title || 'Return & Refund Policy'}</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          {hasCustomContent ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {siteSettings?.footer_legal_return_policy_content}
            </div>
          ) : (
            <>
              {/* Default content when no custom content is provided */}
              <section>
            <h2>1. Return Policy Overview</h2>
            <p>We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, you may return most items within 30 days of delivery for a full refund or exchange.</p>
          </section>

          <section>
            <h2>2. Return Eligibility</h2>
            <p>To be eligible for a return, your item must be:</p>
            <ul>
              <li>Unused and in the same condition that you received it</li>
              <li>In the original packaging</li>
              <li>Returned within 30 days of delivery</li>
              <li>Accompanied by proof of purchase</li>
            </ul>
          </section>

          <section>
            <h2>3. Non-Returnable Items</h2>
            <p>Certain items cannot be returned, including:</p>
            <ul>
              <li>Custom or personalized items</li>
              <li>Digital downloads</li>
              <li>Items on clearance or final sale</li>
              <li>Perishable goods</li>
              <li>Intimate or sanitary goods</li>
              <li>Items that have been used or damaged by the customer</li>
            </ul>
          </section>

          <section>
            <h2>4. Return Process</h2>
            <p>To return an item, please follow these steps:</p>
            <ol>
              <li>Contact our customer service team at returns@pebdeq.com within 30 days of delivery</li>
              <li>Provide your order number and reason for return</li>
              <li>We will provide you with a return authorization number (RMA)</li>
              <li>Package the item securely in its original packaging</li>
              <li>Include the RMA number on the package</li>
              <li>Ship the item back to us using a trackable shipping method</li>
            </ol>
          </section>

          <section>
            <h2>5. Return Shipping</h2>
            <p>Return shipping costs:</p>
            <ul>
              <li><strong>Defective or Wrong Items:</strong> We will provide a prepaid return label</li>
              <li><strong>Change of Mind:</strong> Customer is responsible for return shipping costs</li>
              <li><strong>Free Returns:</strong> Items over $50 qualify for free return shipping</li>
            </ul>
            <p>We recommend using a trackable shipping service and purchasing shipping insurance for items over $75.</p>
          </section>

          <section>
            <h2>6. Refund Processing</h2>
            <p>Once we receive your returned item, we will:</p>
            <ul>
              <li>Inspect the item within 3-5 business days</li>
              <li>Process your refund within 5-10 business days</li>
              <li>Send you an email confirmation once the refund is processed</li>
            </ul>
            <p>Refunds will be issued to the original payment method. Please allow 5-10 business days for the refund to appear in your account.</p>
          </section>

          <section>
            <h2>7. Exchanges</h2>
            <p>We offer exchanges for:</p>
            <ul>
              <li>Different sizes or colors (subject to availability)</li>
              <li>Defective items</li>
              <li>Items damaged during shipping</li>
            </ul>
            <p>To request an exchange, follow the same process as returns but specify that you want an exchange.</p>
          </section>

          <section>
            <h2>8. Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item:</p>
            <ul>
              <li>Contact us within 7 days of delivery</li>
              <li>Provide photos of the damage or defect</li>
              <li>We will arrange for a replacement or full refund</li>
              <li>We will cover all return shipping costs</li>
            </ul>
          </section>

          <section>
            <h2>9. Cancellation Policy</h2>
            <p>You may cancel your order:</p>
            <ul>
              <li>Within 24 hours of placing the order for a full refund</li>
              <li>Before the item ships (contact us immediately)</li>
              <li>Custom orders may have different cancellation terms</li>
            </ul>
          </section>

          <section>
            <h2>10. Restocking Fees</h2>
            <p>Most items can be returned without a restocking fee. However, a 20% restocking fee may apply to:</p>
            <ul>
              <li>Large or oversized items</li>
              <li>Items returned after 30 days</li>
              <li>Items returned without original packaging</li>
            </ul>
          </section>

          <section>
            <h2>11. Gift Returns</h2>
            <p>Items purchased as gifts can be returned for store credit if:</p>
            <ul>
              <li>The item is returned within 30 days</li>
              <li>Gift receipt is provided</li>
              <li>Item meets return eligibility requirements</li>
            </ul>
          </section>

          <section>
            <h2>12. International Returns</h2>
            <p>International customers are responsible for:</p>
            <ul>
              <li>Return shipping costs</li>
              <li>Any customs duties or taxes</li>
              <li>Items must be returned within 30 days</li>
            </ul>
          </section>

          <section>
            <h2>13. Contact Information</h2>
            <p>For questions about returns or refunds, contact us:</p>
            <p>
              Email: returns@pebdeq.com<br />
              Phone: [Your Phone Number]<br />
              Address: [Your Business Address]<br />
              Hours: Monday-Friday, 9AM-5PM EST
            </p>
          </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy; 
