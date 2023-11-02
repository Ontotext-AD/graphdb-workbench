angular
    .module('graphdb.framework.explore.services', [])
    .factory('StatementsService', StatementsService);

StatementsService.$inject = [];

function StatementsService() {
    function transformToTrig(statements) {
        let data = '';
        const contexts = {};

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.context === undefined) {
                statement.context = '';
            } else {
                statement.context = _.trim(statement.context);
            }
            if (angular.isUndefined(contexts[statement.context])) {
                const cstatement = [];
                cstatement.push(statement);
                contexts[statement.context] = cstatement;
            } else {
                contexts[statement.context].push(statement);
            }
        }

        const ckeys = Object.keys(contexts);
        for (let i = 0; i < ckeys.length; i++) {
            const key = ckeys[i];
            if (key === '') {
                data += '\n{';
            } else {
                data += '\n<' + key + '> {';
            }

            const value = contexts[key];
            for (let j = 0; j < value.length; j++) {
                const statement = value[j];
                data += '\n\t<' + statement.subject + '> <' + statement.predicate + '> ';
                const statementObjectValue = statement.object.value;
                if (statement.object.type === 'uri') {
                    data += '<' + statementObjectValue + '> .';
                } else {
                    if (statementObjectValue.toString().includes('"')) {
                        data += "'''" + statementObjectValue + "'''" + (statement.object.datatype ? '^^<' + statement.object.datatype + '>' : (statement.object.lang ? '@' + statement.object.lang : '')) + ' .';
                    } else {
                        data += '"""' + statementObjectValue + '"""' + (statement.object.datatype ? '^^<' + statement.object.datatype + '>' : (statement.object.lang ? '@' + statement.object.lang : '')) + ' .';
                    }
                }
            }

            data += '\n}';
        }

        return data;
    }

    function buildStatements(res, uri) {
        const statements = [];
        if (!_.isEmpty(res.data)) {
            const graph = res.data[uri];
            const predicates = Object.keys(graph);
            for (let i = 0; i < predicates.length; i++) {
                const predicate = predicates[i];
                const objects = graph[predicate];
                for (let j = 0; j < objects.length; j++) {
                    const object = objects[j];
                    for (let k = 0; k < object.graphs.length; k++) {
                        let context = object.graphs[k];
                        if (context === 'http://www.ontotext.com/explicit') {
                            // Statements in the default context are special
                            context = '';
                        }
                        if (object.lang) {
                            object.datatype = '';
                        }
                        if (!object.datatype) {
                            object.datatype = '';
                        }
                        statements.push({
                            subject: uri,
                            predicate: predicate,
                            object: {
                                value: object.value,
                                type: object.type,
                                datatype: object.datatype,
                                lang: object.lang
                            },
                            context: context
                        });
                    }
                }
            }
        }
        return statements;
    }

    function getDatatypeOptions() {
        return [
            {
                value: '',
                label: 'string'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#boolean',
                label: 'boolean'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#decimal',
                label: 'decimal'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#integer',
                label: 'integer'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#double',
                label: 'double'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#float',
                label: 'float'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#date',
                label: 'date'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#time',
                label: 'time'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#dateTime',
                label: 'date time'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#byte',
                label: 'byte'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#short',
                label: 'short'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#int',
                label: 'int'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#long',
                label: 'long'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#unsignedByte',
                label: 'unsigned byte'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#unsignedShort',
                label: 'unsigned short'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#unsignedInt',
                label: 'unsigned int'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#unsignedLong',
                label: 'unsigned long'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#positoveInteger',
                label: 'positive integer'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
                label: 'non-negative integer'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#negativeInteger',
                label: 'negative integer'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
                label: 'non-positive integer'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#gYear',
                label: 'gYear'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#gMonth',
                label: 'gMonth'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#gDay',
                label: 'gDay'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#gYearMonth',
                label: 'gYearMonth'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#gMonthDay',
                label: 'gMonthDay'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#duration',
                label: 'duration'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#hexBinary',
                label: 'hex binary'
            }, {
                value: 'http://www.w3.org/2001/XMLSchema#base64Binary',
                label: 'base64 binary'
            }
        ];
    }

    return {
        transformToTrig: transformToTrig,
        buildStatements: buildStatements,
        getDatatypeOptions: getDatatypeOptions
    };
}
