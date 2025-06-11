import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, X } from 'lucide-react'; // <-- ADD THIS IMPORT STATEMENT
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
  Overlay,
  PopupBox,
  CloseButton,
  CheckIconContainer,
  SuccessMessage,
} from './ContactBlockStyles';

interface ContactFormShape {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function ContactBlock() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormShape>();

  const [formStatusMessage, setFormStatusMessage] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const onSubmit = (data: ContactFormShape) => {
    setFormStatusMessage(null);
    setShowSuccessPopup(false);

    const recipientEmail = 'info@agenciaworking.com'; // Your target email
    const subject = encodeURIComponent('Contact Form Submission from Website');
    const body = encodeURIComponent(
      `Full Name: ${data.firstName} ${data.lastName}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Company: ${data.company || 'N/A'}\n\n` +
      `Message:\n${data.message}`
    );

    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    try {
      window.location.href = mailtoLink;
      // Assume success if the mailto link is opened
      setShowSuccessPopup(true);
      setFormStatusMessage('Your email client has opened with the pre-filled message. Please click "Send" to complete your submission. We will contact you soon!');
      reset(); // Reset form fields
    } catch (error) {
      setFormStatusMessage('Failed to open email client. Please ensure you have one configured, or email us directly at info@agenciaworking.com.');
      console.error('Mailto error:', error);
    }
  };

  return (
    <Wrapper>
      <Inner>
        <TwoCol>
          {/* Left Column (Details) */}
          <div>
            <Title>Contact Us</Title>
            <Details>
              <p>Boulevard Tamaulipas 3191 Local 3 y 4,</p>
              <p>Fraccionamiento La Misión, Ciudad Victoria,</p>
              <p>Tamaulipas. MX C.P. 87025</p>
              <p>Phone: 834 147 2218</p>
              <p>Phone: 899 461 2756</p>
              <p>Email: Info@agenciaworking.com</p>
            </Details>
          </div>

          {/* Right Column (Form) */}
          <div>
            <Title>Send Us a Message</Title>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Input
                  placeholder="First Name"
                  {...register('firstName', { required: true })}
                  $error={!!errors.firstName}
                />
                <Input
                  placeholder="Last Name"
                  {...register('lastName', { required: true })}
                  $error={!!errors.lastName}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  $error={!!errors.email}
                />
              </Row>
              <Input
                placeholder="Phone Number"
                type="tel"
                {...register('phone', { required: true })}
                $error={!!errors.phone}
              />
              <Input
                placeholder="Company (Optional)"
                {...register('company')}
              />
              <TextArea
                placeholder="Your Message"
                rows={5}
                {...register('message', { required: true })}
                $error={!!errors.message}
              />
              <Button type="submit">
                Send Message
              </Button>

              {errors.firstName && <p style={{ color: 'red' }}>First Name is required.</p>}
              {errors.lastName && <p style={{ color: 'red' }}>Last Name is required.</p>}
              {errors.email && <p style={{ color: 'red' }}>A valid Email is required.</p>}
              {errors.phone && <p style={{ color: 'red' }}>Phone Number is required.</p>}
              {errors.message && <p style={{ color: 'red' }}>Message is required.</p>}
            </Form>
          </div>
        </TwoCol>
      </Inner>

      {/* Success/Error Pop-up */}
      {showSuccessPopup && formStatusMessage && (
        <Overlay>
          <PopupBox>
            <CloseButton onClick={() => setShowSuccessPopup(false)}>
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
      )}
    </Wrapper>
  );
}