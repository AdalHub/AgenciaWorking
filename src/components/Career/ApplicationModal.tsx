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
  // FileInputWrapper, // This will no longer be needed if we remove file input
  ModalButton,
  ModalStatusMessage,
  CheckIconContainer,
  SuccessMessage,
  PopupBox
} from './ContactBlockStyles';

interface ApplicationFormShape {
  fullName: string;
  email: string;
  phone: string;
  whyApply: string;
  // resume: FileList; // Removed: mailto cannot handle file uploads
}

interface ApplicationModalProps {
  jobTitle: string; // Pass the job title to the modal
  onClose: () => void;
  // phpScriptUrl: string; // Removed: No longer using PHP script
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ jobTitle, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors}, 
  } = useForm<ApplicationFormShape>();

  const [formStatusMessage, setFormStatusMessage] = useState<string | null>(null);
  const [isFormSubmissionSuccess, setIsFormSubmissionSuccess] = useState<boolean>(false);

  const onSubmit = (data: ApplicationFormShape) => {
    setFormStatusMessage(null);
    setIsFormSubmissionSuccess(false);

    const recipientEmail = 'applications@agenciaworking.com'; // Dedicated email for applications
    const subject = encodeURIComponent(`Job Application: ${jobTitle}`);
    const body = encodeURIComponent(
      `Job Title: ${jobTitle}\n` +
      `Full Name: ${data.fullName}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n\n` +
      `Why I'm a great fit:\n${data.whyApply}\n\n` +
      `Please remember to attach your resume to this email before sending!`
    );

    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    try {
      window.location.href = mailtoLink;
      setIsFormSubmissionSuccess(true);
      setFormStatusMessage('Your email client has opened with the pre-filled application. Please **attach your resume** and click "Send" to complete your application. We will contact you soon!');
      reset(); // Reset form fields
    } catch (err) {
      setFormStatusMessage('Failed to open email client. Please ensure you have one configured, or email us directly at applications@agenciaworking.com with your application and resume.');
      setIsFormSubmissionSuccess(false);
      console.error('Mailto error:', err);
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

          {/* Removed file input and related wrapper */}
          <p style={{ fontSize: '0.9rem', color: '#505864', marginBottom: '0.5rem', textAlign: 'center' }}>
            **Important:** Your resume will be attached manually. Please complete the form below, and your email client will open. **Remember to attach your resume to the email before sending!**
          </p>


          <ModalTextArea
            placeholder="Tell us why you're a great fit for this role."
            rows={5}
            {...register('whyApply', { required: true })}
            $error={!!errors.whyApply}
          />

          <ModalButton type="submit">
            Open Email Client & Apply
          </ModalButton>

          {/* Form status and error messages */}
          {formStatusMessage && !isFormSubmissionSuccess && (
            <ModalStatusMessage $isSuccess={isFormSubmissionSuccess}>
              {formStatusMessage}
            </ModalStatusMessage>
          )}

          {errors.fullName && <ModalStatusMessage $isSuccess={false}>Full Name is required.</ModalStatusMessage>}
          {errors.email && <ModalStatusMessage $isSuccess={false}>A valid Email is required.</ModalStatusMessage>}
          {errors.phone && <ModalStatusMessage $isSuccess={false}>Phone Number is required.</ModalStatusMessage>}
          {errors.whyApply && <ModalStatusMessage $isSuccess={false}>Please tell us why you want to apply.</ModalStatusMessage>}
        </ModalForm>
      </ApplicationModalContent>
    </Overlay>
  );
};