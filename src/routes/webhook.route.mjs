import { Router } from "express";
import OrderQuery from "../database/queries/order.query.mjs";

const WebhookRouter = Router();

WebhookRouter.post("/api/payment/webhook", async (req, res) => {
  const notification = req.body;
  const rawInvoice = notification.order.invoice_number;
  const [name, orderId, unique] = rawInvoice.split("::"); // name::orderId
  const status = notification.transaction.status;

  if (status === "SUCCESS") {
    await OrderQuery.updateStatusPayment(orderId, "sudah bayar");
    console.log("Pembayaran sukses untuk order", orderId);
  }

  res.status(200).send("OK");
});

export default WebhookRouter;
