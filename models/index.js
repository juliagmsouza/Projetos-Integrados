const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Contato = require('./contato')(sequelize, Sequelize.DataTypes);
const Endereco = require('./endereco')(sequelize, Sequelize.DataTypes);
const Usuario = require('./usuario');

Contato.hasOne(Endereco, { foreignKey: 'contatoId', onDelete: 'CASCADE' });
Endereco.belongsTo(Contato, { foreignKey: 'contatoId' });

module.exports = {
  Contato,
  Endereco,
  Usuario,
  sequelize
};
