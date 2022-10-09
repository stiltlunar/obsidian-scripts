class tifa { 
  // * GLOBAL
  
  // * CALLOUTS
  // TODO: General Callouts
  // TODO: Project Callouts
  renderCallouts(dv) {
    try {
      const content = this.getNoteCallouts(dv.current())
      dv.paragraph(content)
    } catch(error) {
      dv.paragraph(`> [!bug] Problem with getCallouts()\n${error}`)
    }
  }

  stringifyCallout(callout) {    
    let content
    if(typeof callout.content == 'string') {
      content = callout.content
    } else {
      content = callout.content.join('\n')
    }
    if (callout.message) {
      let calloutString = `> [!${callout.type}] ${callout.message}\n${content}`
      return calloutString
    } else {
      return `> [!${callout.type}]\n${content}`
    }
  }

  createCallout(type, message, content = []) {
    return {
      type,
      message,
      content
    }
  }

  // ?offload note type handling?
  // Note Health (see Style Guide for health guidelines)
  getNoteCallouts(noteData) {
    const note = noteData.file

    // * General Notes
    if (noteData.type === '🗒') {
      const content = []
      // * Empty Note
      if (note.size < 500) {
        return this.stringifyCallout(this.createCallout('missing', 'Looks Like Nothing is Here', ['Try adding content to this note']))
      }
      
      // * Note Health
      if (note.size < 4000) {
        content.push('Needs more [[Content Length | content]]')
      }
      if (note.outlinks.length <= 5) {
        content.push('Needs more [[Outgoing Links | outgoing links]]')
      }
  
      // * No Errors Check
      if (content.length === 0) {
        return this.stringifyCallout(this.createCallout('success', 'Healthy Note'))
      }

      return this.stringifyCallout(this.createCallout('warning', 'Note Needs Work', content))
    }

    // * Book Notes
    if (noteData.type === '📖') {
      const content = []
      // * Book Metadata
      if (!noteData.format) {
        return this.stringifyCallout(this.createCallout('failure', 'Book Notes Require a Format', ['']))
      }

    }

  }

  // * TASK HANDLER
  // TODO: handle queries and display of tasks

  // * BIBLIOGRAPHY
  // TODO: handle creating bibliography for topic based on references to book notes
  renderBibliography(dv) {
    try {
      const references = this.formatReferences(this.getBookReferences(dv.current(), dv), dv)
      const bibliography = `## Bibliography\n${references.join('\n')}`
      dv.paragraph(bibliography)
    } catch(error) {
      dv.paragraph(`> [!bug] Problem with renderBibliography()\n${error}`)
    }
    
  }

  getBookReferences(noteData, dv) {
    const outlinks = noteData.file.outlinks
    let bookReferences = []
    outlinks.forEach(link => {      
      if (dv.page(link).type === '📖') {
        bookReferences.push(link)
      }
    })
    return bookReferences
  }

  formatReferences(references, dv) {
    const formattedReferences = []
    
    references.forEach(reference => {
      const info = dv.page(reference)
      if(info.format === 'Book') {
        formattedReferences.push(`${info.author}. *${info.title}*. ${info.publishLocation}: ${info.publisher}, ${info.publishDate}. [[${info.file.name} | ⬈]]`)
      }
      if(info.format === 'Journal Article') {
        formattedReferences.push(`${info.author}. "*${info.title}*." ${info.publisher} ${info.issue} (${info.publishDate}): ${info.pages} [[${info.file.name} | ⬈]]`)
      }
    })
    return formattedReferences
  }

}