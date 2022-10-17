module.exports = (plugin) => {

    const contentTypesController = plugin.controllers['content-types'];

    const originalCreateContentType = contentTypesController.createContentType;

    contentTypesController.createContentType = async (ctx) => {

        const { body } = ctx.request;

        const contentTypeName = body.contentType.singularName;
        const contentTypeKind = body.contentType.kind;

        const apiId = `api::${contentTypeName}.${contentTypeName}`;

        const exists = strapi.db.metadata.get(apiId);

        if (!exists) {
            const publicRole = await strapi
                .query('plugin::users-permissions.role')
                .findOne({ where: { name: 'Public' } });
            const authenticatedRole = await strapi
                .query('plugin::users-permissions.role')
                .findOne({ where: { name: 'Authenticated' } });

            if (publicRole && authenticatedRole) {
                // Note: don't use createMany() here, because it doesn't set the association with the role
                await addPermission(`${apiId}.find`, publicRole.id)
                await addPermission(`${apiId}.find`, authenticatedRole.id)
                if (contentTypeKind === 'collectionType') {
                    await addPermission(`${apiId}.findOne`, publicRole.id)
                    await addPermission(`${apiId}.findOne`, authenticatedRole.id)
                }
            }
        }

        await originalCreateContentType(ctx);
        // server restarts...
    };

    return plugin;
};

async function addPermission(action, roleId) {
    await strapi
        .query('plugin::users-permissions.permission')
        .create({
            data: {
                action,
                role: roleId
            }
        });
}
