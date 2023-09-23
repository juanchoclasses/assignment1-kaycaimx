import Cell from "./Cell";
import SheetMemory from "./SheetMemory";
import { ErrorMessages } from "./GlobalDefinitions";

export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;

  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
  }

  /**
    * place holder for the evaluator.   I am not sure what the type of the formula is yet 
    * I do know that there will be a list of tokens so i will return the length of the array
    * 
    * I also need to test the error display in the front end so i will set the error message to
    * the error messages found In GlobalDefinitions.ts
    * 
    * according to this formula.
    * 
    7 tokens partial: "#ERR",
    8 tokens divideByZero: "#DIV/0!",
    9 tokens invalidCell: "#REF!",
  10 tokens invalidFormula: "#ERR",
  11 tokens invalidNumber: "#ERR",
  12 tokens invalidOperator: "#ERR",
  13 missingParentheses: "#ERR",
  0 tokens emptyFormula: "#EMPTY!",

                    When i get back from my quest to save the world from the evil thing i will fix.
                      (if you are in a hurry you can fix it yourself)
                               Sincerely 
                               Bilbo
    * 
   */

  evaluate(formula: FormulaType) {
    // set the this._result to the length of the formula

    this._result = formula.length;
    this._errorMessage = "";

    switch (formula.length) {
      case 0:
        this._errorMessage = ErrorMessages.emptyFormula;
        break;
      case 7:
        this._errorMessage = ErrorMessages.partial;
        break;
      case 8:
        this._errorMessage = ErrorMessages.divideByZero;
        break;
      case 9:
        this._errorMessage = ErrorMessages.invalidCell;
        break;
      case 10:
        this._errorMessage = ErrorMessages.invalidFormula;
        break;
      case 11:
        this._errorMessage = ErrorMessages.invalidNumber;
        break;
      case 12:
        this._errorMessage = ErrorMessages.invalidOperator;
        break;
      case 13:
        this._errorMessage = ErrorMessages.missingParentheses;
        break;
      default:
        this._errorMessage = "";
        break;
    }

    // if the formula has only one token
    if (formula.length === 1) {
      let token = formula[0];
      if (this.isNumber(token)) {
        this._result = Number(token);
      } else if (this.isCellReference(token)) {
        let [value, error] = this.getCellValue(token);
        this._result = value;
        this._errorMessage = error;
      } else {
        this._errorMessage = ErrorMessages.invalidFormula;
      }

      // if the formula has two tokens
    } else if (formula.length === 2) {
      let token1 = formula[0];
      let token2 = formula[1];
      if (token1 === "(" && token2 === ")") {
        this._errorMessage = ErrorMessages.missingParentheses;
        this._result = 0;
      } else if (this.isNumber(token1) || this.isCellReference(token1)) {
        this._result = this.isNumber(token1)
          ? Number(token1)
          : this.getCellValue(token1)[0];
        this._errorMessage = ErrorMessages.invalidFormula;
      }

      // if the formula has three tokens
    } else if (formula.length === 3) {
      let token1 = formula[0];
      let token2 = formula[1];
      let token3 = formula[2];

      // if the first and third tokens are numbers/cellReferences and the second token is an operator
      if (
        (this.isNumber(token1) || this.isCellReference(token1)) &&
        (this.isNumber(token3) || this.isCellReference(token3))
      ) {
        let value1 = this.isNumber(token1)
          ? Number(token1)
          : this.getCellValue(token1)[0];
        let value3 = this.isNumber(token3)
          ? Number(token3)
          : this.getCellValue(token3)[0];
        if (token2 === "+") {
          this._result = value1 + value3;
        } else if (token2 === "-") {
          this._result = value1 - value3;
        } else if (token2 === "*") {
          this._result = value1 * value3;
        } else if (token2 === "/") {
          if (value3 === 0) {
            // divide by zero
            this._result = Infinity;
            this._errorMessage = ErrorMessages.divideByZero;
          } else {
            this._result = value1 / value3;
          }
        }
      } else if (
        token1 === "(" &&
        (this.isNumber(token2) || this.isCellReference(token2)) &&
        token3 === ")"
      ) {
        this._result = this.isNumber(token2)
          ? Number(token2)
          : this.getCellValue(token2)[0];
      } else if (this.isNumber(token1) || this.isCellReference(token1)) {
        this._result = this.isNumber(token1)
          ? Number(token1)
          : this.getCellValue(token1)[0];
        this._errorMessage = ErrorMessages.invalidFormula;
      }

      // if the formula has four tokens
    } else if (formula.length === 4) {
      let token1 = formula[0];
      let token2 = formula[1];
      let token3 = formula[2];
      if (
        (this.isNumber(token1) || this.isCellReference(token1)) &&
        (this.isNumber(token3) || this.isCellReference(token3))
      ) {
        this.evaluate([token1, token2, token3]);
        this._errorMessage = ErrorMessages.invalidFormula;
      }

      // if the formula has five tokens
    } else if (formula.length === 5) {
      let token1 = formula[0];
      let token2 = formula[1];
      let token3 = formula[2];
      let token4 = formula[3];
      let token5 = formula[4];
      if (
        (this.isNumber(token1) || this.isCellReference(token1)) &&
        (this.isNumber(token3) || this.isCellReference(token3)) &&
        (this.isNumber(token5) || this.isCellReference(token5))
      ) {
        let value1 = this.isNumber(token1)
          ? Number(token1)
          : this.getCellValue(token1)[0];
        let value3 = this.isNumber(token3)
          ? Number(token3)
          : this.getCellValue(token3)[0];
        let value5 = this.isNumber(token5)
          ? Number(token5)
          : this.getCellValue(token5)[0];
        if (token2 === "+" && token4 === "+") {
          this._result = value1 + value3 + value5;
        } else if (token2 === "+" && token4 === "-") {
          this._result = value1 + value3 - value5;
        } else if (token2 === "+" && token4 === "*") {
          this._result = value1 + value3 * value5;
        } else if (token2 === "+" && token4 === "/") {
          this._result = value1 + value3 / value5;
        }
      }
    }
  }

  public get error(): string {
    return this._errorMessage;
  }

  public get result(): number {
    return this._result;
  }

  /**
   *
   * @param token
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   *
   * @param token
   * @returns true if the token is a cell reference
   *
   */
  isCellReference(token: TokenType): boolean {
    return Cell.isValidCellLabel(token);
  }

  /**
   *
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   *
   */
  getCellValue(token: TokenType): [number, string] {
    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }

    let value = cell.getValue();
    return [value, ""];
  }
}

export default FormulaEvaluator;
