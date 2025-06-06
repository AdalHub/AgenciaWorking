import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';
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
} from './ContactBlockStyles';

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
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormShape>();

  const onSubmit = async (data: FormShape) => {
    try {
      await emailjs.send(
        'SERVICE_ID',  // ← your EmailJS IDs
        'TEMPLATE_ID',
        {
          first_name: data.firstName,
          last_name: data.lastName,
          sender_email: data.email,
          message: data.message,
        },
        'PUBLIC_KEY'
      );
      reset();
      alert('Thanks! Your message was sent.');
    } catch (err) {
      console.error(err);
      alert('Sorry, something went wrong.');
    }
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

            <Button type="submit" disabled={isSubmitSuccessful}>
              Send
            </Button>
          </Form>
        </TwoCol>
      </Inner>
    </Wrapper>
  );
}
