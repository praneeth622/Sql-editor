import { TokenType } from './lexer';

class SQLParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek(offset = 0) {
    return this.tokens[this.position + offset] || null;
  }

  consume() {
    return this.tokens[this.position++] || null;
  }

  match(type, value = null) {
    const token = this.peek();
    if (
      token &&
      token.type === type &&
      (!value || token.value.toUpperCase() === value.toUpperCase())
    ) {
      this.consume();
      return true;
    }
    return false;
  }

  expect(type, value = null) {
    const token = this.peek();
    if (!token) {
      throw new Error(
        `Expected ${type}${value ? ` (${value})` : ''}, but got end of input`
      );
    }
    if (
      token.type !== type ||
      (value && token.value.toUpperCase() !== value.toUpperCase())
    ) {
      throw new Error(
        `Expected ${type}${value ? ` (${value})` : ''}, but got ${token.type} (${token.value})`
      );
    }
    return this.consume();
  }

  parse() {
    const token = this.peek();
    if (!token) throw new Error('Empty query');

    switch (token.value.toUpperCase()) {
      case 'SELECT':
        return this.parseSelect();
      case 'INSERT':
        return this.parseInsert();
      case 'UPDATE':
        return this.parseUpdate();
      case 'DELETE':
        return this.parseDelete();
      case 'SHOW':
        return this.parseShow();
      default:
        throw new Error(`Unsupported command: ${token.value}`);
    }
  }

  parseSelect() {
    this.expect(TokenType.KEYWORD, 'SELECT');

    const columns = this.parseColumnList();

    this.expect(TokenType.KEYWORD, 'FROM');
    const table = this.expect(TokenType.IDENTIFIER).value;

    let where = null;
    if (this.match(TokenType.KEYWORD, 'WHERE')) {
      where = this.parseExpression();
    }

    return {
      type: 'SELECT',
      columns,
      table,
      where,
    };
  }

  parseColumnList() {
    const columns = [];
    do {
      if (this.match(TokenType.OPERATOR, '*')) {
        columns.push('*');
      } else {
        const column = this.expect(TokenType.IDENTIFIER);
        columns.push(column.value);
      }
    } while (this.match(TokenType.PUNCTUATION, ','));
    return columns;
  }

  parseInsert() {
    this.expect(TokenType.KEYWORD, 'INSERT');
    this.expect(TokenType.KEYWORD, 'INTO');

    const table = this.expect(TokenType.IDENTIFIER).value;
    let columns = [];

    if (this.match(TokenType.PUNCTUATION, '(')) {
      columns = this.parseIdentifierList();
      this.expect(TokenType.PUNCTUATION, ')');
    }

    this.expect(TokenType.KEYWORD, 'VALUES');

    const valuesList = this.parseValuesList();

    return {
      type: 'INSERT',
      table,
      columns,
      valuesList,
    };
  }

  parseIdentifierList() {
    const identifiers = [];
    do {
      const identifier = this.expect(TokenType.IDENTIFIER);
      identifiers.push(identifier.value);
    } while (this.match(TokenType.PUNCTUATION, ','));
    return identifiers;
  }

  parseValuesList() {
    const valuesList = [];
    do {
      this.expect(TokenType.PUNCTUATION, '(');
      const values = [];
      do {
        const value = this.parseValue();
        values.push(value);
      } while (this.match(TokenType.PUNCTUATION, ','));
      this.expect(TokenType.PUNCTUATION, ')');
      valuesList.push(values);
    } while (this.match(TokenType.PUNCTUATION, ','));
    return valuesList;
  }
  

  parseValue() {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end of input');

    if (
      [TokenType.STRING, TokenType.NUMBER, TokenType.IDENTIFIER].includes(
        token.type
      )
    ) {
      return this.consume();
    }

    throw new Error(
      `Unexpected token ${token.type} (${token.value}) at position ${this.position}`
    );
  }

  parseUpdate() {
    this.expect(TokenType.KEYWORD, 'UPDATE');
    const table = this.expect(TokenType.IDENTIFIER).value;

    this.expect(TokenType.KEYWORD, 'SET');
    const assignments = this.parseAssignments();

    let where = null;
    if (this.match(TokenType.KEYWORD, 'WHERE')) {
      where = this.parseExpression();
    }

    return {
      type: 'UPDATE',
      table,
      assignments,
      where,
    };
  }

  parseAssignments() {
    const assignments = [];
    do {
      const column = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.OPERATOR, '=');
      const value = this.parseValue();
      assignments.push({ column, value });
    } while (this.match(TokenType.PUNCTUATION, ','));
    return assignments;
  }

  parseDelete() {
    this.expect(TokenType.KEYWORD, 'DELETE');
    this.expect(TokenType.KEYWORD, 'FROM');
    const table = this.expect(TokenType.IDENTIFIER).value;

    let where = null;
    if (this.match(TokenType.KEYWORD, 'WHERE')) {
      where = this.parseExpression();
    }

    return {
      type: 'DELETE',
      table,
      where,
    };
  }

  parseShow() {
    this.expect(TokenType.KEYWORD, 'SHOW');

    if (this.match(TokenType.KEYWORD, 'TABLES')) {
      // Optional semicolon at the end
      this.match(TokenType.PUNCTUATION, ';');

      return {
        type: 'SHOW_TABLES',
      };
    } else {
      throw new Error(`Expected TABLES after SHOW, but got ${this.peek().value}`);
    }
  }

  parseExpression() {
    return this.parseLogicalOr();
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();

    while (this.match(TokenType.KEYWORD, 'OR')) {
      const right = this.parseLogicalAnd();
      left = {
        type: 'BinaryExpression',
        operator: 'OR',
        left,
        right,
      };
    }

    return left;
  }

  parseLogicalAnd() {
    let left = this.parseEquality();

    while (this.match(TokenType.KEYWORD, 'AND')) {
      const right = this.parseEquality();
      left = {
        type: 'BinaryExpression',
        operator: 'AND',
        left,
        right,
      };
    }

    return left;
  }

  parseEquality() {
    let left = this.parseRelational();

    while (true) {
      if (this.match(TokenType.OPERATOR, '=')) {
        const right = this.parseRelational();
        left = {
          type: 'BinaryExpression',
          operator: '=',
          left,
          right,
        };
      } else if (this.match(TokenType.OPERATOR, '<>')) {
        const right = this.parseRelational();
        left = {
          type: 'BinaryExpression',
          operator: '<>',
          left,
          right,
        };
      } else {
        break;
      }
    }

    return left;
  }

  parseRelational() {
    let left = this.parseAdditive();

    while (true) {
      if (this.match(TokenType.OPERATOR, '<')) {
        const right = this.parseAdditive();
        left = {
          type: 'BinaryExpression',
          operator: '<',
          left,
          right,
        };
      } else if (this.match(TokenType.OPERATOR, '>')) {
        const right = this.parseAdditive();
        left = {
          type: 'BinaryExpression',
          operator: '>',
          left,
          right,
        };
      } else if (this.match(TokenType.OPERATOR, '<=')) {
        const right = this.parseAdditive();
        left = {
          type: 'BinaryExpression',
          operator: '<=',
          left,
          right,
        };
      } else if (this.match(TokenType.OPERATOR, '>=')) {
        const right = this.parseAdditive();
        left = {
          type: 'BinaryExpression',
          operator: '>=',
          left,
          right,
        };
      } else {
        break;
      }
    }

    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (true) {
      if (this.match(TokenType.OPERATOR, '+')) {
        const right = this.parseMultiplicative();
        left = {
          type: 'BinaryExpression',
          operator: '+',
          left,
          right,
        };
      } else if (this.match(TokenType.OPERATOR, '-')) {
        const right = this.parseMultiplicative();
        left = {
          type: 'BinaryExpression',
          operator: '-',
          left,
          right,
        };
      } else {
        break;
      }
    }

    return left;
  }

  parseMultiplicative() {
    let left = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.OPERATOR, '*')) {
        const right = this.parsePrimary();
        left = {
          type: 'BinaryExpression',
          operator: '*',
          left,
          right,
        };
      } else if (this.match(TokenType.OPERATOR, '/')) {
        const right = this.parsePrimary();
        left = {
          type: 'BinaryExpression',
          operator: '/',
          left,
          right,
        };
      } else {
        break;
      }
    }

    return left;
  }

  parsePrimary() {
    const token = this.peek();

    if (!token) {
      throw new Error('Unexpected end of input');
    }

    if (token.type === TokenType.IDENTIFIER) {
      this.consume();
      return {
        type: 'Identifier',
        value: token.value,
      };
    }

    if (token.type === TokenType.NUMBER || token.type === TokenType.STRING) {
      this.consume();
      return {
        type: 'Literal',
        value: token.value,
        valueType: token.type,
      };
    }

    if (this.match(TokenType.PUNCTUATION, '(')) {
      const expression = this.parseExpression();
      this.expect(TokenType.PUNCTUATION, ')');
      return expression;
    }

    throw new Error(
      `Unexpected token ${token.type} (${token.value}) at position ${this.position}`
    );
  }
}

export function parseSQL(tokens) {
  const parser = new SQLParser(tokens);
  const ast = parser.parse();
  return ast;
}
