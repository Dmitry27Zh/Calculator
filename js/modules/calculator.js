class Calculator {
  constructor(element, screen) {
    this._expression = null
    this._result = null
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

  work(action, value) {
    switch (action) {
      case Attribute.SYMBOL:
        this._appendSymbol(value)
        break
      case Attribute.OPERATION:
        this._compute(value)
        break
      case Attribute.DELETE:
        this._delete()
        break
      case Attribute.CLEAR:
        this._clear()
        break
    }

    this._updateScreen()
  }

  _appendSymbol(symbol) {
    alert('Append Symbol ' + symbol)
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

  _updateScreen() {
    alert('Update screen')
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
