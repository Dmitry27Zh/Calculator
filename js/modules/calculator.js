class Calculator {
  constructor(element, screen, settings = {}) {
    this._expression = ''
    this._result = ''
    this.element = null
    this.controls = null
    this.screen = {}
    this._settings = { ...defaultSettings, ...settings }
    this.init(element, screen)
  }

  init(element, screen) {
    handleError(() => {
      this._getElements(element, screen)
      this._addListeners()
    }, ErrorMessage.GLOBAL.pre)
  }

  _getElements(element, screen) {
    const { container } = this._settings
    const isExternalScreen = !!screen
    this.element = element ?? createElement(isExternalScreen, container)
    this.screen = screen ?? getScreen(this.element)
    this.controls = this.element.querySelector('.calculator__controls')
    checkScreen(this.screen)
  }

  _addListeners() {
    this.controls.addEventListener('click', ({ target }) => {
      handleError(() => {
        const action = target.getAttribute('data-action')
        const value = target.textContent.trim()
        this.work(action, value)
      })
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
    const { maximumFractionDigits } = this._settings
    this._result = Calculator.calculate(this.expression)
    this.screen.resultOutput.textContent = formatResult(this.result, maximumFractionDigits)
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
        throw new Error(ErrorMessage.ACTION.main)
    }

    this.expression = expression
  }

  static calculate(expression) {
    if (!Reg.VALID_EXPRESSION.test(expression)) {
      throw new Error('Invalid expression!')
    }

    expression = expression
      .replace(/\D$/, '')
      .replace(...Reg.OPERATORS_REPLACEMENT)
      .trim()
    const parts = expression.split(' ')
    const operands = parts.filter(Boolean).map(Number).filter(isFinite)
    const operators = parts.filter(isNaN)
    operators.splice(operands.length - 1)
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
  VALID_EXPRESSION: /^(-?|-?\d+(\.\d*)?|(-?\d+(\.\d*)?[^\d.]-?)*|(-?\d+(\.\d*)?[^\d.](-?\d+(\.\d*)?)?)*)?$/,
  OPERATORS_REPLACEMENT: [/([\d.])([^\d.])/g, '$1 $2 '],
}

const ErrorMessage = {
  GLOBAL: {
    pre: 'Unknown error in the Calculator:',
  },
  ACTION: {
    main: 'Unknown action!',
  },
}

const defaultSettings = {
  container: document.body,
  maximumFractionDigits: 4,
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

const createElement = (isExternalScreen, container) => {
  const screen = isExternalScreen
    ? ''
    : `<div class="calculator__screen">
        <div class="calculator__screen-line calculator__expression" data-action="expression"></div>
        <div class="calculator__screen-line calculator__result" data-action="result"></div>
      </div>`
  const html = `
    <div class="calculator">
      ${screen}
      <div class="calculator__controls">
        <button class="calculator__btn calculator__btn--span" type="button" data-action="clear">
        AC
        </button>
        <button class="calculator__btn" type="button" data-action="delete">
          DEL
        </button>
        <button class="calculator__btn" type="button" data-action="operation">
          ÷
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          1
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          2
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          3
        </button>
        <button class="calculator__btn" type="button" data-action="operation">
          x
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          4
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          5
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          6
        </button>
        <button class="calculator__btn" type="button" data-action="operation">
          +
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          7
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          8
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          9
        </button>
        <button class="calculator__btn" type="button" data-action="operation">
          -
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          .
        </button>
        <button class="calculator__btn" type="button" data-action="symbol">
          0
        </button>
        <button class="calculator__btn calculator__btn--span" type="button" data-action="equals">
          =
        </button>
      </div>
    </div>`
  container.innerHTML = html
  return container.firstElementChild
}

const formatExpression = (expression) => {
  return expression.replace(...Reg.OPERATORS_REPLACEMENT).trim()
}

const formatResult = (result, maximumFractionDigits) => {
  result = +result
  console.log(maximumFractionDigits)

  return result.toLocaleString('en', {
    maximumFractionDigits,
  })
}

const handleError = (cb, msg = '') => {
  try {
    cb()
  } catch (err) {
    msg = `${msg} ${err.message} on ${err.stack}`.trim()
    alert(msg)
  }
}

window.Calculator = Calculator

export { Calculator }
