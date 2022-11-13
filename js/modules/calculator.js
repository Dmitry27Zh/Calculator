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
      if (target.matches('[data-action]')) {
        handleError(() => {
          const action = target.getAttribute('data-action')
          const value = target.textContent.trim()
          this.work(action, value)
        })
      }
    })

    this.element.addEventListener('keydown', (e) => {
      const { code, repeat } = e

      if (repeat) {
        return
      }

      if (code in keycodeToValue) {
        e.preventDefault()
        e.stopPropagation()
      }
    })
  }

  get expression() {
    return this._expression
  }

  set expression(expression) {
    if (Reg.VALID_EXPRESSION.test(expression) && !Reg.INVALID_EXPRESSION.test(expression)) {
      this._expression = expression.replace(/[.,]/, Value.POINT)
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
    if (!Reg.VALID_EXPRESSION.test(expression) || Reg.INVALID_EXPRESSION.test(expression)) {
      throw new Error(ErrorMessage.EXPRESSION.main)
    }

    expression = expression
      .replace(/\D$/, '')
      .replace(/,/g, '.')
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

const Operator = {
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: 'x',
  DIVIDE: '÷',
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
  ADD: Operator.ADD,
  SUBTRACT: Operator.SUBTRACT,
  MULTIPLY: Operator.MULTIPLY,
  DIVIDE: Operator.DIVIDE,
  POINT: '.',
  EQUALS: '=',
}

const Reg = {
  VALID_EXPRESSION: /^(-?|-?\d+([.,]\d*)?|(-?\d+([.,]\d*)?[^\d.,]-?)*|(-?\d+([.,]\d*)?[^\d.,](-?\d+([.,]\d*)?)?)*)?$/,
  INVALID_EXPRESSION: /\..*,|,.*\./,
  OPERATORS_REPLACEMENT: [/([\d.,])([^\d.,])/g, '$1 $2 '],
}

const keycodeToValue = {
  Digit0: Value[0],
  Digit1: Value[1],
  Digit2: Value[2],
  Digit3: Value[3],
  Digit4: Value[4],
  Digit5: Value[5],
  Digit6: Value[6],
  Digit7: Value[7],
  Digit8: Value[8],
  Digit9: Value[9],
  Period: Value.POINT,
  Slash: Value.DIVIDE,
  Numpad0: Value[0],
  Numpad1: Value[1],
  Numpad2: Value[2],
  Numpad3: Value[3],
  Numpad4: Value[4],
  Numpad5: Value[5],
  Numpad6: Value[6],
  Numpad7: Value[7],
  Numpad8: Value[8],
  Numpad9: Value[9],
  NumpadDecimal: Value.POINT,
  NumpadAdd: Value.ADD,
  NumpadSubtract: Value.SUBTRACT,
  NumpadMultiply: Value.MULTIPLY,
  NumpadDivide: Value.DIVIDE,
}

const ErrorMessage = {
  UNKNOWN: {
    pre: 'Please reload the app! Unknown error in the Calculator',
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
    main: 'Problem with controls element!',
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
  } else if (!checkControls(controls)) {
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

const checkControls = (element) => {
  return element?.outerHTML.replace(/\s/g, '') === CONTROLS_MARKUP.replace(/\s/g, '')
}

const CONTROLS_MARKUP = `
  <div class="calculator__controls">
    <button class="calculator__btn calculator__btn--span" type="button" data-action="${Action.CLEAR}">
      ${Value.CLEAR}
    </button>
    <button class="calculator__btn" type="button" data-action="${Action.DELETE}">
      ${Value.DELETE}
    </button>
    <button class="calculator__btn" type="button" data-action="${Action.OPERATION}">
      ${Value.DIVIDE}
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
      ${Value.MULTIPLY}
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
      ${Value.ADD}
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
      ${Value.SUBTRACT}
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
`

const createElement = (isExternalScreen, container) => {
  const screenMarkup = isExternalScreen
    ? ''
    : `<div class="calculator__screen">
        <div class="calculator__screen-line calculator__expression" data-action="${Action.EXPRESSION_OUTPUT}"></div>
        <div class="calculator__screen-line calculator__result" data-action="${Action.RESULT_OUTPUT}"></div>
      </div>`
  const html = `
    <div class="calculator" tabindex="0">
      ${screenMarkup}
      ${CONTROLS_MARKUP}
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
