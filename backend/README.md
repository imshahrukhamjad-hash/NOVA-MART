Manager PIN verification endpoint removed.

Stripe integration

- Set your Stripe secret key in `backend/.env` as `STRIPE_SECRET_KEY=sk_test_...`
- To fully support webhooks (order status updates), set `STRIPE_WEBHOOK_SECRET` with the secret provided when you create a webhook endpoint in the Stripe Dashboard and point it to `POST /stripe/webhook` on your backend.
- Optionally set `STRIPE_CURRENCY` (default: `usd`) and `FRONTEND_URL` (used for success/cancel URLs).

The server provides a Checkout session endpoint at `POST /orders/create-checkout-session` which the client uses to start a real Stripe Checkout flow.

If you want, I can also help register the webhook URL in your Stripe Dashboard and add instructions for local webhook testing.