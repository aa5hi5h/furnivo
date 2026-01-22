import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
  } from '@react-email/components';
  
  interface ShippingNotificationEmailProps {
    customerName: string;
    orderId: string;
    trackingNumber?: string;
  }
  
  export default function ShippingNotificationEmail({
    customerName,
    orderId,
    trackingNumber,
  }: ShippingNotificationEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>Your order {orderId} has been shipped!</Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header */}
            <Section style={header}>
              <Heading style={headerTitle}>📦 Order Shipped!</Heading>
            </Section>
  
            {/* Content */}
            <Section style={content}>
              <Text style={greeting}>Hi {customerName},</Text>
  
              <Text style={paragraph}>
                Great news! Your order has been shipped and is on its way to you! 🎉
              </Text>
  
              {/* Order Details Box */}
              <Section style={orderBox}>
                <Text style={orderDetail}>
                  <strong>Order ID:</strong> {orderId}
                </Text>
                {trackingNumber && (
                  <Text style={orderDetail}>
                    <strong>Tracking Number:</strong>{' '}
                    <span style={trackingNumberText}>{trackingNumber}</span>
                  </Text>
                )}
              </Section>
  
              {trackingNumber ? (
                <Text style={paragraph}>
                  You can track your shipment using the tracking number above. Your
                  package should arrive within 3-5 business days.
                </Text>
              ) : (
                <Text style={paragraph}>
                  Your package should arrive within 3-5 business days. We'll notify
                  you once it's delivered.
                </Text>
              )}
  
              <Text style={paragraph}>
                Thank you for shopping with {process.env.BUSINESS_NAME || 'us'}!
              </Text>
            </Section>
  
            <Hr style={divider} />
  
            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                Questions? Contact us at{' '}
                <a href={`mailto:${process.env.BUSINESS_EMAIL}`} style={link}>
                  {process.env.BUSINESS_EMAIL}
                </a>
              </Text>
              <Text style={copyright}>
                © {new Date().getFullYear()} {process.env.BUSINESS_NAME || 'FurnZ'}.
                All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
  
  // Styles
  const main = {
    backgroundColor: '#f4f4f4',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };
  
  const container = {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
  };
  
  const header = {
    backgroundColor: '#4CAF50',
    padding: '40px 40px 20px',
    textAlign: 'center' as const,
    borderRadius: '8px 8px 0 0',
  };
  
  const headerTitle = {
    margin: '0',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
  };
  
  const content = {
    padding: '40px',
  };
  
  const greeting = {
    fontSize: '16px',
    color: '#333333',
    margin: '0 0 20px',
  };
  
  const paragraph = {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '1.6',
    margin: '20px 0',
  };
  
  const orderBox = {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  };
  
  const orderDetail = {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 10px',
  };
  
  const trackingNumberText = {
    color: '#4CAF50',
    fontWeight: 'bold',
  };
  
  const divider = {
    borderColor: '#eeeeee',
    margin: '30px 0',
  };
  
  const footer = {
    padding: '30px 40px',
    backgroundColor: '#f9f9f9',
  };
  
  const footerText = {
    fontSize: '14px',
    color: '#666666',
    textAlign: 'center' as const,
    margin: '0 0 10px',
  };
  
  const link = {
    color: '#4CAF50',
    textDecoration: 'none',
  };
  
  const copyright = {
    fontSize: '12px',
    color: '#999999',
    textAlign: 'center' as const,
    margin: '0',
  };