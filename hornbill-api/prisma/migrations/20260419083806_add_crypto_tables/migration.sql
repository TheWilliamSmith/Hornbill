-- CreateEnum
CREATE TYPE "CryptoPositionStatus" AS ENUM ('OPEN', 'PARTIALLY_SOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "SellTargetStatus" AS ENUM ('PENDING', 'TRIGGERED', 'EXECUTED');

-- CreateTable
CREATE TABLE "crypto_positions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "buy_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_basis" DOUBLE PRECISION NOT NULL,
    "bought_at" TIMESTAMP(3) NOT NULL,
    "status" "CryptoPositionStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_targets" (
    "id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "trigger_percent" DOUBLE PRECISION NOT NULL,
    "sell_percent" DOUBLE PRECISION NOT NULL,
    "target_price" DOUBLE PRECISION NOT NULL,
    "status" "SellTargetStatus" NOT NULL DEFAULT 'PENDING',
    "triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sell_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_executions" (
    "id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "target_id" TEXT,
    "quantity_sold" DOUBLE PRECISION NOT NULL,
    "sell_price" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realized_pnl" DOUBLE PRECISION NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sell_executions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "crypto_positions" ADD CONSTRAINT "crypto_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_targets" ADD CONSTRAINT "sell_targets_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "crypto_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_executions" ADD CONSTRAINT "sell_executions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "crypto_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_executions" ADD CONSTRAINT "sell_executions_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "sell_targets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
