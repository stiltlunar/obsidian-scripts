class tifa { 
  // TODO
  createCallout(type, message, content?: string | string[]) {
    try {
      // TODO: accomodate ordered and unordered lists
      if (!type) {
        throw new Error('createCallout() called without type')
      }
      let calloutString = `> [!${type}]`
      if (message) {
        calloutString += ` ${message}`
      }
      if (content) {
        if (typeof content === 'string') {
          calloutString += `\n${content}`
        } else {
          const joinedContent = content.join('\n > - ')
          calloutString += `\n > - ${joinedContent}`
        }
      }
      
      return calloutString
    } catch(error) {
      return this.handleError(error, 'createCallout()')
    }
  }
  
  // *DONE
  async getJSON(page, dv) {
    // TODO: Add better error handling
    // TODO: I need to know when the function fails
    // TODO: I need to know when there is no JSON
    // TODO: I need to know when the JSON is formatted incorrectly
    try {
      let content = await dv.io.load(page.file.path)
      content = content.trim()
      content = content.slice(3, -3)      
      const json = JSON.parse(content)
      
      return json
    } catch(error) {
      return false
    }
  }

  // Ignore
  async addImplicitProps(note, dv) {
    const newNote = note
    newNote.content = await dv.io.load(newNote.file.path)
    return newNote
  }

  // Ignore
  handleError(error: Error, location: string) {
    return `> [!bug] Problem at ${location}\n${error}`
  }

  // Ignore
  async renderCallouts(dv, callouts?: string | string[]) {
    try {
      if (callouts) {
        // TODO: Handle specified callouts
        dv.span(callouts)
      } else {
        const note = await this.addImplicitProps(dv.current(), dv)
        await this.getNoteCallouts(note, dv)
      }
      
    } catch(error) {
      dv.span(this.handleError(error, 'renderCallouts()'))
    }
  }

  // !WIP
  async getNoteCallouts(note, dv) {
    try {

      if(!note.type) {
        dv.span(this.createCallout('missing', 'Missing Note Type'))
        return
      }
  
      const schema = await this.getJSON(dv.page(note.type + '@callouts'), dv)
      if (!schema) {
        dv.span(this.createCallout('missing', `Missing [[Callout Schema]] | [[${note.type}@callouts |Add One]]`))
        return
      }
  
      let content: string[] = []
      let done: boolean = false
  
      for (let key in schema) {
        if (key === 'file') {
          // for things like file property on a note
          schema[key].forEach(rule => {          
            const passed = this.compareRule(note[key], rule)
            if(!passed) {
              rule.result.type ? dv.paragraph(this.createCallout(rule.result.type, rule.result.message, rule.result.content)) : content.push(rule.result.content)
              if(rule.result.done) {
                done = true
                return
              }
            }
          })
        } else {
          schema[key].forEach(rule => {
            const passed = this.compareRule(note, rule)
            if(!passed) {
              rule.result.type ? dv.paragraph(this.createCallout(rule.result.type, rule.result.message, rule.result.content)) : content.push(rule.result.content)
              if(rule.result.done) {
                done = true
                return
              }
            }
          })
        }
        if (done) {
          return
        }
      }
  
      if (done) {
        return
      }
  
      if (content.length !== 0) {
        dv.paragraph(this.createCallout('warning', 'Needs Work', content))
      }

    } catch (error) {
      dv.span(`> [!bug] Problem with getNoteCallouts()\n${error}`)
    }
  }

  // !WIP
  compareRule(note, rule) {
    try {
      // TODO: Handle more types than numbers
      const property = rule.property
      const condition = rule.condition
      
      if(!note[property]) {
        throw new Error(`${property} property does not exist`)
      }

      if (condition[1] === ' ') {
        let operator = condition[0]
        let value = condition.slice(-(condition.length - 2))
        if (operator === '<') {
          return note[property] > value
        } else if (operator === '>') {
          return note[property] < value
        } else if (operator === '<=') {
          return note[property] >= value
        } else if (operator === '>=') {
          return note[property] <= value
        } else if (operator === '!') {
          return note[property] == value
        } else if (operator === '=') {
          return note[property] !== value
        }
      }
  
      if (typeof condition === 'string') {
        return note[property] === condition
      }
    } catch(error) {
      return `> [!bug] Problem with compareRule()\n${error}`
    }
  }

}