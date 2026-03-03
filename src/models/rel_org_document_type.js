module.exports = function (sequelize, DataTypes) {
	return sequelize.define('rel_org_document_type', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		org_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "organization_master",
				key: "id"
			}
		},
		doc_type_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "document_type_master",
				key: "id"
			}
		},
		doc_copy:
		{
			type: DataTypes.ARRAY(DataTypes.TEXT),
			allowNull: true
		},
		report_date:
		{
			type: DataTypes.DATE,
			allowNull: true
		},
		expiry_date:
		{
			type: DataTypes.DATE,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'rel_org_document_type',
		schema: 'public',
		timestamps: false
	});
};