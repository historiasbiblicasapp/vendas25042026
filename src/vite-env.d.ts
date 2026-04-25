import type { CSSDescriptor } from 'vite';

declare module '*.css' {
  const css: CSSDescriptor;
  export default css;
}