import { Calculator } from './modules/calculator.js'

const element = document.querySelector('.calculator')
const dynamicContainer = document.querySelector('#dynamic-container')
const dynamicBtn = document.querySelector('#dynamic-btn')
const dynamicExternalBtn = document.querySelector('#dynamic-external-btn')
const dynamicExtrenalContainer = document.querySelector('#dynamic-external-container')
const dynamicExternalExpression = document.querySelector('#dynamic-external-expression')
const dynamicExternalResult = document.querySelector('#dynamic-external-result')

const staticCalculator = new Calculator(element)

dynamicBtn.addEventListener(
  'click',
  () => {
    const dynamicCalculator = new Calculator(null, null, { container: dynamicContainer })
  },
  { once: true }
)

dynamicExternalBtn.addEventListener(
  'click',
  () => {
    const dynamicExternalCalculator = new Calculator(
      null,
      { expressionOutput: dynamicExternalExpression, resultOutput: dynamicExternalResult },
      { container: dynamicExtrenalContainer }
    )
  },
  {
    once: true,
  }
)
