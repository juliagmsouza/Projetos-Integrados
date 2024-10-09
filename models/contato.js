module.exports = (sequelize, DataTypes) => {
    const Contato = sequelize.define('Contato', {
      nome: DataTypes.STRING,
      telefone: DataTypes.STRING,
      email: DataTypes.STRING,
      usuarioId: DataTypes.INTEGER,
      favorito: DataTypes.BOOLEAN
    });
  
    Contato.associate = (models) => {
      Contato.hasOne(models.Endereco, { foreignKey: 'contatoId', onDelete: 'CASCADE' });
    };
  
    return Contato;
  };
  