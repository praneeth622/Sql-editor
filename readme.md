# SQL Editor

A web-based SQL editor that allows users to input SQL queries, parse them, execute them against a mock database, and display the results. This project simulates basic SQL operations using React for the frontend and JavaScript for the parsing and execution logic.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Using the SQL Editor](#using-the-sql-editor)
- [Project Structure](#project-structure)
- [Built With](#built-with)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Features

- **SQL Query Execution**: Supports `SELECT`, `INSERT`, `UPDATE`, and `DELETE` commands.
- **SQL Parsing**: Lexical analyzer and parser convert SQL queries into an Abstract Syntax Tree (AST).
- **Mock Database**: Simulates a database using in-memory JavaScript objects managed by React state.
- **Parse Tree Display**: Shows the parsed AST for each query for educational purposes.
- **Error Handling**: Provides meaningful error messages for syntax errors or unsupported commands.
- **Sample Templates**: Quick-insert buttons for sample SQL queries to facilitate testing.
- **Responsive UI**: User-friendly interface built with React and styled for readability.


## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js** (v12 or later)
- **npm** (v6 or later)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/praneeth622/Sql-editor.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd Sql-editor
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Start the Development Server**

   ```bash
   npm run dev
   ```

   This will run the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Usage

### Running the Application

After starting the development server, the application should automatically open in your default web browser. If it doesn't, navigate to [http://localhost:5173](http://localhost:5173).

### Using the SQL Editor

1. **Input SQL Queries**

   - Type your SQL queries into the editor textarea.
   - Alternatively, use the sample template buttons to insert example queries.

2. **Execute Queries**

   - Click the **Run** button to execute the query.
   - The results or success messages will be displayed below the editor.

3. **View Parse Tree**

   - The parsed Abstract Syntax Tree (AST) of your SQL query is displayed for educational purposes.
   - This helps in understanding how the query is interpreted by the parser.

4. **Clear Editor**

   - Use the **Clear** button to reset the editor and outputs.

### Example Queries

**SELECT Query**

```sql
SELECT * FROM users;
```

**INSERT Query**

```sql
INSERT INTO users (id, name, email) VALUES (3, 'Charlie', 'charlie@example.com');
```

**UPDATE Query**

```sql
UPDATE users SET email = 'alice.new@example.com' WHERE id = 1;
```

**DELETE Query**

```sql
DELETE FROM users WHERE id = 2;
```

## Project Structure

```
src/
├── components/
│   └── SQLEditor.js     # Main React component
├── utils/
│   ├── lexer.js         # Lexical analyzer
│   └── parser.js        # SQL parser
├── App.js               # Entry point for React
└── index.js             # Renders the App component
```

- **`components/SQLEditor.js`**: Contains the main SQL editor component, including the execution logic and state management.
- **`utils/lexer.js`**: Implements the lexical analyzer that tokenizes SQL input.
- **`utils/parser.js`**: Parses tokens from the lexer into an AST.
- **`App.js`**: The root component that renders `SQLEditor`.
- **`index.js`**: Entry point that renders `App` to the DOM.

## Built With

- [React](https://reactjs.org/) - Frontend library for building user interfaces
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Programming language used for logic
- [Node.js](https://nodejs.org/) - JavaScript runtime environment
- [npm](https://www.npmjs.com/) - Package manager for Node.js
- [Lucide React](https://lucide.dev/docs/lucide-react) - Icon library for React

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

   Click the "Fork" button at the top right of the [GitHub page](https://github.com/praneeth622/Sql-editor) to create a copy of this repository in your GitHub account.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/Sql-editor.git
   cd Sql-editor
   ```

3. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Commit Your Changes**

   ```bash
   git commit -am 'Add some feature'
   ```

5. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Open a Pull Request**

   Submit a pull request to the original repository explaining your changes.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- **Inspiration**: This project was inspired by the need for an educational tool to understand SQL parsing and execution.
- **Resources**:
  - [React Documentation](https://reactjs.org/docs/getting-started.html)
  - [Mozilla Developer Network](https://developer.mozilla.org/en-US/)
  - [Lucide Icons](https://lucide.dev/)

## Contact

For any questions or suggestions, please feel free to reach out:

- **GitHub**: [praneeth622](https://github.com/praneeth622)


---

Thank you for checking out this project! If you found it helpful, please consider giving it a star on GitHub.