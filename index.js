import { render, html as h, useState } from './src'
import { html1 as h1 } from './src_mine/h'


// function counter() {
//   const state = useState({
//     count: 0
//   },this)
//   return h`
//     <div>
//       ${h`<${count} count=${state.count} />`}
//       <button onclick=${() => {state.count++}}>+</button>
//       <button onclick=${() => {state.count--}}>-</button>
//     </div> 
//   `
// }

// function count(props){
//   const state = useState({
//     sex:'boy'
//   },this)
//   return h`
//     <div>
//       <p>${props.count}</p>
//       <p>${state.sex}</p>
//       <button onclick=${()=>{console.log(123)}}>x</button>
//     </div>
//   `
// }

function HelloWord(){
  return h`
    <button onclick=${()=>{console.log(123)}}>hello</button>
  `
}

function HelloWord2(){
  return h1`
    <button onclick=${()=>{console.log(123)}}>${1+2}</button>
  `
}
// console.log(123,HelloWord())
console.log('mine',HelloWord2())
// render(h`<${HelloWord} />`, document.body)
