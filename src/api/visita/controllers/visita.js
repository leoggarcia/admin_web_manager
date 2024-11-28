'use strict';

/**
 * visita controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::visita.visita', ({ strapi }) => ({
    async registrar(ctx) {
        const { referer, dispositivo, navegador, websiteId } = ctx.request.body;

        const website = await strapi.entityService.findMany(
            'api::website.website',
            {
                filters: { id: websiteId },
            }
        );

        if (!website) {
            return ctx.badRequest('El website especificado no existe.');
        }

        // Crear la visita y vincularla al website
        /* const nuevaVisita = await strapi.services.visita.create({
            referer,
            dispositivo,
            navegador,
            website: websiteId,
        }); */

        const nuevaVisita = await strapi.entityService.create(
            'api::visita.visita',
            {
                data: {
                    referer,
                    dispositivo,
                    navegador,
                    website: websiteId,
                },
            }
        );

        ctx.send(nuevaVisita);
    },
}));
