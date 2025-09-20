// migrations/20240601000000-add-distributor-id-to-stock-items.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add distributor_id column
    await queryInterface.addColumn('distributor_stock_items', 'distributor_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'distributors',
        key: 'distributor_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('distributor_stock_items', {
      fields: ['distributor_id'],
      type: 'foreign key',
      name: 'fk_distributor_stock_items_distributor_id',
      references: {
        table: 'distributors',
        field: 'distributor_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Create index for better query performance
    await queryInterface.addIndex('distributor_stock_items', ['distributor_id'], {
      name: 'idx_distributor_stock_items_distributor_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('distributor_stock_items', 'idx_distributor_stock_items_distributor_id');
    
    // Remove foreign key constraint
    await queryInterface.removeConstraint('distributor_stock_items', 'fk_distributor_stock_items_distributor_id');

    // Remove column
    await queryInterface.removeColumn('distributor_stock_items', 'distributor_id');
  }
};