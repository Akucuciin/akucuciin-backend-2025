import { Router } from "express";
import OrderQuery from "../database/queries/order.query.mjs";
import { sendOrderPaymentCompletedToCustomer } from "../services/whatsapp.service.mjs";
import { formatOrderFromDb } from "../utils/order.utils.mjs";

const WebhookRouter = Router();

WebhookRouter.post("/api/payment/webhook", async (req, res) => {
  const notification = req.body;
  const rawInvoice = notification.order.invoice_number;
  const [name, orderId, unique] = rawInvoice.split("::"); // name::orderId::unique
  const status = notification.transaction.status;

  const ordersJoined = await OrderQuery.getOrderJoinedById(orderId);
  const orderJoined = ordersJoined[0];
  const _order = formatOrderFromDb(orderJoined);

  await sendOrderPaymentCompletedToCustomer(_order);

  if (status === "SUCCESS") {
    await OrderQuery.updateStatusPayment(orderId, "sudah bayar");
    console.log("Pembayaran sukses untuk order", orderId);
  }

  res.status(200).send("OK");
});

export default WebhookRouter;
