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
    })
  }

  _getElements(element, screen) {
    const { container } = this._settings
    const isExternalScreen = !!screen
    this.element = element ?? createElement(isExternalScreen, container)
    this.screen = screen ?? getScreen(this.element)
    this.controls = this.element.querySelector('.calculator__controls')
    checkElements(this.element, this.screen, this.controls)
    this.element.focus()
  }

  _addListeners() {
    this.controls.addEventListener('click', ({ target }) => {
      handleError(() => {
        const action = target.getAttribute('data-action')
        const value = target.textContent.trim()
        this.work(action, value)
      })
    })

    this.element.addEventListener('keydown', (e) => {
      const { code, repeat } = e

      if (repeat) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
    })
  }

  get expression() {
    return this._expression
  }

  set expression(expression) {
    if (Reg.VALID_EXPRESSION.test(expression)) {
      this._expression = expression
      const { expressionOutput } = this.screen

      if (expressionOutput) {
        expressionOutput.textContent = formatExpression(this._expression)
      }

      this._setResult()
    }
  }

  get result() {
    return this._result
  }

  _setResult() {
    const { maximumFractionDigits } = this._settings
    this._result = Calculator.calculate(this.expression)
    const { resultOutput } = this.screen

    if (resultOutput) {
      resultOutput.textContent = formatResult(this.result, maximumFractionDigits)
    }
  }

  work(action, value) {
    let expression = this.expression

    switch (action) {
      case Action.SYMBOL:
      case Action.OPERATION:
        expression += value
        break
      case Action.DELETE:
        expression = expression.slice(0, -1)
        break
      case Action.CLEAR:
        expression = ''
        break
      case Action.EQUALS:
        expression = this.result
        break
      default:
        throw new Error(ErrorMessage.ACTION.main)
    }

    this.expression = expression
  }

  static calculate(expression) {
    if (!Reg.VALID_EXPRESSION.test(expression)) {
      throw new Error(ErrorMessage.EXPRESSION.main)
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
          case Operator.ADD:
            return operandA + operandB
          case Operator.SUBTRACT:
            return operandA - operandB
          case Operator.MULTIPLY:
            return operandA * operandB
          case Operator.DIVIDE:
            return operandA / operandB
          default:
            throw new Error(`${ErrorMessage.OPERATOR.main} ${operator}`)
        }
      }, defaultOperand)
      .toString()
  }
}

const Action = {
  EXPRESSION_OUTPUT: 'expression',
  RESULT_OUTPUT: 'result',
  SYMBOL: 'symbol',
  OPERATION: 'operation',
  EQUALS: 'equals',
  DELETE: 'delete',
  CLEAR: 'clear',
}

const Value = {
  CLEAR: 'AC',
  DELETE: 'DEL',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  0: '0',
  POINT: '.',
  EQUALS: '=',
}

const Operator = {
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: 'x',
  DIVIDE: '÷',
}

const Reg = {
  VALID_EXPRESSION: /^(-?|-?\d+(\.\d*)?|(-?\d+(\.\d*)?[^\d.]-?)*|(-?\d+(\.\d*)?[^\d.](-?\d+(\.\d*)?)?)*)?$/,
  OPERATORS_REPLACEMENT: [/([\d.])([^\d.])/g, '$1 $2 '],
}

const ErrorMessage = {
  UNKNOWN: {
    pre: 'Please reload app! Unknown error in the Calculator',
  },
  KNOWN: {
    pre: 'Please try again! Well-known error',
  },
  ELEMENT: {
    main: 'Lacks element!',
  },
  SCREEN: {
    main: 'Lacks screen output element!',
  },
  CONTROLS: {
    main: 'Lacks controls element!',
  },
  ACTION: {
    main: 'Unknown action!',
  },
  OPERATOR: {
    main: 'Unsupported operator:',
  },
  EXPRESSION: {
    main: 'Invalid expression!',
  },
}

const defaultSettings = {
  container: document.body,
  maximumFractionDigits: 4,
}

const getScreen = (element) => {
  return {
    expressionOutput: element.querySelector(`[data-action=${Action.EXPRESSION_OUTPUT}]`),
    resultOutput: element.querySelector(`[data-action="${Action.RESULT_OUTPUT}"]`),
  }
}

const checkElements = (element, screen, controls) => {
  let errorMsg = ''

  if (!element) {
    errorMsg = ErrorMessage.ELEMENT.main
  } else if (!checkScreen(screen)) {
    errorMsg = ErrorMessage.SCREEN.main
  } else if (!controls) {
    errorMsg = ErrorMessage.CONTROLS.main
  }

  if (errorMsg) {
    throw new Error(errorMsg)
  }
}

const checkScreen = (screen) => {
  const { expressionOutput, resultOutput } = screen

  return (
    expressionOutput?.matches?.(`[data-action=${Action.EXPRESSION_OUTPUT}]`) ||
    resultOutput?.matches?.(`[data-action=${Action.RESULT_OUTPUT}]`)
  )
}

const createElement = (isExternalScreen, container) => {
  const screen = isExternalScreen
    ? ''
    : `<div class="calculator__screen">
        <div class="calculator__screen-line calculator__expression" data-action="${Action.EXPRESSION_OUTPUT}"></div>
        <div class="calculator__screen-line calculator__result" data-action="${Action.RESULT_OUTPUT}"></div>
      </div>`
  const html = `
    <div class="calculator" tabindex="0">
      ${screen}
      <div class="calculator__controls">
        <button class="calculator__btn calculator__btn--span" type="button" data-action="${Action.CLEAR}">
          ${Value.CLEAR}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.DELETE}">
          ${Value.DELETE}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.OPERATION}">
          ${Operator.DIVIDE}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[1]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[2]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[3]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.OPERATION}">
          ${Operator.MULTIPLY}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[4]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[5]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[6]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.OPERATION}">
          ${Operator.ADD}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[7]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[8]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[9]}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.OPERATION}">
          ${Operator.SUBTRACT}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value.POINT}
        </button>
        <button class="calculator__btn" type="button" data-action="${Action.SYMBOL}">
          ${Value[0]}
        </button>
        <button class="calculator__btn calculator__btn--span" type="button" data-action="${Action.EQUALS}">
          ${Value.EQUALS}
        </button>
      </div>
    </div>`
  container.insertAdjacentHTML('beforeend', html)
  return container.lastElementChild
}

const formatExpression = (expression) => {
  return expression.replace(...Reg.OPERATORS_REPLACEMENT).trim()
}

const formatResult = (result, maximumFractionDigits) => {
  result = +result

  return result.toLocaleString('en', {
    maximumFractionDigits,
  })
}

const handleError = (cb) => {
  try {
    cb()
  } catch (err) {
    const msgPre = err.name === 'Error' ? ErrorMessage.KNOWN.pre : ErrorMessage.UNKNOWN.pre
    const msg = `${msgPre.trim()} – on ${err.stack}`
    alert(msg)
  }
}

window.Calculator = Calculator

export { Calculator }
