import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, X } from 'lucide-react'; // Import icons

import {
  Wrapper,
  Inner,
  TwoCol,
  Title,
  Details,
  Form,
  Row,
  Input,
  TextArea,
  Button,
  // New imports for pop-up styles
  Overlay,
  PopupBox,
  CloseButton,
  CheckIconContainer,
  SuccessMessage,
} from './ContactBlockStyles'; // Make sure this path is correct for your styles file

type FormShape = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export default function ContactBlock() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormShape>();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false); // State to control popup visibility

  const onSubmit = async (data: FormShape) => {
    setFeedbackMessage(null);
    setIsSuccess(false);
    setShowPopup(false); // Ensure popup is hidden before new submission

    try {
      // IMPORTANT: Replace with the actual URL of your PHP script on Hostway
      const response = await fetch('https://www.agenciaworking.com/send_email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          message: data.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFeedbackMessage('Successfully Submitted message'); // Specific message for success pop-up
        setIsSuccess(true);
        reset(); // Reset form fields on success
        setShowPopup(true); // Show the success pop-up
      } else {
        // For general errors, display directly below the form, not in the pop-up
        setFeedbackMessage(result.message || 'Sorry, something went wrong. Please try again.');
        setIsSuccess(false);
        // setShowPopup(false); // Ensure pop-up doesn't show for errors
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setFeedbackMessage('An unexpected error occurred. Please check your internet connection and try again.');
      setIsSuccess(false);
      // setShowPopup(false); // Ensure pop-up doesn't show for network errors
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setFeedbackMessage(null); // Clear message when closing
    setIsSuccess(false); // Reset success state
  };

  return (
    <Wrapper>
      <Inner>
        <TwoCol>
          {/* left: address / phones / email */}
          <div>
            <Title>Contact Details</Title>
            <Details>
              <p>Boulevard&nbsp;Tamaulipas&nbsp;3191&nbsp;Local&nbsp;3&nbsp;y&nbsp;4</p>
              <p>Fraccionamiento&nbsp;La&nbsp;Misión</p>
              <p>Ciudad&nbsp;Victoria&nbsp;Tamps,&nbsp;C.P.&nbsp;87025</p>
              <p>834-147-2218</p>
              <p>899-461-2756</p>
              <p>info@agenciaworking.com</p>
            </Details>
          </div>

          {/* right: form */}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Input
                placeholder="First name"
                {...register('firstName', { required: true })}
                $error={!!errors.firstName}
              />
              <Input
                placeholder="Last name"
                {...register('lastName', { required: true })}
                $error={!!errors.lastName}
              />
              <Input
                placeholder="Email"
                type="email"
                {...register('email', {
                  required: true,
                  pattern: /^\S+@\S+$/i,
                })}
                $error={!!errors.email}
              />
            </Row>

            <TextArea
              placeholder="Message"
              rows={4}
              {...register('message', { required: true })}
              $error={!!errors.message}
            />

            <Button type="submit" disabled={isSubmitting} className={isSubmitting ? 'loading' : ''}>
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>

            {/* Display general feedback message below the form only if not showing popup */}
            {feedbackMessage && !showPopup && !isSuccess && ( // Only show error message below form
              <p style={{ color: 'red', marginTop: '10px' }}>
                {feedbackMessage}
              </p>
            )}

            {/* Optional: Display validation errors */}
            {errors.firstName && <p style={{ color: 'red' }}>First name is required.</p>}
            {errors.lastName && <p style={{ color: 'red' }}>Last name is required.</p>}
            {errors.email && <p style={{ color: 'red' }}>Please enter a valid email.</p>}
            {errors.message && <p style={{ color: 'red' }}>Message is required.</p>}
          </Form>
        </TwoCol>
      </Inner>

      {/* Success Pop-up */}
      {showPopup && isSuccess && (
        <Overlay>
          <PopupBox>
            <CloseButton onClick={handleClosePopup}>
              <X size={24} /> {/* Exit cross icon */}
            </CloseButton>
            <CheckIconContainer>
              <CheckCircle /> {/* Green checkmark icon */}
            </CheckIconContainer>
            <SuccessMessage>
              {feedbackMessage} {/* Will display "Successfully Submitted message" */}
            </SuccessMessage>
          </PopupBox>
        </Overlay>
      )}
    </Wrapper>
  );
}