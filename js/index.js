import { Calculator } from './modules/calculator.js'

const element = document.querySelector('.calculator')
const div = document.createElement('div')
div.setAttribute('data-action', 'expression')

const staticCalculator = new Calculator(element, {
  expressionOutput: div,
})
