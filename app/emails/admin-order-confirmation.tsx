// app/emails/admin-order-notification.tsx
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
    Hr,
  } from '@react-email/components';
  
  interface AdminOrderNotificationEmailProps {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
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
    paymentMethod: string;
  }
  
  export const AdminOrderNotificationEmail = ({
    customerName,
    customerEmail,
    customerPhone,
    orderId,
    orderDate,
    items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress,
    paymentMethod,
  }: AdminOrderNotificationEmailProps) => (
    <Html>
      <Head />
      <Preview>New order received - {orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>FURNIVO - NEW ORDER ALERT</Heading>
          </Section>
  
          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>
              ⚠️ New order received and requires attention
            </Text>
          </Section>
  
          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>New Order Received!</Heading>
  
            {/* Customer Information */}
            <Section style={customerInfoSection}>
              <Heading style={h2}>Customer Information</Heading>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={infoLabel}>Name</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={infoValue}>{customerName}</Text>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={infoLabel}>Email</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={infoValue}>
                    <a href={`mailto:${customerEmail}`} style={link}>
                      {customerEmail}
                    </a>
                  </Text>
                </Column>
              </Row>
              {customerPhone && (
                <Row style={infoRow}>
                  <Column style={labelColumn}>
                    <Text style={infoLabel}>Phone</Text>
                  </Column>
                  <Column style={valueColumn}>
                    <Text style={infoValue}>
                      <a href={`tel:${customerPhone}`} style={link}>
                        {customerPhone}
                      </a>
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>
  
            <Hr style={divider} />
  
            {/* Order Details */}
            <Section style={orderInfo}>
              <Row>
                <Column>
                  <Text style={label}>Order ID</Text>
                  <Text style={value}>{orderId}</Text>
                </Column>
                <Column>
                  <Text style={label}>Order Date</Text>
                  <Text style={value}>{orderDate}</Text>
                </Column>
                <Column>
                  <Text style={label}>Payment Method</Text>
                  <Text style={value}>{paymentMethod.toUpperCase()}</Text>
                </Column>
              </Row>
            </Section>
  
            <Hr style={divider} />
  
            {/* Items */}
            <Section style={itemsSection}>
              <Heading style={h2}>Order Items ({items.length})</Heading>
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
                  <Column style={{ paddingLeft: '16px', flex: 1 }}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemDetails}>
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: 'right' as const }}>
                    <Text style={itemPrice}>
                      ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
  
            <Hr style={divider} />
  
            {/* Order Summary */}
            <Section style={summary}>
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Subtotal</Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={summaryValue}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </Text>
                </Column>
              </Row>
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Shipping</Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={summaryValue}>
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </Text>
                </Column>
              </Row>
              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Tax (GST)</Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={summaryValue}>₹{tax.toLocaleString('en-IN')}</Text>
                </Column>
              </Row>
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>TOTAL</Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={totalValue}>₹{total.toLocaleString('en-IN')}</Text>
                </Column>
              </Row>
            </Section>
  
            <Hr style={divider} />
  
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
  
            <Hr style={divider} />
  
            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Button
                style={{ ...button, backgroundColor: '#16a34a' }}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}`}
              >
                View in Admin Panel
              </Button>
              <Button
                style={{ ...button, backgroundColor: '#C47456', marginLeft: '12px' }}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}/process`}
              >
                Process Order
              </Button>
            </Section>
  
            <Text style={footer}>
              This is an automated notification. Please do not reply to this email.
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
  
  const alertBanner = {
    backgroundColor: '#fef3c7',
    padding: '16px 20px',
    borderLeft: '4px solid #f59e0b',
  };
  
  const alertText = {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    margin: '0',
  };
  
  const content = {
    padding: '0 48px',
  };
  
  const h1 = {
    color: '#2C2C2C',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: '40px 0 20px',
  };
  
  const h2 = {
    color: '#2C2C2C',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    margin: '24px 0 16px',
  };
  
  const customerInfoSection = {
    backgroundColor: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #bfdbfe',
  };
  
  const infoRow = {
    marginBottom: '12px',
  };
  
  const labelColumn = {
    width: '120px',
  };
  
  const valueColumn = {
    flex: 1,
  };
  
  const infoLabel = {
    color: '#8898aa',
    fontSize: '12px',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    margin: '0',
  };
  
  const infoValue = {
    color: '#2C2C2C',
    fontSize: '14px',
    fontWeight: '500' as const,
    margin: '4px 0 0',
  };
  
  const link = {
    color: '#C47456',
    textDecoration: 'none',
  };
  
  const divider = {
    borderColor: '#e6ebf1',
    margin: '24px 0',
  };
  
  const label = {
    color: '#8898aa',
    fontSize: '12px',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
  };
  
  const value = {
    color: '#2C2C2C',
    fontSize: '16px',
    fontWeight: '600' as const,
    margin: '0',
  };
  
  const orderInfo = {
    backgroundColor: '#f6f9fc',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
  };
  
  const itemsSection = {
    margin: '24px 0',
  };
  
  const itemRow = {
    borderBottom: '1px solid #e6ebf1',
    paddingBottom: '16px',
    marginBottom: '16px',
    display: 'flex' as const,
  };
  
  const itemImage = {
    borderRadius: '8px',
    objectFit: 'cover' as const,
  };
  
  const itemName = {
    color: '#2C2C2C',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '0 0 4px',
  };
  
  const itemDetails = {
    color: '#8898aa',
    fontSize: '12px',
    margin: '0',
  };
  
  const itemPrice = {
    color: '#C47456',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '0',
  };
  
  const summary = {
    backgroundColor: '#f6f9fc',
    padding: '20px',
    borderRadius: '8px',
    margin: '24px 0',
  };
  
  const summaryRow = {
    marginBottom: '12px',
  };
  
  const summaryLabel = {
    color: '#525f7f',
    fontSize: '14px',
    margin: '0',
  };
  
  const summaryValue = {
    color: '#2C2C2C',
    fontSize: '14px',
    fontWeight: '600' as const,
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
    fontWeight: 'bold' as const,
    margin: '0',
  };
  
  const totalValue = {
    color: '#C47456',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    margin: '0',
  };
  
  const addressSection = {
    margin: '24px 0',
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
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    marginRight: '8px',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '40px',
  };
  
  export default AdminOrderNotificationEmail;