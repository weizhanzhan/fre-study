// complie tagged template to vnode , thanks htm

// const CACHE = {}
// const TEMPLATE = document.createElement('template')
// const reg = /(\$_h\[\d+\])/g

export default function html(statics) {
  console.log('statics', statics)

  let str = statics[0]

  let i = 1

  while(i< statics.length){
    str+= '$_h['+i +']'+ statics[i++]
  }

  console.log('tag', str)

  // for(let i = 1; i <statics.length; ){
  //   str+= '$_h'+i + statics[i++]
  // }


 
  // const tpl = CACHE[statics] || (CACHE[statics] = build(statics))
  // return tpl(this, arguments)
}

function build(statics) {
 
}

function walk(n) {
 
}

function field(value, sep) {

}
