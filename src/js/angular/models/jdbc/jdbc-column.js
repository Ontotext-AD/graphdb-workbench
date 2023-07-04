/**
 * DTO
 */
export class JdbcColumn {
    constructor() {
        this.column_name = '';
        this.column_type = '';
        this.sparql_type = '';
        this.nullable = true;
    }
}

/**
 * Constructs an array with {@link JdbcColumn} objects for everyone column of <code>columnNames</code>.
 *
 * @param {string[]} columnNames - array with column names.
 * @param {Object} columnTypes - objects that holds key-value pair. The key is column id, the value is {@link JdbcColumnType} object.
 * @return {JdbcColumn[]} the array with jdbc columns.
 */
export const toJDBCColumns = (columnNames = [], columnTypes) => {
    return columnNames.map((columnName) => {
        return {
            column_name: columnName,
            column_type: columnTypes[columnName].column_type,
            nullable: true,
            sparql_type: columnTypes[columnName].sparql_type
        };
    });
};

export const updateColumn = (column, columnSuggestion) => {
    column.column_type = columnSuggestion[column.column_name].column_type;
    column.sparql_type = columnSuggestion[column.column_name].sparql_type;
};
