class qualityCheck {
  
  async render(dv) {
    const note = dv.current()
    if (!note.type) {
      dv.span('> [!missing] Missing Note Type')
      return
    }

    const schema = await this.getSchema(note, dv)
    if (!schema) {
      dv.span(`> [!missing] Missing [[Callout Schema]] | [[${note.type}@callouts|Add One]]`)
      return
    }

    const errors = await this.getErrors(note, schema, dv)

    if (!errors) {
      return
    } else if (errors.length > 0) {
      let errorMessages = []
      errors.forEach(error => {
        errorMessages.push(`> > [!warning] ${error.message}\n>\n`)
      })
      dv.span(`> [!warning] This note has [[Note Quality|quality propblems]]!\n${errorMessages.join('')}`)
    } else {
      dv.span('> [!success] This is a quality note')
    }

  }

  async addImplicitMeta() {

  }

  async getSchema(note, dv) {
    try {
      const noteCallout = dv.page(note.type + "@callouts")
      let schema = await dv.io.load(noteCallout.file.path)
      schema = schema.trim()
      schema = schema.slice(3, -3)      
      const json = JSON.parse(schema)
      
      return json
    } catch(error) {
      return false
    }
  }

  async getErrors(note, schema, dv) {
    const errors = [{message: 'Needs more content'}, {message: 'So empty!'}]
    const qualitySchema = schema.qualityCheck
    if (!qualitySchema) {
      dv.span(`> [!info] Missing [[Note Quality Checking|Quality Checkers]] | [[${note.type}@callouts|Add Some]]`)
      return false
    }
    if (qualitySchema.frontMatter) {

    }
    if (qualitySchema.explicitMeta) {

    }
    if (qualitySchema.implicitMeta) {

    }

    return errors
  }

}