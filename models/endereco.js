module.exports = (sequelize, DataTypes) => {
    const Endereco = sequelize.define('Endereco', {
      rua: DataTypes.STRING,
      cidade: DataTypes.STRING,
      estado: DataTypes.STRING,
      cep: DataTypes.STRING,
      contatoId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Contatos',
          key: 'id'
        }
      }
    });
  
    Endereco.associate = (models) => {
      Endereco.belongsTo(models.Contato, { foreignKey: 'contatoId' });
    };
  
    return Endereco;
  };
  