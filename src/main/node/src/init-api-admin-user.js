'use strict';

module.exports = async (strapi) => {

  if (process.env.NODE_ENV === 'development' || process.env.INIT_ADMIN === 'true') {
    const adminUser = process.env.INIT_ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.INIT_ADMIN_PASSWORD || 'adminadmin'
    const adminEmail = process.env.INIT_ADMIN_EMAIL || 'strapi@entando.local'

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: 'Authenticated' } });

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { username: adminUser } });

    if (!user) {
      await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: adminUser,
          email: adminEmail,
          password: await strapi.service("admin::auth").hashPassword(adminPassword),
          confirmed: true,
          role: role.id
        }
      });
    }
  }

}