class Calculator {
  constructor(element, screen) {
    this._expression = ''
    this._result = ''
    this.element = null
    this.screen = {}
    this.init(element, screen)
  }

  init(element, screen) {
    this._getElements(element, screen)
    this._addListeners()
  }

  _getElements(element, screen) {
    const hasScreen = !!screen
    this.element = element ?? createElement(hasScreen)
    this.screen = screen ?? getScreen(this.element)
    checkScreen(this.screen)
  }

  _addListeners() {
    this.element.addEventListener('click', ({ target }) => {
      const action = target.getAttribute('data-action')
      const value = target.textContent
      this.work(action, value)
    })
  }

  get expression() {
    return this._expression
  }

  set expression(expression) {
    if (Reg.VALID_EXPRESSION.test(expression)) {
      this._expression = expression
      this.screen.expressionOutput.textContent = formatExpression(this._expression)
      this._setResult()
    }
  }

  get result() {
    return this._result
  }

  _setResult() {
    this._result = Calculator.calculate(this.expression)
    this.screen.resultOutput.textContent = this.result
  }

  work(action, value) {
    let expression = this.expression

    switch (action) {
      case Attribute.SYMBOL:
      case Attribute.OPERATION:
        expression += value
        break
      case Attribute.DELETE:
        expression = expression.slice(0, -1)
        break
      case Attribute.CLEAR:
        expression = ''
        break
      case Attribute.EQUALS:
        expression = this.result
        break
      default:
        throw new Error('Unknown action!')
    }

    this.expression = expression
  }

  static calculate(expression) {
    if (!Reg.VALID_EXPRESSION.test(expression)) {
      throw new Error('Invalid expression!')
    }

    expression = expression
      .replace(/\D$/, '')
      .replace(/([\d.])([^\d.])/g, '$1 $2 ')
      .trim()
    const parts = expression.split(' ')
    const operands = parts.filter(Boolean).map(Number).filter(isFinite)
    const operators = parts.filter(isNaN)
    const defaultOperand = operands.shift() ?? ''

    return operators
      .reduce((operandA, operator) => {
        const operandB = operands.shift()

        switch (operator) {
          case '+':
            return operandA + operandB
          case '-':
            return operandA - operandB
          case 'x':
            return operandA * operandB
          case '÷':
            return operandA / operandB
          default:
            throw new Error(`Unsupported operator: ${operator}`)
        }
      }, defaultOperand)
      .toString()
  }
}

const Attribute = {
  EXPRESSION_OUTPUT: 'expression',
  RESULT_OUTPUT: 'result',
  SYMBOL: 'symbol',
  OPERATION: 'operation',
  EQUALS: 'equals',
  DELETE: 'delete',
  CLEAR: 'clear',
}

const Reg = {
  VALID_EXPRESSION: /^(-?\d*(\.\d*)?|(-?\d+(\.\d*)?[^\d.](-?\d*(\.\d*)?)?)*)?$/,
}

const getScreen = (element) => {
  return {
    expressionOutput: element.querySelector(`[data-action=${Attribute.EXPRESSION_OUTPUT}]`),
    resultOutput: element.querySelector(`[data-action="${Attribute.RESULT_OUTPUT}"]`),
  }
}

const checkScreen = (screen) => {
  const { expressionOutput, resultOutput } = screen

  if (
    !expressionOutput?.matches?.(`[data-action=${Attribute.EXPRESSION_OUTPUT}]`) &&
    !resultOutput?.matches?.(`[data-action=${Attribute.RESULT_OUTPUT}]`)
  ) {
    throw new Error('Lacks screen output element!')
  }
}

const createElement = (hasScreen) => {
  console.log(hasScreen)
}

const formatExpression = (expression) => {
  return expression.replace(/^-?[\d.]+|[\d.]+/g, ' $& ').trim()
}

window.Calculator = Calculator

export { Calculator }
