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
        errorMessages.push(`> [!warning] ${error.message}\n>\n`)
      })
      
      dv.span(`${errorMessages.join('\n')}`)
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
    let done = false
    
    if (!qualitySchema) {
      dv.span(`> [!info] Missing [[Note Quality Checking|Quality Checkers]] | [[${note.type}@callouts|Add Some]]`)
      return false
    }
    
    for (let metaLocation in qualitySchema) {
      for (let metaKey in qualitySchema[metaLocation]) {
        const rules = qualitySchema[metaLocation][metaKey]
        await rules.forEach(async (rule) => {
          const passed = await this.checkRule(rule, note, metaKey)
          if (!passed) {
            errors.push(rule.error)
          }
          if (rule.done) {
            done = true
            return errors
          }
        })
      }
    }
    console.log(done);
    
    console.log(errors);
    return errors
  }

  async checkRule(rule, note, property) {    
    let check = true
    
    if ((rule.condition === 'equals') && (rule.value !== note[property])) {
      check = false
    } else if ((rule.condition === 'required') && !note[property]) {
      check = false
    }
    
    return check
  }

}