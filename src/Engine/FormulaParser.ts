import { ErrorMessages } from "./GlobalDefinitions";

export class FormulaParser {
  private index: number = 0;
  private formula: FormulaType = [];

  constructor(formula: FormulaType) {
    this.formula = formula;
  }

  parse(): number {
    try {
      const result = this.parseExpression();
      if (this.index === this.formula.length) {
        return result;
      }
    } catch (error) {
      throw error;
    }
    return 0;
  }

  private parseExpression(): number {
    let leftValue = this.parseTerm();
    while (this.index < this.formula.length) {
      const operator = this.formula[this.index];
      if (operator === "+" || operator === "-") {
        this.index++;
        const rightValue = this.parseTerm();
        if (operator === "+") {
          leftValue += rightValue;
        } else {
          leftValue -= rightValue;
        }
      } else {
        break;
      }
    }
    return leftValue;
  }

  private parseTerm(): number {
    let leftValue = this.parseFactor();
    while (this.index < this.formula.length) {
      const operator = this.formula[this.index];
      if (operator === "*") {
        this.index++;
        const rightValue = this.parseFactor();
        leftValue *= rightValue;
      } else if (operator === "/") {
        this.index++;
        const rightValue = this.parseFactor();
        if (rightValue === 0) {
          return Infinity; // Division by zero returns Infinity
        }
        leftValue /= rightValue;
        // if (operator === "*" || operator === "/") {
        //   this.index++;
        //   const rightValue = this.parseFactor();
        //   if (operator === "*") {
        //     leftValue *= rightValue;
        //   } else {
        //     if (rightValue !== 0) {
        //       leftValue /= rightValue;
        //     } else {
        //       leftValue = Infinity;
        //       throw new Error(ErrorMessages.divideByZero);
        //     }
        //   }
      } else {
        break;
      }
    }
    return leftValue;
  }

  private parseFactor(): number {
    const token = this.formula[this.index];
    if (token === "(") {
      this.index++;
      const result = this.parseExpression();
      if (this.formula[this.index] !== ")") {
        throw new Error(ErrorMessages.missingParentheses);
      }
      this.index++;
      return result;
    } else if (/[0-9]/.test(token)) {
      let numStr = "";
      while (
        this.index < this.formula.length &&
        /[0-9.]/.test(this.formula[this.index])
      ) {
        numStr += this.formula[this.index];
        this.index++;
      }
      return parseFloat(numStr);
    } else {
      throw new Error(ErrorMessages.invalidFormula);
    }
  }
}
