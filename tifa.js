class tifa { 
  // * UNIVERSAL
  // uses dv to render content
  render(...args) {
    const [content, dv] = args
    try {
      if (!content) {
        dv.paragraph('> [!info] Nothing to see here')
      } else if ( Array.isArray(content) ) {
        content.forEach(string => {
          dv.paragraph(string)
        })
      } else {
        dv.paragraph(content)
      }
    } catch(error) {
      dv.paragraph('> [!bug] Rendering Problem \n' + error + '\n **SEE CONSOLE FOR MORE INFO**')
      console.log(error)
    }
  }
  
  // gets all data for current file provided by the dv object from dataview plugin
  getNoteData(...args) {
    const [dv] = args
    const noteData = dv.current()
    return noteData
  }
  
  // * CALLOUTS
  // TODO: General Callouts
  // TODO: Project Callouts
  renderCallouts(...args) {
    try {
      const [dv] = args
      const noteData = this.getNoteData(dv)
      const content = this.getNoteHealth(noteData)
      this.render(content, dv)
    } catch(error) {
      this.render(`> [!bug] Problem with getCallouts()\n${error}`, dv)
    }
  }

  stringifyCallout(callout) {    
    if(callout.content.length == 0) {
      return
    }
    let content = callout.content.join('\n')
    if (callout.message) {
      let calloutString = `> [!${callout.type}] ${callout.message}\n${content}`
      return calloutString
    } else {
      return `> [!${callout.type}]\n${content}`
    }
  }

  // ?offload note type handling?
  // Note Health (see Style Guide for health guidelines)
  getNoteHealth(noteData) {
    const note = noteData.file
    const noteType = noteData.type
    
    const calloutData = {
      type: '',
      message: '',
      content: []
    }

    if (noteType === '🗒') {
      // Length Check
      if (note.size < 500) {
        calloutData.type = 'missing'
        calloutData.message = 'Looks Like Nothing is Here'
        calloutData.content.push('Try adding content to this note')
        return this.stringifyCallout(calloutData)
      }
      
      if (note.size < 4000) {
        calloutData.content.push('Needs more [[Content Length | content]]')
      }
      
      // Internal Linking Check
      if (note.outlinks.length <= 5) {
        calloutData.content.push('Needs more [[Outgoing Links | outgoing links]]')
      }
  
      if (calloutData.content.length === 0) {
        calloutData.type = 'success'
        calloutData.message = 'Healthy Note'
      } else {
        calloutData.type = 'warning'
        calloutData.message = 'Note Needs Work'
      }
    }
    console.log(calloutData.content)
  
    return this.stringifyCallout(calloutData)
  }

  // * TASK HANDLER
  // TODO: handle queries and display of tasks
}