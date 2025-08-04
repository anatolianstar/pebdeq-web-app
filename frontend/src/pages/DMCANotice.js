import React from 'react';

const DMCANotice = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="legal-page">
          <h1>DMCA Notice</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2>1. Digital Millennium Copyright Act (DMCA) Policy</h2>
            <p>PEBDEQ respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to legitimate claims of copyright infringement.</p>
          </section>

          <section>
            <h2>2. Copyright Infringement Claims</h2>
            <p>If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on our website, please notify our copyright agent as specified below.</p>
          </section>

          <section>
            <h2>3. DMCA Takedown Notice Requirements</h2>
            <p>To file a DMCA takedown notice with us, please provide the following information:</p>
            <ol>
              <li><strong>Identify the copyrighted work:</strong> Describe the copyrighted work that you claim has been infringed</li>
              <li><strong>Identify the infringing material:</strong> Provide the URL or other specific location where the allegedly infringing material is located</li>
              <li><strong>Provide your contact information:</strong> Include your name, address, telephone number, and email address</li>
              <li><strong>Include a statement of good faith:</strong> State that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law</li>
              <li><strong>Include a statement of accuracy:</strong> State that the information in the notification is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
              <li><strong>Include your signature:</strong> Provide your physical or electronic signature</li>
            </ol>
          </section>

          <section>
            <h2>4. How to Submit a DMCA Notice</h2>
            <p>Please send your DMCA takedown notice to our designated copyright agent:</p>
            <div className="contact-info">
              <p><strong>Copyright Agent:</strong> PEBDEQ Legal Department</p>
              <p><strong>Email:</strong> dmca@pebdeq.com</p>
              <p><strong>Address:</strong><br />
                PEBDEQ DMCA Agent<br />
                [Your Business Address]<br />
                [City, State, ZIP Code]
              </p>
              <p><strong>Phone:</strong> [Your Phone Number]</p>
            </div>
          </section>

          <section>
            <h2>5. Counter-Notification Process</h2>
            <p>If you believe that your material was removed or disabled by mistake or misidentification, you may file a counter-notification with us by providing the following information:</p>
            <ol>
              <li><strong>Identify the material:</strong> Describe the material that was removed or disabled and the location where it appeared before removal</li>
              <li><strong>Statement under penalty of perjury:</strong> State that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification</li>
              <li><strong>Provide your contact information:</strong> Include your name, address, and telephone number</li>
              <li><strong>Consent to jurisdiction:</strong> State that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located</li>
              <li><strong>Accept service of process:</strong> State that you will accept service of process from the person who provided the original DMCA notice</li>
              <li><strong>Include your signature:</strong> Provide your physical or electronic signature</li>
            </ol>
          </section>

          <section>
            <h2>6. Repeat Infringer Policy</h2>
            <p>PEBDEQ has adopted a policy of terminating, in appropriate circumstances, the accounts of users who are deemed to be repeat infringers. We may also, at our sole discretion, limit access to our website and/or terminate the accounts of any users who infringe any intellectual property rights of others.</p>
          </section>

          <section>
            <h2>7. Response Time</h2>
            <p>We will respond to valid DMCA notices within 24-48 hours of receipt. Upon receiving a valid takedown notice, we will:</p>
            <ul>
              <li>Remove or disable access to the allegedly infringing material</li>
              <li>Notify the user who posted the material</li>
              <li>Provide the user with a copy of the takedown notice</li>
            </ul>
          </section>

          <section>
            <h2>8. False Claims</h2>
            <p>Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages. Do not make false claims.</p>
          </section>

          <section>
            <h2>9. Copyright Agent Information</h2>
            <p>Our designated agent for copyright takedown notices is:</p>
            <div className="agent-info">
              <p><strong>Name:</strong> PEBDEQ Legal Department</p>
              <p><strong>Company:</strong> PEBDEQ</p>
              <p><strong>Address:</strong> [Your Business Address]</p>
              <p><strong>Phone:</strong> [Your Phone Number]</p>
              <p><strong>Email:</strong> dmca@pebdeq.com</p>
            </div>
          </section>

          <section>
            <h2>10. Educational Resources</h2>
            <p>For more information about the DMCA, please visit:</p>
            <ul>
              <li><a href="https://www.copyright.gov/policy/dmca/" target="_blank" rel="noopener noreferrer">U.S. Copyright Office - DMCA</a></li>
              <li><a href="https://www.eff.org/issues/dmca" target="_blank" rel="noopener noreferrer">Electronic Frontier Foundation - DMCA</a></li>
            </ul>
          </section>

          <section>
            <h2>11. Our Commitment</h2>
            <p>We are committed to protecting intellectual property rights and will work diligently to address any legitimate copyright concerns. We appreciate your cooperation in helping us maintain a lawful and respectful online environment.</p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>For general questions about our DMCA policy, please contact us:</p>
            <p>
              Email: legal@pebdeq.com<br />
              Phone: [Your Phone Number]<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DMCANotice; 