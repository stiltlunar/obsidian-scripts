class readTime {

  async render(dv) {
    try {
      const note = dv.current()
      const content = await dv.io.load(note.file.path)
      const wordCount = content.split(' ').length
      const readTime = await this.getReadTime(wordCount, dv)
      dv.span(`>[!info] READ TIME: ${readTime.hours} ${readTime.hourText} ${readTime.mins} ${readTime.minText}`)
    } catch (error) {
      dv.span(`> [!bug] Problem at renderReadTime\n${error}`)
    }
  }

  async getReadTime(wordCount, dv) {
    try {
      const rawTime = Math.round(wordCount/250)
      
      let hourText: string = ''
      let minText: string = ''
      let hours: string|number = ''
      let mins: string|number = ''
  
      // set mins and hours
      if (rawTime > 60) {
        hours = Math.floor(rawTime / 60)
        mins = rawTime % 60
      } else {
        mins = rawTime
      }
  
      // set hour text
      if (hours) {
        hours === 1 ? hourText = 'hr' : hourText = 'hrs'
      }
      // set min text
      mins === 1 ? minText = 'min' : minText = 'mins'
  
      return {
        hourText,
        minText,
        hours,
        mins
      }
    } catch (error) {
      dv.span(`> [!bug] Problem at getReadTime\n${error}`)
    }
  } 

}