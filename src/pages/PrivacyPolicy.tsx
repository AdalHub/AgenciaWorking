import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main style={{ 
        minHeight: '65vh', 
        paddingTop: '80px',
        maxWidth: 900,
        margin: '0 auto',
        padding: '80px 20px 48px',
        lineHeight: 1.6,
      }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Privacy Policy</h1>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Introduction</h2>
          <p style={{ marginBottom: '1rem' }}>
            Agencia Working ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://agenciaworking.com" style={{ color: '#063591' }}>https://agenciaworking.com</a> and use our services.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Information We Collect</h2>
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>2.1 Personal Information</h3>
          <p style={{ marginBottom: '1rem' }}>
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Register for an account (email, name, phone number)</li>
            <li>Book a service or schedule an appointment</li>
            <li>Apply for a job position</li>
            <li>Contact us through our contact forms</li>
            <li>Subscribe to our newsletters or communications</li>
          </ul>

          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>2.2 Google Authentication</h3>
          <p style={{ marginBottom: '1rem' }}>
            If you choose to sign in with Google, we collect your Google account information including your email address, name, and profile picture. This information is used solely for authentication and account management purposes.
          </p>

          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>2.3 Automatically Collected Information</h3>
          <p style={{ marginBottom: '1rem' }}>
            When you visit our website, we may automatically collect certain information about your device, including:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>3. How We Use Your Information</h2>
          <p style={{ marginBottom: '1rem' }}>We use the information we collect to:</p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your bookings and service requests</li>
            <li>Communicate with you about your account, bookings, and our services</li>
            <li>Send you administrative information, such as updates to our terms and policies</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send you marketing communications (with your consent, where required)</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>4. Information Sharing and Disclosure</h2>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, email delivery, and hosting services.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            <li><strong>With Your Consent:</strong> We may share your information with your explicit consent.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>5. Data Security</h2>
          <p style={{ marginBottom: '1rem' }}>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>6. Your Rights</h2>
          <p style={{ marginBottom: '1rem' }}>Depending on your location, you may have the following rights regarding your personal information:</p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Objection:</strong> Object to processing of your personal information</li>
            <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            To exercise these rights, please contact us at <a href="mailto:info@agenciaworking.com" style={{ color: '#063591' }}>info@agenciaworking.com</a>.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>7. Cookies and Tracking Technologies</h2>
          <p style={{ marginBottom: '1rem' }}>
            We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>8. Children's Privacy</h2>
          <p style={{ marginBottom: '1rem' }}>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>9. International Data Transfers</h2>
          <p style={{ marginBottom: '1rem' }}>
            Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to the transfer of your information to our facilities and those third parties with whom we share it as described in this policy.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>10. Changes to This Privacy Policy</h2>
          <p style={{ marginBottom: '1rem' }}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>11. Contact Us</h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Agencia Working</strong><br />
            Email: <a href="mailto:info@agenciaworking.com" style={{ color: '#063591' }}>info@agenciaworking.com</a><br />
            Phone: <a href="tel:+1528341472218" style={{ color: '#063591' }}>+1 (512) 555-0123</a><br />
            Website: <a href="https://agenciaworking.com" style={{ color: '#063591' }}>https://agenciaworking.com</a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

