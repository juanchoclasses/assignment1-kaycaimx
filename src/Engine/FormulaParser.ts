/**
 * This class is a simple formula parser that can parse an array of formula tokens and compute the result.
 * It is used by the FormulaEvaluator class.
 * 
 * The parser uses the following grammar:
 *    expression = term {("+" | "-") term}
 *    term = factor {("*" | "/") factor}
 *    factor = number | "(" expression ")"
 *    number = digit {digit}
 *    digit = "0" | "1" | ... | "9"
 *   
 * it exports the following functions:
 * parse(): number
 */
import { ErrorMessages } from "./GlobalDefinitions";

export class FormulaParser {
  // index of the current token, tracking the position of current parsing
  private index: number = 0;
  private formula: FormulaType = [];

  /**
   * Constructor of the FormulaParser class
   * @param formula An array of string formula tokens (without invalid ends)
   */
  constructor(formula: FormulaType) {
    this.formula = formula;
  }

  /**
   * This method parses the formula and returns the result
   * @returns the result of the formula
   * @throws Error if the formula is invalid or missing parentheses
   */
  public parse(): number {
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

  /**
   * This method parses the expression and returns the result, following the grammar: expression = term {("+" | "-") term}
   * @returns the result of the current expression
   */
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

  /**
   * This method parses the term and returns the result, following the grammar: term = factor {("*" | "/") factor}
   * @returns the result of the current term
   * @returns Infinity if the denominator is 0
   */
  private parseTerm(): number {
    let leftValue = this.parseFactor();
    while (this.index < this.formula.length) {
      const operator = this.formula[this.index];
        if (operator === "*" || operator === "/") {
          this.index++;
          const rightValue = this.parseFactor();
          if (operator === "*") {
            leftValue *= rightValue;
          } else {
            if (rightValue !== 0) {
              leftValue /= rightValue;
            } else {
              //leftValue = Infinity
              return Infinity;  
            }
          }
      } else {
        break;
      }
    }
    return leftValue;
  }

  /** 
   * This method parses the factor and returns the result, following the grammar: factor = number | "(" expression ")"
   * @returns the result of the current factor
   * @throws Error if the formula is invalid or missing parentheses
   * */
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
