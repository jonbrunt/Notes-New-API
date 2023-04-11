const { EntitySchema } = require('typeorm');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 11;

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    email: {
      type: 'varchar',
      nullable: false,
      unique: true,
      transformer: {
        to: (value) => value.toLowerCase(),
        from: (value) => value,
      },
    },
    password: {
      type: 'varchar',
      nullable: false,
    },
  },
  listeners: {
    beforeInsert: async (event) => {
      const user = event.entity;
      user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    },
  },
  methods: {
    checkPassword: async (user, rawPassword) => {
      return bcrypt.compare(rawPassword, user.password);
    },
  },
  relations: {
    notes: {
      target: 'Note',
      type: 'one-to-many',
      inverseSide: 'user',
      onDelete: 'CASCADE'
    }
  }
});
