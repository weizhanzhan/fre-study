import { render, html as h, useState } from './src'
import { h1 } from './src_mine/h'


function counter() {
  const state = useState({
    count: 0
  },this)
  h1`<${count} count=${state.count} />`
  return h`
    <div>
      ${h`<${count} count=${state.count} />`}
      <button onclick=${() => {state.count++}}>+</button>
      <button onclick=${() => {state.count--}}>-</button>
    </div> 
  `
}

function count(props){
  const state = useState({
    sex:'boy'
  },this)
  return h`
    <div>
      <p>${props.count}</p>
      <p>${state.sex}</p>
      <button onclick=${()=>{state.sex=state.sex==='boy'?'girl':'boy'}}>x</button>
    </div>
  `
}

render(h`<${counter} />`, document.body)
