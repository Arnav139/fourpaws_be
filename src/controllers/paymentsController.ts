import axios from "axios";
import { envConfigs } from "../config/envconfig";
import { Request, Response } from "express";


const CASHFREE_ENV = envConfigs.CASHFREE_ENV
const CASHFREE_APP_ID = envConfigs.CASHFREE_APP_ID
const CASHFREE_SECRET_KEY = envConfigs.CASHFREE_SECRET_KEY


const baseURL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const headers = {
  "Content-Type": "application/json",
  "x-client-id": CASHFREE_APP_ID,
  "x-client-secret": CASHFREE_SECRET_KEY,
};


export default class PaymentsController {
  static createOrder = async (req: Request, res: Response): Promise<any> => {
    const { customer_id, customer_email, customer_phone, amount, order_id } =
      req.body;

    try {
      const response = await axios.post(
        `${baseURL}/orders`,
        {
          order_id,
          order_amount: amount,
          order_currency: "INR",
          customer_details: {
            customer_id,
            customer_email,
            customer_phone,
          },
        },
        { headers }
      );

      res.json({
        success: true,
        paymentSessionId: response.data.payment_session_id,
        cashfreeCheckoutUrl: `https://sandbox.cashfree.com/pg/checkout?payment_session_id=${response.data.payment_session_id}`,
      });
    } catch (err) {
      console.error(err?.response?.data || err.message);
      return res.status(500).json({ error: "Failed to create order" });
    }
  };
}
