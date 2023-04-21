class tifa { 
  // !!! ALL METHODS WITH 'render' PREFIX ARE CALLED FROM OBSIDIAN              !!!
  // !!! RENAMING A 'render' METHOD WILL AFFECT ALL PAGES CALLING THE METHOD    !!!
  // !!! CHANGING A 'render' VARIABLES WILL AFFECT ALL PAGES CALLING THE METHOD !!!
  // * GLOBAL
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

  async addImplicitProps(note, dv) {
    const newNote = note
    newNote.content = await dv.io.load(newNote.file.path)
    return newNote
  }

  handleError(error: Error, location: string) {
    return `> [!bug] Problem at ${location}\n${error}`
  }

  // * CALLOUTS
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

  // * TASKS
  // TODO: handle queries and display of tasks
  async renderTasks(dv, option) {
    const tasks = dv.pages('"Journal"').file.tasks
    const headingLevel = 3

    // Add task due today
    const dueToday = tasks.filter(task => task.due && task.due.day === dv.parse(dv.current().file.name).day && task.due.month === dv.parse(dv.current().file.name).month && task.due.year === dv.parse(dv.current().file.name).year)
    this.createTaskList(dv, dueToday, 'Due Today', headingLevel)

    // Past due highlighted in red
    const pastDue = tasks.filter(task => task.due && task.due < dv.parse(dv.current().file.name) && !task.completed)
    this.createTaskList(dv, pastDue, 'Past Due', headingLevel)
    
    // No due date warning
    const noDueDate = tasks.filter(task => !task.due && !task.completed)
    this.createTaskList(dv, noDueDate, 'NO DUE DATE', headingLevel)
    
    // If all tasks complete, add backlog
    if (dueToday.length === 2 && pastDue.length === 3) {
      const futureTasks = tasks.filter(task => task.due && task.due > dv.parse(dv.current().file.name) && !task.completed)
      dv.span('```ad-note\n' + '' + '\n```')
    }
  }

  createTaskList(dv, tasks, heading, headingLevel) {
    if (tasks.length > 0) {
      dv.header(headingLevel, heading)
      dv.taskList(tasks, false)
    }
  }

}