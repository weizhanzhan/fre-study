// complie tagged template to vnode , thanks htm

// const CACHE = {}
// const TEMPLATE = document.createElement('template')
// const reg = /(\$_h\[\d+\])/g

export default function html(statics) {
  console.log('statics', statics)

  let str = statics[0]

  let i = 1

  while(i< statics.length){
    str+= '$_h'+i + statics[i++]
  }
  str
    .replace(/<(?:(\/)\/|(\/?)(\$_h\[\d+\]))/g, '<$1$2c c@=$3')
    .replace(/<([\w:-]+)(?:\s[^<>]*?)?(\/?)>/g,(str, name, a) => str.replace(/(?:'.*?'|".*?"|([A-Z]))/g, (s, c) => (c ? ':::' + c : s)) + (a ? '</' + name + '>' : ''))
    .replace(/[\r\n]|\ \ +/g,'')
    .trim()
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
