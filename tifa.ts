class tifa { 
  
  // TODO: Incorporate this functionality to read json for writing callout for types
  async getContent(page, dv) {
    let content = await dv.io.load(page.file.path)
    return content
  }
  
  // !!! ALL METHODS WITH 'render' PREFIX ARE CALLED FROM OBSIDIAN !!!
  // !!! RENAMING A 'render' METHOD WILL AFFECT ALL PAGES CALLING THE METHOD !!!
  // * GLOBAL
  createCallout(type, message, content?) {
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
        const joinedContent = content.join('\n')
        calloutString += `\n${joinedContent}`
      }
    }
  
    return calloutString
  }
  
  // * CALLOUTS
  // TODO: If type is not in 'NoteTypes' then warning with missing notetype
  async renderCallouts(dv) {
    try {
      const content = this.getNoteCallouts(dv.current(), dv)
      const readTime = await this.getReadTime(dv)
      console.log(content);
      dv.paragraph(readTime)
      dv.paragraph(content)
    } catch(error) {
      dv.paragraph(`> [!bug] Problem with getCallouts()\n${error}`)
    }
  }

  async betterNoteCallouts(dv) {
    
  }


  getNoteCallouts(noteData, dv) {
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

      // TODO: Add a check for a note that is too long => indicates that it needs to be multiple notes

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
        return this.createCallout('failure', 'Book Notes Require a Format', ['Optional formats include: Book, Journal Article'])
      }

    }

    return ''
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

  // * ESTIMATED READ TIME
  async getReadTime(dv) {
    const content = await this.getContent(dv.current(), dv)
    const wordCount = content.split(' ').length
    const readTime = Math.round(wordCount/200)
    if (readTime < 1) {
      return '> [!info] Read Time: < 1 min'
    } else if (readTime < 60) {
      if (readTime === 1) {
        return `> [!info] Read Time: ${readTime} min`
      } else {
        return `> [!info] Read Time: ${readTime} mins`
      }
    } else if (readTime >= 60) {
      let hours = Math.floor(readTime / 60)
      let minutes = readTime % 60
      
      if (hours === 1) {
        if (minutes === 0) {
          return `> [!info] Read Time: ${hours} hr`
        } else if (minutes === 1) {
          return `> [!info] Read Time: ${hours} hr, ${minutes} min`
        } else {
          return `> [!info] Read Time: ${hours} hr, ${minutes} mins`
        }
      } else {
        if (minutes === 0) {
          return `Read Time: ${hours} hrs`
        } else if (minutes === 1) {
          return `> [!info] Read Time: ${hours} hrs, ${minutes} min`
        } else {
          return `> [!info] Read Time: ${hours} hrs, ${minutes} mins`
        }
      }
    }
  }

}