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
    this._expression = expression
    this.screen.expressionOutput.textContent = this._expression
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

  _compute(operation) {
    alert('Compute ' + operation)
  }

  _delete() {
    alert('Delete')
  }

  _clear() {
    alert('Clear')
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

export { Calculator }
