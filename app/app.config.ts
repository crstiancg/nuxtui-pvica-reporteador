export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      secondary: 'blue',
      neutral: 'slate'
    },
    pageFeature: {
      slots: {
        leading: 'inline-flex items-center justify-center rounded-lg bg-primary/10 p-2',
        leadingIcon: 'size-5 shrink-0 text-primary'
      }
    }
  }
})
