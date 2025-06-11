// src/components/career/JobDetailsPage.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { ApplicationModal } from './ApplicationModal'; // Path to your new modal component
import type { JobPosting } from './jobData'; // Import JobPosting interface

// Styled components for the Job Details Page Layout
const JobDetailsWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto; /* Centered within ListWrap */
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.textDark};

  @media (max-width: 768px) {
    margin: 0 1rem;
    padding: 1.5rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const JobTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(2rem, 5vw, 2.8rem);
  margin-bottom: 0.5rem;
  text-align: center;
`;

const JobMeta = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: #888888; /* Small grey letters */
  font-size: 1rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const CategoryBox = styled.div`
  display: block; /* Changed to block to allow margin:auto */
  width: fit-content; /* Make box fit content */
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  margin: 0 auto 2rem; /* Centered box */
  text-align: center;
`;

const ApplyButton = styled.button`
  display: block;
  margin: 2rem auto; /* Centered */
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: none;
  padding: 1rem 3rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const JobDescription = styled.div`
  line-height: 1.7;
  padding-top: 1.5rem;
  border-top: 1px solid #eeeeee;

  p {
    margin-bottom: 1rem;
  }
`;

interface JobDetailsPageProps {
  job: JobPosting; // The job data to display
  onBack: () => void; // Function to go back to job listings
  phpScriptUrl: string; // URL for the PHP script
}

const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ job, onBack, phpScriptUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This check is already handled by JobList rendering this component only if job is found
  // if (!job) {
  //   return (
  //     <JobDetailsWrapper>
  //       <p>Job not found.</p>
  //       <BackButton onClick={onBack}>
  //         <ArrowLeft size={16} /> Back to Job Listings
  //       </BackButton>
  //     </JobDetailsWrapper>
  //   );
  // }

  return (
    <JobDetailsWrapper>
      <BackButton onClick={onBack}>
        <ArrowLeft size={16} /> Back to Job Listings
      </BackButton>

      <JobTitle>{job.title}</JobTitle>
      <JobMeta>{job.employmentType}</JobMeta> {/* Changed to employmentType */}
      <CategoryBox>{job.team}</CategoryBox> {/* Changed to team */}

      <ApplyButton onClick={() => setIsModalOpen(true)}>Apply Now</ApplyButton>

      <JobDescription>
        <p>{job.description}</p>
        <p>
          At Agencia Working, we are committed to fostering human development through effective talent and workforce solutions. We seek passionate individuals dedicated to our values of respect, honesty, teamwork, and loyalty. If you are ready to contribute to a solid and reliable company that has been operating since 1999, we encourage you to apply. We look forward to reviewing your profile!
        </p>
      </JobDescription>

      {isModalOpen && (
        <ApplicationModal
          jobTitle={job.title}
          onClose={() => setIsModalOpen(false)}
          phpScriptUrl={phpScriptUrl}
        />
      )}
    </JobDetailsWrapper>
  );
};

export default JobDetailsPage;