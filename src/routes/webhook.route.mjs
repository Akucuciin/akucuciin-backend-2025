import { Router } from "express";

const WebhookRouter = Router();

WebhookRouter.post("/api/payment/webhook", async (req, res) => {
  const notification = req.body;
  const orderId = notification.order.invoice_number;
  const status = notification.transaction.status;

  if (status === "SUCCESS") {
    await OrderQuery.updateStatusPayment(orderId, "sudah bayar");
    console.log("Pembayaran sukses untuk order", orderId);
  }
  
  res.status(200).send("OK");
});

export default WebhookRouter;
