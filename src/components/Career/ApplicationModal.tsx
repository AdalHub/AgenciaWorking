// src/components/career/ApplicationModal.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, X } from 'lucide-react'; // Icons

import {
  Overlay,
  ApplicationModalContent,
  CloseButton,
  ModalTitle,
  ModalForm,
  ModalInput,
  ModalTextArea,
  FileInputWrapper,
  ModalButton,
  ModalStatusMessage,
  CheckIconContainer,
  SuccessMessage,
  PopupBox
} from './ContactBlockStyles'; // Corrected import path

interface ApplicationFormShape {
  fullName: string;
  email: string;
  phone: string;
  whyApply: string;
  resume: FileList; // For file input
}

interface ApplicationModalProps {
  jobTitle: string; // Pass the job title to the modal
  onClose: () => void;
  phpScriptUrl: string; // The URL to your send_email.php
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ jobTitle, onClose, phpScriptUrl }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormShape>();

  const [formStatusMessage, setFormStatusMessage] = useState<string | null>(null);
  const [isFormSubmissionSuccess, setIsFormSubmissionSuccess] = useState<boolean>(false);

  const onSubmit = async (data: ApplicationFormShape) => {
    setFormStatusMessage(null);
    setIsFormSubmissionSuccess(false);

    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('jobTitle', jobTitle); // Include job title
    formData.append('whyApply', data.whyApply);
    if (data.resume && data.resume[0]) {
      formData.append('resume', data.resume[0]); // Append the actual file
    }

    try {
      const response = await fetch(phpScriptUrl, {
        method: 'POST',
        // DO NOT set Content-Type header when sending FormData;
        // the browser will set it automatically with the correct boundary.
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormStatusMessage('Your application has been sent successfully!');
        setIsFormSubmissionSuccess(true);
        reset(); // Reset form fields on success
      } else {
        setFormStatusMessage(result.message || 'Failed to send application. Please try again.');
        setIsFormSubmissionSuccess(false);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setFormStatusMessage('An unexpected error occurred. Please check your internet connection.');
      setIsFormSubmissionSuccess(false);
    }
  };

  // If form submission is successful, show a simplified success box
  if (isFormSubmissionSuccess) {
    return (
      <Overlay>
        <PopupBox>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
          <CheckIconContainer>
            <CheckCircle />
          </CheckIconContainer>
          <SuccessMessage>
            {formStatusMessage}
          </SuccessMessage>
        </PopupBox>
      </Overlay>
    );
  }

  // Otherwise, show the full application form modal
  return (
    <Overlay>
      <ApplicationModalContent>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>
        <ModalTitle>Apply for {jobTitle}</ModalTitle>

        <ModalForm onSubmit={handleSubmit(onSubmit)}>
          <ModalInput
            placeholder="Full Name"
            {...register('fullName', { required: true })}
            $error={!!errors.fullName}
          />
          <ModalInput
            placeholder="Email"
            type="email"
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
            $error={!!errors.email}
          />
          <ModalInput
            placeholder="Phone Number"
            type="tel"
            {...register('phone', { required: true })}
            $error={!!errors.phone}
          />

          <FileInputWrapper>
            <label htmlFor="resume-upload">Upload Resume (PDF, DOCX)</label>
            <ModalInput
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx" // Restrict file types
              {...register('resume', { required: 'Resume file is required.' })} // Added required message
              $error={!!errors.resume}
            />
          </FileInputWrapper>

          <ModalTextArea
            placeholder="Tell us why you're a great fit for this role."
            rows={5}
            {...register('whyApply', { required: true })}
            $error={!!errors.whyApply}
          />

          <ModalButton type="submit" disabled={isSubmitting} className={isSubmitting ? 'loading' : ''}>
            {isSubmitting ? 'Applying...' : 'Submit Application'}
          </ModalButton>

          {formStatusMessage && !isFormSubmissionSuccess && (
            <ModalStatusMessage $isSuccess={isFormSubmissionSuccess}>
              {formStatusMessage}
            </ModalStatusMessage>
          )}

          {errors.fullName && <ModalStatusMessage $isSuccess={false}>Full Name is required.</ModalStatusMessage>}
          {errors.email && <ModalStatusMessage $isSuccess={false}>A valid Email is required.</ModalStatusMessage>}
          {errors.phone && <ModalStatusMessage $isSuccess={false}>Phone Number is required.</ModalStatusMessage>}
          {errors.resume && <ModalStatusMessage $isSuccess={false}>{errors.resume.message}</ModalStatusMessage>} {/* Display resume error message */}
          {errors.whyApply && <ModalStatusMessage $isSuccess={false}>Please tell us why you want to apply.</ModalStatusMessage>}
        </ModalForm>
      </ApplicationModalContent>
    </Overlay>
  );
};