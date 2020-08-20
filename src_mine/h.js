import htm from './html'

export function h1(type, props, ...children) {
  return { type, props, children }
}

export const html1 = htm.bind(h1)
