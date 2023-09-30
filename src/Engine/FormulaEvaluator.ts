import Cell from "./Cell";
import SheetMemory from "./SheetMemory";
import { ErrorMessages } from "./GlobalDefinitions";
import { FormulaParser } from "./FormulaParser";

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
   * @param formula
   * @returns the result of the formula and sets the error message
   */
  evaluate(formula: FormulaType) {
    // set the error message to the empty string
    let error: string = "";

    // convert CellReferences in the formula to values, and convert numeric strings to numbers
    // else, keep the token itself (for operators and parentheses)
    // create a new array called newFormula with the converted values
    const newFormula = formula.map((token) => {
      if (this.isNumber(token)) {
        return Number(token);
      } else if (this.isCellReference(token)) {
        error = this.getCellValue(token)[1];
        return this.getCellValue(token)[0];
      } else {
        return token;
      }
    });

    // keep removing trailing operators and left parenthesis from the newFormula,
    // set error message to be Invalid Formula
    const invalidEnds = /[+\-*/(]$/; // regex for invalid ends: + - * / (
    while (newFormula.length > 0) {
      if (invalidEnds.test(newFormula[newFormula.length - 1])) {
        error = ErrorMessages.invalidFormula;
        newFormula.pop();
      } else {
        break;
      }
    }

    // pass the new formula (without invalid ends) to the parser
    // try parse() and catch any errors
    // if the result is Infinity, set error message to be Divide by Zero
    const parser = new FormulaParser(newFormula);
    try {
      this._result = parser.parse();
    } catch (err: any) {
      error = err.message;
    }
    if (this._result === Infinity) {
      error = ErrorMessages.divideByZero;
    }
    this._errorMessage = error;
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
