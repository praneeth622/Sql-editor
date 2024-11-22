// src/components/SQLEditor.js

import React, { useState } from 'react';
import { Terminal, Code2, Play, Trash2 } from 'lucide-react';
import { lexicalAnalysis } from '../utils/lexer';
import { parseSQL } from '../utils/parser';

const SQL_TEMPLATES = {
  select: 'SELECT * FROM users;',
  insert: "INSERT INTO users (id, name, email) VALUES (3, 'Charlie', 'charlie@example.com');",
  update: "UPDATE users SET email = 'alice.new@example.com' WHERE id = 1;",
  delete: 'DELETE FROM users WHERE id = 2;',
};

const SQLEditor = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [parseTree, setParseTree] = useState(null);

  // Initialize mockDatabase in state
  const [mockDatabase, setMockDatabase] = useState({
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ],
    orders: [],
    products: [],
  });

  const executeQuery = () => {
    try {
      const tokens = lexicalAnalysis(query);
      const ast = parseSQL(tokens);

      const result = executeAST(ast, mockDatabase, setMockDatabase);

      setResult(result);
      setParseTree(ast);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const executeAST = (ast, db, setDB) => {
    switch (ast.type) {
      case 'SHOW_TABLES':
        return {
          columns: ['Tables_in_database'],
          rows: Object.keys(db).map((table) => [table]),
        };

      case 'SELECT':
        return executeSelect(ast, db);

      case 'INSERT':
        return executeInsert(ast, db, setDB);

      case 'UPDATE':
        return executeUpdate(ast, db, setDB);

      case 'DELETE':
        return executeDelete(ast, db, setDB);

      default:
        throw new Error(`Unsupported AST type: ${ast.type}`);
    }
  };

  const executeSelect = (ast, db) => {
    const tableName = ast.table;
    const tableData = db[tableName];

    if (!tableData) {
      throw new Error(`Table '${tableName}' not found`);
    }

    // Apply WHERE clause if present
    let rows = tableData;
    if (ast.where) {
      rows = rows.filter((row) => evaluateExpression(row, ast.where));
    }

    // Select specified columns
    const columns =
      ast.columns.includes('*') ? Object.keys(tableData[0]) : ast.columns;
    const resultRows = rows.map((row) =>
      columns.map((col) => (row.hasOwnProperty(col) ? row[col] : null))
    );

    return {
      columns,
      rows: resultRows,
    };
  };

  const executeInsert = (ast, db, setDB) => {
    const tableName = ast.table;
    const tableData = db[tableName];

    if (!tableData) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const newRecords = ast.valuesList.map((values) => {
      const record = {};
      if (ast.columns.length !== values.length) {
        throw new Error('Column count does not match value count');
      }
      ast.columns.forEach((col, index) => {
        record[col] = parseValue(values[index]);
      });
      return record;
    });

    // Update the mockDatabase state
    setDB((prevDB) => ({
      ...prevDB,
      [tableName]: [...prevDB[tableName], ...newRecords],
    }));

    return {
      message: `Inserted ${ast.valuesList.length} record(s) into '${tableName}' table`,
    };
  };

  const executeUpdate = (ast, db, setDB) => {
    const tableName = ast.table;
    const tableData = db[tableName];

    if (!tableData) {
      throw new Error(`Table '${tableName}' not found`);
    }

    let rowsAffected = 0;
    const updatedTableData = tableData.map((row) => {
      if (!ast.where || evaluateExpression(row, ast.where)) {
        ast.assignments.forEach((assign) => {
          row[assign.column] = parseValue(assign.value);
        });
        rowsAffected++;
      }
      return row;
    });

    // Update the mockDatabase state
    setDB((prevDB) => ({
      ...prevDB,
      [tableName]: updatedTableData,
    }));

    return {
      message: `Updated ${rowsAffected} record(s) in '${tableName}' table`,
    };
  };

  const executeDelete = (ast, db, setDB) => {
    const tableName = ast.table;
    const tableData = db[tableName];

    if (!tableData) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const initialLength = tableData.length;
    const updatedTableData = tableData.filter((row) => {
      return ast.where ? !evaluateExpression(row, ast.where) : false;
    });

    const rowsDeleted = initialLength - updatedTableData.length;

    // Update the mockDatabase state
    setDB((prevDB) => ({
      ...prevDB,
      [tableName]: updatedTableData,
    }));

    return {
      message: `Deleted ${rowsDeleted} record(s) from '${tableName}' table`,
    };
  };

  const evaluateExpression = (row, expression) => {
    switch (expression.type) {
      case 'BinaryExpression':
        const left = getValue(row, expression.left);
        const right = getValue(row, expression.right);

        switch (expression.operator) {
          case '=':
            return left == right;
          case '<>':
            return left != right;
          case '>':
            return left > right;
          case '<':
            return left < right;
          case '>=':
            return left >= right;
          case '<=':
            return left <= right;
          case 'AND':
            return (
              evaluateExpression(row, expression.left) &&
              evaluateExpression(row, expression.right)
            );
          case 'OR':
            return (
              evaluateExpression(row, expression.left) ||
              evaluateExpression(row, expression.right)
            );
          default:
            throw new Error(
              `Unsupported operator in WHERE clause: ${expression.operator}`
            );
        }

      case 'Literal':
        return parseValue(expression);

      case 'Identifier':
        return row[expression.value];

      default:
        throw new Error(`Unsupported expression type: ${expression.type}`);
    }
  };

  const getValue = (row, operand) => {
    switch (operand.type) {
      case 'Literal':
        return parseValue(operand);
      case 'Identifier':
        return row[operand.value];
      default:
        throw new Error(`Unsupported operand type: ${operand.type}`);
    }
  };

  const parseValue = (token) => {
    switch (token.valueType || token.type) {
      case 'NUMBER':
        return parseFloat(token.value);
      case 'STRING':
        return token.value;
      case 'IDENTIFIER':
        return token.value; // Treat as string if necessary
      default:
        throw new Error(`Unsupported token type: ${token.type}`);
    }
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setError(null);
  };

  const clearEditor = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setParseTree(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6" />
          <h1 className="text-2xl font-bold">SQL Editor</h1>
        </div>

        {/* Template Buttons */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(SQL_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setQuery(template)}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-sm"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} Example
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span className="text-sm font-medium">SQL Query</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={executeQuery}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={clearEditor}
                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={query}
            onChange={handleQueryChange}
            className="w-full h-40 p-4 font-mono text-sm focus:outline-none"
            placeholder="Enter your SQL query here..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h2 className="font-bold mb-2">Error</h2>
            <pre className="text-sm">{error}</pre>
          </div>
        )}

        {/* Success Message */}
        {result && result.message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            <h2 className="font-bold mb-2">Success</h2>
            <pre className="text-sm">{result.message}</pre>
          </div>
        )}

        {/* Results Table */}
        {result && result.columns && result.rows && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-2">
              <h2 className="font-medium">Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {result.columns.map((col) => (
                      <th key={col} className="px-4 py-2 text-left border-b">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 border-b">
                          {cell !== null && cell !== undefined ? cell.toString() : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Parse Tree Display */}
        {parseTree && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-2">
              <h2 className="font-medium">Parse Tree</h2>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
              {JSON.stringify(parseTree, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLEditor;
