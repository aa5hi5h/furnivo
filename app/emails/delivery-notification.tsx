// app/emails/delivery-notification.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Row,
    Column,
  } from '@react-email/components';
  
  interface DeliveryNotificationEmailProps {
    customerName: string;
    orderId: string;
    trackingNumber?: string;
  }
  
  export const DeliveryNotificationEmail = ({
    customerName,
    orderId,
    trackingNumber,
  }: DeliveryNotificationEmailProps) => (
    <Html>
      <Head />
      <Preview>Your order has been delivered!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>FURNIVO</Heading>
          </Section>
  
          {/* Success Banner */}
          <Section style={successBanner}>
            <Text style={successText}>✓ Your order has been delivered!</Text>
          </Section>
  
          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>It's Here! 🎉</Heading>
  
            <Text style={text}>
              Hi {customerName},
            </Text>
  
            <Text style={text}>
              Your order has been delivered! We hope you're excited about your new
              furniture. We'd love to hear what you think about your purchase.
            </Text>
  
            {/* Delivery Details */}
            <Section style={deliveryInfo}>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Order ID</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{orderId}</Text>
                </Column>
              </Row>
              {trackingNumber && (
                <Row style={infoRow}>
                  <Column style={labelColumn}>
                    <Text style={label}>Tracking</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={value}>{trackingNumber}</Text>
                  </Column>
                </Row>
              )}
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Status</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={{ ...value, color: '#16a34a' }}>DELIVERED</Text>
                </Column>
              </Row>
            </Section>
  
            {/* Review Section */}
            <Section style={reviewSection}>
              <Heading style={h2}>Share Your Experience</Heading>
              <Text style={text}>
                Your feedback helps us improve! Please leave a review for the
                products you purchased.
              </Text>
              <Section style={buttonSection}>
                <Button
                  style={reviewButton}
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}`}
                >
                  View Order & Leave Review
                </Button>
              </Section>
            </Section>
  
            {/* Next Steps */}
            <Section style={nextStepsSection}>
              <Heading style={h2}>What's Next?</Heading>
              <Section style={stepItem}>
                <Text style={stepNumber}>1</Text>
                <Text style={stepText}>
                  <strong>Inspect Your Order:</strong> Check that all items arrived
                  in good condition
                </Text>
              </Section>
              <Section style={stepItem}>
                <Text style={stepNumber}>2</Text>
                <Text style={stepText}>
                  <strong>Setup & Assembly:</strong> Follow any included
                  instructions for assembly
                </Text>
              </Section>
              <Section style={stepItem}>
                <Text style={stepNumber}>3</Text>
                <Text style={stepText}>
                  <strong>Leave a Review:</strong> Share your feedback with other
                  customers
                </Text>
              </Section>
            </Section>
  
            {/* Support Section */}
            <Section style={supportSection}>
              <Heading style={h2}>Need Help?</Heading>
              <Text style={text}>
                If you have any issues with your order or need assistance, we're here
                to help!
              </Text>
              <Section style={buttonSection}>
                <Button
                  style={supportButton}
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/contact`}
                >
                  Contact Support
                </Button>
              </Section>
            </Section>
  
            {/* Thank You */}
            <Section style={thankYouSection}>
              <Text style={thankYouText}>
                Thank you for shopping with FURNIVO! We appreciate your business and
                look forward to serving you again.
              </Text>
            </Section>
  
            <Text style={footer}>
              Questions? Contact us at {process.env.BUSINESS_EMAIL}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
  
  // Styles
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
  };
  
  const header = {
    padding: '32px 20px',
    backgroundColor: '#2C2C2C',
  };
  
  const heading = {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
    margin: '0',
  };
  
  const successBanner = {
    backgroundColor: '#dcfce7',
    padding: '20px',
    borderLeft: '4px solid #16a34a',
    margin: '24px 0',
  };
  
  const successText = {
    color: '#15803d',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    margin: '0',
  };
  
  const content = {
    padding: '0 48px',
  };
  
  const h1 = {
    color: '#2C2C2C',
    fontSize: '28px',
    fontWeight: 'bold' as const,
    margin: '40px 0 20px',
    textAlign: 'center' as const,
  };
  
  const h2 = {
    color: '#2C2C2C',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    margin: '28px 0 16px',
  };
  
  const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px',
  };
  
  const deliveryInfo = {
    backgroundColor: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    margin: '24px 0',
    border: '1px solid #bfdbfe',
  };
  
  const infoRow = {
    marginBottom: '16px',
  };
  
  const labelColumn = {
    width: '100px',
  };
  
  const valueColumn = {
    flex: 1,
  };
  
  const label = {
    color: '#8898aa',
    fontSize: '12px',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    margin: '0',
  };
  
  const value = {
    color: '#2C2C2C',
    fontSize: '16px',
    fontWeight: '600' as const,
    margin: '0',
  };
  
  const reviewSection = {
    backgroundColor: '#fef3c7',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
  };
  
  const nextStepsSection = {
    margin: '24px 0',
  };
  
  const stepItem = {
    display: 'flex' as const,
    marginBottom: '16px',
    paddingLeft: '20px',
    borderLeft: '3px solid #C47456',
  };
  
  const stepNumber = {
    color: '#C47456',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginRight: '16px',
    minWidth: '30px',
  };
  
  const stepText = {
    color: '#525f7f',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  };
  
  const supportSection = {
    backgroundColor: '#f3f4f6',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
  };
  
  const buttonSection = {
    textAlign: 'center' as const,
    margin: '20px 0',
  };
  
  const reviewButton = {
    backgroundColor: '#16a34a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
  };
  
  const supportButton = {
    backgroundColor: '#C47456',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
  };
  
  const thankYouSection = {
    backgroundColor: '#f5f3ff',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
    textAlign: 'center' as const,
  };
  
  const thankYouText = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0',
    fontStyle: 'italic' as const,
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '40px',
  };
  
  export default DeliveryNotificationEmail;