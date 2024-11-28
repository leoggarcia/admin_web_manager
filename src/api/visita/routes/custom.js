module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/visitas',
            handler: 'visita.registrar',
            config: {
                auth: false,
            },
        },
    ],
};
