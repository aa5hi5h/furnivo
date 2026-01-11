// emails/order-confirmation.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Row,
    Column,
  } from '@react-email/components';
  
  interface OrderConfirmationEmailProps {
    customerName: string;
    orderId: string;
    orderDate: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image: string;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }
  
  export const OrderConfirmationEmail = ({
    customerName,
    orderId,
    orderDate,
    items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress,
  }: OrderConfirmationEmailProps) => (
    <Html>
      <Head />
      <Preview>Your FURNIVO order has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>FURNIVO</Heading>
          </Section>
  
          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Thank you for your order!</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              We've received your order and will send you a confirmation email once
              your items have shipped.
            </Text>
  
            {/* Order Details */}
            <Section style={orderInfo}>
              <Row>
                <Column>
                  <Text style={label}>Order Number</Text>
                  <Text style={value}>{orderId}</Text>
                </Column>
                <Column>
                  <Text style={label}>Order Date</Text>
                  <Text style={value}>{orderDate}</Text>
                </Column>
              </Row>
            </Section>
  
            {/* Items */}
            <Section style={itemsSection}>
              <Heading style={h2}>Order Items</Heading>
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={{ width: '80px' }}>
                    <Img
                      src={item.image}
                      alt={item.name}
                      width="80"
                      height="80"
                      style={itemImage}
                    />
                  </Column>
                  <Column style={{ paddingLeft: '16px' }}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemDetails}>
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text style={itemPrice}>
                      ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
  
            {/* Order Summary */}
            <Section style={summary}>
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Subtotal</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={summaryValue}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </Text>
                </Column>
              </Row>
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Shipping</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={summaryValue}>
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </Text>
                </Column>
              </Row>
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Tax (GST)</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={summaryValue}>₹{tax.toLocaleString('en-IN')}</Text>
                </Column>
              </Row>
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={totalValue}>₹{total.toLocaleString('en-IN')}</Text>
                </Column>
              </Row>
            </Section>
  
            {/* Shipping Address */}
            <Section style={addressSection}>
              <Heading style={h2}>Shipping Address</Heading>
              <Text style={address}>
                {shippingAddress.street}
                <br />
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.postalCode}
                <br />
                {shippingAddress.country}
              </Text>
            </Section>
  
            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}`}>
                View Order Details
              </Button>
            </Section>
  
            <Text style={footer}>
              If you have any questions, please contact us at{' '}
              {process.env.BUSINESS_EMAIL}
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
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center' as const,
    margin: '0',
  };
  
  const content = {
    padding: '0 48px',
  };
  
  const h1 = {
    color: '#2C2C2C',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0 20px',
  };
  
  const h2 = {
    color: '#2C2C2C',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '30px 0 15px',
  };
  
  const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 10px',
  };
  
  const orderInfo = {
    backgroundColor: '#f6f9fc',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
  };
  
  const label = {
    color: '#8898aa',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
  };
  
  const value = {
    color: '#2C2C2C',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
  };
  
  const itemsSection = {
    margin: '30px 0',
  };
  
  const itemRow = {
    borderBottom: '1px solid #e6ebf1',
    paddingBottom: '16px',
    marginBottom: '16px',
  };
  
  const itemImage = {
    borderRadius: '8px',
    objectFit: 'cover' as const,
  };
  
  const itemName = {
    color: '#2C2C2C',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px',
  };
  
  const itemDetails = {
    color: '#8898aa',
    fontSize: '14px',
    margin: '0',
  };
  
  const itemPrice = {
    color: '#C47456',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
  };
  
  const summary = {
    backgroundColor: '#f6f9fc',
    padding: '20px',
    borderRadius: '8px',
    margin: '30px 0',
  };
  
  const summaryRow = {
    marginBottom: '8px',
  };
  
  const summaryLabel = {
    color: '#525f7f',
    fontSize: '14px',
    margin: '0',
  };
  
  const summaryValue = {
    color: '#2C2C2C',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  };
  
  const totalRow = {
    borderTop: '2px solid #e6ebf1',
    paddingTop: '12px',
    marginTop: '12px',
  };
  
  const totalLabel = {
    color: '#2C2C2C',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0',
  };
  
  const totalValue = {
    color: '#C47456',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0',
  };
  
  const addressSection = {
    margin: '30px 0',
  };
  
  const address = {
    color: '#525f7f',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
  };
  
  const buttonSection = {
    textAlign: 'center' as const,
    margin: '32px 0',
  };
  
  const button = {
    backgroundColor: '#C47456',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '40px',
  };
  
  export default OrderConfirmationEmail;