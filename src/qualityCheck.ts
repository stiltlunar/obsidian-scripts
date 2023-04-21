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
      const schema = dv.page(note.type + "@callouts")
      return schema.file.frontmatter
    } catch(error) {
      return false
    }
  }

  async getErrors(note, schema, dv) {
    const errors = []
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