import { Wrapper, Left, Right, Heading, Dash, ReadMore, PolicyText } from './styles';

export default function NonDiscrimination() {
  return (
    <Wrapper>
      {/* left blue half */}
      <Left>
        <Heading>
          Non-<br />
          Discriminati<br />
          on Policy
        </Heading>

        <Dash />

        <ReadMore href="/non-discrimination">Read More</ReadMore>
      </Left>

      {/* right white half */}
      <Right>
        <PolicyText>
          At Agencia Working, we are committed to providing equal employment opportunities to all
          our employees and job applicants. We do not tolerate any form of discrimination or
          harassment under any circumstances, regardless of race, color, religion, ethnic or
          national origin, gender, pregnancy, marital status, sexual orientation, disability, gender
          identity, age, political or union affiliation.
          <br />
          <br />
          This non-discrimination policy applies comprehensively to all terms and conditions of
          employment, including but not limited to recruitment, hiring, placement, promotion,
          termination, contract terms, retirements, transfers, leaves, compensation and training.
          <br />
          <br />
          We are committed to providing a respectful, inclusive and discrimination-free work
          environment where all employees and applicants have equal opportunities to grow and
          contribute to the success of the organization.
        </PolicyText>
      </Right>
    </Wrapper>
  );
}
