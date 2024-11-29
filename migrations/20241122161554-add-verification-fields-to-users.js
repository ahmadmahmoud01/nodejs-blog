'use strict';

export default {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'isVerified', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        await queryInterface.addColumn('Users', 'verificationCode', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('Users', 'isVerified');
        await queryInterface.removeColumn('Users', 'verificationCode');
    },
};
