import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

export default function TermsOfService() {
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
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Terms of Service</h1>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '1rem' }}>
            By accessing and using the Agencia Working website located at <a href="https://agenciaworking.com" style={{ color: '#063591' }}>https://agenciaworking.com</a> (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Description of Service</h2>
          <p style={{ marginBottom: '1rem' }}>
            Agencia Working provides human resources services including but not limited to:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Labor surveys and studies</li>
            <li>Background check reports</li>
            <li>Talent recruitment and selection</li>
            <li>Training and upskilling programs</li>
            <li>Team building programs</li>
            <li>HR consulting services</li>
            <li>Job postings and career opportunities</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>3. User Accounts</h2>
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>3.1 Account Registration</h3>
          <p style={{ marginBottom: '1rem' }}>
            To access certain features of our Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>

          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>3.2 Account Security</h3>
          <p style={{ marginBottom: '1rem' }}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>3.3 Google Authentication</h3>
          <p style={{ marginBottom: '1rem' }}>
            If you choose to sign in using Google, you are also subject to Google's Terms of Service and Privacy Policy. We are not responsible for Google's authentication services.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>4. Service Bookings and Payments</h2>
          <p style={{ marginBottom: '1rem' }}>
            When you book a service through our platform:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>You agree to provide accurate booking information</li>
            <li>You are responsible for payment of all fees associated with your booking</li>
            <li>All bookings are subject to availability</li>
            <li>We reserve the right to cancel or modify bookings at our discretion</li>
            <li>Refund policies will be communicated at the time of booking</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>5. Job Applications</h2>
          <p style={{ marginBottom: '1rem' }}>
            When you apply for a job position through our Service:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>You represent that all information provided in your application is truthful and accurate</li>
            <li>You grant us permission to use your application materials for recruitment purposes</li>
            <li>We are not obligated to respond to every application</li>
            <li>We reserve the right to reject any application at our sole discretion</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>6. User Conduct</h2>
          <p style={{ marginBottom: '1rem' }}>You agree not to:</p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Violate or infringe upon the rights of others</li>
            <li>Transmit any harmful code, viruses, or malicious software</li>
            <li>Attempt to gain unauthorized access to the Service or its related systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>7. Intellectual Property</h2>
          <p style={{ marginBottom: '1rem' }}>
            The Service and its original content, features, and functionality are owned by Agencia Working and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of any content from the Service without our express written permission.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>8. Disclaimer of Warranties</h2>
          <p style={{ marginBottom: '1rem' }}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>9. Limitation of Liability</h2>
          <p style={{ marginBottom: '1rem' }}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGENCIA WORKING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>10. Indemnification</h2>
          <p style={{ marginBottom: '1rem' }}>
            You agree to indemnify, defend, and hold harmless Agencia Working, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Service or your violation of these Terms.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>11. Termination</h2>
          <p style={{ marginBottom: '1rem' }}>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>12. Governing Law</h2>
          <p style={{ marginBottom: '1rem' }}>
            These Terms shall be governed by and construed in accordance with the laws of Mexico, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Mexico.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>13. Changes to Terms</h2>
          <p style={{ marginBottom: '1rem' }}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }}>14. Contact Information</h2>
          <p style={{ marginBottom: '1rem' }}>
            If you have any questions about these Terms of Service, please contact us:
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

