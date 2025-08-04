import React from 'react';

const AccessibilityStatement = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="legal-page">
          <h1>Accessibility Statement</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2>1. Our Commitment to Accessibility</h2>
            <p>PEBDEQ is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
          </section>

          <section>
            <h2>2. Accessibility Standards</h2>
            <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines help make web content more accessible to people with disabilities, including:</p>
            <ul>
              <li>Visual impairments (blindness, low vision, color blindness)</li>
              <li>Hearing impairments (deafness, hearing loss)</li>
              <li>Motor impairments (difficulty using a mouse, slow response time)</li>
              <li>Cognitive impairments (learning disabilities, memory issues)</li>
            </ul>
          </section>

          <section>
            <h2>3. Accessibility Features</h2>
            <p>Our website includes the following accessibility features:</p>
            
            <h3>Navigation</h3>
            <ul>
              <li>Keyboard navigation support</li>
              <li>Skip to main content links</li>
              <li>Logical tab order</li>
              <li>Clear focus indicators</li>
            </ul>

            <h3>Content</h3>
            <ul>
              <li>Alternative text for images</li>
              <li>Descriptive link text</li>
              <li>Proper heading structure</li>
              <li>Sufficient color contrast</li>
            </ul>

            <h3>Forms</h3>
            <ul>
              <li>Form labels and instructions</li>
              <li>Error identification and suggestions</li>
              <li>Required field indicators</li>
            </ul>

            <h3>Media</h3>
            <ul>
              <li>Captions for videos (when available)</li>
              <li>Audio descriptions (when available)</li>
              <li>Transcripts for audio content</li>
            </ul>
          </section>

          <section>
            <h2>4. Assistive Technology Compatibility</h2>
            <p>Our website is designed to be compatible with assistive technologies, including:</p>
            <ul>
              <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
              <li>Voice recognition software</li>
              <li>Keyboard navigation</li>
              <li>Screen magnification software</li>
            </ul>
          </section>

          <section>
            <h2>5. Browser Compatibility</h2>
            <p>We test our website for accessibility using:</p>
            <ul>
              <li>Chrome with NVDA on Windows</li>
              <li>Safari with VoiceOver on macOS</li>
              <li>Firefox with NVDA on Windows</li>
              <li>Edge with NVDA on Windows</li>
            </ul>
          </section>

          <section>
            <h2>6. Known Limitations</h2>
            <p>Despite our efforts, some parts of our website may not be fully accessible. We are aware of the following limitations:</p>
            <ul>
              <li>Some older PDF documents may not be fully accessible</li>
              <li>Third-party content may not meet accessibility standards</li>
              <li>Some interactive elements may have limited keyboard support</li>
            </ul>
            <p>We are working to address these issues in future updates.</p>
          </section>

          <section>
            <h2>7. Accessibility Tools</h2>
            <p>To enhance your experience, you can use the following tools:</p>
            
            <h3>Browser Features</h3>
            <ul>
              <li>Zoom: Use Ctrl/Cmd + Plus (+) to increase text size</li>
              <li>High contrast mode: Available in browser settings</li>
              <li>Reader mode: Available in most modern browsers</li>
            </ul>

            <h3>Operating System Features</h3>
            <ul>
              <li>Windows: Narrator, High Contrast, Magnifier</li>
              <li>macOS: VoiceOver, Zoom, High Contrast</li>
              <li>Mobile: Screen readers, voice control, magnification</li>
            </ul>
          </section>

          <section>
            <h2>8. Feedback and Assistance</h2>
            <p>We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> accessibility@pebdeq.com</p>
              <p><strong>Phone:</strong> [Your Phone Number]</p>
              <p><strong>Address:</strong> [Your Business Address]</p>
            </div>
            <p>When contacting us, please provide:</p>
            <ul>
              <li>The web page URL where you encountered the issue</li>
              <li>A description of the accessibility barrier</li>
              <li>Your contact information</li>
              <li>The assistive technology you are using</li>
            </ul>
          </section>

          <section>
            <h2>9. Alternative Access Methods</h2>
            <p>If you cannot access content on our website, we offer alternative methods:</p>
            <ul>
              <li>Phone support for placing orders</li>
              <li>Email support for product information</li>
              <li>Alternative format documents upon request</li>
              <li>Personal assistance for complex transactions</li>
            </ul>
          </section>

          <section>
            <h2>10. Ongoing Efforts</h2>
            <p>We are committed to continuous improvement of our website's accessibility:</p>
            <ul>
              <li>Regular accessibility audits</li>
              <li>Staff training on accessibility best practices</li>
              <li>User testing with people with disabilities</li>
              <li>Updating content and features based on feedback</li>
            </ul>
          </section>

          <section>
            <h2>11. Third-Party Content</h2>
            <p>Some content on our website comes from third parties. We are working with our vendors to ensure their content meets accessibility standards. If you encounter issues with third-party content, please let us know.</p>
          </section>

          <section>
            <h2>12. Legal Compliance</h2>
            <p>We strive to comply with applicable accessibility laws and regulations, including:</p>
            <ul>
              <li>Americans with Disabilities Act (ADA)</li>
              <li>Section 508 of the Rehabilitation Act</li>
              <li>State and local accessibility laws</li>
            </ul>
          </section>

          <section>
            <h2>13. Contact Information</h2>
            <p>For questions about accessibility or to request assistance:</p>
            <p>
              <strong>Accessibility Coordinator:</strong> PEBDEQ Accessibility Team<br />
              <strong>Email:</strong> accessibility@pebdeq.com<br />
              <strong>Phone:</strong> [Your Phone Number]<br />
              <strong>Address:</strong> [Your Business Address]<br />
              <strong>Hours:</strong> Monday-Friday, 9AM-5PM EST
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityStatement; 