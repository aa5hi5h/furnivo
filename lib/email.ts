// lib/email.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmationEmail from './../app/emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  customerEmail: string;
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

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const emailHtml = render(
      OrderConfirmationEmail({
        customerName: data.customerName,
        orderId: data.orderId,
        orderDate: data.orderDate,
        items: data.items,
        subtotal: data.subtotal,
        shipping: data.shipping,
        tax: data.tax,
        total: data.total,
        shippingAddress: data.shippingAddress,
      })
    );

    const { data: emailData, error } = await resend.emails.send({
      from: `${process.env.BUSINESS_NAME} <${process.env.BUSINESS_EMAIL}>`,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderId}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Order confirmation email sent:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendOrderStatusEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  status: string
) {
  try {
    const statusMessages: Record<string, string> = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const { data, error } = await resend.emails.send({
      from: `${process.env.BUSINESS_NAME} <${process.env.BUSINESS_EMAIL}>`,
      to: customerEmail,
      subject: `Order Update - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2C2C2C; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FURNIVO</h1>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="color: #2C2C2C;">Hi ${customerName},</h2>
            <p style="font-size: 16px; color: #525f7f; line-height: 1.5;">
              ${statusMessages[status] || 'Your order status has been updated'}.
            </p>
            <p style="font-size: 14px; color: #8898aa;">
              Order Number: <strong>${orderId}</strong><br/>
              Status: <strong style="color: #C47456;">${status.toUpperCase()}</strong>
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}" 
                 style="background-color: #C47456; color: white; padding: 12px 32px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;">
                View Order Details
              </a>
            </div>
            <p style="font-size: 12px; color: #8898aa; text-align: center; margin-top: 40px;">
              If you have any questions, please contact us at ${process.env.BUSINESS_EMAIL}
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending status email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send order status email:', error);
    return { success: false, error };
  }
}