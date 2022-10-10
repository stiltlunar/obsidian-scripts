class tifa { 
  // !!! ALL METHODS WITH 'render' PREFIX ARE CALLED FROM OBSIDIAN !!!
  // !!! RENAMING A 'render' METHOD WILL AFFECT ALL PAGES CALLING THE METHOD !!!
  // * GLOBAL
  
  // * CALLOUTS
  // TODO: If type is not in 'NoteTypes' then warning with missing notetype
  renderCallouts(dv) {
    try {
      const content = this.getNoteCallouts(dv.current())
      dv.paragraph(content)
    } catch(error) {
      dv.paragraph(`> [!bug] Problem with getCallouts()\n${error}`)
    }
  }

  createCallout(type, message, content) {
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
        const joinedContent = content.join('\n')
        calloutString += `\n${joinedContent}`
      }
    }

    return calloutString
  }

  getNoteCallouts(noteData) {
    const note = noteData.file

    // * General Notes
    if (noteData.type === '🗒') {
      const content = []
      // * Empty Note
      if (note.size < 500) {
        return this.createCallout('missing', 'Looks Like Nothing is Here', ['Try adding content to this note'])
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
        return this.createCallout('success', 'Healthy Note')
      }

      return this.createCallout('warning', 'Note Needs Work', content)
    }

    // * Book Notes
    if (noteData.type === '📖') {
      const content = []
      // * Book Metadata
      if (!noteData.format) {
        return this.createCallout('failure', 'Book Notes Require a Format', [''])
      }

    }

    return this.createCallout('info', 'Nothing to See Here')
  }

  // * TASKS
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