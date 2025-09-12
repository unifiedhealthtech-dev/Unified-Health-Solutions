// migrations/20240601000000-add-distributor-id-to-stock-items.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add distributor_id column
    await queryInterface.addColumn('stock_items', 'distributor_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('stock_items', {
      fields: ['distributor_id'],
      type: 'foreign key',
      name: 'fk_stock_items_distributor_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Create index for better query performance
    await queryInterface.addIndex('stock_items', ['distributor_id'], {
      name: 'idx_stock_items_distributor_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('stock_items', 'idx_stock_items_distributor_id');
    
    // Remove foreign key constraint
    await queryInterface.removeConstraint('stock_items', 'fk_stock_items_distributor_id');
    
    // Remove column
    await queryInterface.removeColumn('stock_items', 'distributor_id');
  }
};