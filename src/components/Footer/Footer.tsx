import {
  Wrapper,
  ContactRow,
  Grid,
  GroupTitle,
  FooterLink,
  SocialRow,
  SocialBtn,
  Note,
} from './styles';

export default function Footer() {
  return (
    <Wrapper>


      {/* link grid */}
      <Grid>
        <div>
          <GroupTitle>Job search</GroupTitle>
          <FooterLink to="/careers">Search jobs</FooterLink>
          <FooterLink to="/careers?team=Software">Software team</FooterLink>
          <FooterLink to="/careers?team=Support">Support team</FooterLink>
        </div>

        <div>
          <GroupTitle>Services</GroupTitle>
          <FooterLink to="/services/talent-recruitment">
            Recruitment
          </FooterLink>
          <FooterLink to="/services/training-upskilling">
            Training &amp; Upskilling
          </FooterLink>
          <FooterLink to="/services/labor-surveys">
            Labor Surveys
          </FooterLink>
        </div>

        <div>
          <GroupTitle>Company</GroupTitle>
          <FooterLink to="/about-us">About us</FooterLink>
          <FooterLink to="/non-discrimination">Non-discrimination</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </div>

        <div>
          <GroupTitle>Resources</GroupTitle>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/privacy">Privacy policy</FooterLink>
        </div>
      </Grid>

      {/* social icons */}
      <SocialRow>
        <SocialBtn
          href="https://www.linkedin.com"
          aria-label="LinkedIn"
          target="_blank"
        >
          {/* LinkedIn SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 
              2.76 2.24 5 5 5h14c2.76 0 5-2.24 
              5-5v-14c0-2.76-2.24-5-5-5zm-11.75 19h-3v-11h3v11zm-1.5-12.27c-.97
              0-1.75-.79-1.75-1.73s.78-1.73 1.75-1.73 1.75.79
              1.75 1.73-.78 1.73-1.75 1.73zm13.25 
              12.27h-3v-5.6c0-3.37-4-3.11-4 0v5.6h-3v-11h3v1.7c1.4-2.58
              7-2.77 7 2.46v6.84z"
            />
          </svg>
        </SocialBtn>

        <SocialBtn
          href="https://www.facebook.com"
          aria-label="Facebook"
          target="_blank"
        >
          {/* Facebook SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.68 0h-21.36c-.73 0-1.32.59-1.32 
              1.32v21.36c0 .73.59 1.32 1.32
              1.32h11.49v-9.29h-3.13v-3.62h3.13v-2.67c0-3.1
              1.9-4.79 4.67-4.79 1.32 0
              2.46.1 2.79.14v3.23l-1.92.001c-1.5 0-1.79.71-1.79
              1.75v2.3h3.58l-.47 3.62h-3.11v9.29h6.09c.73
              0 1.32-.59 1.32-1.32v-21.36c0-.73-.59-1.32-1.32-1.32z"
            />
          </svg>
        </SocialBtn>

        <SocialBtn
          href="https://www.instagram.com"
          aria-label="Instagram"
          target="_blank"
        >
          {/* Instagram SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2.16c3.22 0 3.6.01 4.86.07 1.17.05 
              1.97.24 2.43.41a4.92 4.92 0 0 1 
              1.77 1.15 4.92 4.92 0 0 1 1.15 
              1.77c.17.46.36 1.26.41 2.43.06 
              1.26.07 1.64.07 4.86s-.01 3.6-.07 
              4.86c-.05 1.17-.24 1.97-.41 
              2.43a4.92 4.92 0 0 1-1.15 1.77 4.92 
              4.92 0 0 1-1.77 1.15c-.46.17-1.26.36-2.43.41-1.26.06-1.64.07-4.86.07s-3.6-.01-4.86-.07c-1.17-.05-1.97-.24-2.43-.41a4.92 
              4.92 0 0 1-1.77-1.15 4.92 4.92 0 0 
              1-1.15-1.77c-.17-.46-.36-1.26-.41-2.43-.06-1.26-.07-1.64-.07-4.86s.01-3.6.07-4.86c.05-1.17.24-1.97.41-2.43a4.92 
              4.92 0 0 1 1.15-1.77 4.92 4.92 0 0 1 1.77-1.15c.46-.17 1.26-.36 2.43-.41 1.26-.06 1.64-.07 4.86-.07m0-2.16c-3.28 
              0-3.7.01-5 .07-1.29.06-2.17.27-2.93.58a7.07 7.07 
              0 0 0-2.55 1.66 7.07 7.07 0 0 0-1.66 2.55c-.31.76-.52 
              1.64-.58 2.93-.06 1.3-.07
              1.72-.07 5s.01 3.7.07 5c.06 1.29.27 2.17.58 
              2.93a7.07 7.07 0 0 0 1.66 2.55 7.07 7.07 0 0 0 2.55 
              1.66c.76.31 1.64.52 2.93.58 1.3.06 1.72.07 5 .07s3.7-.01 
              5-.07c1.29-.06 2.17-.27 2.93-.58a7.07 7.07 0 0 0 2.55-1.66 7.07 7.07 
              0 0 0 1.66-2.55c.31-.76.52-1.64.58-2.93.06-1.3.07-1.72.07-5s-.01-3.7-.07-5c-.06-1.29-.27-2.17-.58-2.93a7.07 7.07 
              0 0 0-1.66-2.55 7.07 7.07 0 0 0-2.55-1.66c-.76-.31-1.64-.52-2.93-.58-1.3-.06-1.72-.07-5-.07z"
            />
            <path
              d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 
              10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
            />
            <circle cx="18.4" cy="5.6" r="1.44" />
          </svg>
        </SocialBtn>
      </SocialRow>

      {/* legal + non-discrimination */}
      <Note>
        Permission from the Secretary of Labor and Social Welfare STPS:&nbsp;
        2023-A-01234-ABC1
      </Note>

      <Note style={{ maxWidth: '1000px' }}>
        At Agencia Working, we are committed to providing equal employment
        opportunities to all our employees and job applicants. We do not tolerate
        any form of discrimination or harassment under any circumstances,
        regardless of race, color, religion, ethnic or national origin, gender,
        pregnancy, marital status, sexual orientation, disability, gender
        identity, age, political or union affiliation.
        <br />
        This non-discrimination policy applies comprehensively to all terms and
        conditions of employment, including but not limited to recruitment,
        hiring, placement, promotion, termination, contract terms, retirements,
        transfers, leaves, compensation and training.
        <br />
        We are committed to providing a respectful, inclusive and
        discrimination-free work environment where all employees and applicants
        have equal opportunities to grow and contribute to the success of the
        organization.
      </Note>
      <ContactRow>
        <span>Contact us:&nbsp;</span>
        <a href="tel:+15125550123">+1&nbsp;(512)&nbsp;555-0123</a>
        <span>&nbsp;|&nbsp;</span>
        <a href="mailto:info@agenciaworking.com">info@agenciaworking.com</a>
      </ContactRow>
    </Wrapper>
    
  );
}
