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
    if (!/\D\D$/.test(expression)) {
      this._expression = expression
      this.screen.expressionOutput.textContent = formatExpression(this._expression)
      Calculator.calculate(this.expression)
    }
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
      default:
        throw new Error('Unknown action!')
    }

    this.expression = expression
  }

  static calculate(expression) {
    const operands = expression.split(/\D+/).filter(Boolean).map(Number)
    const operators = expression.split(/\d+/).filter(Boolean)
    console.log('Operands', operands)
    console.log('Operators', operators)
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
  return expression.replace(/\D+/g, ' $& ').trim()
}

export { Calculator }
