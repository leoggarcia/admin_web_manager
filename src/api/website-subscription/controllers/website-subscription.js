'use strict';

/**
 * website-subscription controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = createCoreController(
    'api::website-subscription.website-subscription',
    ({ strapi }) => ({
        async stripeCheckout(ctx) {
            const websitePrice = ctx?.request?.body?.website_price;
            const website_subscription_id =
                ctx?.request?.body?.website_subscription_id;

            if (!website_subscription_id) {
                return ctx.badRequest('website_subscription_id is required');
            }

            try {
                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                            price:
                                websitePrice ??
                                'price_1QAMPXGChMK8V46WcFJ4CdGx',
                            quantity: 1,
                        },
                    ],
                    metadata: {
                        subscriptionId: website_subscription_id,
                    },
                    mode: 'subscription',
                    success_url: `${process.env.CLIENT_SITE_URL}/client/payment-success`,
                    cancel_url: `${process.env.CLIENT_SITE_URL}/client/`,
                });

                ctx.body = session;
            } catch (error) {
                ctx.body = error;
            }
        },
        async stripeWebhook(ctx) {
            const sig = ctx.request.headers['stripe-signature'];
            const raw = ctx.request.body[Symbol.for('unparsedBody')];
            /* const unparsed = require("koa-body/unparsed.js");
            const unparsedBody = ctx.request.body[unparsed]; */

            let event;

            try {
                event = stripe.webhooks.constructEvent(
                    raw,
                    sig,
                    process.env.STRIPE_WEBHOOK_SECRET
                );
            } catch (err) {
                return ctx.badRequest(`Webhook Error: ${err.message}`);
            }

            switch (event.type) {
                case 'subscription_schedule.aborted':
                    const subscriptionScheduleAborted = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.aborted
                    break;
                case 'subscription_schedule.canceled':
                    const subscriptionScheduleCanceled = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.canceled
                    break;
                case 'subscription_schedule.completed':
                    const subscriptionScheduleCompleted = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.completed
                    break;
                case 'subscription_schedule.created':
                    const subscriptionScheduleCreated = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.created
                    break;
                case 'subscription_schedule.expiring':
                    const subscriptionScheduleExpiring = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.expiring
                    break;
                case 'subscription_schedule.released':
                    const subscriptionScheduleReleased = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.released
                    break;
                case 'subscription_schedule.updated':
                    const subscriptionScheduleUpdated = event.data.object;
                    // Then define and call a function to handle the event subscription_schedule.updated
                    break;
                case 'checkout.session.completed':
                    const checkoutSessionCompleted = event.data.object;

                    /* strapi.log.info('🚀 payment: ' + JSON.stringify(raw)); */

                    const stripeSubscriptionId =
                        checkoutSessionCompleted.subscription;
                    const subscriptionId =
                        checkoutSessionCompleted.metadata.subscriptionId;

                    if (!subscriptionId) {
                        return ctx.badRequest(
                            'No subscription ID found in metadata'
                        );
                    }

                    try {
                        // Buscar la suscripción en la colección "website_subscription"
                        const subscription =
                            await strapi.entityService.findMany(
                                'api::website-subscription.website-subscription',
                                {
                                    filters: { id: subscriptionId },
                                }
                            );

                        if (!subscription || subscription.length === 0) {
                            return ctx.notFound('Subscription not found');
                        }

                        // Actualizar el campo "activo" a true
                        await strapi.entityService.update(
                            'api::website-subscription.website-subscription',
                            subscription[0].id,
                            {
                                data: {
                                    stripe_subscription_id:
                                        stripeSubscriptionId,
                                    subscripcion_activa: true, // Aquí actualizamos el campo "activo"
                                },
                            }
                        );

                        /* strapi.log.info(
                            `Subscription ${subscriptionId} marked as active.`
                        ); */
                    } catch (err) {
                        strapi.log.error('Error updating subscription:', err);
                        return ctx.internalServerError(
                            'Error updating subscription'
                        );
                    }

                    break;
                // ... handle other event types
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            ctx.body = { received: true };
        },
        async cancelSubscription(ctx) {
            const { strapiSubscriptionId, subscriptionId } = ctx.request.body;

            if (!subscriptionId || !strapiSubscriptionId) {
                return ctx.badRequest('No subscription ID found in metadata');
            }

            try {
                // Actualizar informacion en la subscripcion de strapi
                const subscription = await strapi.entityService.findMany(
                    'api::website-subscription.website-subscription',
                    {
                        filters: { id: strapiSubscriptionId },
                    }
                );

                if (!subscription || subscription.length === 0) {
                    return ctx.notFound('Subscription not found');
                }

                
                // Actualizar el campo "activo" a true
                await strapi.entityService.update(
                    'api::website-subscription.website-subscription',
                    subscription[0].id,
                    {
                        data: {
                            subscripcion_activa: false,
                        },
                    }
                );
                
                // Cancela la suscripción en Stripe
                const deletedSubscription =
                    await stripe.subscriptions.cancel(subscriptionId);

                return ctx.send({
                    message: 'Subscription canceled successfully',
                    data: deletedSubscription,
                });
            } catch (err) {
                return ctx.badRequest('Failed to cancel subscription');
            }
        },
    })
);
