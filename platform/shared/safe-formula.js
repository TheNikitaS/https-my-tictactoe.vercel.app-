function isWhitespace(char) {
  return /\s/.test(char);
}

function isDigit(char) {
  return /[0-9]/.test(char);
}

function isIdentifierStart(char) {
  return /[A-Za-zА-Яа-яЁё_]/.test(char);
}

function isIdentifierPart(char) {
  return /[A-Za-zА-Яа-яЁё0-9_]/.test(char);
}

function tokenize(input) {
  const source = String(input || "");
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (isWhitespace(char)) {
      index += 1;
      continue;
    }

    const triple = source.slice(index, index + 3);
    const double = source.slice(index, index + 2);

    if (["!==", "===", "&&", "||", ">=", "<=", "==", "!="].includes(double) || ["!==", "==="].includes(triple)) {
      const value = ["!==", "==="].includes(triple) ? triple : double;
      tokens.push({ type: "operator", value });
      index += value.length;
      continue;
    }

    if ("+-*/%()!,?:<>".includes(char)) {
      tokens.push({
        type: "()?,:".includes(char) ? "punctuation" : "operator",
        value: char
      });
      index += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      let value = "";
      index += 1;
      while (index < source.length) {
        const current = source[index];
        if (current === "\\") {
          const next = source[index + 1];
          if (typeof next === "string") {
            value += next;
            index += 2;
            continue;
          }
        }
        if (current === quote) {
          index += 1;
          break;
        }
        value += current;
        index += 1;
      }
      tokens.push({ type: "string", value });
      continue;
    }

    if (isDigit(char) || (char === "." && isDigit(source[index + 1] || ""))) {
      let value = char;
      index += 1;
      while (index < source.length) {
        const current = source[index];
        if (!(isDigit(current) || current === ".")) break;
        value += current;
        index += 1;
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (isIdentifierStart(char)) {
      let value = char;
      index += 1;
      while (index < source.length && isIdentifierPart(source[index])) {
        value += source[index];
        index += 1;
      }
      tokens.push({ type: "identifier", value });
      continue;
    }

    throw new Error(`Недопустимый символ в формуле: ${char}`);
  }

  return tokens;
}

function createParser(tokens) {
  let index = 0;

  function peek() {
    return tokens[index] || null;
  }

  function match(type, value) {
    const token = peek();
    if (!token) return false;
    if (type && token.type !== type) return false;
    if (typeof value !== "undefined" && token.value !== value) return false;
    index += 1;
    return token;
  }

  function expect(type, value, label) {
    const token = match(type, value);
    if (!token) {
      throw new Error(label || `Ожидался токен ${value || type}`);
    }
    return token;
  }

  function parseExpression() {
    return parseTernary();
  }

  function parseTernary() {
    const test = parseLogicalOr();
    if (match("punctuation", "?")) {
      const consequent = parseExpression();
      expect("punctuation", ":", "В тернарном операторе пропущено ':'");
      const alternate = parseExpression();
      return { type: "ternary", test, consequent, alternate };
    }
    return test;
  }

  function parseLogicalOr() {
    let node = parseLogicalAnd();
    while (match("operator", "||")) {
      node = { type: "binary", operator: "||", left: node, right: parseLogicalAnd() };
    }
    return node;
  }

  function parseLogicalAnd() {
    let node = parseEquality();
    while (match("operator", "&&")) {
      node = { type: "binary", operator: "&&", left: node, right: parseEquality() };
    }
    return node;
  }

  function parseEquality() {
    let node = parseComparison();
    while (true) {
      const operator =
        match("operator", "===") ||
        match("operator", "!==") ||
        match("operator", "==") ||
        match("operator", "!=");
      if (!operator) break;
      node = { type: "binary", operator: operator.value, left: node, right: parseComparison() };
    }
    return node;
  }

  function parseComparison() {
    let node = parseAdditive();
    while (true) {
      const operator =
        match("operator", ">=") ||
        match("operator", "<=") ||
        match("operator", ">") ||
        match("operator", "<");
      if (!operator) break;
      node = { type: "binary", operator: operator.value, left: node, right: parseAdditive() };
    }
    return node;
  }

  function parseAdditive() {
    let node = parseMultiplicative();
    while (true) {
      const operator = match("operator", "+") || match("operator", "-");
      if (!operator) break;
      node = { type: "binary", operator: operator.value, left: node, right: parseMultiplicative() };
    }
    return node;
  }

  function parseMultiplicative() {
    let node = parseUnary();
    while (true) {
      const operator = match("operator", "*") || match("operator", "/") || match("operator", "%");
      if (!operator) break;
      node = { type: "binary", operator: operator.value, left: node, right: parseUnary() };
    }
    return node;
  }

  function parseUnary() {
    const operator = match("operator", "!") || match("operator", "-") || match("operator", "+");
    if (operator) {
      return { type: "unary", operator: operator.value, argument: parseUnary() };
    }
    return parsePrimary();
  }

  function parseArguments() {
    const args = [];
    if (match("punctuation", ")")) return args;
    do {
      args.push(parseExpression());
    } while (match("punctuation", ","));
    expect("punctuation", ")", "Пропущена закрывающая скобка аргументов");
    return args;
  }

  function parsePrimary() {
    const token = peek();
    if (!token) throw new Error("Формула закончилась неожиданно");

    if (match("punctuation", "(")) {
      const expression = parseExpression();
      expect("punctuation", ")", "Пропущена закрывающая скобка");
      return expression;
    }

    if (token.type === "number") {
      index += 1;
      return { type: "literal", value: Number(token.value) };
    }

    if (token.type === "string") {
      index += 1;
      return { type: "literal", value: token.value };
    }

    if (token.type === "identifier") {
      index += 1;
      const normalized = token.value.toLowerCase();
      if (normalized === "true") return { type: "literal", value: true };
      if (normalized === "false") return { type: "literal", value: false };
      if (normalized === "null") return { type: "literal", value: null };
      if (match("punctuation", "(")) {
        return {
          type: "call",
          callee: token.value,
          arguments: parseArguments()
        };
      }
      return { type: "identifier", name: token.value };
    }

    throw new Error(`Неожиданный токен ${token.value}`);
  }

  const ast = parseExpression();
  if (peek()) {
    throw new Error(`Лишний фрагмент в формуле: ${peek().value}`);
  }
  return ast;
}

function evaluateAst(node, scope) {
  if (!node) return null;

  if (node.type === "literal") return node.value;

  if (node.type === "identifier") {
    if (!Object.prototype.hasOwnProperty.call(scope.variables, node.name)) {
      throw new Error(`Неизвестная переменная: ${node.name}`);
    }
    return scope.variables[node.name];
  }

  if (node.type === "call") {
    const fn = scope.functions[node.callee];
    if (typeof fn !== "function") {
      throw new Error(`Неизвестная функция: ${node.callee}`);
    }
    const args = node.arguments.map((arg) => evaluateAst(arg, scope));
    return fn(...args);
  }

  if (node.type === "unary") {
    const value = evaluateAst(node.argument, scope);
    if (node.operator === "!") return !value;
    if (node.operator === "-") return -Number(value || 0);
    if (node.operator === "+") return Number(value || 0);
  }

  if (node.type === "binary") {
    const left = evaluateAst(node.left, scope);
    const right = evaluateAst(node.right, scope);
    switch (node.operator) {
      case "+":
        return typeof left === "string" || typeof right === "string" ? `${left ?? ""}${right ?? ""}` : Number(left || 0) + Number(right || 0);
      case "-":
        return Number(left || 0) - Number(right || 0);
      case "*":
        return Number(left || 0) * Number(right || 0);
      case "/":
        return Number(right || 0) === 0 ? 0 : Number(left || 0) / Number(right || 0);
      case "%":
        return Number(right || 0) === 0 ? 0 : Number(left || 0) % Number(right || 0);
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case "==":
        return left == right;
      case "!=":
        return left != right;
      case "===":
        return left === right;
      case "!==":
        return left !== right;
      case "&&":
        return Boolean(left && right);
      case "||":
        return Boolean(left || right);
      default:
        throw new Error(`Неподдерживаемый оператор: ${node.operator}`);
    }
  }

  if (node.type === "ternary") {
    return evaluateAst(node.test, scope)
      ? evaluateAst(node.consequent, scope)
      : evaluateAst(node.alternate, scope);
  }

  throw new Error(`Неподдерживаемый узел формулы: ${node.type}`);
}

export function evaluateSafeFormula(expression, scope = {}) {
  const ast = createParser(tokenize(expression));
  return evaluateAst(ast, {
    variables: scope.variables || {},
    functions: scope.functions || {}
  });
}
