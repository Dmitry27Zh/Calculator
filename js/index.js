import { Calculator } from './modules/calculator.js'

const container = document.querySelector('.container')
const element = document.querySelector('.calculator')

const staticCalculator = new Calculator(element, null, { container })
