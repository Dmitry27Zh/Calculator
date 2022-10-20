class Calculator {
  constructor(element, expressionScreen, resultScreen) {
    this.element = element
    this.init()
  }

  init() {
    this._addListeners()
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
  EXPRESSION_SCREEN: 'expression',
  RESULT_SCREEN: 'result',
  SYMBOL: 'symbol',
  OPERATION: 'operation',
  EQUALS: 'equals',
  DELETE: 'delete',
  CLEAR: 'clear',
}

export { Calculator }
