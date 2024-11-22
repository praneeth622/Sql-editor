// src/utils/lexer.js

// Token types
export const TokenType = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    OPERATOR: 'OPERATOR',
    PUNCTUATION: 'PUNCTUATION',
    WHITESPACE: 'WHITESPACE',
    ERROR: 'ERROR',
  };
  
  // SQL Keywords
  const KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES',
    'UPDATE', 'SET', 'DELETE', 'AND', 'OR', 'NOT', 'NULL',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'PRIMARY',
    'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CONSTRAINT',
    'SHOW', 'TABLES',
  ]);
  
  // Operators
  const OPERATORS = new Set([
    '=', '<', '>', '<=', '>=', '<>', '+', '-', '*', '/', '%',
  ]);
  
  class Token {
    constructor(type, value, position) {
      this.type = type;
      this.value = value;
      this.position = position;
    }
  }
  
  class LexicalAnalyzer {
    constructor(input) {
      this.input = input;
      this.position = 0;
      this.tokens = [];
    }
  
    isWhitespace(char) {
      return /\s/.test(char);
    }
  
    isLetter(char) {
      return /[a-zA-Z]/.test(char);
    }
  
    isDigit(char) {
      return /[0-9]/.test(char);
    }
  
    isIdentifierChar(char) {
      return this.isLetter(char) || this.isDigit(char) || char === '_';
    }
  
    peek() {
      return this.position < this.input.length ? this.input[this.position] : null;
    }
  
    advance() {
      this.position++;
    }
  
    tokenizeIdentifier() {
      let value = '';
      const startPos = this.position;
  
      while (this.peek() && this.isIdentifierChar(this.peek())) {
        value += this.peek();
        this.advance();
      }
  
      const upperValue = value.toUpperCase();
      if (KEYWORDS.has(upperValue)) {
        return new Token(TokenType.KEYWORD, upperValue, startPos);
      }
      return new Token(TokenType.IDENTIFIER, value, startPos);
    }
  
    tokenizeNumber() {
      let value = '';
      const startPos = this.position;
      let hasDecimalPoint = false;
  
      while (this.peek() && (this.isDigit(this.peek()) || this.peek() === '.')) {
        if (this.peek() === '.') {
          if (hasDecimalPoint) {
            break; // Stop if a second decimal point is found
          }
          hasDecimalPoint = true;
        }
        value += this.peek();
        this.advance();
      }
  
      return new Token(TokenType.NUMBER, value, startPos);
    }
  
    tokenizeString() {
      let value = '';
      const startPos = this.position;
      this.advance(); // Skip opening quote
  
      while (this.peek()) {
        if (this.peek() === "'") {
          if (this.input[this.position + 1] === "'") {
            // Handle escaped quote
            value += "'";
            this.advance(); // Skip the first quote
            this.advance(); // Skip the escaped quote
          } else {
            break; // End of string
          }
        } else {
          value += this.peek();
          this.advance();
        }
      }
  
      if (this.peek() === "'") {
        this.advance(); // Skip closing quote
        return new Token(TokenType.STRING, value, startPos);
      }
  
      throw new Error(`Unterminated string at position ${startPos}`);
    }
  
    tokenizeOperator() {
      let value = '';
      const startPos = this.position;
  
      while (this.peek() && OPERATORS.has(value + this.peek())) {
        value += this.peek();
        this.advance();
      }
  
      return new Token(TokenType.OPERATOR, value, startPos);
    }
  
    analyze() {
      while (this.position < this.input.length) {
        const char = this.peek();
  
        if (this.isWhitespace(char)) {
          while (this.peek() && this.isWhitespace(this.peek())) {
            this.advance();
          }
          continue;
        }
  
        if (this.isLetter(char)) {
          this.tokens.push(this.tokenizeIdentifier());
          continue;
        }
  
        if (this.isDigit(char)) {
          this.tokens.push(this.tokenizeNumber());
          continue;
        }
  
        if (char === "'") {
          this.tokens.push(this.tokenizeString());
          continue;
        }
  
        if (OPERATORS.has(char)) {
          this.tokens.push(this.tokenizeOperator());
          continue;
        }
  
        if ('(),;'.includes(char)) {
          this.tokens.push(new Token(TokenType.PUNCTUATION, char, this.position));
          this.advance();
          continue;
        }
  
        throw new Error(`Invalid character '${char}' at position ${this.position}`);
      }
  
      return this.tokens;
    }
  }
  
  export function lexicalAnalysis(query) {
    const lexer = new LexicalAnalyzer(query);
    return lexer.analyze();
  }
  