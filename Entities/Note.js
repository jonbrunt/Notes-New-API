const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Note',
  tableName: 'notes',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    title: {
      type: 'varchar',
    },
    body: {
      type: 'varchar',
    },
    created: {
      type: 'bigint',
      createDate: true,
      nullable: true
    },
    stamp: {
      type: 'varchar',
      createDate: true,
      nullable: true
    },
    email: { // this probably can be removed since it is now relational
      type: 'varchar'
    }
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'user_id' },
    },
  }
});
