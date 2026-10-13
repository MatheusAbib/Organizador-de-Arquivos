declare module 'pptx-preview' {
  interface PreviewerOptions {
    width?: number
    height?: number
    [key: string]: unknown
  }

  interface Previewer {
    preview: (file: ArrayBuffer | Uint8Array) => Promise<void>
    [key: string]: unknown
  }

  export function init(container: HTMLElement, options?: PreviewerOptions): Previewer
}
