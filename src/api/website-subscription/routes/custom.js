module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/stripe_checkout',
            handler: 'website-subscription.stripeCheckout',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: "/stripe_webhook",
            handler: 'website-subscription.stripeWebhook',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: "/cancel_subscription",
            handler: 'website-subscription.cancelSubscription',
            config: {
                auth: false,
            },
        }
    ],
};
