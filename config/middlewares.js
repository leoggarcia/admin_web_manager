module.exports = [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    /* 'strapi::body', */
    {
        name: 'strapi::body',
        config: {
            patchKoa: true,
            multipart: true,
            includeUnparsed: true,
        },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
