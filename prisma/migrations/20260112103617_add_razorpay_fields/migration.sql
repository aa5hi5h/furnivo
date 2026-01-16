-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "merchantTransactionId" TEXT,
ALTER COLUMN "paymentMethod" SET DEFAULT 'razorpay';
