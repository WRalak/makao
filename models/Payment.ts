import { query, queryOne } from '../lib/database-helpers';

interface Payment {
  id: number;
  agentId: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  subscriptionId?: string;
  plan?: string;
  commissionAmount: number;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentData {
  agentId: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  subscriptionId?: string;
  plan?: string;
  commissionAmount: number;
  commissionRate: number;
}

class Payment {
  static async create(data: PaymentData) {
    const sql = `
      INSERT INTO payments (agent_id, stripe_payment_intent_id, amount, currency, status, subscription_id, plan, commission_amount, commission_rate, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.agentId,
      data.stripePaymentIntentId,
      data.amount,
      data.currency,
      data.status,
      data.subscriptionId,
      data.plan,
      data.commissionAmount,
      data.commissionRate
    ]) as Payment[];
    return result[0];
  }

  static async findById(id: string | number) {
    const sql = 'SELECT * FROM payments WHERE id = $1';
    return await queryOne<Payment>(sql, [id]);
  }

  static async findByAgentId(agentId: string | number) {
    const sql = 'SELECT * FROM payments WHERE agent_id = $1 ORDER BY created_at DESC';
    return await query(sql, [agentId]) as Payment[];
  }

  static async findByPaymentIntentId(paymentIntentId: string) {
    const sql = 'SELECT * FROM payments WHERE stripe_payment_intent_id = $1';
    return await queryOne<Payment>(sql, [paymentIntentId]);
  }

  static async updateStatus(id: string | number, status: string) {
    const sql = `
      UPDATE payments 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [status, id]) as Payment[];
    return result[0];
  }

  static async save(payment: Payment) {
    if (payment.id) {
      return await this.updateStatus(payment.id, payment.status);
    } else {
      return await this.create(payment);
    }
  }
}

export default Payment;
